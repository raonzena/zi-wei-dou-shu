import { expect, it, vi } from 'vitest';
import { resultShareMethod, resultShareUrl, shareResult } from './share';
const id = 'd964c88a-966b-4147-aae1-185f0d86f2dc';
it('shares only the result ID and selected view, without unrelated query or hash', () => {
  const origin = 'https://example.com/result/old?birth=private#secret';
  expect(resultShareUrl(origin, id, 'simple')).toBe(
    `https://example.com/result/${id}`,
  );
  expect(resultShareUrl(origin, id, 'detail')).toBe(
    `https://example.com/result/${id}?view=detail`,
  );
});
it('passes only a generic title and result URL to device sharing', async () => {
  const share = vi.fn().mockResolvedValue(undefined);
  const writeText = vi.fn();
  expect(
    await shareResult('https://example.com/result/id', 'share', {
      share,
      clipboard: { writeText },
    }),
  ).toBe('shared');
  expect(share).toHaveBeenCalledWith({
    title: '자미두수 명반 풀이',
    url: 'https://example.com/result/id',
  });
  expect(writeText).not.toHaveBeenCalled();
});
it('does not copy or report an error when device sharing is cancelled', async () => {
  const share = vi
    .fn()
    .mockRejectedValue(new DOMException('Cancelled', 'AbortError'));
  const writeText = vi.fn();
  expect(
    await shareResult('url', 'share', { share, clipboard: { writeText } }),
  ).toBe('cancelled');
  expect(writeText).not.toHaveBeenCalled();
});
it('copies on devices without sharing and on an explicit copy request', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const share = vi.fn();
  expect(await shareResult('url', 'share', { clipboard: { writeText } })).toBe(
    'copied',
  );
  expect(
    await shareResult('url', 'copy', { share, clipboard: { writeText } }),
  ).toBe('copied');
  expect(share).not.toHaveBeenCalled();
  expect(writeText).toHaveBeenCalledWith('url');
});
it('offers manual copying if permissions are denied or APIs are unavailable', async () => {
  expect(await shareResult('url', 'copy', {})).toBe('manual');
  expect(
    await shareResult('url', 'copy', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    }),
  ).toBe('manual');
  expect(
    await shareResult('url', 'share', {
      share: vi.fn().mockRejectedValue(new Error('denied')),
    }),
  ).toBe('manual');
});

it.each([
  ['Windows NT 10.0; Win64; x64', 0, 'copied'],
  ['Windows NT 10.0; Win64; x64', 10, 'copied'],
  ['Macintosh; Intel Mac OS X 10_15_7', 0, 'copied'],
  ['X11; Linux x86_64', 0, 'copied'],
  ['iPhone; CPU iPhone OS 18_0 like Mac OS X', 5, 'shared'],
  ['iPad; CPU OS 18_0 like Mac OS X', 5, 'shared'],
  ['Macintosh; Intel Mac OS X 10_15_7', 5, 'shared'],
  ['Linux; Android 15; Pixel 9; wv', 5, 'shared'],
  ['Linux; Android 15; SM-X910', 5, 'shared'],
] as const)(
  'routes sharing for %s with %i touch points to %s',
  async (userAgent, maxTouchPoints, outcome) => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    const method = resultShareMethod({ userAgent, maxTouchPoints });
    expect(
      await shareResult('url', method, { share, clipboard: { writeText } }),
    ).toBe(outcome);
    expect(share).toHaveBeenCalledTimes(outcome === 'shared' ? 1 : 0);
    expect(writeText).toHaveBeenCalledTimes(outcome === 'copied' ? 1 : 0);
  },
);
