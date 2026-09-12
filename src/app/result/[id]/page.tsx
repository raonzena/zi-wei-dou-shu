import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadResult } from '../../../server/results/store.server';
import { SavedResult } from '../../../features/results/saved-result';
import { isAiExplanationEnabled } from '../../../server/interpretation/availability';
import * as styles from '../../page.css';

export const dynamic = 'force-dynamic';
export const maxDuration = 180;
export const metadata: Metadata = {
  title: '저장된 명반 | 자미두수',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};
export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadResult(id);
  if (!result) notFound();
  return (
    <main className={styles.main}>
      <SavedResult id={id} {...result} aiEnabled={isAiExplanationEnabled()} />
    </main>
  );
}
