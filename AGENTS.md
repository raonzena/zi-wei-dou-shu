# 프로젝트 작업 규칙

## 요구사항과 구현

- `docs/requirements.md`, `docs/screen-flow.md`, `docs/decisions/`를 먼저 확인한다. 확정 사항과 설계안·미결정 사항을 구분한다.
- `docs/requirements.md`와 `docs/screen-flow.md`는 현재 유효한 결정만 담는 기준 문서다. 날짜별 작업 이력을 이어 붙이지 않는다.
- 새 결정이 기존 내용과 충돌하면 기존 문장을 최신 결정으로 교체하고, 서로 충돌하는 두 결정을 기준 문서에 함께 남기지 않는다. 변경 이유와 과거 상태는 작업 문서, ADR, Git 이력에 기록한다.
- 기존 제품의 패턴과 공식 문서·타입을 먼저 확인한다. 설치된 의존성을 검토한 후 필요한 패키지만 추가한다.
- pnpm, Next.js, TypeScript, Vitest, vanilla-extract, Jotai, Supabase를 사용한다.
- 검증되고 유지보수되는 라이브러리가 전체 복잡도를 낮추거나 안정성을 높이면 사용한다. 흔한 기능을 명확한 이유 없이 재구현하지 않는다.
- 아키텍처는 장기 관점에서 결정한다. 당장 문제를 넘기기 위한 임시방편을 최종 구조로 채택하지 않는다.
- 현재 요구를 만족하는 가장 단순한 구현을 선택한다. 쓰이지 않는 추상화·설정·호환 계층·폴백을 추가하지 않는다.
- 실제로 동작하는 최소 흐름을 먼저 완성하고 기능을 단계적으로 추가한다. 컴포넌트와 모듈의 책임을 분리한다.
- 문서의 제안 디렉터리를 빈 폴더로 미리 만들지 않는다.
- 사용자 개인정보와 키를 URL·로그·커밋에 넣지 않는다.
- 개발 설명은 공식 문서와 실제 검증 결과에 근거한다. 맥락이 불명확하면 질문한다.

## 답변 원칙

- 사용자가 8년차 프론트엔드 개발자임을 고려해 설명한다.
- 실제로 확인한 코드·문서·검증 결과에 근거해 답변한다. 추측은 확인된 사실과 구분한다.
- 개발 관련 설명은 공식 문서를 우선 확인하며, 요청 맥락을 확인할 수 없으면 질문한다.

## 작업 종료 전 요구사항 대조

- 매 작업 종료 전에 변경된 코드·설정·문서를 `docs/requirements.md`의 관련 요구사항과 수용 기준에 대조한다. 확정 요구사항, 설계안, 미결정 사항, 아직 구현하지 않은 항목을 구분한다.
- 이유 없이 요구사항과 달라진 작업은 종료 전에 요구사항에 맞게 수정하고 변경에 필요한 검증을 수행한다. 구현에 맞추기 위해 요구사항을 임의로 낮추거나 삭제하지 않는다.
- 사용자가 요구사항을 변경하거나 수행 불가로 다른 방향을 확정한 경우, `docs/requirements.md`의 기존 내용을 현재 결정으로 직접 갱신한다. 변경 이유, 이전 방향, 영향 범위는 해당 작업 문서나 ADR에 기록하고 기준 문서에는 날짜별 변경 기록을 추가하지 않는다.
- 제안한 대안을 사용자 확정 요구사항으로 취급하지 않는다. 아직 구현하지 않은 항목이나 후보 기술의 채택 보류를 요구사항 수행 불가로 단정하지 않는다.
- 종료 보고에는 요구사항 대조 결과와 복구·변경 내역, 남은 미구현·미결정 사항을 작업 범위에 맞춰 간결하게 밝힌다.

## 작업별 기술 문서

- 코드·설정·조사·문서 변경을 포함한 각 작업마다 `docs/tasks/YYYY-MM-DD-kebab-case-title.md`에 독립된 기술 문서 한 페이지를 작성한다. 동일 작업의 후속 진행은 기존 페이지를 갱신하고 목적이 다른 작업은 별도 페이지로 작성한다.
- `docs/tasks/TEMPLATE.md`를 기본 구조로 사용한다. 작업 시작 시 목적·범위·관련 요구사항을 기록하고, 종료 전에 실제 결과로 갱신한다. 짧은 작업은 각 항목을 간결하게 작성하되 해당하지 않는 항목은 이유를 명시한다.
- 각 문서에는 작업 개요와 상태, 관련 요구사항과 수용 기준, 결정 내용과 근거, 실제 변경과 영향을 포함한다. 검증 방법과 결과, 미검증 범위, 종료 전 요구사항 대조 결과, 남은 문제와 추후 개선점, 참고 자료도 기록한다.
- 결정 근거는 사용자 지시, 확인한 코드·타입, 공식 문서, 실행 결과를 구분한다. 실제 검토한 대안과 선택 이유가 있으면 기록하고 검토하지 않은 대안이나 수행하지 않은 검증은 만들어 쓰지 않는다.
- 개선점은 확인된 한계·필요성·착수 조건을 기록한다. 제안과 확정 후속 작업을 구분하고, 불필요한 확장 계획을 채우기 위해 만들지 않는다.
- 요구사항의 현재 기준은 `docs/requirements.md`, 화면 흐름의 현재 기준은 `docs/screen-flow.md`, 아키텍처 결정은 `docs/decisions/`에 유지한다. 변경 이력은 작업 문서와 Git에서 확인한다.
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
- 제목 다음에 빈 줄을 두고, 본문(description)에 실제 변경 내용과 목적을 작성한다.
- 하나의 커밋은 하나의 검토 가능한 목적을 가진다. 실제 수행한 변경·검증만 기록한다.
- 예: `feat/initial-settings`, `fix/report-sharing`, `docs/calculation-policy`.
- 멀티라인 메시지는 임시 파일을 작성한 후 `git commit -F <파일>`로 전달해 셸 치환을 방지한다.
- 사용자 요청이나 현재 작업 계획에 따라 브랜치를 사용한다. 커밋 요청을 원격 push 요청으로 간주하지 않는다.

## 저장소에 포함한 전역 지침

아래 fluent-korean 전문은 다른 컴퓨터나 클라우드에서도 이 저장소만으로 읽을 수 있도록 포함했다. 로컬 전역 파일이나 외부 링크를 별도로 읽어야 적용되는 구조가 아니다. 프로젝트의 작업·커밋 규칙과 함께 적용하며, 사용자가 확정한 쉬운 서비스 문구 작성 원칙을 유지한다. 별도 도구·플러그인의 설치를 의미하지 않는다.

<!-- prettier-ignore-start -->

# 한국어 작성 지침 (fluent-korean)

출처: https://github.com/snflkd/fluent-korean/blob/main/plugins/fluent-korean/output-styles/fluent-korean.md

당신은 한국어를 활용해야 하는 상황에 있다면 본 문서에 제시된 지침들을 준수해야 합니다. 그럼으로써 의사소통의 효율성을 높일 수 있습니다. 이 지침들은, 의미가 명확하며 비교적 가독성이 높고 안정적인 구조를 지닌 한국어 문장을 출력하는 방법을 자세히 설명합니다. 인용, 코드, 코드 주석에는 이 지침들을 적용하지 않습니다.


## 상황과 목표

- LLM은 한국어를 구사할 때 몇 가지 특징을 보이는데, 일부 특징은 결과물의 완성도를 낮추거나, 사용자가 소통에 더 많은 노력을 들이게 만듭니다. 이 문서에 작성된 사항들을 준수하면 이런 현상을 개선할 수 있습니다.

- 이 문서에서 제시하는 지침들을 요약하는 것은 일반적으로 권장되지 않습니다. 그렇게 한다면 조항마다 첨부된 예시를 확인할 수 없으므로 조항의 문구가 구체적으로 어떤 동작을 의도했는지 파악하기 어렵습니다. 또한 요약에 포함된 몇 가지 지침을 제외한 나머지 지침들은 잘 준수되지 않는 방향으로 서술 압력이 작동하게 될 수도 있습니다. 그리고 목적과 의도를 생략하고 제한 사항만 요약한다면 목적에 부합하지 않게 기계적으로 지침을 준수했는지 확인하게 될 수도 있습니다.


## 동작 범위

1. 본문의 지침들은 한국어를 활용하는 상황에서 그 한국어를 명확하게 출력하라는 지시입니다. 외국어 문장이나 어휘를 출력해야 하는 상황에서, 그것을 한국어로 번역하거나 대체하라는 지시가 아닙니다.

2. 변수명과 주석, 커밋 메시지, 로그 문자열처럼 코드에 속하는 텍스트는 프로젝트의 기존 관례를 준수해야 합니다. 이러한 텍스트는 지침을 적용하면 안 되기 때문에 이 조항에서 한 번 더 강조하고 있습니다.

3. 고유 명사와 기술 용어 등은, 통상적인 용례로 정착된 번역어 혹은 음차가 있다면 우선적으로 사용하고, 그렇지 않다면 원어를 유지함으로써, 한국어 사용자가 이해하기 편하고 의미를 잘 이해할 수 있도록 합니다.

4. 사용자가 어떤 어조나 어휘를 사용하든지, 사용자 메시지의 어조를 모방하지 않고, 본문에서 제시하는 지침들을 일관되게 유지합니다.


## 문장 단위

1. 읽는 이가 문장의 의미를 충분히 이해할 수 있어야 하므로, 의미가 있는 문장 성분을 생략하지 않습니다. [그러면 경고가 붙습니다.→ ('그러면 이미 작업 중인 파일에도 경고 표지가 추가됩니다.'와 같이, 맥락과 정보를 충분히 제공하도록 수정) ]  특히 관형격 조사인 '~의'를 필요 이상으로 사용한다면, 의미를 담고 있는 문장 성분을 생략하기 쉬우므로 유의해야 합니다.  [사본의 문구는 작업의 상황을 → 사본에 기재된 문구는 작업이 진행되는 상황을]

2. (이 2번 조항은 헤더와 목록에는 강제로 적용되는 사항이 아닙니다.) 명사구나 부사구, 연결어미로 문장을 끝내지 말고, 서술어와 종결어미를 사용하여 완성된 형태의 문장으로 끝을 맺어야 합니다.


## 구 단위

1. 필수적인 경우가 아니라면 조사와 어미를 생략하지 말아야 합니다. 또한 부사, 보조사와 선어말어미, 보조 용언을 적극적으로 활용하면, 의미가 명확한 한국어 문장을 완성할 수 있습니다. [이 결정은 이후 중요 정책이 갈리는 자리. 컨텍스트 압축 전 신중 반영한다. → 이 결정은 이후 중요한 정책에 지속적으로 영향을 주기 때문에, 컨텍스트가 압축되기 전에 신중히 반영합니다. → 지금 답변해주신 결정 사항은 이후 중요한 정책에도 지속적으로 영향을 미치기 때문에, 컨텍스트가 압축되기 전에 미리 신중하게 반영해 놓겠습니다.]

2. 구체적인 의미를 담고 있는 한자어와 자연스러운 통사 구조를 결합하면, 풍부하고 명확한 의미를 전달할 수 있습니다. 따라서 맥락에 적합한 한자어를 적극적으로 활용하고, 그 한자어에 조사와 어미를 붙여서 어휘 사이의 관계를 확실하게 나타내야 합니다. [<쓴 비용을 구하는 토큰 카운트 함수에 문제가 생기면 (상황에 적합한 어휘가 사용되지 않아 의미가 불충분함) /지출 비용 추론 용도의 토큰 카운트 함수의 오류 상황에서 (조사와 어미가 없어 가독성이 낮고 의미 관계가 불분명함)>  → 지출한 비용을 추론하는 토큰 카운트 함수에 오류가 발생하면 (이 지침의 목표 예시)]

3. 일반적인 어휘를 사용해야 하는 자리에 비유적 어휘를 사용하면 가독성이 낮고, 의미가 변질되기 쉽습니다. 따라서 꼭 필요한 경우가 아니라면 비유적 어휘로 일반적인 명사나 동사를 대체하지 않습니다. 다만 일상적인 문어에서 통용되고 지금 다루는 분야에서도 관용 표현으로 정착되어 있어서, 일반적인 어휘로 바꾸면 오히려 어색해지는 표현은 그대로 사용합니다. [<분석의 흐름 → 분석의 방향성>, <코드로 박는 자리 → 코드에 명시하는 상황 (혹은 코드에 명시하는 작업)>, <요청을 받습니다 -> 요청을 확인했습니다 (혹은 요청대로 수행하겠습니다)>]

4. 엠대시(—)는 앞뒤 문장의 관계를 지나치게 함축하기 때문에 자제하고, 문맥과 형식에 따라 콜론이나 접속사로 대체합니다.


## 추가 사항

- 서브에이전트를 호출할 때, 한국어로 프롬프트를 작성했다면 실제로 서브에이전트 호출 도구를 사용하기 전에 이 본문의 지침들이 준수되어 있는지 점검합니다. 서브에이전트가 산출한 결과를 사용자에게 전달할 때에도 본문의 지침들이 그대로 적용됩니다.

<!-- fluent-korean 라이선스 고지
MIT License

Copyright (c) 2026 snflkd

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OF OR IN CONNECTION WITH
THE SOFTWARE.
-->

<!-- prettier-ignore-end -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
