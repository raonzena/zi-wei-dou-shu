import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { personalityCharacters } from '../../content/personality-characters';
import { loadResult } from './store.server';

const headers = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

export async function resultCharacterImage(id: string) {
  try {
    const saved = await loadResult(id);
    if (!saved) return new Response(null, { status: 404, headers });
    const characters = personalityCharacters(
      saved.snapshot.reading,
      saved.snapshot.characterGender,
    );
    if (!characters.length) return new Response(null, { status: 404, headers });
    const images = await Promise.all(
      characters.map(async ({ src }) => {
        const image = await readFile(path.join(process.cwd(), 'public', src));
        return `data:image/jpeg;base64,${image.toString('base64')}`;
      }),
    );
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          background: '#F7F3E8',
        }}
      >
        {images.map((src, index) => (
          // ImageResponse renders native image elements, not next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={index} src={src} alt="" width={570} height={570} />
        ))}
      </div>,
      { width: 1200, height: 630, headers },
    );
  } catch {
    return new Response(null, { status: 503, headers });
  }
}
