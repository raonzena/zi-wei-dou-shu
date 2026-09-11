# 명반 인장 로고와 메타데이터

- 작성일: 2026-09-12
- 상태: 완료 — 코드·Figma·로컬 검증 완료, 배포 전

## 작업 개요와 요구사항

[브랜드 로고와 메타데이터 요구사항](../requirements.md)에 따라 기존 중국풍 디자인에 맞는 로고와 공유 이미지를 제작한다. 입력·명반 계산·AI 호출·결과 공유 동작은 변경하지 않는다.

## 결정과 근거

기존 Figma와 코드의 종이색 #F7F3E8, 주홍색 #A6382E를 재사용한다. 중국 인장의 사각 형태 안에 12궁의 외곽 칸과 중심 별을 도형으로 표현한다. 로고는 명반을 모티프로 한 장식이며 실제 개인의 별 배치가 아니다. 작은 크기에서 복잡한 한자가 뭉개지지 않도록 문자 없는 SVG로 제작한다. 기존 디자인 시스템에서 자미두수 로고를 검색했으나 해당 컴포넌트는 없어 직접 만들었다.

Next.js 16.3.4의 로컬 app-icons·opengraph-image 공식 문서에 따라 파일 기반 메타데이터를 사용한다. 별도 이미지 생성 API나 런타임 이미지 라이브러리를 추가하지 않는다. SVG 원본은 src/app/icon.svg이며 기존 SVGR 설정으로 상단 Brand에서도 같은 파일을 가져온다. Figma 로고는 기존 paper·accent 변수에 연결한다.

## 변경 내용과 영향

- icon.svg: 64×64 벡터 원본과 브라우저 아이콘.
- favicon.ico: 16·32·48px PNG를 포함한 ICO.
- apple-icon.png: 180×180 터치 아이콘.
- opengraph-image.png 및 alt.txt: Figma에서 내보낸 1200×630 정적 공유 이미지와 대체 설명.
- layout.tsx: 공개 도메인의 metadataBase, 한국어 Open Graph 및 Twitter large-image 카드 설정. Twitter 이미지는 Next.js가 Open Graph 이미지를 사용한다.
- Brand: SVG 심볼과 한글 서비스 이름. 장식 SVG는 접근성 트리에서 제외하고 이름은 텍스트로 제공한다.

정적 PNG는 Figma에서 내보냈고 ICO·Apple 아이콘은 Next.js에 이미 설치된 sharp로 SVG를 렌더링했다. 추가 의존성은 없다. SVG를 바꾸면 Apple·ICO를 다시 렌더링하고 Figma 원본 및 공유 이미지를 함께 갱신해야 한다. OG PNG의 수정 가능한 디자인 원본은 Figma에 있다.

## Figma

- [로고 컴포넌트](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=17-160)
- [공유 이미지](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=18-153)
- [사용 기준](https://www.figma.com/design/VyoZh5i11OisRmKGgw06qg/?node-id=18-165)

기존 입력·간편·상세의 데스크톱 및 모바일 6개 화면 상단을 같은 로고 인스턴스로 교체했다. 명반 중앙 한자와 로딩 화면의 기존 인장 장식은 유지한다.

## 검증과 요구사항 대조

pnpm check(203개 통과, 유료 실호출 테스트 1개 기본 제외), pnpm build, git diff --check를 통과했다. 운영 빌드의 icon.svg·favicon.ico·apple-icon.png·opengraph-image.png 응답은 모두 HTTP 200이다. 실제 head에서 SVG·ICO·180px Apple 아이콘, 1200×630 Open Graph 이미지와 대체 설명, 같은 이미지를 사용하는 Twitter large-image 카드를 확인했다. 브라우저 1280px 화면에서 로고는 40×40px이며 장식 SVG의 aria-hidden=true, 가로 넘침 없음을 확인했다. Figma의 32px 모바일 로고와 공유 이미지를 스크린샷으로 검토했다. SVG에는 외부 이미지·글꼴 의존성이 없다. 결과 공유 미구현이나 전체 AI 품질 검증 상태를 이번 정적 공유 이미지 작업의 완료로 변경하지 않는다.

## 남은 문제와 추후 개선점

브라우저·메신저의 기존 아이콘과 공유 미리보기 캐시는 서비스별로 갱신 시간이 다르다. 커스텀 도메인 변경 시 metadataBase도 갱신해야 한다. 카카오톡·iOS 실기기에서의 캐시 갱신과 표시 검증은 별도다. 코드와 정적 자산은 로컬 검증을 완료했으며, main push 후 자동 배포되면 공개 사이트에도 적용된다.

## 참고 자료

- 설치된 Next.js 16.3.4의 app-icons, opengraph-image, generate-metadata 문서
- [이전 중국풍 디자인 작업](2026-09-11-chinese-visual-design.md)
