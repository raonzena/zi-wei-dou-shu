export interface TokenUsage {
  input: number;
  cached: number;
  output: number;
}

/** Standard text-token snapshot pricing, not an invoice or unknown-usage estimate. */
export function estimatedMicrousd(usage: TokenUsage): number {
  return Math.ceil(
    (usage.input - usage.cached) * 0.75 +
      usage.cached * 0.075 +
      usage.output * 4.5,
  );
}

export function validUsage(usage: TokenUsage): boolean {
  return (
    [usage.input, usage.cached, usage.output].every(
      (value) => Number.isSafeInteger(value) && value >= 0 && value <= 400_000,
    ) && usage.cached <= usage.input
  );
}
