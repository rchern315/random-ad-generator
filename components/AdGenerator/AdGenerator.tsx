"use client";

import { FormEvent, useState } from "react";
import styles from "./AdGenerator.module.css";

export type AdDraft = {
  product: string;
  destinationUrl: string;
  instructions: string;
  audience: string;
  platform: string;
  tone: string;
  headline: string;
  body: string;
  callToAction: string;
};

type AdGeneratorProps = {
  onGenerate: (ad: AdDraft) => void;
};

export default function AdGenerator({ onGenerate }: AdGeneratorProps) {
  const [product, setProduct] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Friendly");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/generate-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, audience, platform, tone, destinationUrl, instructions }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Ad generation failed.");

      setIsDemo(result.demo === true);
      onGenerate({ product: product.trim(), audience: audience.trim(), platform, tone, destinationUrl, instructions, ...result });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate the ad.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={styles.card} aria-labelledby="generator-title">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>AI creative studio</span>
        <h2 id="generator-title">What are we advertising?</h2>
        <p>Describe the product and audience. AI will draft ad copy for your selected channel.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Product or service</span>
          <input value={product} onChange={(event) => setProduct(event.target.value)} placeholder="e.g. Dog grooming membership" maxLength={200} required />
        </label>

        <label className={styles.field}>
          <span>Target audience</span>
          <input value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="e.g. Busy pet parents" maxLength={200} required />
        </label>

        <label className={styles.field}><span>Destination URL</span><input type="url" placeholder="https://brand.com/campaign" value={destinationUrl} onChange={e=>setDestinationUrl(e.target.value)} required /></label>
        <label className={styles.field}><span>Describe the ad you want</span><textarea rows={4} maxLength={1200} placeholder="For example: A bright summer campaign focused on our new smoothie flavors, with an energetic headline and a clear call to action." value={instructions} onChange={e=>setInstructions(e.target.value)} required /></label>
        <div className={styles.row}>
          <label className={styles.field}>
            <span>Platform</span>
            <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
              <option>Instagram</option><option>Facebook</option><option>LinkedIn</option><option>Google Ads</option><option>Website display</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Tone</span>
            <select value={tone} onChange={(event) => setTone(event.target.value)}>
              <option>Friendly</option><option>Professional</option><option>Playful</option><option>Bold</option>
            </select>
          </label>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}
        {isDemo && <p role="status">Sample copy generated in portfolio demo mode. This preview does not use AI.</p>}
        <button className={styles.button} type="submit" disabled={pending}>
          {pending ? "Generating with AI…" : "Generate ad with AI"}
        </button>
        <p className={styles.helper}>Public demo uses sample copy with no paid AI requests. Review all copy for accuracy before publishing.</p>
      </form>
    </section>
  );
}
