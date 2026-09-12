import { z } from 'zod';

export const starContentSchema = z.object({
  star_key: z.string(),
  version: z.number().int().positive(),
  title: z.string(),
  translation: z.string(),
  translation_kind: z.enum(['adaptation', 'full_translation']),
  source_url: z.url().refine((url) => new URL(url).hostname === 'iztro.com'),
  source_version: z.string(),
  license: z.string(),
});
export type StarContent = z.infer<typeof starContentSchema>;
export type StarContentResult =
  { status: 'ready'; entries: StarContent[] } | { status: 'unavailable' };
