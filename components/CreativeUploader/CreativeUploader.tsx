"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import styles from "./CreativeUploader.module.css";

type Dimensions = { width: number; height: number };

type UploadedCreative = {
  name: string;
  imageUrl: string;
  destinationUrl: string;
  altText: string;
  creative: Dimensions;
  placement: Dimensions;
  rotation: "fixed" | "refresh" | "sticky";
  cookieHours: number;
};

const sizes = {
  leaderboard: { label: "Homepage banner — 1200 × 200", width: 1200, height: 200 },
  square: { label: "Article square — 300 × 300", width: 300, height: 300 },
  custom: { label: "Custom placement size", width: 600, height: 300 },
};

export default function CreativeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [creative, setCreative] = useState<Dimensions | null>(null);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [size, setSize] = useState<keyof typeof sizes>("leaderboard");
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(200);
  const [rotation, setRotation] = useState<UploadedCreative["rotation"]>("fixed");
  const [cookieHours, setCookieHours] = useState(24);
  const [savedAd, setSavedAd] = useState<UploadedCreative | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setCreative(null);
    setSavedAd(null);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!selected) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);

    const image = new Image();
    image.onload = () => {
      setCreative({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.src = objectUrl;
  }

  function handleSize(value: keyof typeof sizes) {
    setSize(value);
    setSavedAd(null);
    if (value !== "custom") {
      setWidth(sizes[value].width);
      setHeight(sizes[value].height);
    }
  }

  function useCreativeDimensions() {
    if (!creative) return;
    setSize("custom");
    setWidth(creative.width);
    setHeight(creative.height);
    setSavedAd(null);
  }

  const matchesPlacement =
    creative !== null &&
    creative.width === width &&
    creative.height === height;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !previewUrl || !creative) return;

    setSavedAd({
      name: file.name,
      imageUrl: previewUrl,
      destinationUrl,
      altText,
      creative,
      placement: { width, height },
      rotation,
      cookieHours,
    });
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
          <label className={styles.field}>
            <span>Creative image</span>
            <input type="file" accept="image/gif,image/jpeg,image/png" onChange={handleFile} required />
            <small>GIF, JPEG, or PNG. We read the image dimensions automatically.</small>
          </label>

          {creative && (
            <div className={styles.creativeInfo}>
              <div>
                <span>Uploaded creative</span>
                <strong>{creative.width} × {creative.height}px</strong>
              </div>
              <button type="button" onClick={useCreativeDimensions}>
                Use as custom placement
              </button>
            </div>
          )}

          <label className={styles.field}>
            <span>Destination URL</span>
            <input type="url" value={destinationUrl} onChange={(event) => setDestinationUrl(event.target.value)} placeholder="https://advertiser.com/offer" required />
          </label>

          <label className={styles.field}>
            <span>Image alt text</span>
            <input value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Describe the ad for screen-reader users" required />
          </label>

          <label className={styles.field}>
            <span>Placement size</span>
            <select value={size} onChange={(event) => handleSize(event.target.value as keyof typeof sizes)}>
              {Object.entries(sizes).map(([key, option]) => (
                <option key={key} value={key}>{option.label}</option>
              ))}
            </select>
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Width (px)</span>
              <input type="number" min="1" value={width} disabled={size !== "custom"} onChange={(event) => setWidth(Number(event.target.value))} />
            </label>
            <label className={styles.field}>
              <span>Height (px)</span>
              <input type="number" min="1" value={height} disabled={size !== "custom"} onChange={(event) => setHeight(Number(event.target.value))} />
            </label>
          </div>

          {creative && (
            <div className={matchesPlacement ? styles.match : styles.warning} role="status">
              <strong>{matchesPlacement ? "Creative matches this placement." : "Creative dimensions do not match this placement."}</strong>
              <span>
                Creative: {creative.width} × {creative.height}px · Placement: {width} × {height}px
              </span>
            </div>
          )}

          <label className={styles.field}>
            <span>Rotation behavior</span>
            <select value={rotation} onChange={(event) => setRotation(event.target.value as UploadedCreative["rotation"])}>
              <option value="fixed">Fixed — always display this ad</option>
              <option value="refresh">Random pool — change on page refresh</option>
              <option value="sticky">Sticky random — keep until cookie expires</option>
            </select>
          </label>

          {rotation === "sticky" && (
            <label className={styles.field}>
              <span>Keep selected ad for</span>
              <div className={styles.inlineInput}>
                <input type="number" min="1" value={cookieHours} onChange={(event) => setCookieHours(Number(event.target.value))} />
                <span>hours</span>
              </div>
            </label>
          )}

          <button className={styles.button} type="submit">Save & preview ad</button>
        </form>
      </section>

      <section className={styles.card} aria-labelledby="creative-preview-title">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>Placement preview</span>
          <h2 id="creative-preview-title">Clickable ad preview</h2>
          <p>The creative is never stretched. A mismatch is shown so the wrong artwork is not assigned accidentally.</p>
        </div>

        {savedAd ? (
          <div className={styles.previewArea}>
            <div className={styles.badges}>
              <span>{savedAd.placement.width} × {savedAd.placement.height} placement</span>
              <span className={savedAd.creative.width === savedAd.placement.width && savedAd.creative.height === savedAd.placement.height ? styles.goodBadge : styles.warnBadge}>
                {savedAd.creative.width} × {savedAd.creative.height} creative
              </span>
            </div>
            <div
              className={styles.placementFrame}
              style={{ aspectRatio: `${savedAd.placement.width} / ${savedAd.placement.height}`, maxWidth: `${savedAd.placement.width}px` }}
            >
              <a className={styles.adLink} href={savedAd.destinationUrl} target="_blank" rel="noopener noreferrer">
                <img src={savedAd.imageUrl} alt={savedAd.altText} />
              </a>
            </div>
            <dl className={styles.details}>
              <div><dt>File</dt><dd>{savedAd.name}</dd></div>
              <div><dt>Destination</dt><dd>{savedAd.destinationUrl}</dd></div>
              <div><dt>Rotation</dt><dd>{savedAd.rotation === "sticky" ? `Sticky random · ${savedAd.cookieHours}h` : savedAd.rotation}</dd></div>
            </dl>
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.placeholder} aria-hidden="true">+</div>
            <h3>No creative saved yet</h3>
            <p>Upload an image and configure the ad to see its placement preview.</p>
          </div>
        )}
      </section>
    </div>
  );
}
