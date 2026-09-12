import type { ConsultationEvidence } from '../consultation-evidence';
import { readingSections } from '../ai-explanation';

/** Test-only structured passages, never production fallback content. */
export function mockExplanation(evidence: ConsultationEvidence) {
  const names = ['명궁', '관록', '재백', '부처', '복덕', '질액', '노복'];
  const passage = (text: string, id: string) => ({
    text,
    evidence: [{ id, relevance: text, interpretation: text }],
  });
  const soul = evidence.palaces.find((p) => p.name === '명궁')!;
  return {
    overview: {
      paragraphs: [
        passage('명궁을 전체 성향의 근거로 읽는 모의 해석입니다.', soul.id),
      ],
    },
    sections: readingSections.map((section, index) => {
      const palace = evidence.palaces.find((p) => p.name === names[index])!;
      return {
        id: section.id,
        title: passage(
          `${section.label}: ${palace.name}의 의미를 확인하는 모의 제목`,
          palace.id,
        ),
        paragraphs: [
          {
            ...passage(
              `${palace.name}의 성향을 바탕으로 ${section.label}의 생활 모습을 설명하는 모의 문장입니다. 익숙한 선택의 기준을 살펴보는 내용입니다. 상황에 따라 다른 반응이 나올 수도 있습니다. 실제 경험에 따라 나타나는 정도는 다를 수 있습니다.`,
              palace.id,
            ),
            id: 'p1' as 'p1' | 'p2' | 'p3',
          },
        ],
        bulletPoints:
          index === 1
            ? [
                {
                  text: '결정하기 전에 기준을 정리해 보는 모의 조언입니다.',
                  paragraphId: 'p1' as 'p1' | 'p2' | 'p3',
                  reason:
                    '첫 문단의 판단 성향에 따라 기준을 정리하는 행동을 제안합니다.',
                },
              ]
            : [],
      };
    }),
    closing: passage(
      '한 줄로 정리하면, 명궁을 전체 성향의 근거로 읽는 모의 요약입니다.',
      soul.id,
    ),
  };
}
