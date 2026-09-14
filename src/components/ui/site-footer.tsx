import Link from 'next/link';
import * as styles from './site-footer.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Link href="/privacy">개인정보 및 쿠키 안내</Link>
    </footer>
  );
}
