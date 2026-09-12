import { getStarContent } from '../server/content/star-content.server';
import { StarContentProvider } from '../features/chart/star-content-context';
import { isAiExplanationEnabled } from '../server/interpretation/availability';
import { BirthForm } from '../features/birth-input/birth-form';
import * as styles from './page.css';

export const dynamic = 'force-dynamic';
export const maxDuration = 180;

export default async function HomePage() {
  const content = await getStarContent();
  return (
    <main className={styles.main}>
      <StarContentProvider value={content}>
        <BirthForm includeAi={isAiExplanationEnabled()} />
      </StarContentProvider>
    </main>
  );
}
