import {
  adsTxtEntry,
  getPublicAdSenseClientId,
} from '../../features/ads/adsense-config';

export const dynamic = 'force-dynamic';

export function GET() {
  const clientId = getPublicAdSenseClientId();
  const entry = clientId ? adsTxtEntry(clientId) : null;
  if (!entry)
    return new Response('Not found\n', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  return new Response(`${entry}\n`, {
    headers: {
      'cache-control': 'public, max-age=3600',
      'content-type': 'text/plain; charset=utf-8',
    },
  });
}
