import 'server-only';
import { createClient } from '@supabase/supabase-js';
import {
  starContentSchema,
  type StarContentResult,
} from '../../domain/content/star-content';

export async function getStarContent(): Promise<StarContentResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { status: 'unavailable' };
  try {
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
    if (error) return { status: 'unavailable' };
    return { status: 'ready', entries: starContentSchema.array().parse(data) };
  } catch {
    return { status: 'unavailable' };
  }
}
