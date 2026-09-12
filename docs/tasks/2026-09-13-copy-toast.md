# 링크 복사 완료 토스트

- 작성일: 2026-09-13
- 상태: 완료

## 작업 개요와 요구사항

사용자 요청에 따라 링크 복사 완료 문구를 인라인 안내에서 토스트로 바꾼다. 기존 페이지 디자인과 UI 규칙에 맞춘다.

## 결정과 근거

설치된 Base UI 1.8.0 Toast의 Provider·Viewport·Title·Close·useToastManager 타입을 확인했다. 패키지나 수동 타이머를 추가하지 않는다. 기존 paper·ink·accent·line 색상과 카드 테두리·그림자를 사용하고 fixed 레이어는 기존 20·30 위의 40을 사용한다. 별도 애니메이션은 추가하지 않는다.

## 변경 내용과 영향

공통 Provider 아래에 토스트를 두고 복사 성공 시에만 표시한다. 오른쪽 아래의 종이색 카드와 붉은 강조선, 닫기 버튼으로 구성한다. 모바일에서는 양쪽 여백과 safe-area를 확보한다. 4초 자동 닫힘과 동일 ID 갱신, polite 알림을 사용한다. 직접 복사가 필요한 오류 안내와 링크 입력은 버튼 아래에 유지한다.

## 검증

- 브라우저에서 기본 화면과 390px 모바일 화면의 실제 토스트 디자인을 확인했다. 반복 복사 후 토스트 한 개 유지, 자동 닫힘, 직접 닫기 후 제거를 확인했다.
- 설치된 Toast가 polite live region을 제공하는 것을 DOM에서 확인했다. 라이브 안내 중 닫기 버튼을 스크린리더에서 숨기는 라이브러리 동작 때문에 첫 role 기반 검증이 실패했으며, 표시된 닫기 버튼으로 재검증해 통과했다. 접근성 동작을 임의로 덮어쓰지 않았다.
- 공유 처리 테스트 5개와 타입 검사를 통과했다. 최초 전체 검사에서 Provider 테스트가 vanilla-extract를 직접 읽어 실패했다. 기존 테스트 관례대로 토스트 CSS 모듈만 모킹하고, SSR 상태 격리 테스트 2개는 원래 검증 그대로 통과했다. 재실행한 pnpm check는 테스트 270개 통과·유료 실평가 1개 제외로 통과했다. pnpm build와 git diff --check도 통과했다. 실제 AI 호출이나 외부 공유 전송은 없었다. 생성한 시험 결과를 관리 작업으로 정리했다.

## 요구사항 대조

공유 링크, 취소 처리와 복사 권한 오류 동작을 유지한다. 요구사항에 성공 토스트의 표시·닫힘 동작을 기록했다.

## 남은 문제와 추후 개선점

이번 알림 변경에 미결정 사항은 없다.

## 참고 자료

- node_modules/@base-ui/react/toast/provider/ToastProvider.d.ts
- node_modules/@base-ui/react/toast/useToastManager.d.ts
- .agents/skills/baseline-ui/SKILL.md
- src/styles/theme.css.ts
