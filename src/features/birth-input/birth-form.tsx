'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Chart } from '../../domain/ziwei/chart';
import { calculatePreview } from './calculate-action';
import { parseBirthForm, type InputErrors } from './form-input';
import { NumberChoice } from './number-choice';
import { birthInputRanges } from './input-ranges';
import { ChartPreview } from './preview';
import * as styles from './styles.css';

export function BirthForm() {
  const [calendar, setCalendar] = useState('solar');
  const [date, setDate] = useState({ year: '', month: '', isLeapMonth: false });
  const ranges = birthInputRanges(
    calendar,
    Number(date.year),
    Number(date.month),
    date.isLeapMonth,
  );
  const [errors, setErrors] = useState<InputErrors>({});
  const [pending, setPending] = useState(false);
  const [chart, setChart] = useState<Chart | null>(null);
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (Object.values(errors).some(Boolean)) summaryRef.current?.focus();
  }, [errors]);
  useEffect(() => {
    if (chart) document.getElementById('preview-title')?.focus();
  }, [chart]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const data = new FormData(event.currentTarget);
    const parsed = parseBirthForm(data);
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }
    busy.current = true;
    setErrors({});
    setPending(true);
    try {
      const result = await calculatePreview(data);
      if (result.success) setChart(result.chart);
      else setErrors(result.errors);
    } catch {
      setErrors({
        input:
          '서버에 연결하지 못했습니다. 입력값은 유지됩니다. 연결을 확인하고 다시 시도해주세요.',
      });
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  const error = (field: keyof InputErrors) =>
    errors[field] && (
      <p id={`${field}-error`} className={styles.error}>
        {errors[field]}
      </p>
    );
  const numeric = (
    field: 'year' | 'month' | 'day' | 'hour' | 'minute',
    label: string,
    placeholder: string,
  ) => (
    <NumberChoice
      name={field}
      label={label}
      min={ranges[field][0]}
      max={ranges[field][1]}
      placeholder={placeholder}
      error={errors[field]}
      onChange={(value) => {
        if (field === 'year' || field === 'month')
          setDate((previous) => ({ ...previous, [field]: value }));
      }}
    />
  );

  return (
    <>
      {pending && (
        <section
          className={styles.loading}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className={styles.eyebrow}>잠시만 기다려주세요</p>
          <h1 className={styles.title}>명반을 계산하고 있습니다</h1>
          <p>출생 날짜와 시각을 확인하고 별을 배치합니다.</p>
        </section>
      )}
      {chart && !pending && (
        <ChartPreview
          chart={chart}
          onBack={() => {
            setChart(null);
            requestAnimationFrame(() =>
              formRef.current
                ?.querySelector<HTMLInputElement>('#year')
                ?.focus(),
            );
          }}
        />
      )}
      <div hidden={pending || !!chart}>
        <header>
          <p className={styles.eyebrow}>자미두수 · 출생 정보</p>
          <h1 className={styles.title}>
            나를 알아보는
            <br />첫 번째 명반
          </h1>
          <p className={styles.intro}>
            태어난 날짜와 시각으로
            <br />
            열두 궁과 주요 별을 살펴보세요.
          </p>
        </header>
        <form
          ref={formRef}
          method="post"
          autoComplete="off"
          onSubmit={submit}
          noValidate
          className={styles.form}
        >
          {Object.values(errors).some(Boolean) && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              className={styles.errorSummary}
            >
              <strong>입력 정보를 확인해주세요.</strong>
              {errors.input && <p>{errors.input}</p>}
              <p>아래 표시된 항목을 수정한 뒤 다시 시도해주세요.</p>
            </div>
          )}
          <fieldset
            className={styles.section}
            disabled={pending}
            aria-describedby="date-help date-error"
          >
            <legend className={styles.legend}>01. 태어난 날짜</legend>
            <div className={styles.choices}>
              {[
                ['solar', '양력'],
                ['lunar', '음력'],
              ].map(([value, label]) => (
                <label key={value} className={styles.choice}>
                  <input
                    type="radio"
                    name="calendar"
                    value={value}
                    checked={calendar === value}
                    onChange={() => setCalendar(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className={styles.help}>
              음력은 한국 음력 기준입니다. 아래 입력칸에서 값을 직접 입력하거나
              목록에서 선택할 수 있습니다.
            </p>
            {error('calendar')}
            <div className={styles.row}>
              {numeric('year', '연도', '예: 1990')}
              {numeric('month', '월', '1~12')}
              {numeric('day', '일', `1~${ranges.day[1]}`)}
            </div>
            {calendar === 'lunar' && (
              <label className={styles.choice}>
                <input
                  type="checkbox"
                  name="isLeapMonth"
                  checked={date.isLeapMonth}
                  onChange={(event) =>
                    setDate((previous) => ({
                      ...previous,
                      isLeapMonth: event.target.checked,
                    }))
                  }
                />
                윤달에 태어났어요
              </label>
            )}
            {error('isLeapMonth')}
            <p id="date-help" className={styles.help}>
              양력으로 환산한 1900년 1월 1일 이후, 현재 대한민국 지역 출생을
              지원합니다.
            </p>
            {error('date')}
          </fieldset>
          <fieldset
            className={styles.section}
            aria-describedby="time-help time-error"
          >
            <legend className={styles.legend}>02. 태어난 시각</legend>
            <div className={styles.row}>
              {numeric('hour', '시 (24시간제)', '0~23')}
              {numeric('minute', '분', '0~59')}
            </div>
            <p id="time-help" className={styles.help}>
              출생 기록에 적힌 당시 현지 시각을 입력해주세요. 역사적
              표준시·서머타임을 반영하며 진태양시 보정은 하지 않습니다. 시각을
              모르면 정확한 명반을 계산할 수 없어 진행할 수 없습니다.
            </p>
            {error('time')}
          </fieldset>
          <fieldset
            className={styles.section}
            aria-describedby="gender-help gender-error"
          >
            <legend className={styles.legend}>03. 계산에 사용할 성별</legend>
            <div className={styles.choices}>
              {[
                ['male', '남성'],
                ['female', '여성'],
              ].map(([value, label]) => (
                <label key={value} className={styles.choice}>
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    defaultChecked={value === 'male'}
                    required
                    aria-invalid={!!errors.gender}
                  />
                  {label}
                </label>
              ))}
            </div>
            <p id="gender-help" className={styles.help}>
              자미두수 계산 규칙에 사용하는 구분입니다.
            </p>
            {error('gender')}
          </fieldset>
          <aside className={styles.notice}>
            <strong>입력 정보는 명반 계산에만 사용합니다.</strong>
            <p>
              현재 입력과 결과를 데이터베이스에 저장하거나 외부 AI에 전송하지
              않습니다. 새로고침하면 입력값과 결과가 사라집니다.
            </p>
            <p>
              초기 계산은 iztro 규칙을 따릅니다. 윤달 후반에도 23시에는 별
              배치용 월을 다음 달로 보정하지 않습니다.
            </p>
          </aside>
          <button type="submit" className={styles.button} disabled={pending}>
            내 명반 확인하기 <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>
    </>
  );
}
