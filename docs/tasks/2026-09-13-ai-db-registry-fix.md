# AI DB 검사 이미지 다운로드 실패 수정

- 작성일: 2026-09-13
- 상태: 로컬 수정·검증 완료 (원격 CI 재검증 전)

## 작업 개요와 요구사항

GitHub Actions의 test:ai-db 실패로 배포가 중단됐다는 사용자 보고를 조사했다. 요구사항 6절의 검증 성공 후 배포 조건을 유지하며 실패 원인을 해결한다.

## 원인과 결정

실패 실행 34706004092와 34705447169 모두 Docker가 public.ecr.aws/supabase/postgres:17.6.1.166을 받다가 toomanyrequests: Rate exceeded로 종료했다. SQL 검사에 진입하기 전의 이미지 다운로드 제한이며 문구 마이그레이션이나 AI 호출 실패가 아니다. gh 로그 캐시 기본 위치는 쓰기 권한이 없어 임시 디렉터리로 변경해 조회했다.

Supabase 공식 GHCR 패키지와 동일 버전의 manifest를 확인했다. linux/amd64와 linux/arm64 배포를 확인하고 AI DB 스크립트의 이미지 경로만 ghcr.io/supabase/postgres:17.6.1.166으로 변경했다. 재시도 루프나 레지스트리 폴백, 검사 생략은 추가하지 않는다.

## 변경과 영향

scripts/test-ai-usage-db.mjs의 다운로드 경로 한 곳만 변경한다. DB 버전·테스트·배포 조건·운영 Supabase·AI 설정은 유지한다. 다른 독립 스크립트의 이미지 경로는 이번 장애 범위 밖이므로 변경하지 않는다.

## 검증

변경한 이미지로 pnpm test:ai-db 통과: 동시 중복·시간/일별 횟수·예산 제한, 비용 정산과 멱등성, 한국 날짜 경계·보관·RLS·RPC 권한 검사 통과. 로컬 ARM 환경에서 수행했다. CI의 AMD64 manifest는 확인했지만 수정본을 GitHub Actions에서 아직 실행하지 않았다. 로컬에서 기존 ECR 이미지와 새 GHCR 이미지의 image ID가 동일함도 확인했다. ESLint와 문서 포맷, git diff --check를 통과했다. 운영 DB와 실제 AI 호출은 사용하지 않았다.

## 요구사항 대조와 남은 사항

배포 전 DB 검사 조건을 그대로 유지해 요구사항 변경은 필요하지 않다. 원격 CI 성공과 실제 배포는 수정본 커밋·푸시 후 확인해야 한다. 다른 레지스트리의 장애가 없을 것이라고 보장하지 않는다.

## 참고 자료

- https://github.com/raonzena/zi-wei-dou-shu/actions/runs/34706004092
- https://github.com/raonzena/zi-wei-dou-shu/actions/runs/34705447169
- https://github.com/supabase/postgres/pkgs/container/postgres
- ../requirements.md
