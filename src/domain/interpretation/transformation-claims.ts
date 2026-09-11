import type { ConsultationEvidence } from './consultation-evidence';

/** Checks explicit star/transformation pairs, not arbitrary natural-language truth. */
export function validateTransformationClaims(
  prose: string,
  ids: string[],
  evidence: ConsultationEvidence,
) {
  const layers = [
    ...evidence.timing.decadals,
    evidence.timing.yearly,
    ...evidence.timing.monthly,
  ];
  const selected = layers.filter((l) => ids.includes(l.id));
  if (!selected.length) return;
  const allowed = new Set(
    selected.flatMap((l) =>
      l.transformations.map((t) => `${t.starName}:${t.type}`),
    ),
  );
  const stars = [
    ...new Set(evidence.palaces.flatMap((p) => p.stars.map((s) => s.name))),
  ];
  // Require 化 or whitespace so conjunctions such as "무곡과" are not read as 化科.
  const pattern = new RegExp(
    `(${stars.join('|')})(?:\\s*화\\s*|\\s+)([록권과기])(?=$|[\\s·,.:;、，。은는이가을를의와과도에으])`,
    'g',
  );
  for (const m of prose.matchAll(pattern)) {
    if (!allowed.has(`${m[1]}:${m[2]}`))
      throw new Error('Transformation contradicts cited timing');
  }
}
