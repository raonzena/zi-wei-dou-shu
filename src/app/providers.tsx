'use client';

import { ToastProvider } from '../components/ui/toast';
import { Provider } from 'jotai';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <ToastProvider>{children}</ToastProvider>
    </Provider>
  );
}
