import type { StarContent } from '../../domain/content/star-content';
import type { ConsultationEvidence } from '../../domain/interpretation/consultation-evidence';
import { terms } from '../../content/glossary';

/** Only natal evidence enters the seven-topic reading; timing stays in detail facts. */
export function groundedInput(
  evidence: ConsultationEvidence,
  content: StarContent[],
) {
  const position = (id: string) => {
    const palace = evidence.palaces.find((p) => p.id === id);
    if (!palace) throw new Error('Unknown palace reference');
    return {
      palaceId: id,
      branch: palace.earthlyBranch,
      natalPalace: palace.name,
      natalMajorStars: palace.stars.filter((s) => s.isMajor).map((s) => s.name),
    };
  };
  return {
    inputVersion: 'natal-reading-v3',
    starReferences: content
      .filter((c) =>
        evidence.palaces.some((p) =>
          p.stars.some((s) => `${s.category}:${s.name}` === c.star_key),
        ),
      )
      .map((c) => ({
        starKey: c.star_key,
        version: c.version,
        meaning: c.translation,
        source: c.source_url,
        sourceVersion: c.source_version,
      }))
      .sort((a, b) => a.starKey.localeCompare(b.starKey)),
    source: evidence.source,
    engine: evidence.engine,
    chartType: evidence.chartType,
    metadata: evidence.metadata,
    bodyPalace: {
      ...position(`palace:${evidence.metadata.bodyPalaceBranch}`),
      meaning: terms.신궁.description,
      distinction: '신궁은 신체·질병을 담당하는 궁이 아니며 질액궁과 구분한다.',
    },
    palaceAliases: evidence.palaceAliases,
    relationOrder: evidence.relationOrder,
    transformationLayer:
      'palaces는 생년사화; flyingTransformations는 본명반 궁간 사화',
    brightnessScale: evidence.brightnessScale,
    brightnessSource: evidence.brightnessSource,
    palaces: evidence.palaces.map((p) => ({
      ...p,
      aliases: [
        ...new Set([
          p.name,
          evidence.palaceAliases[
            p.name as keyof typeof evidence.palaceAliases
          ] ?? p.name,
          ...(p.earthlyBranch === evidence.metadata.bodyPalaceBranch
            ? ['신궁']
            : []),
        ]),
      ],
    })),
    patterns: evidence.patterns.filter((p) => p.matched),
    flyingTransformations: evidence.flyingTransformations.map((f) => ({
      ...f,
      source: position(f.sourcePalaceId),
      target: position(f.targetPalaceId),
    })),
    excluded: [...evidence.excluded, '대한·유년·유월 및 시기별 해석'],
    missing: evidence.missing,
  };
}
