import Image from 'next/image';
import type { BasicReading } from '../../domain/interpretation/basic-reading';
import { palaceLabel } from '../../domain/interpretation/palace-reading';
import {
  personalityCharacters,
  type CharacterGender,
} from '../../content/personality-characters';
import * as styles from './personality-characters.css';

export function PersonalityCharacters({
  reading,
  gender,
}: {
  reading: BasicReading;
  gender?: CharacterGender;
}) {
  const characters = personalityCharacters(reading, gender);
  if (!characters.length) return null;
  const reference = reading.evidence.oppositeReference;
  return (
    <div className={styles.container}>
      <div className={styles.portraits}>
        {characters.map(({ starName, src }) => (
          <figure key={starName} className={styles.portrait}>
            <Image
              src={src}
              alt={`${starName}의 성향을 표현한 ${gender === 'male' ? '남성' : '여성'} 캐릭터`}
              width={1254}
              height={1254}
              sizes="(max-width: 640px) 45vw, 320px"
              className={styles.image}
            />
            <figcaption className={styles.caption}>{starName}</figcaption>
          </figure>
        ))}
      </div>
      <p className={styles.context}>
        {reference
          ? `명궁에 주성이 없어 맞은편 ${palaceLabel(reference.palaceName)}의 주성을 참고했습니다.`
          : '명궁의 주성으로 표현한 나의 성향'}
      </p>
    </div>
  );
}
