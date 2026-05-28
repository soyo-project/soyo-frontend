# SOYO 프론트엔드

## 사용자 흐름 (플로우차트 기반)

```
1. 회원가입/로그인
   login.html → signup-email.html → signup-nickname.html → signup-school.html → home.html

2. 기록하기 (게시글 작성)
   upload.html → 사진/제목/설명/태그/위치 → 등록

3. 공간 탐색
   home.html (탭: 추천|최신|저장) + 검색바 + 필터/정렬
   map.html (지도 기반 탐색)

4. 정보 확인/공유
   post-detail.html → 좋아요/저장/공유/전송
   내 게시글: 수정(upload.html?edit=ID) / 삭제
   남의 게시글: 신고

5. 반복/유지
   calendar.html (날짜별 기록)
   my-groups.html (커뮤니티)
   mypage.html (프로필/그룹 코드)
```

## 폴더 구조

```
soyo/
├── css/
│   ├── global.css          # 전역 변수, 공통 컴포넌트
│   ├── login.css           # 로그인 + 소셜 로그인
│   ├── signup.css          # 회원가입 공통 (step indicator 포함)
│   ├── home.css            # 홈 피드 + 검색바 + 필터 모달
│   ├── map.css             # 지도 + 바텀시트
│   ├── upload.css          # 게시글 작성/수정
│   ├── calendar.css        # 캘린더
│   ├── mypage.css          # 마이페이지 + 그룹코드 모달
│   ├── groups.css          # 내 그룹
│   └── post-detail.css     # 게시글 상세 + 옵션 시트
│
├── js/
│   ├── login.js            # 로그인 + 카카오 소셜
│   ├── signup-email.js     # 이메일 입력 + 인증코드 타이머
│   ├── signup-nickname.js  # 닉네임 입력
│   ├── signup-school.js    # 학교 선택 + 최종 가입 API
│   ├── home.js             # 피드 + 탭 + 좋아요/저장 + 필터/검색
│   ├── map.js              # 지도 마커 + 현위치 + 바텀시트
│   ├── upload.js           # 사진/태그/위치 + 작성 & 수정 모드
│   ├── calendar.js         # 월 이동 + 날짜 클릭 + 슬라이더
│   ├── mypage.js           # 프로필 + 그룹코드 모달 + 로그아웃
│   ├── groups.js           # 그룹 목록 렌더링
│   └── post-detail.js      # 슬라이더 + 좋아요/저장/공유 + 수정/삭제/신고
│
└── pages/
    ├── login.html
    ├── signup-email.html   # 이메일 + 인증코드 (2단계)
    ├── signup-nickname.html
    ├── signup-school.html
    ├── home.html           # 검색바 + 필터 모달 포함
    ├── map.html
    ├── upload.html         # ?edit=ID 파라미터로 수정 모드 진입
    ├── calendar.html
    ├── mypage.html
    ├── my-groups.html
    └── post-detail.html    # 수정/삭제/신고 옵션 시트 포함
```

## 백엔드 연동 API 목록

| 분류 | Method | Endpoint | 파일 |
|------|--------|----------|------|
| 로그인 | POST | /api/auth/login | login.js |
| 카카오 로그인 | GET | /api/auth/kakao | login.js |
| 이메일 인증 발송 | POST | /api/auth/send-verify-email | signup-email.js |
| 이메일 인증 확인 | POST | /api/auth/verify-email | signup-email.js |
| 회원가입 | POST | /api/auth/signup | signup-school.js |
| 피드 조회 | GET | /api/posts?tab=&tags=&sort= | home.js |
| 게시글 검색 | GET | /api/posts/search?q= | home.js |
| 게시글 좋아요 | POST | /api/posts/:id/like | home.js, post-detail.js |
| 게시글 저장 | POST | /api/posts/:id/save | home.js, post-detail.js |
| 게시글 상세 | GET | /api/posts/:id | post-detail.js |
| 게시글 삭제 | DELETE | /api/posts/:id | post-detail.js |
| 게시글 신고 | POST | /api/posts/:id/report | post-detail.js |
| 게시글 작성 | POST | /api/posts (multipart) | upload.js |
| 게시글 수정 | PATCH | /api/posts/:id (multipart) | upload.js |
| 지도 마커 | GET | /api/posts/map | map.js |
| 캘린더 | GET | /api/calendar?year=&month= | calendar.js |
| 내 프로필 | GET | /api/user/profile | mypage.js |
| 내 코드 조회 | GET | /api/user/code | mypage.js |
| 그룹 참여 | POST | /api/groups/join | mypage.js |
| 내 그룹 목록 | GET | /api/groups/mine | groups.js |

## 인증
- 로그인 후 `localStorage.token` (JWT)
- 모든 인증 필요 API: 헤더 `Authorization: Bearer {token}`
- 사용자 정보: `localStorage.user` (JSON: { id, nickname, avatar, school })

## 지도 연동
- `pages/map.html`, `pages/upload.html` 내 카카오맵 SDK 주석 해제 필요
- `YOUR_APP_KEY` → 발급받은 카카오맵 JavaScript 앱키로 교체
