import type { Metadata } from 'next';
import { Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import '@/styles/global.css';

const sans = Noto_Sans_KR({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});
const serif = Noto_Serif_KR({
  variable: '--font-serif',
  weight: '700',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://zi-wei-dou-shu-blush.vercel.app'),
  title: '자미두수',
  description: '명반과 한국어 해석으로 알아보는 자미두수',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '자미두수',
    title: '자미두수',
    description: '나의 명반을 읽고, 나를 알아가는 시간',
  },
  twitter: {
    card: 'summary_large_image',
    title: '자미두수',
    description: '나의 명반을 읽고, 나를 알아가는 시간',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
