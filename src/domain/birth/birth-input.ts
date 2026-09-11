import { z } from 'zod';

const fields = {
  year: z.number().int().min(1).max(9999),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  gender: z.enum(['male', 'female']),
};

// Calendar-specific shape prevents a hidden leap-month flag on solar input.
// Form controls must convert numeric strings explicitly; do not coerce empty input to zero.
export const birthInputSchema = z.discriminatedUnion('calendar', [
  z.strictObject({ calendar: z.literal('solar'), ...fields }),
  z.strictObject({
    calendar: z.literal('lunar'),
    ...fields,
    isLeapMonth: z.boolean(),
  }),
]);

export type BirthInput = z.infer<typeof birthInputSchema>;
