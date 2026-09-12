import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import {
  ownerCookieName,
  retentionSeconds,
  validOwnerToken,
} from './server/results/owner-cookie';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  // Establish identity before form submission; parallel POSTs must not mint owners.
  if (
    request.method === 'GET' &&
    !validOwnerToken(request.cookies.get(ownerCookieName)?.value)
  ) {
    response.cookies.set(ownerCookieName, randomBytes(32).toString('hex'), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: retentionSeconds,
    });
  }
  return response;
}
export const config = { matcher: '/' };
