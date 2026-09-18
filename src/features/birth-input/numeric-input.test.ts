import { describe, expect, it } from 'vitest';
import { normalizeNumericInput } from './numeric-input';

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
