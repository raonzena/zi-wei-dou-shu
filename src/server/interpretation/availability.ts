import 'server-only';

/** Server kill switch: absent means enabled; only explicit false disables AI. */
export function isAiExplanationEnabled() {
  return process.env.AI_EXPLANATION_ENABLED !== 'false';
}
