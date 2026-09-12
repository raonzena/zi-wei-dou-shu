import type { ConsultationEvidence } from '../consultation-evidence';
import { readingSections } from '../ai-explanation';

/** Test data; not a generated consultation or production fallback. */
export function mockExplanation(evidence: ConsultationEvidence) {
  const soul = evidence.palaces.find((palace) => palace.name === '명궁')!;
  const career = evidence.palaces.find((palace) => palace.name === '관록')!;
  const money = evidence.palaces.find((palace) => palace.name === '재백')!;
  const partner = evidence.palaces.find((palace) => palace.name === '부처')!;
  const inner = evidence.palaces.find((palace) => palace.name === '복덕')!;
  const health = evidence.palaces.find((palace) => palace.name === '질액')!;
  const social = evidence.palaces.find((palace) => palace.name === '노복')!;
  const references = [soul, career, money, partner, inner, health, social];

  return {
    overview: {
      paragraphs: [
        '전체적인 성향과 생활 패턴을 짧고 자연스럽게 확인하기 위한 모의 해석입니다.',
      ],
      evidenceIds: ['chart', soul.id],
    },
    sections: readingSections.map((section, index) => ({
      id: section.id,
      title: `${section.label}: 화면 형식을 확인하는 문장`,
      paragraphs: [
        `${section.label} 영역이 정해진 순서와 형식으로 표시되는지 확인하는 모의 문장입니다.`,
      ],
      bulletPoints:
        index === 1 ? ['필요한 경우에만 짧은 목록을 표시합니다.'] : [],
      evidenceIds: [references[index].id],
    })),
    closing: {
      text: '한 줄로 정리하면, 이 문장은 결과 화면의 마지막 요약 형식을 확인하기 위한 모의 자료입니다.',
      evidenceIds: ['chart', soul.id],
    },
  };
}
