export type TermDefinition = {
  label: string;
  description: string;
  source: string;
};
const palaceSource = 'https://iztro.com/learn/palace';
const starSource = 'https://iztro.com/learn/star';
const majorSource = 'https://iztro.com/learn/major-star';
const minorSource = 'https://iztro.com/learn/minor-star';
const adjSource = 'https://iztro.com/learn/adj-star';
const mutagenSource = 'https://iztro.com/learn/mutagen';

export const terms: Record<string, TermDefinition> = {
  명주: {
    label: '명주',
    description:
      '계산 규칙에 따라 명궁의 지지로 정하는 대표 별입니다. 명궁에 실제 놓인 주성과는 다른 항목입니다.',
    source: 'https://iztro.com/learn/setup',
  },
  신주: {
    label: '신주',
    description:
      '출생 연도의 지지로 정하는 대표 별입니다. 신궁의 위치나 그 궁에 놓인 별과 구분합니다.',
    source: 'https://iztro.com/learn/setup',
  },
  대한: {
    label: '대한',
    description:
      '10년 단위의 흐름을 살피는 전통적인 구분입니다. 오행국에 따라 시작 나이가 달라집니다. 계산용 나이는 만 나이가 아닙니다.',
    source: 'https://iztro.com/learn/horoscope',
  },
  유년: {
    label: '유년',
    description:
      '한 해의 흐름을 살피는 명반입니다. 자세한 달력 기준은 페이지 하단에서 확인할 수 있습니다.',
    source: 'https://iztro.com/learn/horoscope',
  },
  밝기: {
    label: '별의 밝기',
    description:
      '묘·왕·득·리·평·불·함으로 구분하는 전통적인 별의 상태입니다. 실제 빛의 밝기나 운세 점수가 아니며 유파별 표가 다를 수 있습니다.',
    source: 'https://iztro.com/learn/star',
  },
  윤달: {
    label: '윤달',
    description:
      '음력에서 같은 이름의 달이 한 번 더 들어간 달입니다. 음력 생일이 윤달에 해당할 때만 선택해주세요.',
    source: 'https://www.kasi.re.kr/kor/publication/post/newsMaterial/2444',
  },
  명반: {
    label: '명반',
    description: '출생 정보를 바탕으로 궁과 별을 배치한 자미두수 도표입니다.',
    source: palaceSource,
  },
  궁: {
    label: '궁',
    description:
      '명반의 열두 칸입니다. 각 칸은 자신, 관계, 일 등 서로 다른 삶의 영역을 나타냅니다.',
    source: palaceSource,
  },
  신궁: {
    label: '신궁',
    description:
      '명궁과 함께 행동과 삶의 관심사를 살펴보는 위치입니다. 열두 궁 중 하나에 겹쳐 표시됩니다.',
    source: palaceSource,
  },
  주성: {
    label: '주성 (主星)',
    description:
      '궁을 해석할 때 중심이 되는 14개의 별입니다. 한 궁에 없거나 둘 이상 함께 놓일 수 있습니다.',
    source: starSource,
  },
  보조성: {
    label: '보조성 (補助星)',
    description:
      '주성과 함께 궁을 해석할 때 참고하는 별입니다. 이 화면에서는 주성 외에 표시하는 별을 묶어 부릅니다.',
    source: starSource,
  },
  오행국: {
    label: '오행국',
    description:
      '명반 계산에 사용하는 수·목·금·토·화의 다섯 분류입니다. 이름에 붙는 숫자는 운세 점수가 아닙니다.',
    source: 'https://iztro.com/learn/setup',
  },
  간지: {
    label: '간지',
    description:
      '천간과 지지를 짝지은 표기입니다. 이 화면에서는 각 궁의 계산상 위치를 구분하는 데 사용합니다.',
    source: palaceSource,
  },
  사화: {
    label: '사화',
    description:
      '별에 붙는 화록·화권·화과·화기의 네 가지 표시입니다. 여기서는 출생 연도의 규칙으로 정한 사화를 보여줍니다.',
    source: mutagenSource,
  },
  록: {
    label: '화록',
    description:
      '별의 성질이 늘어나거나 확장되는 모습과 연결해 해석하는 표시입니다.',
    source: mutagenSource,
  },
  권: {
    label: '화권',
    description: '주도권과 추진력에 연결해 해석하는 표시입니다.',
    source: mutagenSource,
  },
  과: {
    label: '화과',
    description: '드러나는 평판과 명예에 연결해 해석하는 표시입니다.',
    source: mutagenSource,
  },
  기: {
    label: '화기',
    description:
      '집중하거나 얽매이는 대상에 연결해 해석하는 표시입니다. 불행을 확정하는 뜻은 아닙니다.',
    source: mutagenSource,
  },
};

const palaceDescriptions: Record<string, string> = {
  명궁: '자신의 성향을 살펴보는 중심 궁입니다.',
  형제: '형제자매와의 관계를 살펴보는 궁입니다.',
  부처: '배우자와의 관계, 연애와 결혼에 대한 태도를 살펴보는 궁입니다.',
  자녀: '자녀와의 관계를 살펴보는 궁입니다.',
  재백: '돈을 벌고 사용하는 태도를 살펴보는 궁입니다.',
  질액: '몸을 대하는 태도를 살펴보는 궁입니다. 의학적 진단을 뜻하지 않습니다.',
  천이: '바깥 환경과 대외 관계를 살펴보는 궁입니다.',
  노복: '친구와 주변 사람들과의 관계를 살펴보는 궁입니다.',
  관록: '일을 대하는 태도와 활동 방식을 살펴보는 궁입니다.',
  전택: '주거와 가족, 재산의 축적을 살펴보는 궁입니다.',
  복덕: '내면의 관심사와 정신적 만족을 살펴보는 궁입니다.',
  부모: '부모와의 관계를 살펴보는 궁입니다.',
};
export const palaceHanja: Record<string, string> = {
  명궁: '命宮',
  형제: '兄弟',
  부처: '夫妻',
  자녀: '子女',
  재백: '財帛',
  질액: '疾厄',
  천이: '遷移',
  노복: '奴僕',
  관록: '官祿',
  전택: '田宅',
  복덕: '福德',
  부모: '父母',
};
export const palaceTerms: Record<string, TermDefinition> = Object.fromEntries(
  Object.entries(palaceDescriptions).map(([name, description]) => [
    name,
    { label: name, description, source: palaceSource },
  ]),
);

// Keys include the original engine category to distinguish homonymous stars.
const majorStars: [string, string, string][] = [
  ['자미', '紫微', '주도성과 통솔'],
  ['천기', '天機', '사고와 변화'],
  ['태양', '太陽', '표현과 활동'],
  ['무곡', '武曲', '실행과 재물'],
  ['천동', '天同', '편안함과 즐거움'],
  ['염정', '廉貞', '원칙과 감정'],
  ['천부', '天府', '관리와 안정'],
  ['태음', '太陰', '섬세함과 내면'],
  ['탐랑', '貪狼', '욕구와 교류'],
  ['거문', '巨門', '말과 의문'],
  ['천상', '天相', '조율과 지원'],
  ['천량', '天梁', '보호와 원칙'],
  ['칠살', '七殺', '결단과 독립'],
  ['파군', '破軍', '변화와 재구성'],
];
const supportingStars: [string, string, string, string][] = [
  ['minor', '천마', '天馬', '이동과 활동'],
  ['minor', '지공', '地空', '발상과 비움'],
  ['minor', '지겁', '地劫', '자원의 소모와 변동'],
  ['adjective', '홍란', '紅鸞', '친밀감과 교류'],
  ['adjective', '천희', '天喜', '친화력과 즐거움'],
  ['adjective', '천요', '天姚', '표현과 사교'],
  ['adjective', '함지', '咸池', '매력과 교류'],
  ['minor', '좌보', '左輔', '도움과 지원'],
  ['minor', '우필', '右弼', '협력과 지원'],
  ['minor', '문창', '文昌', '학습과 글'],
  ['minor', '문곡', '文曲', '표현과 예술'],
  ['minor', '록존', '祿存', '자원과 축적'],
  ['minor', '경양', '擎羊', '강한 추진'],
  ['minor', '타라', '陀羅', '지속과 지연'],
  ['minor', '화성', '火星', '급격한 반응'],
  ['minor', '령성', '鈴星', '내면의 긴장'],
  ['minor', '천괴', '天魁', '도움과 인정'],
  ['minor', '천월', '天鉞', '도움과 기회'],
  ['adjective', '천관', '天官', '직책과 명예'],
  ['adjective', '천복', '天福', '복과 여유'],
  ['adjective', '삼태', '三台', '지위'],
  ['adjective', '팔좌', '八座', '지위'],
  ['adjective', '은광', '恩光', '감사와 보답'],
  ['adjective', '천귀', '天貴', '도움과 보답'],
  ['adjective', '천재', '天才', '재능'],
];
export const starTerms: Record<string, TermDefinition> = Object.fromEntries([
  ...majorStars.map(([name, hanja, meaning]) => [
    `major:${name}`,
    {
      label: `${name} (${hanja})`,
      description: `14주성 중 하나로, 전통적으로 ${meaning}에 연결해 해석합니다.`,
      source: majorSource,
    },
  ]),
  ...supportingStars.map(([category, name, hanja, meaning]) => [
    `${category}:${name}`,
    {
      label: `${name} (${hanja})`,
      description: `주성을 보완하며, 전통적으로 ${meaning}에 연결해 해석하는 별입니다.`,
      source: category === 'adjective' ? adjSource : minorSource,
    },
  ]),
]);

export const extendedTerms = {
  유월: {
    label: '유월',
    description:
      '한 해의 흐름을 월별로 살펴보는 명반입니다. 윤달은 전반과 후반을 나눠 읽으며, 자세한 달력 기준은 페이지 하단에서 확인할 수 있습니다.',
    source: 'https://iztro.com/posts/astrolabe',
  },
  비화: {
    label: '궁간 비화·자화',
    description:
      '각 궁의 천간으로 정한 사화가 어느 별과 궁에 연결되는지 표시합니다. 출발 궁과 도착 궁이 같으면 자화입니다. 생년사화와 별개이며 연쇄 추론은 하지 않습니다.',
    source: 'https://iztro.com/posts/palace',
  },
  격국: {
    label: '격국 구조 검사',
    description:
      '여러 별의 배치 조건을 묶어 확인합니다. 표시된 두 규칙의 명궁 조건만 검사하며 길흉이나 실제 성취를 확정하지 않습니다.',
    source: 'https://iztro.com/learn/pattern',
  },
  유요: {
    label: '유요',
    description:
      '대한·유년·유월에 따라 위치가 달라지는 별입니다. 본명반 별의 위치와 구분해서 읽습니다. 표시된 궁은 본명반의 궁 이름입니다.',
    source: 'https://iztro.com/posts/horoscope',
  },
} satisfies Record<string, TermDefinition>;
