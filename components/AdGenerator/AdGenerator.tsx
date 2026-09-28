"use client";

import { FormEvent, useState } from "react";
import styles from "./AdGenerator.module.css";

export type AdDraft = {
  product: string;
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

const openings = [
  "Meet the easier way to",
  "Ready to transform how you",
  "Your next favorite way to",
  "Make every day better with",
];

export default function AdGenerator({ onGenerate }: AdGeneratorProps) {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Friendly");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const opening = openings[Math.floor(Math.random() * openings.length)];
    const productName = product.trim() || "your product";
    const audienceName = audience.trim() || "your customers";

    onGenerate({
      product: productName,
      audience: audienceName,
      platform,
      tone,
      headline: `${opening} ${productName}`,
      body: `${productName} was made for ${audienceName}. Discover a ${tone.toLowerCase()} experience designed to get attention on ${platform}.`,
      callToAction: "Learn More",
    });
  }

  return (
    <section className={styles.card} aria-labelledby="generator-title">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>Creative brief</span>
        <h2 id="generator-title">What are we advertising?</h2>
        <p>Give us a few details and generate a quick ad concept.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Product or service</span>
          <input
            value={product}
            onChange={(event) => setProduct(event.target.value)}
            placeholder="e.g. Dog grooming membership"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Target audience</span>
          <input
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            placeholder="e.g. Busy pet parents"
            required
          />
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Platform</span>
            <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>LinkedIn</option>
              <option>Google Ads</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Tone</span>
            <select value={tone} onChange={(event) => setTone(event.target.value)}>
              <option>Friendly</option>
              <option>Professional</option>
              <option>Playful</option>
              <option>Bold</option>
            </select>
          </label>
        </div>

        <button className={styles.button} type="submit">
          Generate ad
        </button>

        <p className={styles.helper}>
          This first version generates locally. We&apos;ll replace the mock logic with an AI API next.
        </p>
      </form>
    </section>
  );
}
