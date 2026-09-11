'use client';

import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Chart } from '../../domain/ziwei/chart';
import { calculatePreview } from './calculate-action';
import { parseBirthForm, type InputErrors } from './form-input';
import { NumberChoice } from './number-choice';
import { birthInputRanges } from './input-ranges';
import { ChartResult } from '../chart/chart-result';
import { Term } from '../../components/ui/term';
import { terms } from '../../content/glossary';
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
      if (result.success) {
        const url = new URL(window.location.href);
        url.searchParams.delete('view');
        window.history.replaceState(
          null,
          '',
          url.pathname + url.search + url.hash,
        );
        setChart(result.chart);
      } else setErrors(result.errors);
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
          <p>입력한 날짜와 시각을 확인한 뒤 명반에 별을 배치하고 있습니다.</p>
        </section>
      )}
      {chart && !pending && (
        <Suspense fallback={<p role="status">명반을 불러오고 있습니다.</p>}>
          <ChartResult
            chart={chart}
            onBack={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('view');
              window.history.replaceState(
                null,
                '',
                url.pathname + url.search + url.hash,
              );
              setChart(null);
              requestAnimationFrame(() =>
                formRef.current
                  ?.querySelector<HTMLInputElement>('#year')
                  ?.focus(),
              );
            }}
          />
        </Suspense>
      )}
      <div hidden={pending || !!chart}>
        <header>
          <p className={styles.eyebrow}>자미두수 · 출생 정보</p>
          <h1 className={styles.title}>
            나를 알아보는
            <br />첫 번째 명반
          </h1>
          <p className={styles.intro}>
            태어난 날짜와 시각을 입력하고
            <br />
            나의 명반에 어떤 별이 있는지 살펴보세요.
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
              <strong>
                {errors.input
                  ? '명반을 계산하지 못했습니다.'
                  : '입력 정보를 확인해주세요.'}
              </strong>
              {errors.input && <p>{errors.input}</p>}
              {!errors.input && (
                <p>오류가 표시된 항목을 수정한 뒤 다시 시도해주세요.</p>
              )}
            </div>
          )}
          <fieldset
            className={styles.section}
            disabled={pending}
            aria-describedby={`date-help${errors.date ? ' date-error' : ''}`}
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
              음력 생일은 한국 음력을 기준으로 입력해주세요. 날짜는 직접
              입력하거나 목록에서 선택할 수 있습니다.
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
                윤달에 태어났습니다
              </label>
            )}
            {calendar === 'lunar' && (
              <p className={styles.help}>
                <Term term={terms.윤달} />에 해당하는 생일인지 확인해주세요.
              </p>
            )}
            {error('isLeapMonth')}
            <p id="date-help" className={styles.help}>
              양력으로 1900년 1월 1일부터 현재까지, 지금의 대한민국 영토 안에서
              태어난 분의 명반을 계산할 수 있습니다.
            </p>
            {error('date')}
          </fieldset>
          <fieldset
            className={styles.section}
            aria-describedby={`time-help${errors.time ? ' time-error' : ''}`}
          >
            <legend className={styles.legend}>02. 태어난 시각</legend>
            <div className={styles.row}>
              {numeric('hour', '시 (24시간제)', '0~23')}
              {numeric('minute', '분', '0~59')}
            </div>
            <p id="time-help" className={styles.help}>
              출생 기록에 적힌 당시의 현지 시각을 입력해주세요. 태어난 날짜에
              적용되던 표준시와 서머타임을 반영합니다. 시각을 모르는 경우에는
              명반을 계산할 수 없습니다.
            </p>
            {error('time')}
          </fieldset>
          <fieldset
            className={styles.section}
            aria-describedby={`gender-help${errors.gender ? ' gender-error' : ''}`}
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
              전통적인 자미두수 계산에 사용할 성별을 선택해주세요.
            </p>
            {error('gender')}
          </fieldset>
          <aside className={styles.notice}>
            <strong>입력 정보는 명반 계산에만 사용합니다.</strong>
            <p>
              입력한 정보와 계산 결과는 저장하거나 외부 AI에 보내지 않습니다.
              새로고침하면 입력값과 결과가 사라집니다.
            </p>
            <details>
              <summary>날짜와 시각을 계산하는 기준</summary>
              <p>
                음력 생일은 한국 음력으로 확인한 뒤 양력으로 변환합니다. 별의
                배치는 iztro의 달력과 규칙을 따르므로, 한국 음력의 월·일로 직접
                배치한 명반과 다를 수 있습니다.
              </p>
              <p>
                태어난 지역의 경도나 태양의 위치를 이용하는 진태양시 보정은 하지
                않습니다. 서머타임이나 표준시 변경으로 시각이 중복되거나
                존재하지 않으면 계산을 진행하지 않습니다.
              </p>
              <p>
                계산에 사용하는 달력에서 윤달 16일 이후에는 별 배치에 다음 달을
                사용합니다. 다만 계산 시각이 23시대인 경우에는 이 월 보정을
                적용하지 않습니다.
              </p>
            </details>
          </aside>
          <button type="submit" className={styles.button} disabled={pending}>
            내 명반 확인하기
          </button>
        </form>
      </div>
    </>
  );
}
