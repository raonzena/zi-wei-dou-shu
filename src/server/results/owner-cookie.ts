export const ownerCookieName = 'ziwei-result-owner';
export const retentionSeconds = 30 * 24 * 60 * 60;
export const validOwnerToken = (value: string | undefined): value is string =>
  value !== undefined && /^[a-f0-9]{64}$/.test(value);
