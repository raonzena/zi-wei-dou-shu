import { expect, it } from 'vitest';
import { createResultMetadata } from './result-metadata';

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
