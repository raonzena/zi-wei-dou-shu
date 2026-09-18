import { beforeEach, expect, it, vi } from 'vitest';
import { resultCharacterImage } from './character-image';
const m = vi.hoisted(() => ({ load: vi.fn(), read: vi.fn(), render: vi.fn() }));
vi.mock('./store.server', () => ({ loadResult: m.load }));
vi.mock('node:fs/promises', () => ({ readFile: m.read }));
vi.mock('next/og', () => ({
  ImageResponse: class {
    constructor(element: unknown, options: ResponseInit) {
      m.render(element);
      return new Response('png', options);
    }
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
  m.read.mockResolvedValue(Buffer.from('image'));
  m.load.mockResolvedValue({
    snapshot: {
      characterGender: 'female',
      reading: { entries: [{ starName: '천기' }, { starName: '거문' }] },
    },
  });
});
it('성별에 맞는 두 이미지만 읽어 캐시하지 않는 공유 이미지를 만든다', async () => {
  const response = await resultCharacterImage('id');
  expect(response.status).toBe(200);
  expect(m.read.mock.calls.map((call) => call[0])).toEqual([
    expect.stringContaining('tianji-female.jpg'),
    expect.stringContaining('jumen-female.jpg'),
  ]);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(m.render).toHaveBeenCalledOnce();
});
it('없거나 만료된 결과는 이미지를 읽거나 생성하지 않는다', async () => {
  m.load.mockResolvedValue(null);
  expect((await resultCharacterImage('expired')).status).toBe(404);
  expect(m.read).not.toHaveBeenCalled();
  expect(m.render).not.toHaveBeenCalled();
});
it('성별이 없으면 임의 이미지를 만들지 않는다', async () => {
  m.load.mockResolvedValue({
    snapshot: { reading: { entries: [{ starName: '천기' }] } },
  });
  expect((await resultCharacterImage('unknown')).status).toBe(404);
  expect(m.render).not.toHaveBeenCalled();
});
it('조회 장애는 결과 없음과 구분한다', async () => {
  m.load.mockRejectedValue(new Error('database'));
  expect((await resultCharacterImage('id')).status).toBe(503);
});
