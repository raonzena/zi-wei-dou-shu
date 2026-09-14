'use client';

import { useEffect } from 'react';
import { getPublicAdSenseConfig } from './adsense-config';
import * as styles from './styles.css';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function ResultAd() {
  const config = getPublicAdSenseConfig();
  const clientId = config?.clientId;
  const resultSlotId = config?.resultSlotId;

  useEffect(() => {
    if (!clientId || !resultSlotId) return;
    try {
      (window.adsbygoogle ??= []).push({});
    } catch {
      // 광고 차단 확장 기능이나 공급자 스크립트 오류가 풀이 이용을 막지 않게 한다.
    }
  }, [clientId, resultSlotId]);

  if (!config) return null;

  return (
    <aside className={styles.container} aria-label="광고">
      <span className={styles.label}>광고</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={resultSlotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
