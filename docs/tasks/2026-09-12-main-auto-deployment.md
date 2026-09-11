# main 푸시 후 Vercel 자동 배포

- 작성일: 2026-09-12
- 상태: 워크플로우·인증 등록 완료, 원격 실행 검증 중

## 작업 개요와 요구사항

[요구사항의 main 자동 배포 절](../requirements.md)에 따라 main push를 검증하고 성공한 커밋만 기존 Vercel production 프로젝트에 배포한다. PR은 기존 CI 검증만 수행한다.

## 결정과 근거

기존 ci.yml의 validate 작업을 유지하고 이를 needs로 참조하는 deploy 작업을 추가한다. 별도 workflow_run 파일 대신 같은 워크플로우를 사용해 검증한 커밋과 배포할 커밋을 일치시킨다. 같은 브랜치 실행은 동시 실행하지 않고 진행 중 배포를 취소하지 않는다. 대기 중 실행은 GitHub concurrency 정책에 따라 최신 실행으로 대체될 수 있다.

Vercel의 Git 연동 자동 배포는 main에 한해 비활성화한다. 다른 브랜치의 기존 Preview 설정은 이번 변경 대상이 아니다. Vercel CLI 59.10.0의 deploy --prod로 소스를 업로드하고 운영 환경에서 다시 빌드한다. prebuilt 방식은 운영 환경변수를 Actions로 내려받아 빌드해야 하므로 선택하지 않았다. CI 빌드와 Vercel 빌드를 각각 수행하는 비용은 있지만 기존 운영 키를 Vercel에 유지할 수 있다.

## 변경 내용과 영향

- .github/workflows/ci.yml: validate 성공 및 main push 조건, production 환경, 배포 작업과 동시 실행 제어.
- vercel.json: main Git 자동 배포 비활성화.
- 인증은 Actions Repository secret VERCEL_TOKEN을 배포 단계에만 전달한다. 팀·프로젝트 ID는 비밀 값이 아니므로 워크플로우에 명시한다. OpenAI 키는 GitHub로 복사하지 않는다.
- AI 호출은 실행하지 않는다. 실제 호출 검증은 기존 opt-in 정책을 유지한다.

## 설정과 운영

https://vercel.com/account/tokens 에서 배포 대상 팀에 접근 가능한 토큰을 생성하고 https://github.com/raonzena/zi-wei-dou-shu/settings/secrets/actions 에 VERCEL_TOKEN으로 등록한다. 토큰 만료·폐기 시 같은 secret을 갱신한다. 워크플로우가 원격 main에 반영되어야 push 트리거가 동작한다. production GitHub Environment에 별도 승인 규칙을 설정하면 그 정책에 따라 배포가 대기할 수 있다.

## 검증과 요구사항 대조

기존 CI와 로컬 배포 성공에 사용한 명령·Node 24 설정을 대조했다. actionlint 1.7.12로 워크플로우 구문·식·작업 참조 검사를 통과했다(shellcheck는 로컬 미설치로 제외). pnpm format:check와 git diff --check도 통과했다. 앱 코드 변경은 없으므로 기존 전체 테스트·빌드를 다시 실행하지 않았다. VERCEL_TOKEN의 Repository secret 등록을 확인했다. Actions의 실제 인증·배포는 첫 실행에서 확인한다. 요구사항을 낮추지 않으며 인증 등록과 첫 main 실행이 완료될 때까지 자동 배포 활성화는 미완료로 유지한다.

## 남은 문제와 추후 개선점

토큰 등록 후 커밋을 main에 반영하고 validate → deploy 성공을 확인해야 한다. 빌드 실패·인증 만료 시 기존 정상 배포는 유지되며 Actions 실행에서 실패 원인을 확인한다.

## 참고 자료

- [Vercel CLI deploy](https://vercel.com/docs/cli/deploy)
- [Vercel Git 설정](https://vercel.com/docs/project-configuration/git-settings)
- [Vercel과 GitHub Actions](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel)
