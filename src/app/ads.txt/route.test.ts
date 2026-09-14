import { afterEach, expect, it, vi } from 'vitest';
import { GET } from './route';

afterEach(() => vi.unstubAllEnvs());

it('게시자 ID가 없거나 잘못되면 ads.txt를 공개하지 않는다', async () => {
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID', '');
  expect(GET().status).toBe(404);
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID', 'invalid');
  expect(GET().status).toBe(404);
});

it('유효한 게시자 ID를 루트 ads.txt 형식으로 반환한다', async () => {
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID', 'ca-pub-1234567890123456');
  const response = GET();
  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe(
    'text/plain; charset=utf-8',
  );
  expect(await response.text()).toBe(
    'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n',
  );
});
