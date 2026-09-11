import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

export function actorAddress(headers: Headers, vercel: boolean): string | null {
  if (!vercel) return 'local-development';
  const ip = headers.get('x-vercel-forwarded-for')?.trim();
  if (!ip || !isIP(ip)) return null;
  // Canonicalize IPv6 spelling so equivalent addresses cannot bypass a counter.
  return isIP(ip) === 6 ? new URL(`http://[${ip}]`).hostname : ip;
}
export function privateDigest(secret: string, scope: string, value: string) {
  return createHmac('sha256', secret)
    .update(`${scope}\0${value}`)
    .digest('hex');
}
