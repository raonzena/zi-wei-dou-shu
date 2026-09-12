'use client';

import { Toast } from '@base-ui/react/toast';
import { useRef, useState } from 'react';
import { resultShareMethod, resultShareUrl, shareResult } from './share';
import * as styles from './share-result.css';
import { button } from './result-action.css';

export function ShareResult({ id, view }: { id: string; view: string }) {
  const toastManager = Toast.useToastManager();
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const [feedback, setFeedback] = useState<{
    view: string;
    message: string;
    manual: boolean;
  } | null>(null);
  const [origin, setOrigin] = useState('');
  const visibleFeedback = feedback?.view === view ? feedback : null;
  async function perform() {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setFeedback(null);
    setOrigin(window.location.origin);
    try {
      const url = resultShareUrl(window.location.origin, id, view);
      const outcome = await shareResult(
        url,
        resultShareMethod(navigator),
        navigator,
      );
      if (outcome === 'copied') {
        toastManager.add({
          id: 'result-link-copied',
          title: '링크를 복사했습니다.',
          priority: 'low',
        });
      } else if (outcome === 'manual') {
        setFeedback({
          view,
          manual: true,
          message: '아래 링크를 직접 선택해 복사해주세요.',
        });
      }
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <div className={styles.root}>
      <button
        type="button"
        className={button}
        disabled={busy}
        onClick={perform}
      >
        결과 공유
      </button>
      <p role="status" className={styles.status}>
        {visibleFeedback?.message}
      </p>
      {visibleFeedback?.manual && (
        <label className={styles.manual}>
          공유할 결과 링크
          <input
            className={styles.input}
            readOnly
            value={resultShareUrl(origin, id, view)}
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      )}
    </div>
  );
}
