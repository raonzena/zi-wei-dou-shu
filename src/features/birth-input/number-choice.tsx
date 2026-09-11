'use client';

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
  onChange,
}: {
  name: string;
  label: string;
  min: number;
  max: number;
  placeholder: string;
  error?: string;
  onChange?: (value: string) => void;
}) {
  const items = Array.from({ length: max - min + 1 }, (_, i) =>
    String(name === 'year' ? max - i : min + i),
  );
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label}</label>
      <Autocomplete.Root items={items} name={name} onValueChange={onChange}>
        <Autocomplete.InputGroup className={styles.inputGroup}>
          <Autocomplete.Input
            id={name}
            className={styles.comboInput}
            inputMode="numeric"
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
