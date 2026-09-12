import { expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';
it('establishes an httpOnly identity on the input page and preserves existing identity', () => {
  const response = proxy(new NextRequest('https://example.com/'));
  const cookie = response.cookies.get('ziwei-result-owner');
  expect(cookie?.value).toMatch(/^[a-f0-9]{64}$/);
  expect(cookie?.httpOnly).toBe(true);
  expect(
    proxy(
      new NextRequest('https://example.com/', {
        headers: { cookie: `ziwei-result-owner=${cookie!.value}` },
      }),
    ).cookies.get('ziwei-result-owner'),
  ).toBeUndefined();
});
it('does not create different identities for cookie-less concurrent submissions', () => {
  expect(
    proxy(
      new NextRequest('https://example.com/', { method: 'POST' }),
    ).cookies.get('ziwei-result-owner'),
  ).toBeUndefined();
});
