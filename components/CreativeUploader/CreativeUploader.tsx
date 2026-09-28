"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import styles from "./CreativeUploader.module.css";

type Dimensions = { width: number; height: number };
type Rotation = "fixed" | "refresh" | "sticky";
type UploadedCreative = {
  id: string;
  name: string;
  imageUrl: string;
  destinationUrl: string;
  altText: string;
  creative: Dimensions;
  placement: Dimensions;
  rotation: Rotation;
  cookieHours: number;
  enabled: boolean;
  createdAt: string;
};

const STORAGE_KEY = "adspark.creatives.v1";
function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read the image."));
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });
}

type CreativeUploaderProps = { onOpenMediaLibrary?: () => void };\n\nexport default function CreativeUploader({ onOpenMediaLibrary }: CreativeUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);\n  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [creative, setCreative] = useState<Dimensions | null>(null);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(300);
  const [rotation, setRotation] = useState<Rotation>("refresh");
  const [cookieHours, setCookieHours] = useState(24);
  const [scheduleMode, setScheduleMode] = useState<"continuous" | "scheduled">("continuous");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [savedAds, setSavedAds] = useState<UploadedCreative[]>([]);
  const [previewAd, setPreviewAd] = useState<UploadedCreative | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [embedWidth, setEmbedWidth] = useState(600);
  const [embedHeight, setEmbedHeight] = useState(300);
  const [embedCode, setEmbedCode] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedAds(parsed as UploadedCreative[]);
      }
    } catch {
      setMessage("Saved ads could not be read from this browser.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAds));
    } catch {
      setMessage("Browser storage is full. Remove an ad or use a smaller image.");
    }
  }, [loaded, savedAds]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setCreative(null);
    setMessage("");
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);

    if (!selected) {
      setPreviewUrl("");
      return;
    }
    if (!["image/gif", "image/jpeg", "image/png"].includes(selected.type)) {
      setMessage("Choose a GIF, JPEG, or PNG image.");
      event.target.value = "";
      setFile(null);
      setPreviewUrl("");
      return;
    }
    if (selected.size > 1024 * 1024) {
      setMessage("For this browser-based prototype, each image must be 1 MB or smaller.");
      event.target.value = "";
      setFile(null);
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);
    const image = new Image();
    image.onload = () => {
      const detected = { width: image.naturalWidth, height: image.naturalHeight };
      setCreative(detected);
      setWidth(detected.width);
      setHeight(detected.height);
      setEmbedWidth(detected.width);
      setEmbedHeight(detected.height);
    };
    image.onerror = () => setMessage("This image could not be opened.");
    image.src = objectUrl;
  }

  const ratioCompatible = creative !== null && Math.abs((creative.width / creative.height) - (width / height)) < 0.03;
  const needsUpscale = creative !== null && (width > creative.width || height > creative.height);

  const choosePreview = useCallback((candidates: UploadedCreative[]) => {
    const active = candidates.filter((ad) => ad.enabled && ad.placement.width === width && ad.placement.height === height);
    if (!active.length) {
      setPreviewAd(null);
      setMessage("No active ads are saved for this placement yet.");
      return;
    }

    const fixed = active.filter((ad) => ad.rotation === "fixed");
    if (fixed.length) {
      setPreviewAd(fixed[0]);
      setMessage("Showing the fixed ad for this placement.");
      return;
    }

    const sticky = active.filter((ad) => ad.rotation === "sticky");
    if (sticky.length) {
      const key = `adspark.sticky.${width}x${height}`;
      try {
        const saved = document.cookie.split("; ").find((part) => part.startsWith(`${key}=`));
        if (saved) {
          const [id, expiresAt] = decodeURIComponent(saved.slice(key.length + 1)).split("|");
          const match = sticky.find((ad) => ad.id === id);
          if (match && Number(expiresAt) > Date.now()) {
            setPreviewAd(match);
            setMessage(`Sticky selection stays for ${match.cookieHours} hours.`);
            return;
          }
        }
      } catch {
        // Create a fresh selection if browser cookies are unavailable.
      }
      const next = sticky[Math.floor(Math.random() * sticky.length)];
      const expiresAt = Date.now() + next.cookieHours * 60 * 60 * 1000;
      document.cookie = `${key}=${encodeURIComponent(`${next.id}|${expiresAt}`)}; Max-Age=${next.cookieHours * 60 * 60}; Path=/; SameSite=Lax`;
      setPreviewAd(next);
      setMessage(`Random ad selected; it will stay for ${next.cookieHours} hours.`);
      return;
    }

    const rotating = active.filter((ad) => ad.rotation === "refresh");
    const next = rotating[Math.floor(Math.random() * rotating.length)];
    setPreviewAd(next);
    setMessage("Random ad selected for this page view.");
  }, [width, height]);

  useEffect(() => {
    if (loaded && savedAds.length) choosePreview(savedAds);
  }, [choosePreview, loaded, savedAds]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !previewUrl || !creative || width < 1 || height < 1) return;
    if (width > 1600 || height > 1200) {
      setMessage("Custom display size cannot exceed 1600 × 1200px.");
      return;
    }
    try {
      const destination = new URL(destinationUrl);
      if (destination.protocol !== "http:" && destination.protocol !== "https:") throw new Error();
    } catch {
      setMessage("Enter a valid http or https destination URL.");
      return;
    }
    setPending(true);
    setMessage("");

    try {
      const imageUrl = await readImage(file);
      const ad: UploadedCreative = {
        id: crypto.randomUUID(),
        name: file.name,
        imageUrl,
        destinationUrl,
        altText,
        creative,
        placement: { width, height },
        rotation,
        cookieHours: Math.max(1, cookieHours),
        enabled: true,
        createdAt: new Date().toISOString(),
      };
      const next = [ad, ...savedAds];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSavedAds(next);
      setPreviewAd(ad);
      setMessage("Ad saved in this browser's library.");
      setFile(null);
      setPreviewUrl("");
      setCreative(null);
      setDestinationUrl("");
      setAltText("");
      const input = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (input) input.value = "";
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not save this ad.");
    } finally {
      setPending(false);
    }
  }

  function updateAd(id: string, changes: Partial<UploadedCreative>) {
    setSavedAds((ads) => ads.map((ad) => ad.id === id ? { ...ad, ...changes } : ad));
    if (previewAd?.id === id && changes.enabled === false) setPreviewAd(null);
  }

  function removeAd(id: string) {
    setSavedAds((ads) => ads.filter((ad) => ad.id !== id));
    if (previewAd?.id === id) setPreviewAd(null);
  }

  function createEmbedCode() {
    const ads = savedAds.filter(
      (ad) => ad.enabled && ad.placement.width === embedWidth && ad.placement.height === embedHeight,
    );
    if (!ads.length) {
      setMessage(`Save or activate an ad for ${embedWidth} × ${embedHeight} to create its embed.`);
      setEmbedCode("");
      return;
    }

    const config = encodeURIComponent(JSON.stringify(ads.map((ad) => ({
      id: ad.id,
      imageUrl: ad.imageUrl,
      destinationUrl: ad.destinationUrl,
      altText: ad.altText,
      rotation: ad.rotation,
      cookieHours: ad.cookieHours,
    }))));
    const scriptUrl = `${window.location.origin}/adspark.js`;
    setEmbedCode(
      `<div data-adspark-slot data-width="${embedWidth}" data-height="${embedHeight}" data-config="${config}"></div>\n<script src="${scriptUrl}" defer></script>`,
    );
    setMessage("Embed code created. Use your deployed AdSpark URL when adding it to a live site.");
  }

  async function copyEmbedCode() {
    if (!embedCode) return;
    try {
      await navigator.clipboard.writeText(embedCode);
      setMessage("Embed code copied.");
    } catch {
      setMessage("Select and copy the embed code manually.");
    }
  }

  return (
    <div className={styles.workspace}>
      <section className={styles.card} aria-labelledby="upload-title">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>Ad library</span>
          <h2 id="upload-title">Add a clickable display ad</h2>
          <p>Upload finished creative, add its click-through URL, and choose a placement.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <span>Creative image</span>
            <div className={styles.sourceChooser}>
              <button type="button" className={styles.sourceButton} onClick={onOpenMediaLibrary}>
                <strong>Media Library</strong><span>Choose an asset already in AdSpark</span>
              </button>
              <button type="button" className={styles.sourceButton} onClick={() => fileInputRef.current?.click()}>
                <strong>Browse computer</strong><span>Upload from File Explorer</span>
              </button>
            </div>
            <input ref={fileInputRef} className={styles.hiddenFile} type="file" accept="image/gif,image/jpeg,image/png" onChange={handleFile} />
            {file ? <small>Selected: {file.name}</small> : <small>Choose from Media Library or browse JPG, PNG, and GIF files on your computer.</small>}
          </div>

          {creative && (
            <div className={styles.creativeInfo}>
              <div><span>Uploaded creative</span><strong>{creative.width} × {creative.height}px</strong></div>
              <span className={styles.autoDetected}>Auto-detected</span>
            </div>
          )}

          <label className={styles.field}>
            <span>Destination URL</span>
            <input type="url" value={destinationUrl} onChange={(event) => setDestinationUrl(event.target.value)} placeholder="https://advertiser.com/offer" required />
          </label>
          <label className={styles.field}>
            <span>Image alt text</span>
            <input value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Describe the ad for screen-reader users" maxLength={180} required />
          </label>
          <fieldset className={styles.sizeFieldset}>
            <legend>Display size</legend>
            <p>The uploaded image dimensions are used by default. Change these only when you need a custom rendered size.</p>
            <div className={styles.row}>
              <label className={styles.field}><span>Width (px)</span><input type="number" min="1" max="1600" value={width} onChange={(event) => setWidth(Number(event.target.value))} /></label>
              <label className={styles.field}><span>Height (px)</span><input type="number" min="1" max="1200" value={height} onChange={(event) => setHeight(Number(event.target.value))} /></label>
            </div>
          </fieldset>

          {creative && (
            <div className={ratioCompatible && !needsUpscale ? styles.match : styles.warning} role="status">
              <strong>{ratioCompatible ? (needsUpscale ? "Correct shape, but this placement would upscale the creative." : "Responsive fit looks good.") : "This creative has a different aspect ratio than the placement."}</strong>
              <span>Creative: {creative.width} × {creative.height}px · Placement: {width} × {height}px</span>
              <span>{ratioCompatible ? "AdSpark will preserve the aspect ratio and scale down automatically on smaller screens." : "AdSpark will never stretch the image. Choose another creative or add a slot-specific version."}</span>
            </div>
          )}

          <label className={styles.field}>
            <span>Rotation behavior</span>
            <select value={rotation} onChange={(event) => setRotation(event.target.value as Rotation)}>
              <option value="refresh">Random pool — choose on each page refresh</option>
              <option value="sticky">Sticky random — keep until browser cookie expires</option>
              <option value="fixed">Fixed — always show this ad</option>
            </select>
          </label>

          {rotation === "sticky" && (
            <label className={styles.field}>
              <span>Keep selected ad for</span>
              <div className={styles.inlineInput}><input type="number" min="1" max="720" value={cookieHours} onChange={(event) => setCookieHours(Number(event.target.value))} /><span>hours</span></div>
            </label>
          )}

          <fieldset className={styles.sizeFieldset}>
            <legend>Schedule</legend>
            <label className={styles.field}><span>Run</span><select value={scheduleMode} onChange={(event) => setScheduleMode(event.target.value as "continuous" | "scheduled")}><option value="continuous">Continuously until paused</option><option value="scheduled">Schedule dates and times</option></select></label>
            {scheduleMode === "scheduled" && <div className={styles.row}><label className={styles.field}><span>Starts</span><input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required /></label><label className={styles.field}><span>Ends</span><input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} required /></label></div>}
            <small className={styles.limitNote}>The serving API will enforce campaign schedules so expired ads stop automatically.</small>
          </fieldset>

          {message && <p className={styles.notice} role="status">{message}</p>}
          <button className={styles.button} type="submit" disabled={pending}>{pending ? "Saving…" : "Save ad to library"}</button>
        </form>
      </section>

      <section className={styles.card} aria-labelledby="creative-preview-title">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>Placement preview</span>
          <h2 id="creative-preview-title">Clickable ad preview</h2>
          <p>Preview the creative at its configured size and test how rotation will select an ad.</p>
        </div>

        {previewAd ? (
          <div className={styles.previewArea}>
            <div className={styles.badges}><span>{previewAd.placement.width} × {previewAd.placement.height} placement</span><span>{previewAd.rotation} rotation</span></div>
            <div className={styles.placementFrame} style={{ aspectRatio: `${previewAd.placement.width} / ${previewAd.placement.height}`, maxWidth: `${previewAd.placement.width}px` }}>
              <a className={styles.adLink} href={previewAd.destinationUrl} target="_blank" rel="noopener noreferrer"><img src={previewAd.imageUrl} alt={previewAd.altText} /></a>
            </div>
            <p className={styles.destination}>Opens: <a href={previewAd.destinationUrl} target="_blank" rel="noopener noreferrer">{previewAd.destinationUrl}</a></p>
            <button className={styles.secondaryButton} type="button" onClick={() => choosePreview(savedAds)}>Preview another eligible ad</button>
          </div>
        ) : (
          <div className={styles.empty}><div className={styles.placeholder} aria-hidden="true">+</div><h3>No ad selected</h3><p>Save an ad to preview its size, link, and rotation behavior.</p></div>
        )}

        <section className={styles.embedSection} aria-labelledby="embed-title">
          <div className={styles.libraryHeading}><h3 id="embed-title">Place an ad on a brand page</h3></div>
          <p className={styles.embedHelp}>Choose the ad size, then copy the snippet into an HTML/embed block where the ad should appear.</p>
          <div className={styles.embedControls}>
            <label className={styles.field}><span>Width</span><input type="number" min="1" max="1600" value={embedWidth} onChange={(event) => setEmbedWidth(Number(event.target.value))} /></label>
            <label className={styles.field}><span>Height</span><input type="number" min="1" max="1200" value={embedHeight} onChange={(event) => setEmbedHeight(Number(event.target.value))} /></label>
          </div>
          <div className={styles.embedActions}>
            <button className={styles.secondaryButton} type="button" onClick={createEmbedCode}>Generate embed code</button>
            {embedCode && <button className={styles.secondaryButton} type="button" onClick={copyEmbedCode}>Copy</button>}
          </div>
          {embedCode && <textarea className={styles.embedCode} aria-label="Ad embed code" readOnly value={embedCode} rows={5} />}
        </section>

        <div className={styles.library}>
          <div className={styles.libraryHeading}><h3>Saved ads</h3><span>{savedAds.length}</span></div>
          {savedAds.length === 0 ? <p className={styles.libraryEmpty}>Your saved ads will appear here.</p> : (
            <ul className={styles.adList}>
              {savedAds.map((ad) => (
                <li className={styles.adRow} key={ad.id}>
                  <img src={ad.imageUrl} alt="" />
                  <div className={styles.adSummary}>
                    <strong>{ad.name}</strong>
                    <span>{ad.placement.width} × {ad.placement.height} · {ad.rotation}</span>
                    <span>{ad.enabled ? "Active" : "Paused"}</span>
                  </div>
                  <div className={styles.adActions}>
                    <button type="button" onClick={() => updateAd(ad.id, { enabled: !ad.enabled })}>{ad.enabled ? "Pause" : "Activate"}</button>
                    <button type="button" onClick={() => removeAd(ad.id)} aria-label={`Delete ${ad.name}`}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
