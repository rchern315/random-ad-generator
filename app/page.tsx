import Header from "../components/Header/Header";
import AdWorkspace from "../components/AdWorkspace/AdWorkspace";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>AI creative workspace</p>
          <h1>Turn a simple idea into an ad concept.</h1>
          <p className={styles.heroDescription}>
            Define the product, audience, platform, and tone. AdSpark turns the
            brief into a ready-to-review creative concept.
          </p>
        </section>

        <AdWorkspace />
      </main>
    </div>
  );
}
