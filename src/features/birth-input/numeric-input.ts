export function normalizeNumericInput(value: string, maxLength: number) {
  return value.replace(/[^0-9]/g, '').slice(0, maxLength);
}
