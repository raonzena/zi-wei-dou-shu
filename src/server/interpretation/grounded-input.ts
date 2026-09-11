import type { ConsultationEvidence } from '../../domain/interpretation/consultation-evidence';

/** Resolve every cross-layer position on the server; the model never joins arrays. */
export function groundedInput(evidence: ConsultationEvidence) {
  const position = (id: string) => {
    const p = evidence.palaces.find((p) => p.id === id);
    if (!p) throw new Error('Unknown palace reference');
    return {
      palaceId: id,
      branch: p.earthlyBranch,
      natalPalace: p.name,
      natalMajorStars: p.stars.filter((s) => s.isMajor).map((s) => s.name),
    };
  };
  const resolve = <
    T extends
      | ConsultationEvidence['timing']['decadals'][number]
      | ConsultationEvidence['timing']['yearly']
      | ConsultationEvidence['timing']['monthly'][number],
  >(
    layer: T,
  ) => {
    const { palaceNames, ...rest } = layer;
    const placements = evidence.palaces.map((p, i) => ({
      ...position(p.id),
      timingPalace: palaceNames[i],
    }));
    const at = (id: string) => placements.find((p) => p.palaceId === id)!;
    return {
      ...rest,
      layer: layer.id.startsWith('decadal:')
        ? '대한'
        : layer.id.startsWith('yearly:')
          ? '유년'
          : '유월',
      soulPalace: at(layer.soulPalaceId),
      placements: placements.map(({ branch, natalPalace, timingPalace }) => ({
        branch,
        natalPalace,
        timingPalace,
      })),
      transformations: layer.transformations.map((t) => ({
        ...t,
        natalPalace: at(t.palaceId).natalPalace,
        timingPalace: at(t.palaceId).timingPalace,
      })),
      movingStars: layer.movingStars.map((s) => ({
        name: s.name,
        natalPalace: at(s.palaceId).natalPalace,
        timingPalace: at(s.palaceId).timingPalace,
      })),
    };
  };
  return {
    ...evidence,
    inputVersion: 'resolved-layers-v4',
    yearlyReadingBoundary: {
      scope: '11단계 유년 설명에서 사용할 사화의 유일한 출처',
      evidenceId: evidence.timing.yearly.id,
      yearStem: evidence.timing.yearly.heavenlyStem,
      soulPalace: position(evidence.timing.yearly.soulPalaceId),
      transformationStatements: evidence.timing.yearly.transformations.map(
        (t) =>
          `${evidence.timing.yearly.year}년 유년 사화: ${t.starName} 화${t.type} · 본명반 ${position(t.palaceId).natalPalace}궁 · ${position(t.palaceId).branch} 위치`,
      ),
      rule: '유년 명궁이 위치한 본명반 궁의 천간은 연간이 아니다. 그 궁에서 출발하는 궁간 사화를 유년 사화로 사용하지 않는다. 11단계는 이 목록에 없는 사화를 서술하지 않는다.',
    },
    timing: {
      ...evidence.timing,
      decadals: evidence.timing.decadals.map(resolve),
      yearly: resolve(evidence.timing.yearly),
      monthly: evidence.timing.monthly.map(resolve),
    },
    flyingTransformations: evidence.flyingTransformations.map((f) => ({
      ...f,
      source: position(f.sourcePalaceId),
      target: position(f.targetPalaceId),
    })),
  };
}
