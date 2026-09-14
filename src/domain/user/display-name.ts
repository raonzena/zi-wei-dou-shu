import { z } from 'zod';

export const displayNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(20)
  .refine((value) => !/[<>\r\n\p{Cc}\p{Cf}]/u.test(value))
  .transform((value) => value.replace(/\s+/g, ' '));
