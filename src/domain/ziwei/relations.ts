import { z } from 'zod';

export const flyingTransformationSchema = z.strictObject({
  id: z.string().min(1),
  sourcePalaceId: z.string().min(1),
  targetPalaceId: z.string().min(1),
  heavenlyStem: z.string().min(1),
  type: z.enum(['록', '권', '과', '기']),
  starName: z.string().min(1),
  self: z.boolean(),
});
