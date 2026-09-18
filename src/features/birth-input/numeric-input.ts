export function normalizeNumericInput(value: string, maxLength: number) {
  return value.replace(/[^0-9]/g, '').slice(0, maxLength);
}

export function sanitizeNumericInputElement(
  input: HTMLInputElement,
  maxLength: number,
) {
  const raw = input.value;
  const normalized = normalizeNumericInput(raw, maxLength);
  if (raw === normalized) return;
  const caret = input.selectionStart;
  input.value = normalized;
  if (caret !== null) {
    const nextCaret = normalizeNumericInput(
      raw.slice(0, caret),
      maxLength,
    ).length;
    input.setSelectionRange(nextCaret, nextCaret);
  }
}
