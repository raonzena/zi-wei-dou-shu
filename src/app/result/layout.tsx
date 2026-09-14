import type { ReactNode } from 'react';
import Script from 'next/script';
import { getPublicAdSenseConfig } from '../../features/ads/adsense-config';

export default function ResultLayout({ children }: { children: ReactNode }) {
  const config = getPublicAdSenseConfig();
  return (
    <>
      {children}
      {config ? (
        <Script
          id="google-adsense"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.clientId}`}
        />
      ) : null}
    </>
  );
}
