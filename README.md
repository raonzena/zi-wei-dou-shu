# 자미두수 — zi-wei-dou-shu

일반 사용자가 출생 정보를 입력하고, 간소화된 명반과 한국어 해석을 읽은 뒤 상세 명반을 탐색하고 결과를 공유하는 웹 서비스.

- 저장소: https://github.com/raonzena/zi-wei-dou-shu
- 기술 스택: pnpm, Next.js, TypeScript, Vitest, vanilla-extract, Jotai, Supabase
- 현재 단계: 초기 설정과 계산 엔진 1차 평가 완료. 초기 iztro 사용과 후속 TypeScript 자체 구현을 결정했으며 출생 정보 검증·시간 정규화에서 iztro 명반 계산까지 서버 내부 흐름을 연결했다. 독립 명반 검증과 입력·결과 화면·해석·공유 연결은 후속 작업이다.

## 프로젝트 문서

| 문서                                                      | 내용                                             |
| --------------------------------------------------------- | ------------------------------------------------ |
| [요구사항](docs/requirements.md)                          | 제품 범위, 수용 기준, 미결정 정책                |
| [화면 흐름](docs/screen-flow.md)                          | 화면 구성, 이동, 상태, 공유 동작                 |
| [기술 선택 기록](docs/decisions/0001-technology-stack.md) | 확정 스택, 역할, 모듈 경계, 초기 세팅 체크리스트 |

[계산 엔진 평가](docs/decisions/0002-calculation-engine-evaluation.md): 한국 출생 범위, 달력 차이, 테스트 근거와 운영 채택 조건.

[작업별 기술 문서](docs/tasks/README.md): 각 작업의 요구사항, 결정 근거, 구현·검증 결과와 개선점.

문서에서 **확정**은 사용자가 명시한 내용, **설계안**은 구현을 위한 제안, **미결정**은 조사·정책 결정이 필요한 내용을 뜻한다. 설계안을 확정 요구사항으로 취급하지 않는다.

## 실행 환경

- Node.js **24.x** (`.node-version`)
- pnpm **10.33.2** (`packageManager`)
- Next.js App Router, 개발·운영 빌드 모두 Webpack 사용

설치된 Node.js가 다른 버전이라면 사용하는 버전 관리 도구에서 Node.js 24로 전환한다. `engine-strict`로 지원하지 않는 런타임의 설치·실행을 차단한다.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

기본 개발 주소는 http://localhost:3000 이다. 첫 화면은 서비스 준비 안내이며 실제 계산 기능은 아직 없다.

## 명령

| 명령                | 내용                                       |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | 개발 서버                                  |
| `pnpm build`        | 운영 빌드                                  |
| `pnpm start`        | 빌드 결과 실행                             |
| `pnpm lint`         | ESLint 검사                                |
| `pnpm typecheck`    | Next.js 라우트 타입 생성과 TypeScript 검사 |
| `pnpm test`         | Vitest 단일 실행                           |
| `pnpm test:watch`   | Vitest 감시 실행                           |
| `pnpm format`       | Prettier 포맷 적용                         |
| `pnpm format:check` | 포맷 검사                                  |
| `pnpm check`        | 포맷·린트·타입·테스트 순서로 검사          |

GitHub Actions는 main push와 pull request에서 lockfile 설치, `pnpm check`, `pnpm build`를 실행하도록 구성했다. 원격 워크플로 실행 결과는 push 이후 확인한다.

## Supabase

SDK는 설치되어 있다. 첫 화면·빌드·테스트에 Supabase 환경변수는 필요하지 않다. 실제 연결은 소유권·보관 정책과 데이터 모델을 확정한 뒤 구현한다.

연결 단계에서 `.env.example`을 `.env.local`로 복사하고 프로젝트 값을 입력한다. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`는 공개 키이고 `SUPABASE_SECRET_KEY`는 서버 전용 키다. 서버 키를 공개 환경변수에 넣지 않는다. `.env.local`은 Git에 포함하지 않는다.

## 커밋 규칙

[AGENTS.md](AGENTS.md)를 따른다. 제목은 `<type>/<kebab-case-summary>`, 빈 줄 뒤 본문에는 변경 내용·이유와 검증 결과를 작성한다.

```text
feat/initial-settings

초기 개발 환경과 지정 기술 스택을 구성한다.

검증: 실행한 검사와 결과를 기록한다.
```

## 다음 작업

1. [엔진·계산 정책](docs/decisions/0003-engine-and-calculation-policy.md)에 따라 독립 기준 명반·배치 경계 검증을 완료한다.
2. 입력 → 실제 명반 → 기본 설명 흐름을 구현한다.
3. 간편·상세 결과, 용어 설명, 해석 생성, 결과 저장·공유 순서로 확장한다.

독립 강의 명반 1건의 기본 배치는 일치했으나 화령·壬 사화·윤달 늦은 자시에 미해결 차이가 있어 공개 계산 연결을 보류한다. [독립 대조 결과](docs/tasks/2026-09-11-independent-chart-verification.md)에 검증 범위와 근거를 기록했다.
