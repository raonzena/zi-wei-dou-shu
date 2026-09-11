# 중국 전통 서책을 모티프로 한 화면 디자인

- 작성일: 2026-09-11
- 상태: 피그마 디자인과 페이지 구현 완료 / 브라우저 검증 완료

## 작업 개요

사용자 요청에 따라 기존 작업을 `9e589c8 feat/chart-result-ui`로 커밋한 뒤, 지정한 피그마 파일에서 입력·로딩·간편 명반·상세 명반을 설계하고 페이지에 반영한다.

## 요구사항

REQ-01–05·07–10의 기존 기능을 유지하면서 중국풍의 시각 디자인을 적용한다. 피그마를 먼저 설계하고 그 기준으로 구현한다. 공유와 개인화 해석은 기존 후속 구현 범위다.

## 결정과 근거

중국 전통 서책과 인장을 모티프로 삼는다. 종이색 #F7F3E8, 먹색 #292923, 주홍색 #A6382E, 옅은 주홍색 #F3E5DC, 구분선 #C9BDA5, 보조 글자색 #686354를 사용한다. 제목과 명반은 Noto Serif KR Bold, 입력과 설명은 Noto Sans KR로 구성한다. 자미두수를 나타내는 紫微斗數를 인장과 명반 중앙에 사용하며 일반 안내는 한국어로 유지한다.

고궁박물원 공식 홈페이지에서 중국 전통 문화 콘텐츠와 실제 예약·안내 탐색이 함께 제공되는 구성을 참고했다. 사이트 자산을 복제하지 않는다. 디자인은 문화적 표현과 실제 입력 동작을 분리해 읽기 쉬운 구조로 만든다.

피그마 파일은 비어 있었고 코드에 Code Connect 파일은 없었다. 연결된 Simple Design System에서 Button·Input Field·색상·제목 스타일을 검색했다. 기존 프로젝트는 Base UI의 직접 입력 가능한 Autocomplete와 한국어 용어 Popover를 사용하므로 해당 동작을 유지하는 프로젝트 전용 스타일을 만든다. 기존 UI 패키지 교체나 계산 정책 변경은 없다.

## 변경 내용과 영향

피그마: 색상 변수 6개, 글자 스타일 4개, 입력·버튼 및 궁 컴포넌트, 데스크톱과 모바일 화면을 구성한다. 전체 디자인 시스템 구축은 이번 범위가 아니다. 팔레트는 vanilla-extract의 공통 CSS 변수로 관리한다. Next.js의 next/font/google로 글꼴을 빌드 시 가져와 사이트에서 제공하므로 방문자 브라우저는 Google Fonts에 요청하지 않는다. 드롭다운 아이콘 관리에는 사용자 추가 요청에 따라 @svgr/webpack 8.1.0을 개발 의존성으로 추가한다.

입력 폼은 큰 화면에서 소개·입력의 두 단, 작은 화면에서 한 단으로 배치한다. 결과는 최대 704px 너비로 유지하고 궁의 최소 높이와 읽을 수 있는 글자 크기를 보장한다. 기존 Base UI의 Autocomplete·Tabs·Popover와 Jotai 선택 상태를 재사용한다. 디자인의 정적인 라벨 대신 실제 라디오·입력·버튼과 접근성 속성을 유지한다.

### 피그마 화면

- [입력 · 데스크톱](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=4-19), [입력 · 모바일](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=5-105)
- [로딩 · 데스크톱](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=4-20), [로딩 · 모바일](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=8-128)
- [간편 · 데스크톱](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=4-21), [간편 · 모바일](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=5-145)
- [상세 · 데스크톱](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=4-22), [상세 · 모바일](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=5-208)
- [용어 설명](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=8-124)

## 검증

Node.js 24에서 `pnpm lint`, `pnpm typecheck`, 117개 테스트와 `pnpm build`가 통과했다. 변경 파일의 Prettier 검사와 `git diff --check`도 통과했다. 전체 `pnpm check`는 기존 작업에서 별도로 추가된 `.agents/` 파일 42개의 포맷 문제로 중단되었으며, 이번에도 해당 외부 스킬 파일이나 검사 설정을 수정하지 않는다. 전체 check 통과로 기록하지 않는다.

인앱 브라우저에서 실제 운영 빌드를 확인했다. 793px 기본 브라우저와 임시 iframe의 320px·390px·1280px CSS 뷰포트로 확인했으며, 실기기 에뮬레이션이나 모바일 Safari 테스트를 수행한 것은 아니다. 320px와 1280px에서 뷰포트 너비와 문서 scrollWidth가 일치했다. 390px의 입력, 간편·상세 명반과 선택 궁 해설을 시각적으로 확인했다.

1929-04-25 22:00의 기존 검증 입력을 직접 입력하여 실제 서버 계산을 실행했다. 첫 결과가 간편 명반으로 열렸고 상세 탭의 전택궁 선택이 하단 설명에 반영됐다. 320px에서는 별 이름이 줄바꿈되었고, 무곡 용어 팝오버의 본문·출처·닫기 버튼이 화면 안에 표시됐다. 팝오버 닫기와 탭 전환도 확인했다. 320px에서 발견한 연도 placeholder 잘림은 해당 너비에서 연도 칸을 넓혀 수정했다.

브라우저에서 Noto Sans KR와 Noto Serif KR가 적용되었음을 확인했다. 피그마의 8개 화면에서도 두 글꼴과 placeholder 제거 상태를 검사하고 스크린샷으로 배치를 검토했다. 피그마의 고정 예시는 저장소의 CUST 1929 fixture에 근거하며 실제 앱에서는 서버 계산 데이터를 사용한다.

스크린리더, 모바일 실기기·Safari·Firefox는 미검증이다. 로딩은 기존 실제 처리 상태를 그대로 따르며 화면을 오래 보여주기 위한 지연이나 가짜 진행률을 추가하지 않았다. 임시 반응형 검증 HTML은 검증 후 제거하며 제품에 포함하지 않는다.

## 요구사항 대조

REQ-01~10과 화면별 수용 기준을 대조했다. 입력 범위·기본값·한국 음력 안내·오류 처리와 원본 데이터 경로를 유지했다. 변경은 화면 구성, 공통 색상, 글꼴, 간격과 버튼 문구에 한정한다. 이유 없는 요구사항 변경이나 수행 불가에 따른 기능 축소는 없다. 기존 미구현 항목은 후속 작업으로 유지한다.

## 남은 문제와 추후 개선점

공유·저장·개인화 해석과 전체 독립 명반 검증은 기존 후속 작업으로 유지한다.

## 참고 자료

- [요구사항](../requirements.md)
- [피그마 작업 파일](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/)
- [고궁박물원](https://www.dpm.org.cn/)
- 설치된 Next.js 16.3.4의 Font Optimization 가이드

## 후속 요청: SVG 드롭다운 화살표

사용자 요청에 따라 문자 화살표를 피그마의 Chevron down 벡터로 교체한다. 원본 SVG는 src/assets/icons/chevron-down.svg에 보관하고 @svgr/webpack 8.1.0으로 React 컴포넌트로 가져온다. SVG 자체를 다시 그리지 않으며, 빌드 시 선 색상만 currentColor로 바꿔 버튼 색상을 상속한다. 장식 아이콘에는 aria-hidden과 focusable=false를 지정하고 버튼의 접근성 이름은 유지한다.

현재 dev/build는 모두 webpack을 명시한다. 설치된 Next.js 16.3.4의 webpack-config.js는 사용자 SVG 규칙을 발견하면 next-image-loader의 SVG 처리를 제외하므로, 별도 이미지 로더 검색·재등록 코드는 추가하지 않는다. 사용하지 않는 ?url 가져오기 경로와 Turbopack 설정도 만들지 않는다. TypeScript의 SVG 선언을 next-env.d.ts보다 먼저 포함한다.

[SVGR Next.js 안내](https://react-svgr.com/docs/next/)와 [변환 옵션](https://react-svgr.com/docs/options/), 실제 설치된 Next.js 코드를 확인했다. 웹팩 변환은 운영 빌드와 브라우저의 실제 SVG DOM으로 검증했다. 입력 5곳에 SVG와 currentColor, 장식 아이콘 속성이 적용되었고, 연도 목록 열기와 방향키·Enter 선택이 정상 동작했다. 320px에서는 월·일 placeholder가 잘리지 않도록 입력 오른쪽 여백도 조정했다. Vitest에서 컴포넌트 SVG 가져오기를 테스트할 필요가 생기면 Vite용 변환 구성을 별도로 검토한다. 현재 계산·도메인 테스트에는 이를 위한 패키지를 추가하지 않는다.
