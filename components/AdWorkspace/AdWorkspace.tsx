"use client";

import { useState } from "react";
import AdGenerator, { type AdDraft } from "../AdGenerator/AdGenerator";
import AdPreview from "../AdPreview/AdPreview";
import styles from "./AdWorkspace.module.css";

export default function AdWorkspace() {
  const [ad, setAd] = useState<AdDraft | null>(null);

  return (
    <div className={styles.workspace}>
      <AdGenerator onGenerate={setAd} />
      <AdPreview ad={ad} />
    </div>
  );
}
