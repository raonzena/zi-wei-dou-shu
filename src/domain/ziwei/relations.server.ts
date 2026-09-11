import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe';
import { getMutagensByHeavenlyStem } from 'iztro/lib/utils';

/** Natal palace stems only; not a chain of inferred flying transformations. */
export function projectFlyingTransformations(raw: IFunctionalAstrolabe) {
  return raw.palaces.flatMap((p) => {
    const stars = getMutagensByHeavenlyStem(p.heavenlyStem);
    const targets = raw.palace(p.index)!.mutagedPlaces();
    return stars.map((starName, i) => {
      const target = targets[i];
      if (!target) throw new Error('Missing flying transformation target');
      return {
        id: `flying:${p.earthlyBranch}:${i}`,
        sourcePalaceId: `palace:${p.earthlyBranch}`,
        targetPalaceId: `palace:${target.earthlyBranch}`,
        heavenlyStem: p.heavenlyStem,
        type: (['록', '권', '과', '기'] as const)[i],
        starName,
        self: p.index === target.index,
      };
    });
  });
}
