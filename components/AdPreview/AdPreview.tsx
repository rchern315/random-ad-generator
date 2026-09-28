import type { AdDraft } from "../AdGenerator/AdGenerator";
import styles from "./AdPreview.module.css";

type AdPreviewProps = {
  ad: AdDraft | null;
};

export default function AdPreview({ ad }: AdPreviewProps) {
  return (
    <section className={styles.card} aria-labelledby="preview-title">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>Live preview</span>
        <h2 id="preview-title">Your ad concept</h2>
      </div>

      {ad ? (
        <article className={styles.preview}>
          <div className={styles.meta}>
            <span>{ad.platform}</span>
            <span>{ad.tone}</span>
          </div>
          <div className={styles.visual} aria-hidden="true">
            <span>{ad.product.charAt(0).toUpperCase()}</span>
          </div>
          <div className={styles.copy}>
            <p className={styles.audience}>For {ad.audience}</p>
            <h3>{ad.headline}</h3>
            <p>{ad.body}</p>
            <span className={styles.cta}>{ad.callToAction}</span>
          </div>
        </article>
      ) : (
        <div className={styles.empty}>
          <div className={styles.spark} aria-hidden="true">✦</div>
          <h3>Your preview will appear here</h3>
          <p>Complete the creative brief and select Generate ad.</p>
        </div>
      )}
    </section>
  );
}
