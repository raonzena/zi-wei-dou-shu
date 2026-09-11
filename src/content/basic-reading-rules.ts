// Short editorial summaries of iztro's star descriptions, not combined-chart judgments.
// Reflection questions are our own prompts, not predictions from the source.
export const basicReadingVersion = 'ming-major-v1';
export const basicReadingSource = 'https://iztro.com/learn/major-star';
export const basicReadingRules: Record<
  string,
  { id: string; meaning: string; question: string }
> = {
  자미: {
    id: 'ming-ziwei',
    meaning: '전체를 내다보고 방향을 정하는 주도성과 연결해 읽습니다.',
    question: '최근 함께한 일에서 나는 어떤 역할을 맡았나요?',
  },
  천기: {
    id: 'ming-tianji',
    meaning: '생각을 넓히고 여러 방법을 구상하는 태도와 연결해 읽습니다.',
    question: '떠올린 아이디어 중 작게라도 실행해보고 싶은 것은 무엇인가요?',
  },
  태양: {
    id: 'ming-taiyang',
    meaning:
      '자신을 표현하고 다른 사람에게 힘을 보태는 태도와 연결해 읽습니다.',
    question: '내가 도움을 줄 때 상대가 원하는 방식도 확인하고 있나요?',
  },
  무곡: {
    id: 'ming-wuqu',
    meaning: '직접 행동하고 스스로 해결하려는 태도와 연결해 읽습니다.',
    question: '혼자 해결한 일과 도움을 받아 풀었던 일은 어떻게 달랐나요?',
  },
  천동: {
    id: 'ming-tiantong',
    meaning: '편안함을 찾고 갈등을 줄이려는 태도와 연결해 읽습니다.',
    question: '편안하게 지내면서도 분명히 표현하고 싶은 내 바람은 무엇인가요?',
  },
  염정: {
    id: 'ming-lianzhen',
    meaning:
      '일을 진지하게 대하고 자신에게 기준을 세우는 태도와 연결해 읽습니다.',
    question: '내가 중요하게 여기는 기준을 다른 사람에게 어떻게 설명하나요?',
  },
  천부: {
    id: 'ming-tianfu',
    meaning: '실속을 살피고 여유를 지키려는 태도와 연결해 읽습니다.',
    question:
      '현재 생활에서 유지하고 싶은 부분과 바꾸고 싶은 부분은 무엇인가요?',
  },
  태음: {
    id: 'ming-taiyin',
    meaning: '차분한 환경과 섬세한 돌봄을 중시하는 태도와 연결해 읽습니다.',
    question: '내가 편안함을 느끼는 환경에는 어떤 공통점이 있나요?',
  },
  탐랑: {
    id: 'ming-tanlang',
    meaning: '호기심을 따라 관심사를 탐색하는 태도와 연결해 읽습니다.',
    question: '최근 시간을 들여 알아보고 싶어진 일은 무엇인가요?',
  },
  거문: {
    id: 'ming-jumen',
    meaning: '의문을 살피고 말로 표현하는 태도와 연결해 읽습니다.',
    question: '의견이 다를 때 먼저 확인해볼 수 있는 사실은 무엇인가요?',
  },
  천상: {
    id: 'ming-tianxiang',
    meaning: '상황을 조율하고 사람들의 역할을 조직하는 태도와 연결해 읽습니다.',
    question: '여럿이 일할 때 내가 자연스럽게 맡게 되는 역할은 무엇인가요?',
  },
  천량: {
    id: 'ming-tianliang',
    meaning: '주변을 돌보고 약한 입장을 돕는 태도와 연결해 읽습니다.',
    question: '다른 사람을 챙기면서 내 여유도 지키려면 무엇이 필요할까요?',
  },
  칠살: {
    id: 'ming-qisha',
    meaning: '정한 방향을 지키며 행동하는 태도와 연결해 읽습니다.',
    question: '결정을 밀고 나가기 전에 누구의 의견을 들어보고 싶나요?',
  },
  파군: {
    id: 'ming-pojun',
    meaning: '기존 방식을 바꾸고 새롭게 시도하는 태도와 연결해 읽습니다.',
    question:
      '지금 바꾸고 싶은 일에서 먼저 작게 시도할 수 있는 것은 무엇인가요?',
  },
};
