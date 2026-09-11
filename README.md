# 자미두수 — zi-wei-dou-shu

일반 사용자가 출생 정보를 입력해 간소화된 명반과 한국어 해석을 확인하는 웹 서비스다. 상세 명반을 탐색하고 결과를 공유하는 기능도 제공하는 것을 목표로 한다.

- 저장소: https://github.com/raonzena/zi-wei-dou-shu
- 기술 스택: pnpm, Next.js, TypeScript, Vitest, vanilla-extract, Jotai, Supabase

현재는 초기 설정과 계산 엔진의 1차 평가를 마치고, 출생 정보 검증과 시간 정규화를 거쳐 iztro로 명반을 계산하는 흐름을 연결했다. 독립 기준 명반의 일부 항목을 대조했으며, 입력 화면에서 실제 명반 미리보기까지 확인할 수 있다.

초기 엔진으로 iztro를 사용하고, 추후 필요한 명반 기능을 TypeScript로 직접 구현하기로 결정했다. 간편·상세 명반 탭과 궁 선택, 용어 설명을 연결했다. 추가 계산 검증과 개인화 해석, 결과 저장 및 공유 기능은 후속 작업으로 남아 있다.

## 프로젝트 문서

| 문서                                                      | 내용                                             |
| --------------------------------------------------------- | ------------------------------------------------ |
| [요구사항](docs/requirements.md)                          | 제품 범위, 수용 기준, 미결정 정책                |
| [화면 흐름](docs/screen-flow.md)                          | 화면 구성, 이동, 상태, 공유 동작                 |
| [기술 선택 기록](docs/decisions/0001-technology-stack.md) | 확정 스택, 역할, 모듈 경계, 초기 세팅 체크리스트 |

[계산 엔진 평가](docs/decisions/0002-calculation-engine-evaluation.md)에는 한국 출생자의 지원 범위, 달력 차이, 테스트 근거와 운영 채택 조건을 기록했다.

[작업별 기술 문서](docs/tasks/README.md)에는 각 작업의 요구사항과 결정 근거, 구현 및 검증 결과, 추후 개선점을 기록한다.

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

기본 개발 주소는 http://localhost:3000 이다. 첫 화면에서 출생 정보를 입력하면 실제 명반 미리보기를 확인할 수 있다. 간편·상세 탭과 용어 설명을 사용할 수 있다. 결과 저장, 개인화 해석과 공유 기능은 아직 연결하지 않았다.

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

## 현재 단계와 다음 작업

출생 입력 → 서버 검증·계산 → 간편·상세 명반과 용어 설명까지 연결했다. 초기 계산은 윤달 늦은 자시 예외까지 iztro를 따른다. 사용자는 추후 윤달과 늦은 자시가 겹칠 때의 처리가 개선되기를 원한다. 해당 규칙을 변경할 때는 날짜·시각 경계를 검증하고 계산 정책 버전을 갱신한다.

1. 해석 주제·근거·생성 방식을 결정하고 명반 아래에 개인화 해석을 연결한다.
2. 소유권·보관 정책을 정하고 결과 저장·복원·공유를 구현한다.
3. 추가 독립 명반·전체 경계·출시 수용 기준을 검증한다.

[입력·미리보기 작업 기록](docs/tasks/2026-09-11-birth-input-preview.md), [윤달 예외 조사와 최종 결정](docs/tasks/2026-09-11-leap-late-rat-policy.md)을 참고한다.

[간편·상세 명반 UI 작업](docs/tasks/2026-09-11-chart-result-ui.md)에 표시 범위와 검증 결과를 기록했다.
