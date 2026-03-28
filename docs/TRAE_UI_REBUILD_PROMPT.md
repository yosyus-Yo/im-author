# TRAE UI 리빌드 프롬프트

> 이 프롬프트를 TRAE Builder 모드에서 복붙하세요.

---

## 프롬프트 (그대로 복사)

```
이 프로젝트를 Stitch에서 생성된 디자인 HTML 파일들을 기반으로 전체 프론트엔드를 리빌드해줘.

## 디자인 HTML 파일 위치 (총 6개)

docs/ 폴더에 Stitch로 생성된 디자인 HTML이 있어. 각 파일을 읽고 디자인을 정확히 따라 구현해:

1. docs/landing_page_desktop/code.html → 랜딩 페이지 (/)
2. docs/auth_page_desktop/code.html → 인증 페이지 (/auth)
3. docs/creation_workspace_desktop/code.html → 책 생성 워크스페이스 (/app/write)
4. docs/my_library_desktop/code.html → 내 서재 (/app/library)
5. docs/community_library_desktop/code.html → 커뮤니티 서재 (/app/community)
6. docs/web_viewer_desktop/code.html → 웹 뷰어 (/app/reader/:id)

## 구현 요구사항

### 1단계: 디자인 HTML 분석
각 HTML 파일을 열고:
- 레이아웃 구조 (grid, flex, spacing)
- 색상 팔레트 (primary, secondary, accent)
- 타이포그래피 (font-family, font-size, font-weight)
- 컴포넌트 패턴 (카드, 버튼, 입력, 네비게이션)
- 아이콘과 이미지 스타일
을 분석해서 TailwindCSS 클래스로 변환해.

### 2단계: 라우팅 구조 구현
react-router-dom을 사용해서:
- / → LandingPage
- /auth → AuthPage
- /app → AppLayout (로그인 필요)
  - /app/write → 책 생성 워크스페이스
  - /app/library → 내 서재
  - /app/community → 커뮤니티
  - /app/reader/:id → 웹 뷰어
  - /app/profile → 프로필
- 비로그인 시 /app → /auth 리다이렉트
- 로그인 시 / → /app 리다이렉트

### 3단계: 백엔드 연결
기존 src/ 코드의 로직을 새 UI에 연결해:

연결해야 할 백엔드 로직:
- src/lib/openai.ts → API 호출 (callOpenAI, callOpenAIStream)
- src/lib/agents.ts → 4개 에이전트 (리서처, 작가, 편집자, 출판담당)
- src/lib/orchestrator.ts → 파이프라인 오케스트레이터
- src/lib/mockAgent.ts → Mock 모드
- src/lib/supabase.ts → Supabase 클라이언트
- src/lib/bookStorage.ts → 책 저장/로드
- src/hooks/useBookAgent.ts → 파이프라인 상태 관리
- src/hooks/useAuth.ts → 인증 관리
- src/types/agent.ts → 타입 정의

연결 매핑:
| 페이지 | 연결할 훅/함수 |
|--------|---------------|
| LandingPage | 없음 (정적 페이지) |
| AuthPage | useAuth (signIn, signOut, 게스트 로그인) |
| 책 생성 워크스페이스 | useBookAgent (startPipeline), 기존 AgentChat + BookPreview + ChapterEditor + UserFeedbackBar + PipelineProgress |
| 내 서재 | bookStorage.getMyBooks(), bookStorage.saveBook() |
| 커뮤니티 | bookStorage.getPublishedBooks() |
| 웹 뷰어 | bookStorage.getBookById() |
| 프로필 | useAuth (user, signOut) |

### 4단계: 백엔드 미연결 체크리스트
구현 완료 후, 아직 백엔드와 연결되지 않은 컴포넌트를 체크리스트로 정리해줘:

체크 항목:
- [ ] 각 버튼에 onClick 핸들러가 연결되어 있는가?
- [ ] 데이터가 하드코딩이 아니라 실제 상태(state)에서 오는가?
- [ ] API 호출이 Mock이 아닌 실제 호출로 연결되었는가?
- [ ] 로딩 상태가 표시되는가?
- [ ] 에러 상태가 처리되는가?
- [ ] 라우팅 가드가 작동하는가? (비로그인 → /auth)

미연결 컴포넌트가 있으면 파일 경로와 함께 TODO 주석을 남겨줘:
// TODO: 백엔드 미연결 - [설명]

## 주의사항
- 기존 src/lib/, src/hooks/, src/types/ 코드는 수정하지 않고 그대로 사용
- 기존 src/components/는 새 디자인에 맞게 리팩토링하거나 교체
- TailwindCSS 클래스만 사용 (별도 CSS 파일 금지)
- 서비스명: "I'm Author"
- 디자인 HTML의 색상/레이아웃을 최대한 정확히 따르되, React 컴포넌트로 변환
```

---

## TRAE에서 사용법

1. TRAE에서 프로젝트 열기
2. Builder 모드 (Cmd+U → Builder)
3. 위 프롬프트 전체를 복붙
4. TRAE가 6개 HTML을 분석하고 React 컴포넌트로 변환
5. 완료 후 미연결 TODO 목록을 확인하고 하나씩 연결
