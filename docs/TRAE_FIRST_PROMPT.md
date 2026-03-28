# TRAE 첫 번째 프롬프트 (Builder 모드에서 실행)

> TRAE를 열고 ai-book-agent 폴더를 연 후, Builder 모드(Cmd+U → Builder)에서 아래를 복붙하세요.

---

## 프롬프트 (그대로 복사)

```
이 프로젝트는 "AI Book Agent"라는 멀티에이전트 출판 시스템이야.
주제를 입력하면 4명의 AI 에이전트(리서처, 작가, 편집자, 출판담당)가 순차 협업하여 책을 만들어.

프로젝트 폴더에 이미 설계 문서가 있어:
- .trae/rules/ → 프로젝트 규칙 (자동 로드됨)
- docs/GUIDE.md → Phase별 단계별 구현 가이드
- docs/PROMPTS.md → 4 에이전트 시스템 프롬프트 + Function Calling JSON 스키마
- docs/UI_WIREFRAME.md → UI 와이어프레임
- mock/ → Mock 데이터

지금부터 docs/GUIDE.md의 Phase 0를 실행해줘:

React + Vite + TypeScript 프로젝트를 생성해.
요구사항:
- TailwindCSS v3 설정
- src/components/, src/hooks/, src/lib/, src/types/ 디렉토리 생성
- .env 파일에서 VITE_OPENAI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 읽기
- 폰트: Pretendard (CDN)
- title: "AI Book Agent - 멀티에이전트 출판 시스템"

완료되면 "Phase 0 완료"라고 알려줘. 그 다음 내가 Phase 1을 지시할게.
```

---

## Phase 1 프롬프트 (Phase 0 완료 후)

```
#File docs/GUIDE.md 의 Phase 1을 전체 실행해줘.
#File docs/PROMPTS.md 를 참조해서 에이전트 프롬프트와 Function Calling 스키마를 정확히 구현해.

순서:
1. src/types/agent.ts - 모든 타입 정의 (GUIDE.md Step 1-1)
2. src/lib/openai.ts - callOpenAI + callOpenAIStream 함수 (Step 1-2)
3. src/lib/agents.ts - 4개 에이전트 (Step 1-3)
4. src/lib/orchestrator.ts - 파이프라인 오케스트레이터 + 컨텍스트 관리 (Step 1-4)
5. src/hooks/useBookAgent.ts - UI 연결 훅 (Step 1-5)

모델: gpt-5.4-mini
API: fetch 직접 호출 (SDK 없음)
```

---

## Phase 2 프롬프트 (Phase 1 완료 후, Chat 모드 전환)

```
#File docs/GUIDE.md Phase 2를 실행해줘.
#File docs/UI_WIREFRAME.md 를 참조해서 UI를 만들어.

순서:
1. src/App.tsx - 좌우 분할 레이아웃 + 헤더(장르 드롭다운 + 주제 입력)
2. src/components/AgentChat.tsx - 에이전트 채팅 패널
3. src/components/BookPreview.tsx - 책 미리보기 (7단계 상태별)
4. src/components/PipelineProgress.tsx - 7단계 진행 표시기

에이전트 아이콘:
- researcher: 보라 🔍
- writer: 파랑 ✍️
- editor: 초록 📝
- publisher: 주황 📦
```

---

## Phase 3 프롬프트들 (Phase 2 완료 후, 하나씩)

### 3-1: Mock 모드
```
#File docs/GUIDE.md Step 3-1을 실행해줘.
src/lib/mockAgent.ts - API 키 없으면 mock/ 데이터로 자동 전환
```

### 3-2: 글로벌 피드백 바
```
#File docs/GUIDE.md Step 3-2를 실행해줘.
src/components/UserFeedbackBar.tsx - 모든 단계에서 사용자 프롬프트 입력
```

### 3-3: 챕터 편집기
```
#File docs/GUIDE.md Step 3-3을 실행해줘.
src/components/ChapterEditor.tsx - 직접 편집 + AI 수정 요청 + 부분 선택 플로팅 툴바
```

### 3-4: Supabase (시간 남으면)
```
#File docs/GUIDE.md Step 3-4를 실행해줘.
Supabase 연동: 로그인(Google OAuth) + 책 저장 + 내 서재 + 커뮤니티 + 웹 뷰어
```

### 3-5: 반응형
```
현재 UI를 모바일 반응형으로 만들어줘.
md 이상: 좌우 분할
sm 이하: 탭 전환 (채팅 | 미리보기)
```

---

## 사용 요령

1. **Builder 모드**: Phase 0, Phase 1 (새 파일 생성이 많음)
2. **Chat 모드**: Phase 2~3 (기존 파일 수정, 세밀한 조정)
3. 각 Phase 완료 후 **Preview로 확인** → 문제 있으면 Chat에서 수정
4. 에러 발생 시: 에러 메시지를 그대로 Chat에 붙여넣기
5. 모델 선택: 핵심 로직은 Claude/GPT-4o(Fast), UI/디버깅은 DeepSeek(Slow)
