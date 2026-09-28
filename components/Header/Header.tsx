import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <a className={styles.brand} href="/" aria-label="AdSpark home">
        <span className={styles.logo} aria-hidden="true">A</span>
        <span>AdSpark</span>
      </a>
      <div className={styles.status}>
        <span className={styles.statusDot} aria-hidden="true" />
        Ad platform
      </div>
    </header>
  );
}
