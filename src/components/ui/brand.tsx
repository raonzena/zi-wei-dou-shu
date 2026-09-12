'use client';

import Link from 'next/link';
import Logo from '@/app/icon.svg';
import * as styles from './brand.css';

export function Brand() {
  return (
    <Link
      href="/"
      className={styles.brand}
      aria-label="자미두수 홈"
      prefetch={false}
      onNavigate={(event) => {
        event.preventDefault();
        window.location.assign('/');
      }}
    >
      <Logo className={styles.logo} aria-hidden="true" focusable="false" />
      <span>자미두수</span>
    </Link>
  );
}

export function Seal() {
  return (
    <span className={styles.seal} aria-hidden="true" lang="zh-Hant">
      紫微
      <br />
      斗數
    </span>
  );
}
