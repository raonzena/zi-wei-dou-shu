import type { BasicReading } from '../domain/interpretation/basic-reading';

export type CharacterGender = 'male' | 'female';

const characterKeys: Record<string, string> = {
  자미: 'ziwei',
  천기: 'tianji',
  태양: 'taiyang',
  무곡: 'wuqu',
  천동: 'tiantong',
  염정: 'lianzhen',
  천부: 'tianfu',
  태음: 'taiyin',
  탐랑: 'tanlang',
  거문: 'jumen',
  천상: 'tianxiang',
  천량: 'tianliang',
  칠살: 'qisha',
  파군: 'pojun',
};

export function personalityCharacters(
  reading: BasicReading,
  gender?: CharacterGender,
) {
  if (!gender) return [];
  return reading.entries.map(({ starName }) => {
    if (!Object.hasOwn(characterKeys, starName))
      throw new Error('Unknown character star');
    return {
      starName,
      src: `/images/characters/v1/${characterKeys[starName]}-${gender}.jpg`,
    };
  });
}
