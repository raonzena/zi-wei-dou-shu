'use client';

import { useState } from 'react';
import ChevronDown from '../../assets/icons/chevron-down.svg';
import { Autocomplete } from '@base-ui/react/autocomplete';
import * as styles from './styles.css';

export function NumberChoice({
  name,
  label,
  min,
  max,
  placeholder,
  error,
  disabled = false,
  onChange,
}: {
  name: string;
  label: string;
  min: number;
  max: number;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState('');
  const maxLength = name === 'year' ? 4 : 2;
  const items = Array.from({ length: max - min + 1 }, (_, i) =>
    String(name === 'year' ? max - i : min + i),
  );
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label}</label>
      <Autocomplete.Root
        disabled={disabled}
        items={items}
        name={name}
        value={value}
        onValueChange={(next) => {
          const limited = next.slice(0, maxLength);
          setValue(limited);
          onChange?.(limited);
        }}
        openOnInputClick
      >
        <Autocomplete.InputGroup className={styles.inputGroup}>
          <Autocomplete.Input
            id={name}
            className={styles.comboInput}
            inputMode="numeric"
            maxLength={maxLength}
            required
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          />
          <Autocomplete.Trigger
            className={styles.comboTrigger}
            aria-label={`${label} 목록 열기`}
          >
            <ChevronDown
              className={styles.chevron}
              aria-hidden="true"
              focusable="false"
            />
          </Autocomplete.Trigger>
        </Autocomplete.InputGroup>
        <Autocomplete.Portal>
          <Autocomplete.Positioner sideOffset={4} className={styles.positioner}>
            <Autocomplete.Popup className={styles.popup}>
              <Autocomplete.Empty className={styles.empty}>
                선택 가능한 값이 없습니다.
              </Autocomplete.Empty>
              <Autocomplete.List className={styles.optionList}>
                {(item: string) => (
                  <Autocomplete.Item
                    key={item}
                    value={item}
                    className={styles.option}
                  >
                    {item}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>
      {error && (
        <p id={`${name}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
