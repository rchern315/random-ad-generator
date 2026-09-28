import Header from "../components/Header/Header";
import PlatformWorkspace from "../components/PlatformWorkspace/PlatformWorkspace";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Ad creation + delivery</p>
          <h1>Create, upload, place, and rotate digital ads.</h1>
          <p className={styles.heroDescription}>
            Bring finished creative or build a concept with AI. Configure clickable
            ads for the placements your brands need, from wide homepage banners to
            square article ads.
          </p>
        </section>

        <PlatformWorkspace />
      </main>
    </div>
  );
}
