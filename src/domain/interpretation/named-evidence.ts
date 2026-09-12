import { starTerms } from '../../content/glossary';
import type { ConsultationEvidence } from './consultation-evidence';

/** Checks explicitly named known stars, not the semantic truth of an interpretation. */
export function validateNamedStars(
  text: string,
  ids: string[],
  evidence: ConsultationEvidence,
) {
  const allowed = new Set<string>();
  const addPalace = (id: string) =>
    evidence.palaces
      .find((p) => p.id === id)
      ?.stars.forEach((s) => allowed.add(s.name));
  for (const id of ids) {
    const palace = evidence.palaces.find((p) => p.id === id);
    if (palace) addPalace(id);
    for (const p of evidence.palaces)
      for (const star of p.stars) if (star.id === id) allowed.add(star.name);
    const flying = evidence.flyingTransformations.find((f) => f.id === id);
    if (flying) {
      allowed.add(flying.starName);
      addPalace(flying.sourcePalaceId);
      addPalace(flying.targetPalaceId);
    }
    const pattern = evidence.patterns.find((p) => p.id === id && p.matched);
    if (pattern) pattern.palaceIds.forEach(addPalace);
    if (id === 'chart') {
      allowed.add(evidence.metadata.soulStar);
      allowed.add(evidence.metadata.bodyStar);
    }
  }
  const named = new Set(
    Object.keys(starTerms)
      .map((key) => key.split(':')[1])
      .filter((name) => text.includes(name)),
  );
  for (const name of named)
    if (!allowed.has(name))
      throw new Error('Named star missing from passage evidence');
}
