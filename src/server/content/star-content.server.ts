import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import {
  starContentSchema,
  type StarContentResult,
} from '../../domain/content/star-content';

async function loadStarContent(): Promise<StarContentResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Star content unavailable');
  const db = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        }),
    },
  });
  const { data, error } = await db
    .from('star_content')
    .select(
      'star_key,version,title,translation,translation_kind,source_url,source_version,license',
    )
    .eq('locale', 'ko')
    .eq('status', 'published')
    .order('star_key');
  if (error) throw new Error('Star content unavailable');
  return { status: 'ready', entries: starContentSchema.array().parse(data) };
}

const getCachedStarContent = unstable_cache(
  loadStarContent,
  ['published-star-content-ko'],
  { revalidate: 300, tags: ['published-star-content'] },
);

export async function getStarContent(): Promise<StarContentResult> {
  try {
    return await getCachedStarContent();
  } catch {
    return { status: 'unavailable' };
  }
}
