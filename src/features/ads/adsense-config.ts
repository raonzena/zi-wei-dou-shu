const clientIdPattern = /^ca-pub-\d{16}$/;
const slotIdPattern = /^\d+$/;

export type AdSenseConfig = {
  clientId: string;
  resultSlotId: string;
};

export function parseAdSenseClientId(clientId?: string) {
  const normalizedClientId = clientId?.trim();
  return normalizedClientId && clientIdPattern.test(normalizedClientId)
    ? normalizedClientId
    : null;
}

export function parseAdSenseConfig({
  clientId,
  resultSlotId,
}: {
  clientId?: string;
  resultSlotId?: string;
}): AdSenseConfig | null {
  const normalizedClientId = parseAdSenseClientId(clientId);
  const normalizedSlotId = resultSlotId?.trim();
  if (
    !normalizedClientId ||
    !normalizedSlotId ||
    !slotIdPattern.test(normalizedSlotId)
  )
    return null;
  return {
    clientId: normalizedClientId,
    resultSlotId: normalizedSlotId,
  };
}

export function getPublicAdSenseClientId() {
  return parseAdSenseClientId(process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID);
}

export function getPublicAdSenseConfig() {
  return parseAdSenseConfig({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID,
    resultSlotId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_RESULT_SLOT_ID,
  });
}

export function adsTxtEntry(clientId: string) {
  const normalizedClientId = parseAdSenseClientId(clientId);
  if (!normalizedClientId) return null;
  return `google.com, ${normalizedClientId.slice(3)}, DIRECT, f08c47fec0942fa0`;
}
