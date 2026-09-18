import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { loadResult } from '../../../server/results/store.server';
import { SavedResult } from '../../../features/results/saved-result';
import { createResultMetadata } from '../../../features/results/result-metadata';
import { isAiExplanationEnabled } from '../../../server/interpretation/availability';
import * as styles from '../../page.css';
import { personalityCharacters } from '../../../content/personality-characters';

export const dynamic = 'force-dynamic';
export const maxDuration = 180;
const getResult = cache((id: string) => loadResult(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getResult(id).catch(() => null);
  return createResultMetadata(
    id,
    result?.snapshot.name,
    !!result &&
      personalityCharacters(
        result.snapshot.reading,
        result.snapshot.characterGender,
      ).length > 0,
  );
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getResult(id);
  if (!result) notFound();
  return (
    <main className={styles.main}>
      <SavedResult id={id} {...result} aiEnabled={isAiExplanationEnabled()} />
    </main>
  );
}
