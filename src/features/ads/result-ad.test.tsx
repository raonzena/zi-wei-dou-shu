import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { ResultAd } from './result-ad';

vi.mock('./styles.css', () => ({
  container: 'container',
  label: 'label',
}));

afterEach(() => vi.unstubAllEnvs());

it('광고 설정이 없으면 빈 영역과 광고 요청 요소를 만들지 않는다', () => {
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID', '');
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_RESULT_SLOT_ID', '');
  expect(renderToStaticMarkup(<ResultAd />)).toBe('');
});

it('유효한 설정이 있으면 구분된 반응형 결과 광고를 표시한다', () => {
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID', 'ca-pub-1234567890123456');
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_RESULT_SLOT_ID', '1234567890');
  const html = renderToStaticMarkup(<ResultAd />);
  expect(html).toContain('aria-label="광고"');
  expect(html).toContain('data-ad-client="ca-pub-1234567890123456"');
  expect(html).toContain('data-ad-slot="1234567890"');
  expect(html).toContain('data-full-width-responsive="true"');
});
