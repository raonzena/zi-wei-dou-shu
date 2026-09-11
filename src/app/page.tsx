import * as styles from './page.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>자미두수</h1>
      <p className={styles.description}>
        명반과 한국어 해석을 만날 수 있도록 서비스를 준비하고 있습니다.
      </p>
    </main>
  );
}
