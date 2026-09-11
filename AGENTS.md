# 프로젝트 작업 규칙

## 요구사항과 구현

- `docs/requirements.md`, `docs/screen-flow.md`, `docs/decisions/`를 먼저 확인한다. 확정 사항과 설계안·미결정 사항을 구분한다.
- 기존 제품의 패턴과 공식 문서·타입을 먼저 확인한다. 설치된 의존성을 검토한 후 필요한 패키지만 추가한다.
- pnpm, Next.js, TypeScript, Vitest, vanilla-extract, Jotai, Supabase를 사용한다.
- 현재 요구를 만족하는 가장 단순한 구현을 선택한다. 쓰이지 않는 추상화·설정·호환 계층·폴백을 추가하지 않는다.
- 실제로 동작하는 최소 흐름을 먼저 완성하고 기능을 단계적으로 추가한다. 컴포넌트와 모듈의 책임을 분리한다.
- 문서의 제안 디렉터리를 빈 폴더로 미리 만들지 않는다.
- 사용자 개인정보와 키를 URL·로그·커밋에 넣지 않는다.
- 개발 설명은 공식 문서와 실제 검증 결과에 근거한다. 맥락이 불명확하면 질문한다.

## 작업 종료 전 요구사항 대조

- 매 작업 종료 전에 변경된 코드·설정·문서를 `docs/requirements.md`의 관련 요구사항과 수용 기준에 대조한다. 확정 요구사항, 설계안, 미결정 사항, 아직 구현하지 않은 항목을 구분한다.
- 이유 없이 요구사항과 달라진 작업은 종료 전에 요구사항에 맞게 수정하고 변경에 필요한 검증을 수행한다. 구현에 맞추기 위해 요구사항을 임의로 낮추거나 삭제하지 않는다.
- 요구사항을 수행할 수 없어 다른 방향으로 진행한 경우 `docs/requirements.md`에 관련 요구사항 ID 또는 절, 기존 요구사항, 수행할 수 없는 이유와 근거, 변경 전후 방향, 영향 범위, 미결정 사항을 기록한다. 상세 ADR 링크만으로 이유와 변경 방향의 기록을 대신하지 않는다.
- 제안한 대안을 사용자 확정 요구사항으로 취급하지 않는다. 아직 구현하지 않은 항목이나 후보 기술의 채택 보류를 요구사항 수행 불가로 단정하지 않는다.
- 종료 보고에는 요구사항 대조 결과와 복구·변경 내역, 남은 미구현·미결정 사항을 작업 범위에 맞춰 간결하게 밝힌다.

## 작업별 기술 문서

- 코드·설정·조사·문서 변경을 포함한 각 작업마다 `docs/tasks/YYYY-MM-DD-kebab-case-title.md`에 독립된 기술 문서 한 페이지를 작성한다. 동일 작업의 후속 진행은 기존 페이지를 갱신하고 목적이 다른 작업은 별도 페이지로 작성한다.
- `docs/tasks/TEMPLATE.md`를 기본 구조로 사용한다. 작업 시작 시 목적·범위·관련 요구사항을 기록하고, 종료 전에 실제 결과로 갱신한다. 짧은 작업은 각 항목을 간결하게 작성하되 해당하지 않는 항목은 이유를 명시한다.
- 필수 내용: 작업 개요와 상태, 관련 요구사항과 수용 기준, 결정 내용과 근거, 실제 변경과 영향, 검증 방법·결과·미검증 범위, 종료 전 요구사항 대조 결과, 남은 문제·추후 개선점, 참고 자료.
- 결정 근거는 사용자 지시, 확인한 코드·타입, 공식 문서, 실행 결과를 구분한다. 실제 검토한 대안과 선택 이유가 있으면 기록하고 검토하지 않은 대안이나 수행하지 않은 검증은 만들어 쓰지 않는다.
- 개선점은 확인된 한계·필요성·착수 조건을 기록한다. 제안과 확정 후속 작업을 구분하고, 불필요한 확장 계획을 채우기 위해 만들지 않는다.
- 요구사항의 원본은 `docs/requirements.md`, 아키텍처 결정은 `docs/decisions/`에 유지한다. 작업 문서는 해당 내용을 연결하고 이번 작업에 미친 영향을 설명한다. 수행 불가로 요구사항과 달라진 경우 requirements.md에도 이유·변경 방향을 반드시 기록한다.
- `docs/tasks/README.md` 목록에 작업 페이지와 상태를 추가·갱신한다. 작업 문서 작성과 요구사항 대조를 마치기 전 작업을 완료로 보고하지 않는다. 완료된 조사와 보류된 제품 구현은 구분한다.

## 검증

- Node.js 24와 package.json에 기록한 pnpm 버전을 사용한다.
- 커밋 전에 변경에 맞는 검증을 수행한다. 초기 설정·의존성 변경은 `pnpm check`와 `pnpm build`를 실행한다.
- 단순 선언을 복제하는 테스트를 추가하지 않는다. 계산·권한·입력 경계 등 실제 오류를 잡는 테스트를 작성한다.
- 검사 실패를 숨기거나 검사 자체를 무력화하지 않는다. 수행하지 못한 검증은 명시한다.

## 커밋 규칙

모든 커밋은 다음 제목과 본문 형식을 따른다.

```text
<type>/<kebab-case-summary>

<변경한 내용과 이유를 설명하는 한국어 본문>

검증: <실행한 검증과 결과 또는 미실행 이유>
```

- 제목은 영문 소문자 type, 슬래시(`/`), 영문 소문자·숫자·하이픈으로 된 요약으로 작성한다.
- type은 `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `ci`, `build`, `revert` 중 작업에 맞게 선택한다.
- `feat: ...` 또는 `feat(scope): ...` 형식을 사용하지 않는다.
- 제목만 작성하지 않는다. 빈 줄 뒤 description에 실제 변경과 목적을 작성한다.
- 하나의 커밋은 하나의 검토 가능한 목적을 가진다. 실제 수행한 변경·검증만 기록한다.
- 예: `feat/initial-settings`, `fix/report-sharing`, `docs/calculation-policy`.
- 멀티라인 메시지는 임시 파일을 작성한 후 `git commit -F <파일>`로 전달해 셸 치환을 방지한다.
- 사용자 요청이나 현재 작업 계획에 따라 브랜치를 사용한다. 커밋 요청을 원격 push 요청으로 간주하지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
