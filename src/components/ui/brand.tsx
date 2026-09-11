import * as styles from './brand.css';

export function Brand() {
  return (
    <p className={styles.brand}>
      <span lang="zh-Hant" aria-hidden="true">
        紫微斗數
      </span>
      <span>자미두수</span>
    </p>
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
