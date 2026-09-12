import { isAiExplanationEnabled } from '../server/interpretation/availability';
import { BirthForm } from '../features/birth-input/birth-form';
import * as styles from './page.css';

export const dynamic = 'force-dynamic';
export const maxDuration = 180;

export default function HomePage() {
  return (
    <main className={styles.main}>
      <BirthForm includeAi={isAiExplanationEnabled()} />
    </main>
  );
}
