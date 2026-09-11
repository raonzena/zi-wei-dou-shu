import { versions } from 'node:process';
import { Temporal } from '@js-temporal/polyfill';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import { util } from 'iztro';
import { birthInputSchema, type BirthInput } from './birth-input';

export type BirthErrorCode =
  | 'invalid_input'
  | 'invalid_date'
  | 'unsupported_date'
  | 'invalid_local_time'
  | 'future_birth';

export type BirthError = {
  code: BirthErrorCode;
  field: 'input' | 'date' | 'time';
  message: string;
};

export type NormalizedBirth = {
  policyVersion: 'ziwei-v1';
  gender: BirthInput['gender'];
  localSolarDate: string;
  koreanLunarDate: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  };
  birthInstant: string;
  localDateTime: string;
  localOffset: string;
  calculationDateTime: string;
  engineInput: { solarDate: string; timeIndex: number };
  timeZoneDataVersion: string;
};

export type NormalizeBirthResult =
  | { success: true; data: NormalizedBirth }
  | { success: false; error: BirthError };

const fail = (
  code: BirthErrorCode,
  field: BirthError['field'],
  message: string,
): NormalizeBirthResult => ({
  success: false,
  error: { code, field, message },
});

/** Server authority: contains private birth data, never use as a public share payload. */
export function normalizeBirth(
  rawInput: unknown,
  now: Temporal.Instant = Temporal.Now.instant(),
): NormalizeBirthResult {
  const parsed = birthInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return fail(
      'invalid_input',
      'input',
      '출생 날짜, 시각, 달력 구분과 성별을 확인해주세요.',
    );
  }
  const input = parsed.data;
  // The Korean converter's table covers solar 1000-02-13 through 2050-12-31.
  // Lunar 1899 can still correspond to a supported solar birthday in January 1900.
  if (input.year < 1899 || input.year > 2050) {
    return fail(
      'unsupported_date',
      'date',
      '지원하는 출생 날짜 범위를 벗어났습니다.',
    );
  }

  const calendar = new KoreanLunarCalendar();
  const valid =
    input.calendar === 'solar'
      ? calendar.setSolarDate(input.year, input.month, input.day)
      : calendar.setLunarDate(
          input.year,
          input.month,
          input.day,
          input.isLeapMonth,
        );
  if (!valid) {
    return fail(
      'invalid_date',
      'date',
      '존재하지 않는 날짜이거나 윤달 여부가 맞지 않습니다.',
    );
  }
  const solar = calendar.getSolarCalendar();
  const solarDate = Temporal.PlainDate.from(solar, { overflow: 'reject' });
  if (Temporal.PlainDate.compare(solarDate, '1900-01-01') < 0) {
    return fail(
      'unsupported_date',
      'date',
      '양력 1900년 1월 1일 이후 출생부터 지원합니다.',
    );
  }

  let local: Temporal.ZonedDateTime;
  try {
    local = Temporal.ZonedDateTime.from(
      {
        timeZone: 'Asia/Seoul',
        year: solar.year,
        month: solar.month,
        day: solar.day,
        hour: input.hour,
        minute: input.minute,
      },
      { overflow: 'reject', disambiguation: 'reject' },
    );
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return fail(
      'invalid_local_time',
      'time',
      '당시 시간 변경으로 존재하지 않거나 두 번 발생한 시각입니다. 출생 기록을 확인해주세요.',
    );
  }
  if (Temporal.Instant.compare(local.toInstant(), now) > 0) {
    return fail(
      'future_birth',
      'date',
      '아직 지나지 않은 출생 날짜 또는 시각입니다.',
    );
  }

  const calculation = local.withTimeZone('+09:00');
  const lunar = calendar.getLunarCalendar();
  if (!versions.tz)
    throw new Error('Runtime time zone data version is unavailable.');

  return {
    success: true,
    data: {
      policyVersion: 'ziwei-v1',
      gender: input.gender,
      localSolarDate: solarDate.toString(),
      koreanLunarDate: {
        year: lunar.year,
        month: lunar.month,
        day: lunar.day,
        isLeapMonth: lunar.intercalation === true,
      },
      birthInstant: local.toInstant().toString(),
      localDateTime: local.toPlainDateTime().toString(),
      localOffset: local.offset,
      calculationDateTime: calculation.toPlainDateTime().toString(),
      engineInput: {
        solarDate: calculation.toPlainDate().toString(),
        // dayDivide=forward belongs to the engine; never increment the date here.
        timeIndex: util.timeToIndex(calculation.hour),
      },
      timeZoneDataVersion: versions.tz,
    },
  };
}
