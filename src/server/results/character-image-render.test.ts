import { expect, it, vi } from 'vitest';
import { resultCharacterImage } from './character-image';

vi.mock('./store.server', () => ({
  loadResult: async () => ({
    snapshot: {
      characterGender: 'female',
      reading: { entries: [{ starName: '천기' }, { starName: '거문' }] },
    },
  }),
}));

it('실제 캐릭터 파일 두 장을 1200×630 PNG로 렌더링한다', async () => {
  const response = await resultCharacterImage('fixture');
  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe('image/png');
  const png = Buffer.from(await response.arrayBuffer());
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});
