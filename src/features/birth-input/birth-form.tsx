'use client';

import { Brand, Seal } from '../../components/ui/brand';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createSavedResult } from '../results/actions';
import { useRouter } from 'next/navigation';
import {
  parseBirthForm,
  parseDisplayName,
  type InputErrors,
} from './form-input';
import { NumberChoice } from './number-choice';
import { birthInputRanges } from './input-ranges';
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
  const router = useRouter();
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (Object.values(errors).some(Boolean)) summaryRef.current?.focus();
  }, [errors]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const data = new FormData(event.currentTarget);
    const parsed = parseBirthForm(data);
    const parsedName = parseDisplayName(data);
    if (!parsed.success || !parsedName.success) {
      setErrors({
        ...(!parsed.success ? parsed.errors : {}),
        ...(!parsedName.success ? parsedName.errors : {}),
      });
      return;
    }
    busy.current = true;
    setErrors({});
    setPending(true);
    let navigating = false;
    try {
      const result = await createSavedResult(data);
      if (result.success) {
        navigating = true;
        router.push(`/result/${result.id}`);
      } else setErrors(result.errors);
    } catch {
      setErrors({
        input:
          '서버에 연결하지 못했습니다. 입력값은 유지됩니다. 연결을 확인하고 다시 시도해주세요.',
      });
    } finally {
      if (!navigating) {
        busy.current = false;
        setPending(false);
      }
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
      disabled={pending}
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
          data-page-state="loading"
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
      <div hidden={pending}>
        <Brand />
        <div className={styles.inputLayout}>
          <div className={styles.introColumn}>
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
            </header>
            <section
              className={styles.about}
              aria-labelledby="about-ziwei-title"
            >
              <p className={styles.aboutEyebrow}>자미두수 알아보기</p>
              <h2 id="about-ziwei-title" className={styles.aboutTitle}>
                별이 놓인 자리로 나의 여러 모습을 읽습니다
              </h2>
              <div className={styles.aboutGrid}>
                <div>
                  <h3 className={styles.aboutSubtitle}>
                    자미두수란 무엇인가요?
                  </h3>
                  <p className={styles.aboutText}>
                    태어난 날짜와 시각을 바탕으로 별을 열두 궁에 배치하고, 나
                    자신·일·재물·관계처럼 삶의 여러 주제를 나누어 읽는 동양의
                    명리 체계입니다. 같은 별도 어느 궁에 놓이고 어떤 별과 함께
                    있는지에 따라 해석의 초점이 달라집니다.
                  </p>
                </div>
                <div>
                  <h3 className={styles.aboutSubtitle}>
                    사주와는 무엇이 다른가요?
                  </h3>
                  <p className={styles.aboutText}>
                    사주가 태어난 연·월·일·시의 여덟 글자와 오행의 관계를
                    중심으로 본다면, 자미두수는 열두 궁에 놓인 별의 조합과 궁
                    사이의 관계를 명반에서 살펴봅니다. 어느 쪽이 더 정확하다는
                    뜻이 아니라, 같은 출생 정보를 서로 다른 방식으로 이해하는
                    것입니다.
                  </p>
                </div>
              </div>
              <p className={styles.aboutHook}>
                내 명반에는 어떤 별이, 어느 자리에 놓여 있을까요?
              </p>
            </section>
            <div className={styles.introSeal}>
              <Seal />
            </div>
          </div>
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
              aria-describedby={`name-help${errors.name ? ' name-error' : ''}`}
            >
              <legend className={styles.legend}>공유할 이름</legend>
              <label className={styles.field}>
                <span>이름 또는 닉네임</span>
                <span className={styles.inputGroup}>
                  <input
                    className={styles.textInput}
                    type="text"
                    name="name"
                    maxLength={20}
                    placeholder="예: 설화"
                    required
                    disabled={pending}
                    aria-invalid={!!errors.name}
                    aria-describedby={`name-help${errors.name ? ' name-error' : ''}`}
                  />
                </span>
              </label>
              <p id="name-help" className={styles.help}>
                입력한 이름은 공유 링크의 미리보기 제목에 표시됩니다. 실명
                공개가 부담스러우면 닉네임을 입력해주세요.
              </p>
              {error('name')}
            </fieldset>
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
                적용되던 표준시와 서머타임을 반영합니다. 태어난 시각에 따라 궁과
                별의 배치가 달라지므로, 명반을 보려면 시각을 입력해야 합니다.
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
                입력한 이름 또는 닉네임은 명반과 풀이와 함께 생성일로부터 30일간
                저장하며 공유 링크의 미리보기 제목에 표시합니다. 결과 링크를
                아는 사람은 누구나 볼 수 있으며, 운의 시기와 나이 정보로 출생
                연도를 짐작할 수 있습니다. 원본 생년월일·시각은 저장하지
                않습니다. 선택한 성별은 캐릭터 표시를 위해 결과와 함께 30일간
                저장하며, 해당 캐릭터는 결과 화면과 공유 미리보기에 표시됩니다.
                같은 브라우저에서 같은 이름과 출생 정보로 다시 요청하면 기존
                결과를 보여줄 수 있으며, 보관 기간은 연장되지 않습니다.
              </p>
              {includeAi && (
                <p>
                  명반의 궁과 별·밝기, 명궁·신궁·명주·신주·오행국, 사화·격국
                  구조를 OpenAI에 보내 해석을 함께 제공합니다. 원본 출생
                  날짜·시각·성별과 대한·유년·유월 자료는 보내지 않습니다. 요청
                  중복과 과도한 호출을 막기 위해 접속 IP와 명반을 비밀키로
                  변환한 식별값, 처리 상태·시간·토큰 사용량·추정 비용을
                  기록합니다. 호출 관리 기록에는 IP·명반 원문과 해석 결과를 넣지
                  않으며, 30일이 지난 운영 기록은 매일 삭제합니다. OpenAI는 부정
                  사용 모니터링을 위해 API 내용을 보관할 수 있습니다.{' '}
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
