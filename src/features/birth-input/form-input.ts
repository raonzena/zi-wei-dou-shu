import { birthInputRanges } from './input-ranges';
import {
  birthInputSchema,
  type BirthInput,
} from '../../domain/birth/birth-input';

export type InputField =
  keyof BirthInput | 'isLeapMonth' | 'date' | 'time' | 'input';
export type InputErrors = Partial<Record<InputField, string>>;
export type FormInputResult =
  | { success: true; input: BirthInput }
  | { success: false; errors: InputErrors };

const numbers = ['year', 'month', 'day', 'hour', 'minute'] as const;
const labels = {
  year: '출생 연도',
  month: '월',
  day: '일',
  hour: '시',
  minute: '분',
  calendar: '달력',
  gender: '성별',
  isLeapMonth: '윤달 여부',
};

/** Explicit conversion: blank time must never become midnight. Used on both sides. */
export function parseBirthForm(form: FormData): FormInputResult {
  const input: Record<string, unknown> = {};
  const errors: InputErrors = {};
  for (const field of [
    'calendar',
    ...numbers,
    'gender',
    'isLeapMonth',
  ] as const) {
    const values = form.getAll(field);
    if (values.length > 1 || values.some((v) => typeof v !== 'string')) {
      errors[field] = `${labels[field]} 입력을 확인해주세요.`;
    }
    input[field] = values[0];
  }
  for (const field of numbers) {
    const value = input[field];
    input[field] =
      typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;
  }
  if (input.isLeapMonth !== undefined && input.isLeapMonth !== 'on')
    errors.isLeapMonth = '윤달 여부 입력을 확인해주세요.';
  if (input.calendar === 'lunar')
    input.isLeapMonth = input.isLeapMonth === 'on';
  else delete input.isLeapMonth;
  const parsed = birthInputSchema.safeParse(input);
  if (!parsed.success)
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof typeof labels;
      errors[field] = `${labels[field] ?? '출생 정보'} 입력을 확인해주세요.`;
    }
  const ranges = birthInputRanges(
    String(input.calendar),
    Number(input.year),
    Number(input.month),
    input.isLeapMonth === true,
  );
  for (const field of numbers) {
    const value = input[field] as number;
    const [min, max] = ranges[field];
    if (Number.isFinite(value) && (value < min || value > max)) {
      errors[field] = `${labels[field]}: ${min}~${max} 사이로 입력해주세요.`;
    }
  }
  if (!parsed.success || Object.keys(errors).length)
    return { success: false, errors };
  return { success: true, input: parsed.data };
}
