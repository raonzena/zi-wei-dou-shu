'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChartResult } from '../chart/chart-result';
import { StarContentProvider } from '../chart/star-content-context';
import type { ResultSnapshot } from '../../server/results/snapshot';
import { retrySavedExplanation } from './actions';

export function SavedResult({
  id,
  snapshot,
  isOwner,
  aiEnabled,
}: {
  id: string;
  snapshot: ResultSnapshot;
  isOwner: boolean;
  aiEnabled: boolean;
}) {
  const router = useRouter();
  const [ai, setAi] = useState(snapshot.ai);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  async function retry() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      setAi(await retrySavedExplanation(id));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <StarContentProvider value={snapshot.content}>
      <ChartResult
        chart={snapshot.chart}
        reading={snapshot.reading}
        facts={snapshot.facts}
        ai={ai}
        aiPending={pending}
        onRetryAi={isOwner && aiEnabled ? retry : undefined}
        onBack={() => router.push('/')}
        backLabel={isOwner ? '명반 다시 보기' : '나도 확인해보기'}
      />
    </StarContentProvider>
  );
}
