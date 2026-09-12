'use client';

import type { ReactNode } from 'react';
import { Toast } from '@base-ui/react/toast';
import * as styles from './toast.css';

function ToastViewport() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport className={styles.viewport} aria-label="알림">
        {toasts.map((toast) => (
          <Toast.Root key={toast.id} toast={toast} className={styles.toast}>
            <Toast.Content className={styles.content}>
              <Toast.Title className={styles.title} />
              <Toast.Close className={styles.close} aria-label="알림 닫기">
                닫기
              </Toast.Close>
            </Toast.Content>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider timeout={4000} limit={1}>
      {children}
      <ToastViewport />
    </Toast.Provider>
  );
}
