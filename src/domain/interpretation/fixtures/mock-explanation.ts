import type { ConsultationEvidence } from '../consultation-evidence';

/** Test data; not a generated consultation or production fallback. */
export function mockExplanation(evidence: ConsultationEvidence) {
  return {
    sections: Array.from({ length: 11 }, (_, index) => {
      const step = index + 2;
      return {
        step,
        paragraphs: [
          {
            evidenceIds: [
              step === 11
                ? evidence.timing.yearly.id
                : [3, 10].includes(step)
                  ? evidence.timing.decadals[0].id
                  : 'chart',
            ],
            terms: '계산 근거와 설명의 연결을 확인하는 모의 자료입니다.',
            interpretation: `${step}단계 화면 검증용 문장입니다. 실제 AI가 작성한 해석이 아닙니다.`,
            check: '검증이 끝난 뒤에는 실제 해석으로 사용하지 않습니다.',
          },
        ],
      };
    }),
    monthly: Object.fromEntries(
      evidence.timing.monthly.map((m, index) => [
        m.id,
        {
          terms: '월별 구간의 필수 필드 연결을 확인하는 모의 자료입니다.',
          interpretation: `${index + 1}번째 구간의 화면 검증용 문장입니다. 실제 AI가 작성한 해석이 아닙니다.`,
          check: '해당 구간의 제목과 계산 근거가 함께 표시되는지 확인합니다.',
        },
      ]),
    ),
  };
}
