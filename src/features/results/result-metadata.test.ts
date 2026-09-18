import { expect, it } from 'vitest';
import { createResultMetadata } from './result-metadata';

it('결과 캐릭터를 Open Graph와 Twitter의 같은 절대 URL로 연결한다', () => {
  const metadata = createResultMetadata('saved-id', '설화', true);
  const images = [
    {
      url: 'https://zi-wei-dou-shu-blush.vercel.app/result/saved-id/image',
      width: 1200,
      height: 630,
      alt: '명궁의 주성으로 표현한 성향 캐릭터',
    },
  ];
  expect(metadata.openGraph).toMatchObject({ images });
  expect(metadata.twitter).toMatchObject({ images });
});

it('이름이 있는 결과의 공유 제목을 만든다', () => {
  const metadata = createResultMetadata('result-id', '설화');
  expect(metadata.title).toBe('설화님의 명반은 어떻게 나왔을까요?');
  expect(metadata.openGraph).toMatchObject({
    title: '설화님의 명반은 어떻게 나왔을까요?',
    url: '/result/result-id',
  });
});

it('이름이 없는 기존 결과에는 일반 제목을 사용한다', () => {
  expect(createResultMetadata('result-id').title).toBe(
    '저장된 명반 | 자미두수',
  );
});
