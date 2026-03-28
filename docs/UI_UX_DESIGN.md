# AI Book Agent - UI/UX Design & Page Flow

## 🎨 디자인 스타일 제안 (Design Styles)

TailwindCSS 기반으로 프로젝트에 적용할 수 있는 3가지 테마 스타일을 기획했습니다. 앱의 목적과 사용자의 취향에 따라 선택하거나, 설정에서 테마 전환 기능으로 제공할 수 있습니다.

### 1. Modern Minimalist (모던 미니멀리스트 - 현재 기본값)
가장 깔끔하고 직관적인 SaaS(소프트웨어) 형태의 디자인입니다. 넓은 여백과 부드러운 그림자를 사용해 복잡한 AI의 작업 과정을 명확하게 보여줍니다.
- **배경 (Background):** `bg-gray-50` (전체), `bg-white` (카드/패널)
- **텍스트 (Text):** `text-slate-800` (기본), `text-slate-500` (보조)
- **강조 색상 (Primary):** `blue-600` ~ `blue-700`
- **보더 및 구분선:** `border-gray-200`
- **특징:** 생산성 도구에 적합하며, 에이전트들의 상태(Thinking, Done)가 시각적으로 눈에 잘 띕니다.

### 2. Classic Typewriter (클래식 타자기 - 작가 몰입형)
종이책을 쓰는 듯한 따뜻하고 감성적인 디자인입니다. 글쓰기 자체에 집중하고 싶은 사용자에게 적합합니다.
- **배경 (Background):** `bg-stone-100` (전체 앱), `bg-[#fbfaf8]` (종이 질감 느낌의 에디터 배경)
- **텍스트 (Text):** `text-stone-800` (기본), `font-serif` (본문 내용)
- **강조 색상 (Primary):** `amber-700` ~ `amber-900`
- **보더 및 구분선:** `border-stone-300`
- **특징:** 챕터 에디터나 책 미리보기 화면에서 실제 원고지나 오래된 책을 보는 듯한 몰입감을 줍니다.

### 3. Night Owl (다크 모드 - 심야 집필용)
눈의 피로를 덜어주는 어두운 테마입니다. 에이전트 뱃지와 진행률 바가 네온처럼 빛나는 효과를 줍니다.
- **배경 (Background):** `bg-slate-900` (전체), `bg-slate-800` (카드/패널)
- **텍스트 (Text):** `text-slate-200` (기본), `text-slate-400` (보조)
- **강조 색상 (Primary):** `indigo-400` ~ `indigo-500`
- **보더 및 구분선:** `border-slate-700`
- **특징:** 장시간 화면을 보며 집필하는 사용자에게 적합하며, 야간 작업 시 시력을 보호합니다.

---

## 🗺️ 페이지 플로우 템플릿 (Page Flow Template)

사용자의 여정을 한눈에 파악할 수 있는 전체 애플리케이션의 화면 이동 플로우입니다.

```mermaid
graph TD
    %% 노드 스타일 정의
    classDef page fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef action fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px;
    classDef ai fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px;

    %% 인증 및 진입
    Start([웹앱 접속]) --> Auth{로그인 상태 확인}
    
    Auth -- "비로그인" --> Login[로그인/스플래시 페이지] :::page
    Login --> |Google OAuth| Auth
    
    Auth -- "로그인 완료" --> Hub[Library Hub - 내 서재] :::page
    
    %% 허브(메인) 화면
    Hub --> |새 책 만들기| Setup[프로젝트 설정 모달] :::action
    Hub --> |기존 책 선택| Workspace[AI Book Workspace - 작업실] :::page
    Hub --> |커뮤니티 탭| Community[커뮤니티 라이브러리] :::page
    
    Setup --> |주제/장르 입력| Workspace
    
    %% 작업실 내부 파이프라인 (에이전트 협업)
    subgraph "Workspace (좌: 에이전트 챗 / 우: 북 프리뷰)"
        Phase1[1. 리서치 파이프라인] :::ai --> Phase2[2. 시놉시스 작성] :::ai
        Phase2 --> Phase3[3. 목차 구성] :::ai
        Phase3 --> Phase4[4. 챕터 집필 - 스트리밍] :::ai
        Phase4 --> Phase5[5. 에디터 검수 및 수정] :::ai
        Phase5 --> Phase6[6. 출판 준비 - 표지/메타데이터] :::ai
        
        %% 피드백 및 수정 루프
        Phase2 -.-> |유저 피드백 바| Phase2
        Phase3 -.-> |유저 피드백 바| Phase3
        Phase5 -.-> |AI 자동 피드백 루프| Phase4
        Phase5 -.-> |유저 직접 수정 - ChapterEditor| Phase4
    end
    
    %% 출판 및 공유
    Phase6 --> |최종 승인| Publish[출판 완료 상태] :::action
    Publish --> |커뮤니티에 공유| Community
    Workspace --> |나가기| Hub
```

### 📱 핵심 화면 레이아웃 (Wireframe Structure)

#### 1. Library Hub (`/` 기본 뷰)
- **상단 (Header):** 앱 로고, 사용자 프로필, 로그아웃 버튼
- **메인 탭 (Tabs):** 
  - `내 서재`: 현재 진행 중인 책과 출판 완료된 책 목록 (그리드 뷰)
  - `커뮤니티`: 다른 사용자들이 출판하여 공유한 책 목록
- **주요 액션 (Floating Action):** 화면 우측 하단 "새로운 책 시작하기" 버튼

#### 2. Workspace (`/workspace/:id` - 작업실)
- **상단바 (Top Bar):** 
  - 좌측: '내 서재로 돌아가기' 버튼
  - 중앙: 현재 파이프라인 진행도 (`PipelineProgress.tsx` - 7단계 진행바)
- **좌측 패널 (Agent Chat):** 
  - 4명의 에이전트(리서처, 작가, 편집자, 출판담당)가 대화하며 작업하는 로그가 실시간으로 쌓이는 영역 (`AgentChat.tsx`)
- **우측 패널 (Book Preview / Editor):** 
  - 기획 단계: 마크다운으로 렌더링된 시놉시스와 목차
  - 집필 단계: 실시간으로 글이 써지는 것을 보고, 직접 수정도 가능한 에디터 (`ChapterEditor.tsx`)
- **하단바 (User Feedback Bar):** 
  - 화면 최하단에 고정되어 사용자가 언제든 AI에게 방향성을 지시할 수 있는 프롬프트 입력창 (`UserFeedbackBar.tsx`)
