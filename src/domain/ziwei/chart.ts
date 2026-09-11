import { z } from 'zod';

const label = z.string().min(1);
const starSchema = z.strictObject({
  name: label,
  category: z.enum(['major', 'minor', 'adjective']),
  isMajor: z.boolean(),
  brightness: label.nullable(),
  transformation: z.enum(['록', '권', '과', '기']).nullable(),
});

const palaceSchema = z.strictObject({
  index: z.number().int().min(0).max(11),
  name: label,
  heavenlyStem: label,
  earthlyBranch: label,
  isBodyPalace: z.boolean(),
  stars: z.array(starSchema),
});

// Service chart data: no dates, gender, engine methods, or private normalization data.
export const chartSchema = z
  .strictObject({
    soulPalaceBranch: label,
    bodyPalaceBranch: label,
    fiveElementsClass: label,
    palaces: z.array(palaceSchema).length(12),
  })
  .refine((chart) => {
    const { palaces } = chart;
    const mainStars = palaces.flatMap((p) => p.stars.filter((s) => s.isMajor));
    const transformations = palaces.flatMap((p) =>
      p.stars.flatMap((s) => (s.transformation ? [s.transformation] : [])),
    );
    return (
      new Set(palaces.map((p) => p.index)).size === 12 &&
      new Set(palaces.map((p) => p.name)).size === 12 &&
      new Set(palaces.map((p) => p.earthlyBranch)).size === 12 &&
      mainStars.length === 14 &&
      transformations.length === 4 &&
      new Set(transformations).size === 4 &&
      new Set(mainStars.map((s) => s.name)).size === 14 &&
      palaces.filter((p) => p.isBodyPalace).length === 1 &&
      palaces.some(
        (p) => p.isBodyPalace && p.earthlyBranch === chart.bodyPalaceBranch,
      ) &&
      palaces.some(
        (p) => p.name === '명궁' && p.earthlyBranch === chart.soulPalaceBranch,
      )
    );
  }, 'Invalid natal chart structure');

export type Chart = z.infer<typeof chartSchema>;
