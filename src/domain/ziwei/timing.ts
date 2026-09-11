import { z } from 'zod';

const range = z.tuple([z.number().int(), z.number().int()]);
export const timingLayerSchema = z.strictObject({
  id: z.string().min(1),
  soulPalaceId: z.string().min(1),
  heavenlyStem: z.string().min(1),
  earthlyBranch: z.string().min(1),
  palaceNames: z.array(z.string().min(1)).length(12),
  movingStars: z
    .array(
      z.strictObject({ name: z.string().min(1), palaceId: z.string().min(1) }),
    )
    .min(10)
    .max(11),
  transformations: z
    .array(
      z.strictObject({
        type: z.enum(['록', '권', '과', '기']),
        starName: z.string().min(1),
        palaceId: z.string().min(1),
      }),
    )
    .length(4),
});
export const timingSchema = z.strictObject({
  policy: z.literal('iztro-timing-v2'),
  ageBasis: z.literal('iztro 음력 연도 차이 + 1 (만 나이 아님)'),
  yearBoundary: z.literal('iztro 음력 정월 초하루'),
  direction: z.enum(['순행', '역행']),
  startAge: z.number().int().min(2).max(6),
  decadals: z
    .array(timingLayerSchema.extend({ ageRange: range, yearRange: range }))
    .length(12),
  monthly: z
    .array(
      timingLayerSchema.extend({
        year: z.number().int(),
        month: z.number().int().min(1).max(12),
        isLeapMonth: z.boolean(),
        part: z.enum(['normal', 'first', 'second']),
        dayRange: z.tuple([
          z.number().int().min(1).max(30),
          z.number().int().min(1).max(30),
        ]),
      }),
    )
    .min(12)
    .max(14),
  yearly: timingLayerSchema.extend({
    year: z.number().int(),
    currentDecadalId: z.string().nullable(),
  }),
});
