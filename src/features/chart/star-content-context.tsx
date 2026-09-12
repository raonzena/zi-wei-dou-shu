'use client';
import { createContext, type ReactNode } from 'react';
import type { StarContentResult } from '../../domain/content/star-content';
export const StarContentContext = createContext<StarContentResult>({
  status: 'unavailable',
});

export function StarContentProvider({
  value,
  children,
}: {
  value: StarContentResult;
  children: ReactNode;
}) {
  return <StarContentContext value={value}>{children}</StarContentContext>;
}
