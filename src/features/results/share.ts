// Device policy is independent of viewport width and attached pointer devices.
export function resultShareMethod({
  userAgent,
  maxTouchPoints,
}: Pick<Navigator, 'userAgent' | 'maxTouchPoints'>): 'share' | 'copy' {
  const mobileOrTablet = /Android|iPhone|iPad|iPod/i.test(userAgent);
  const desktopModeIPad = /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
  return mobileOrTablet || desktopModeIPad ? 'share' : 'copy';
}

export function resultShareUrl(origin: string, id: string, view: string) {
  const url = new URL(
    `/result/${encodeURIComponent(id)}`,
    new URL(origin).origin,
  );
  if (view === 'detail') url.searchParams.set('view', 'detail');
  return url.href;
}

type ShareBrowser = {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
};
export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'manual';
export async function shareResult(
  url: string,
  method: 'share' | 'copy',
  browser: ShareBrowser,
): Promise<ShareOutcome> {
  if (method === 'share' && browser.share) {
    try {
      await browser.share({ title: '자미두수 명반 풀이', url });
      return 'shared';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError')
        return 'cancelled';
      return 'manual';
    }
  }
  try {
    if (!browser.clipboard) return 'manual';
    await browser.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'manual';
  }
}
