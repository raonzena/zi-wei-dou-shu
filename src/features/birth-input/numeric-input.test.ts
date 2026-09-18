import { describe, expect, it, vi } from 'vitest';
import {
  normalizeNumericInput,
  sanitizeNumericInputElement,
} from './numeric-input';

describe('normalizeNumericInput', () => {
  it('한글과 기호를 제거하고 숫자만 유지한다', () => {
    expect(normalizeNumericInput('19구91년', 4)).toBe('1991');
    expect(normalizeNumericInput('1월0', 2)).toBe('10');
  });

  it('숫자 입력의 최대 자릿수를 제한한다', () => {
    expect(normalizeNumericInput('19910', 4)).toBe('1991');
    expect(normalizeNumericInput('123', 2)).toBe('12');
  });
});

// Base UI reads currentTarget.value into its separate IME composition state.
describe('sanitizeNumericInputElement', () => {
  it.each(['ㅁ', '무', '문'])(
    '조합 중인 %s도 실제 입력란에서 제거한다',
    (value) => {
      const input = {
        value,
        selectionStart: 1,
        setSelectionRange: vi.fn(),
      };
      sanitizeNumericInputElement(input as unknown as HTMLInputElement, 2);
      expect(input.value).toBe('');
      expect(input.setSelectionRange).toHaveBeenCalledWith(0, 0);
    },
  );

  it('숫자 사이에 붙여넣은 문자를 제거하고 커서 위치를 유지한다', () => {
    const input = {
      value: '19년91',
      selectionStart: 3,
      setSelectionRange: vi.fn(),
    };
    sanitizeNumericInputElement(input as unknown as HTMLInputElement, 4);
    expect(input.value).toBe('1991');
    expect(input.setSelectionRange).toHaveBeenCalledWith(2, 2);
  });

  it('허용된 숫자는 다시 쓰거나 커서를 이동하지 않는다', () => {
    const input = {
      value: '12',
      selectionStart: 1,
      setSelectionRange: vi.fn(),
    };
    sanitizeNumericInputElement(input as unknown as HTMLInputElement, 2);
    expect(input.value).toBe('12');
    expect(input.setSelectionRange).not.toHaveBeenCalled();
  });
});
