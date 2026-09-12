# 같은 브라우저의 결과 중복 저장 방지

- 작성일: 2026-09-13
- 상태: 구현·운영 DB 적용 완료 (앱 배포 전)

## 작업 개요와 요구사항

추천한 방식의 중복 확인을 구현한다. 사용자 답변에 따라 이름 입력은 추가하지 않는다. REQ-06에 재사용 범위·만료·동시 요청·HMAC 정책을 기록한다.

## 결정과 근거

동등 키에 B-tree 고유 인덱스를 사용하고 owner_hash와 fingerprint 단위 advisory transaction lock으로 조회·만료 키 해제·생성을 직렬화한다. 동일 쿠키로 동시에 들어온 요청 중 하나만 created=true를 받는다. 서버는 그 요청에서만 최초 AI를 호출한다. 실패한 AI는 기존 소유자 재시도 흐름을 유지한다.

입력 GET에서 Next.js Proxy가 httpOnly 소유 쿠키를 설정한다. 쿠키 없이 직접 제출하면 새 소유자를 요청마다 생성하지 않고 실패한다. 입력값은 기존 정규화로 양력/음력의 동일 시각을 통일하고 분 단위·성별은 구분한다. 현재 계산 결과·설명 내용·버전과 AI 설정을 HMAC에 포함한다. AI_USAGE_HMAC_SECRET을 별도 saved-result-v1 scope로 재사용하며 비활성 AI에서도 해당 키가 필요하다. 이름은 키에 포함하지 않는다.

## 변경과 영향

새 RPC save_or_reuse_result, nullable fingerprint와 고유 인덱스를 추가한다. 기존 결과는 원본 출생 정보가 없으므로 키를 소급 채우지 않는다. 만료된 행의 fingerprint만 해제하고 ID·payload·만료일을 유지한다. API 공개 권한은 추가하지 않고 service_role만 RPC를 호출한다. 공개 공유·소유자 재시도는 유지한다.

현재 결과를 만든 뒤 재사용을 판별하므로 명반 계산과 별 설명 조회는 매번 수행한다. 이번 변경으로 줄이는 것은 결과 중복 저장과 AI 재호출이다. 계산 전 캐시는 추가하지 않는다. 쿠키 삭제·다른 브라우저는 별개 사용자 범위다. HMAC 키 교체 시 기존 결과를 재사용할 수 없지만 기존 링크 조회에는 영향이 없다.

## 검증

격리 Docker DB에서 동시 8개 요청→1개 행·같은 ID, 소유자·키 분리, 재조회 만료 유지, 만료 후 새 ID·기존 ID 만료 유지, anon/authenticated 차단, service_role RPC 허용 및 고유 제약을 확인했다. 관련 단위 테스트 18개·타입 검사 통과. pnpm check(287개 통과, 유료 실평가 1개 제외)와 pnpm build 통과. 운영 DB에 마이그레이션을 적용했다. CI에 test:result-db를 추가한다.

## 요구사항 대조와 남은 사항

사용자 결정에 따라 이름을 추가하지 않았으며 재사용 범위·기간·버전 변경을 REQ-06과 대조한다. AI 유료 실호출은 수행하지 않는다. 동시 첫 페이지 방문처럼 쿠키를 공유하기 전의 별도 세션은 동일인으로 식별하지 않는다.

## 참고 자료

- ../requirements.md
- 2026-09-13-result-deduplication-review.md
- node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
- https://www.postgresql.org/docs/current/indexes-unique.html

## 실제 브라우저 검증과 설정

합성 출생 정보로 같은 브라우저에서 두 번 제출해 동일 ID로 이동하고 DB의 동일 키 행이 1개이며 생성일·만료일이 변하지 않는 것을 확인했다. 첫 시도는 로컬 AI_USAGE_HMAC_SECRET이 비어 있어 의도대로 저장이 차단됐다. 로컬 비밀키를 생성해 .env.local에만 설정한 후 재검증했고 키를 출력하거나 커밋하지 않았다. Vercel production의 해당 Secret 등록 여부만 확인했으며 운영 키를 교체하지 않았다. 시험 결과는 관리자 권한으로 해당 ID만 삭제했다. 운영 AI 호출·앱 배포는 하지 않았다.

Next Proxy의 입력 GET 쿠키 발급을 실제 폼 제출에서 확인했다. 마이그레이션은 기존 운영 앱의 insert 권한을 변경하지 않으므로 현재 배포본의 저장을 막지 않는다. 새 앱에서는 RPC 한 경로를 사용한다. 기존 결과의 공개 조회·소유자 재시도·30일 만료를 유지하고 요구사항과 대조했다. 원격 앱 배포와 CI는 후속 확인이 필요하다.
