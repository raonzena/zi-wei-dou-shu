# ADR-0001 — 기술 스택과 초기 구성

작성일: 2026-09-11

상태: **기술 스택 확정 / 초기 설정 구현, 제품 기능 설계안 유지**

근거: 사용자가 pnpm, Next.js, TypeScript, Vitest, vanilla-extract, Jotai, Supabase를 지정했다.

## 1. 현재 상태

1~11절은 초기 설정 작업 당시의 판단과 검증 결과를 기록한다. 후속 의존성 변경은 이 문서의 마지막 절에, 현재 구현 범위는 [README](../../README.md)에 정리한다.

- 원격 저장소: https://github.com/raonzena/zi-wei-dou-shu
- 작업 폴더: `/Users/sulhwa/Documents/projects/zi-wei-dou-shu`
- 초기 조사 당시에는 원격 ref가 없었고 작업 폴더도 비어 있었다. 기존 앱이나 설치된 의존성도 없었다.
- 앱 생성과 패키지 설치, 스타일·상태·검증 환경을 구성했다. Supabase 프로젝트 생성과 운영 배포는 아직 수행하지 않았다.
- 실제 생성한 모듈은 앱·Provider·스타일·SSR 테스트다. 아래 제품 디렉터리·데이터 구성은 후속 구현 설계안이다.

## 2. 확정 스택과 역할

| 기술            | 역할                     | 사용 범위                                                |
| --------------- | ------------------------ | -------------------------------------------------------- |
| pnpm            | 패키지 관리              | 단일 lockfile과 packageManager 명시                      |
| Next.js         | 웹 앱·서버 진입점        | App Router를 사용하는 설계안; 페이지와 서버 처리 통합    |
| TypeScript      | 타입 검사                | strict 설정, 입력·명반·해석 계약                         |
| Vitest          | 자동 테스트              | 입력 검증, 계산 정책, 명반 회귀, 응답 검증               |
| vanilla-extract | 스타일                   | `.css.ts` 파일과 필요한 공통 디자인 토큰                 |
| Jotai           | 클라이언트 공유 상태     | 결과 내 선택한 궁·별 등 여러 컴포넌트가 공유하는 UI 상태 |
| Supabase        | 결과 저장·접근 제어 기반 | PostgreSQL에 명반·해석·공유 상태 저장                    |

AI SDK, 계산 패키지, 폼·스키마 검증 라이브러리, UI primitive 라이브러리, E2E 도구, 배포 플랫폼은 이 목록만으로 확정하지 않는다.

## 3. Next.js와 vanilla-extract

공식 Next.js 통합 플러그인 `@vanilla-extract/next-plugin`을 사용한다. `.css.ts` 스타일이 개발 서버와 운영 빌드 양쪽에서 적용되는지 확인한다.

확인일 현재 통합 문서는 Turbopack 지원을 실험적 기능으로 안내한다. 초기 설정은 **Webpack 한 경로로 개발·빌드를 검증하는 안**으로 잡고, 설치한 Next.js·플러그인의 실제 지원 범위와 명령을 확인해 결정한다. 사용하지 않는 병렬 번들러 설정은 남기지 않는다.

스타일 구성은 기본 색상·간격·폰트·반응형 기준부터 시작한다. 사용하지 않는 테마, 범용 레이아웃 DSL, 별도 디자인 시스템 패키지는 만들지 않는다.

출처: [Next.js 설치](https://nextjs.org/docs/app/getting-started/installation), [vanilla-extract Next.js 통합](https://vanilla-extract.style/documentation/integrations/next/)

## 4. 상태의 소유권

| 상태                           | 원천                              |
| ------------------------------ | --------------------------------- |
| 간편 / 상세 보기 모드          | URL                               |
| 선택한 궁·별 등 공유 UI 상태   | 필요한 하위 트리의 Jotai Provider |
| 단일 필드의 일시적인 입력 상태 | 폼 / 컴포넌트                     |
| 생성 상태·명반·해석·공유 여부  | 서버 / Supabase                   |

Next.js 환경에서는 Jotai Provider로 store 범위를 제한한다. 요청 사이에서 공유될 수 있는 provider-less 전역 store에 사용자 상태를 두지 않는다. 결과별 선택 상태는 reportId가 바뀌면 초기화한다.

원본 출생 정보나 해석을 편의상 영구 브라우저 저장소에 복제하지 않는다. 입력 복원·소유권 지속 방식은 정책 결정 후 구현한다.

출처: [Jotai Next.js 가이드](https://jotai.org/docs/guides/nextjs)

## 5. 모듈과 데이터 흐름

단일 앱으로 시작한다. React와 독립적인 계산 모듈을 두고, 서버 전용 호출을 UI와 분리한다.

```text
출생 정보 입력
  → 서버 입력 검증
  → 계산 정책 적용 + 명반 계산
  → 해석 근거 구성 + 해석 생성
  → 결과 저장
  → 간편 / 상세 결과 조회
  → 사용자 공유 실행 시 공개용 결과 조회 허용
```

기능을 구현할 때 사용할 디렉터리 구조는 다음과 같이 제안한다.

```text
src/
  app/                    # 페이지, 서버 진입점
  features/
    birth-input/          # 출생 정보 입력
    chart/                # 간편·상세 명반과 선택 상태
    interpretation/       # 해석 표시
    sharing/              # 공유 UI
  domain/
    ziwei/                # 계산 정책·입력 정규화·엔진 호출
  server/
    reports/              # 결과 생성·저장·조회·공유 권한
    interpretation/       # AI 호출·응답 검증
  components/ui/          # 실제 공용 UI
  content/                # 용어집·검토된 설명
  styles/                 # 공통 스타일 토큰
```

테스트는 대상 모듈 가까이에 두고 출처가 있는 기준 명반만 fixture로 관리한다. 최초 생성 시 빈 폴더를 일괄 만들지 않고 실제 기능을 추가할 때 디렉터리를 만든다.

별도 계산 패키지·타입 패키지·범용 repository 계층은 현재 만들지 않는다. 라이브러리의 타입을 먼저 확인하고 앱에서 필요한 최소 계약만 추가한다.

## 6. Supabase와 공유

명반과 생성된 해석을 저장해 탭 전환·새로고침·공유 조회에서 동일한 결과를 제공한다.

필요한 개념은 결과, 생성 상태, 소유권, 공유 권한이다. 정확한 테이블·컬럼은 보관 정책과 비회원 소유권을 정한 뒤 설계한다. 적용한 엔진·계산 정책·해석 버전을 결과와 함께 기록하는 안이다.

- 소유자의 비공개 결과와 공유 결과를 별도 권한으로 다룬다.
- 추측하기 어려운 결과 ID만으로 소유자 인증을 대신하지 않는다.
- 비회원 소유권은 Supabase 익명 인증 등을 검토하되 이번 ADR에서 채택하지 않는다.
- 공개 조회는 승인된 필드만 반환한다. 숨기는 CSS로 비공개 처리를 대체하지 않는다.
- 노출 스키마의 테이블에는 RLS를 적용하고 읽기·쓰기 정책을 명시한다.
- RLS를 우회하는 서버 권한을 사용할 경우 서버가 소유권·공유 권한을 직접 검사해야 한다.
- 서버 전용 키는 브라우저에 전달하지 않는다.
- 전체 결과를 공개 SELECT할 수 있게 한 뒤 토큰 필터만 클라이언트에 적용하는 설계는 사용하지 않는다.

출처: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

## 7. 계산·해석 후보

iztro는 양력·음력 입력과 명반 데이터를 제공하는 기존 구현이므로 우선 검증한다. react-iztro의 정보 배치와 탐색을 참고하되, 컴포넌트 채택은 타입·스타일·접근성·모바일 요구 적합성을 확인한 뒤 결정한다.

독립적인 기준 명반과 경계 사례로 계산을 검증한다. AI 제공자·모델은 한국어 풀이 품질, 응답 시간, 비용, 데이터 처리 조건을 확인해 결정한다. 실제 요청 시간을 확인하기 전에 작업 큐나 실시간 인프라를 추가하지 않는다.

생성 상태 조회만으로 작업 실행이 보장되는 것은 아니다. 실행 중 새로고침·프로세스 중단·시간 초과 후 복구가 가능한 실행 방식을 배포 환경 검증 단계에서 결정한다.

출처: [iztro 공식 문서](https://iztro.com/en_US/quick-start), [react-iztro](https://github.com/SylarLong/react-iztro)

## 8. 테스트 전략

Vitest로 앱이 책임지는 입력 정규화·계산 정책·명반 회귀·해석 응답 검증을 테스트한다. 라이브러리 내부 구현이나 단순 스타일 선언을 복제하는 테스트는 작성하지 않는다.

브라우저 E2E 도구는 Playwright를 후보로 둔다. 채택 전까지는 확정 설치 목록에 넣지 않는다. 입력 → 로딩 → 결과 → 상세 → 공유로 이어지는 흐름과 권한 검사, 오류 처리 사례를 실제 브라우저에서 검증한다.

검증 도구마다 역할을 구분한다. Vitest 테스트가 통과하더라도 Next.js 페이지 렌더링과 서버·브라우저의 전체 동작까지 검증했다고 보고하지 않는다.

출처: [Next.js 테스트 가이드](https://nextjs.org/docs/app/guides/testing)

## 9. 초기 세팅 체크리스트

### D1 — 앱 생성

- [x] 요구사항·화면 흐름·기술 선택 기록 작성
- [x] 원격 저장소 연결
- [x] Node.js·pnpm 설치 상태와 버전 확인
- [x] Next.js·React·TypeScript 및 지정 라이브러리의 호환 버전 선택
- [x] pnpm으로 단일 Next.js 앱 생성; 기존 문서는 보존
- [x] packageManager, Node 지원 범위, pnpm-lock.yaml 기록
- [x] 샘플 페이지를 최소 프로젝트 첫 화면으로 교체
- [x] 실제 실행·빌드 확인 후 README 업데이트

### D2 — 스타일·상태·검증 환경

- [x] TypeScript strict, 코드 검사·포맷 도구 설정
- [x] vanilla-extract 플러그인 연결과 개발·빌드 스타일 확인
- [ ] 필요한 범위의 Jotai Provider 구성 및 hydration 확인
- [ ] Supabase 환경변수 계약과 서버 전용 경계 정리
- [x] 비밀값 없는 환경변수 예시와 gitignore 구성
- [x] Vitest 설정; 첫 실제 로직을 작성할 때 의미 있는 테스트 추가
- [x] 실행 명령 정리: dev / build / start / lint / typecheck / test (실제 설정 후 확정)

### D3 — 자동 검증·배포 준비

- [x] CI에 pnpm lockfile 기반 설치, 타입 검사, lint, 테스트, 빌드 구성
- [x] 운영 환경이 없더라도 불필요한 비밀값 없이 가능한 검증 분리
- [ ] 배포 플랫폼·Supabase 프로젝트 준비 사항 확인
- [ ] 새 환경에서 README만 보고 설치·실행 가능한지 검증

버전과 실행 명령을 추측해서 완료 처리하지 않는다. 앱 생성 이후 lockfile과 실행 결과에 맞춰 기록한다.

출처: [pnpm 설치](https://pnpm.io/installation)

## 10. 적용 결과와 변경 원칙

- 확정 스택 외 의존성은 실제 요구와 문서·타입 검토를 근거로 추가한다.
- 모듈 분리는 유지하되 사용하지 않는 추상화·폴백·호환 계층을 남기지 않는다.
- 스키마 변경 시 현재 기능에 필요한 데이터만 다루며 구버전 지원용 경로를 유지하지 않는다. 운영 데이터 변경은 별도로 검토한다.
- 기술 선택이 바뀌면 이유와 영향을 새 ADR로 남기고 이 기록의 상태를 갱신한다.
- 조사·초기화·검증·배포를 구분해 실제 완료된 범위만 보고한다.

## 11. 초기 설정 구현 기록

- Node.js 24.x, pnpm 10.33.2를 실행 기준으로 고정했다.
- Next.js App Router와 vanilla-extract 공식 플러그인을 수동 구성해 기존 문서를 보존했다.
- 개발·빌드는 Webpack을 명시하며 런타임 전환용 폴백을 두지 않는다.
- ESLint 10, typescript-eslint의 권장 규칙, 공식 `@next/eslint-plugin-next`의 권장·Core Web Vitals 규칙을 조합한다.
- `eslint-config-next`에 포함된 React 관련 플러그인의 peer 범위가 ESLint 10을 포함하지 않아 공식 Next.js 플러그인을 직접 구성했다. 지원이 종료된 ESLint 9는 남기지 않는다. 전체 `eslint-config-next` 규칙과 동일하다고 간주하지 않는다.
- TypeScript 6.0 계열은 설치한 typescript-eslint의 지원 범위에 맞췄다.
- Vitest는 Node 환경에서 React SSR 테스트를 실행한다. Vite와 React 플러그인은 테스트용이며 앱 빌드에 사용하지 않는다.
- 앱 Provider의 전역·상위 store 격리를 테스트했다. 브라우저 hydration 검증은 실제 상호작용 UI 추가 시 수행한다.
- Supabase SDK와 환경변수 예시만 준비했다. 연결·인증·스키마·RLS는 미구현이다.
- pnpm의 의존성 빌드 스크립트 허용 목록은 현재 필요한 esbuild와 SWC로 제한했다.
- CI 파일은 작성했으며 GitHub 원격 실행은 아직 하지 않았다.
- 커밋 규칙은 루트 `AGENTS.md`에 기록했다.

설치 버전은 `package.json`에 정확한 버전으로, 전이 의존성은 `pnpm-lock.yaml`에 기록한다. 초기 설정에서 설치한 패키지와 버전은 다음과 같다.

| 패키지                         | 버전    |
| ------------------------------ | ------- |
| `next`                         | 16.3.4  |
| `react`                        | 19.3.0  |
| `react-dom`                    | 19.3.0  |
| `jotai`                        | 3.0.0   |
| `@vanilla-extract/css`         | 1.21.2  |
| `@supabase/supabase-js`        | 2.116.0 |
| `typescript`                   | 6.0.3   |
| `vitest`                       | 5.0.0   |
| `@vanilla-extract/next-plugin` | 2.5.2   |
| `eslint`                       | 10.10.0 |

공식 설정 참고: [Next.js ESLint 플러그인](https://nextjs.org/docs/app/api-reference/config/eslint), [Next.js Vitest](https://nextjs.org/docs/app/guides/testing/vitest).

검증 기록 (Node.js 24.21.0 / pnpm 10.33.2):

- `pnpm install --frozen-lockfile`: 통과.
- `pnpm check`: 포맷·린트·타입 검사 및 SSR 격리 테스트 2개 통과.
- `pnpm build`: 운영 빌드 통과.
- `pnpm start`: HTTP 200과 vanilla-extract CSS 응답 확인.
- 개발 서버는 검증 환경의 파일 감시 한도 오류(EMFILE)로 검증 시에만 `WATCHPACK_POLLING=true pnpm dev`를 사용해 HTTP 200과 CSS 응답을 확인했다. 프로젝트 실행 명령에는 폴링 설정을 추가하지 않았다.
- 브라우저 시각·hydration 검증, Supabase 실제 연결, GitHub CI 원격 실행은 아직 수행하지 않았다.

## 입력형 목록 추가 (2026-09-11)

날짜·시각의 직접 입력과 목록 선택 요청에 맞춰 @base-ui/react 1.8.0의 Autocomplete를 채택했다. 기존 패키지에 해당 UI가 없고 네이티브 datalist 선택을 현재 브라우저에서 검증하지 못해, 키보드·포커스·팝업 동작을 라이브러리에 맡긴다. 스타일은 기존 vanilla-extract를 유지한다. [작업 문서](../tasks/2026-09-11-birth-input-controls.md)에 결정·검증 근거를 기록했다.
