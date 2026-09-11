'use client';

import { Brand, Seal } from '../../components/ui/brand';

import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { calculatePreview } from './calculate-action';
import { parseBirthForm, type InputErrors } from './form-input';
import { NumberChoice } from './number-choice';
import { birthInputRanges } from './input-ranges';
import { ChartResult } from '../chart/chart-result';
import { Term } from '../../components/ui/term';
import { terms } from '../../content/glossary';
import * as styles from './styles.css';

export function BirthForm({ includeAi = true }: { includeAi?: boolean }) {
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
  const [aiPending, setAiPending] = useState(false);
  const submittedForm = useRef<FormData | null>(null);
  const aiBusy = useRef(false);
  const [result, setResult] = useState<Extract<
    Awaited<ReturnType<typeof calculatePreview>>,
    { success: true }
  > | null>(null);
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (Object.values(errors).some(Boolean)) summaryRef.current?.focus();
  }, [errors]);
  useEffect(() => {
    if (result) document.getElementById('preview-title')?.focus();
  }, [result]);

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
        submittedForm.current = data;
        setResult(result);
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
  async function retryAi() {
    if (aiBusy.current || !submittedForm.current || !result) return;
    aiBusy.current = true;
    setAiPending(true);
    try {
      const next = await calculatePreview(submittedForm.current);
      setResult((previous) =>
        previous
          ? {
              ...previous,
              ai: next.success
                ? next.ai
                : {
                    status: 'error',
                    code: 'provider',
                    message:
                      'AI 설명을 다시 준비하지 못했습니다. 입력 정보를 확인해주세요.',
                    retryable: false,
                  },
            }
          : previous,
      );
    } catch {
      setResult((previous) =>
        previous
          ? {
              ...previous,
              ai: {
                status: 'error',
                code: 'provider',
                message:
                  '서버에 연결하지 못했습니다. 연결을 확인한 뒤 다시 시도해주세요.',
                retryable: true,
              },
            }
          : previous,
      );
    } finally {
      aiBusy.current = false;
      setAiPending(false);
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
          <Seal />
          <h1 className={styles.title}>명반 풀이를 준비하고 있습니다</h1>
          <p>
            입력한 날짜와 시각으로 명반을 계산하고 기본 풀이를 함께 준비합니다.
          </p>
        </section>
      )}
      {result && !pending && (
        <Suspense fallback={<p role="status">명반을 불러오고 있습니다.</p>}>
          <ChartResult
            chart={result.chart}
            facts={result.facts}
            reading={result.reading}
            ai={result.ai}
            aiPending={aiPending}
            onRetryAi={retryAi}
            onBack={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('view');
              window.history.replaceState(
                null,
                '',
                url.pathname + url.search + url.hash,
              );
              submittedForm.current = null;
              setResult(null);
              requestAnimationFrame(() =>
                formRef.current
                  ?.querySelector<HTMLInputElement>('#year')
                  ?.focus(),
              );
            }}
          />
        </Suspense>
      )}
      <div hidden={pending || !!result}>
        <Brand />
        <div className={styles.inputLayout}>
          <header>
            <p className={styles.eyebrow}>출생 정보</p>
            <h1 className={styles.title}>
              나를 알아보는
              <br />첫 번째 명반
            </h1>
            <p className={styles.intro}>
              태어난 날짜와 시각을 입력하고
              <br />
              나의 명반에 어떤 별이 있는지 살펴보세요.
            </p>
            <div className={styles.introSeal}>
              <Seal />
            </div>
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
                    ? '결과를 준비하지 못했습니다.'
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
              <legend className={styles.legend}>태어난 날짜</legend>
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
                양력으로 1900년 1월 1일부터 현재까지, 지금의 대한민국 영토
                안에서 태어난 분의 명반을 계산할 수 있습니다.
              </p>
              {error('date')}
            </fieldset>
            <fieldset
              className={styles.section}
              aria-describedby={`time-help${errors.time ? ' time-error' : ''}`}
            >
              <legend className={styles.legend}>태어난 시각</legend>
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
              <legend className={styles.legend}>계산에 사용할 성별</legend>
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
            {includeAi && <input type="hidden" name="includeAi" value="on" />}
            <aside className={styles.notice}>
              <strong>입력 정보는 명반과 해석을 만드는 데 사용합니다.</strong>
              <p>
                입력한 정보와 결과는 이 서비스에 저장하지 않습니다. 새로고침하면
                입력값과 결과가 사라집니다.
              </p>
              {includeAi && (
                <p>
                  명반의 궁과 별·밝기, 명궁·신궁·명주·신주·오행국, 사화·격국
                  구조, 대한·올해 유년·유월·유요 자료를 OpenAI에 보내 AI 해석을
                  함께 제공합니다. 원본 출생 날짜·시각·성별은 보내지 않지만,
                  대한의 나이와 연도 구간으로 출생 연도를 추정할 수 있습니다.
                  요청 중복과 과도한 호출을 막기 위해 접속 IP와 명반을 비밀키로
                  변환한 식별값, 처리 상태·시간·토큰 사용량·추정 비용을
                  기록합니다. IP·명반 원문과 해석 결과는 저장하지 않으며, 30일이
                  지난 운영 기록은 매일 삭제합니다. OpenAI는 부정 사용
                  모니터링을 위해 API 내용을 보관할 수 있습니다.{' '}
                  <a
                    href="https://developers.openai.com/api/docs/guides/your-data"
                    target="_blank"
                    rel="noreferrer"
                  >
                    데이터 처리 안내 (새 탭)
                  </a>
                </p>
              )}
              <details>
                <summary>날짜와 시각을 계산하는 기준</summary>
                <p>
                  음력 생일은 한국 음력으로 확인한 뒤 양력으로 변환합니다. 별의
                  배치는 iztro의 달력과 규칙을 따르므로, 한국 음력의 월·일로
                  직접 배치한 명반과 다를 수 있습니다.
                </p>
                <p>
                  태어난 지역의 경도나 태양의 위치를 이용하는 진태양시 보정은
                  하지 않습니다. 서머타임이나 표준시 변경으로 시각이 중복되거나
                  존재하지 않으면 계산을 진행하지 않습니다.
                </p>
                <p>
                  계산에 사용하는 달력에서 윤달 16일 이후에는 별 배치에 다음
                  달을 사용합니다. 다만 계산 시각이 23시대인 경우에는 이 월
                  보정을 적용하지 않습니다.
                </p>
              </details>
            </aside>
            <button type="submit" className={styles.button} disabled={pending}>
              나의 명반 보기
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
