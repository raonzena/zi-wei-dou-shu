import type { Metadata } from 'next';
import { resultShareTitle } from './result-title';

const fallbackTitle = '저장된 명반 | 자미두수';
const fallbackDescription = '저장된 자미두수 명반과 성향 풀이를 확인합니다.';

export function createResultMetadata(
  id: string,
  name?: string,
  hasCharacter = false,
): Metadata {
  const title = name ? resultShareTitle(name) : fallbackTitle;
  const description = name
    ? `${name}님의 자미두수 명반과 성향 풀이를 담았습니다.`
    : fallbackDescription;
  const images = [
    {
      url: new URL(
        hasCharacter ? `/result/${id}/image` : '/opengraph-image.png',
        'https://zi-wei-dou-shu-blush.vercel.app',
      ).toString(),
      ...(hasCharacter ? { width: 1200, height: 630 } : {}),
      alt: hasCharacter ? '명궁의 주성으로 표현한 성향 캐릭터' : '자미두수',
    },
  ];

  return {
    title,
    description,
    robots: { index: false, follow: false, nocache: true },
    referrer: 'strict-origin',
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      siteName: '자미두수',
      url: `/result/${id}`,
      title,
      description,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}
