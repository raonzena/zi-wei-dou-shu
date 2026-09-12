import type { Chart } from '../../domain/ziwei/chart';
import { positions } from './display';
import { atom } from 'jotai';
export const selectedPalaceAtom = atom<number | null>(null);

export function selectedPalace(chart: Chart, index: number | null) {
  return chart.palaces.find((palace) => {
    if (index !== null) return palace.index === index;
    const [row, column] = positions[palace.earthlyBranch];
    return row === 1 && column === 1;
  })!;
}
