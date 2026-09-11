'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Popover } from '@base-ui/react/popover';
import type { TermDefinition } from '../../content/glossary';
import * as styles from './term.css';

export function Term({
  term,
  children,
}: {
  term: TermDefinition;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const returningFocus = useRef(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        ref={trigger}
        openOnHover
        className={styles.trigger}
        aria-label={`${term.label} 용어 설명`}
        onFocus={(event) => {
          if (returningFocus.current) {
            returningFocus.current = false;
            return;
          }
          if (event.currentTarget.matches(':focus-visible')) setOpen(true);
        }}
      >
        {children ?? term.label}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} className={styles.positioner}>
          <Popover.Popup
            className={styles.popup}
            initialFocus={false}
            finalFocus={() => {
              returningFocus.current = true;
              return trigger.current;
            }}
          >
            <Popover.Title className={styles.title}>{term.label}</Popover.Title>
            <Popover.Description className={styles.description}>
              {term.description}
            </Popover.Description>
            <div className={styles.actions}>
              <a href={term.source} target="_blank" rel="noreferrer">
                설명 출처 (새 탭)
              </a>
              <Popover.Close className={styles.close}>닫기</Popover.Close>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
