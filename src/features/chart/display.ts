import type { Chart } from '../../domain/ziwei/chart';
import { starTerms } from '../../content/glossary';
export type Palace = Chart['palaces'][number];
export type Star = Palace['stars'][number];
// Clockwise ring: 巳午未申 / 辰..酉 / 卯..戌 / 寅丑子亥.
export const positions: Record<string, [number, number]> = {
  사: [1, 1],
  오: [1, 2],
  미: [1, 3],
  신: [1, 4],
  유: [2, 4],
  술: [3, 4],
  해: [4, 4],
  자: [4, 3],
  축: [4, 2],
  인: [4, 1],
  묘: [3, 1],
  진: [2, 1],
};
export const starKey = (star: Star) => `${star.category}:${star.name}`;
export const displayedStars = (palace: Palace) =>
  palace.stars.filter((star) => Object.hasOwn(starTerms, starKey(star)));
