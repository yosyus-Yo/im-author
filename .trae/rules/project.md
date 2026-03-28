# AI Book Agent - TRAE Project Rules

## Project Overview
AI 멀티에이전트 출판 시스템. 4개 에이전트(리서처, 작가, 편집자, 출판담당)가 순차 협업하여 책을 기획~출판 준비까지 자동화.

## Tech Stack (변경 금지)
- React 18 + TypeScript + Vite
- TailwindCSS v3 (CSS 파일 사용 금지, 클래스만 사용)
- OpenAI GPT-4o-mini API (Function Calling)
- 순수 fetch (openai SDK 사용 금지)
- 상태 관리: React useState/useReducer만 (외부 라이브러리 금지)

## File Structure
```
src/
  types/agent.ts       - 모든 타입 정의
  lib/openai.ts        - OpenAI API 호출 (callOpenAI + callOpenAIStream)
  lib/agents.ts        - 4 에이전트 시스템 프롬프트 + FC 정의
  lib/orchestrator.ts  - 파이프라인 오케스트레이터
  lib/mockAgent.ts     - Mock 모드 (API 키 없을 때)
  hooks/useBookAgent.ts - UI-오케스트레이터 연결 훅
  components/
    AgentChat.tsx      - 에이전트 채팅 패널
    BookPreview.tsx    - 책 미리보기 패널
    PipelineProgress.tsx - 진행 표시기
    ScoreChart.tsx     - 편집 점수 차트
    MarkdownRenderer.tsx - Markdown 렌더링
  App.tsx              - 메인 레이아웃
```

## Coding Conventions
- 함수형 컴포넌트 + hooks만 사용 (class 컴포넌트 금지)
- 한국어 주석
- props 타입은 인라인 또는 별도 interface로 정의
- 이벤트 핸들러: handle + 동사 (handleClick, handleSubmit)
- async 함수: try/catch 필수

## UI Design Rules
- 폰트: Pretendard (CDN)
- 전체 배경: bg-gray-50
- 카드: bg-white rounded-xl shadow-lg p-6
- 에이전트 아이콘 색상:
  - researcher: bg-purple-100 text-purple-700 "🔍"
  - writer: bg-blue-100 text-blue-700 "✍️"
  - editor: bg-green-100 text-green-700 "📝"
  - publisher: bg-orange-100 text-orange-700 "📦"
- 상태 표시:
  - thinking: animate-pulse
  - done: text-green-500
  - error: text-red-500
- 반응형: md 이상 좌우분할, sm 이하 탭 전환

## API Rules
- OpenAI 엔드포인트: https://api.openai.com/v1/chat/completions
- API 키: import.meta.env.VITE_OPENAI_API_KEY
- 모델: import.meta.env.VITE_MODEL || 'gpt-5.4-mini'
- API 키 없으면 자동으로 Mock 모드 전환
- 타임아웃: 30초

## Pipeline Flow
```
RESEARCH → SYNOPSIS(사용자확인) → OUTLINE(사용자확인) → WRITE(스트리밍) → EDIT(피드백루프) → PUBLISH → COMPLETE
```

## Context Management (컨텍스트 관리)
- buildBookContext(): 매 API 호출마다 책 상태 요약을 시스템 프롬프트에 자동 삽입
- buildChapterContext(): 챕터 작성 시 슬라이딩 윈도우 (직전 챕터 전문 + 이전 챕터 요약 + 다음 챕터 개요)
- 시스템 프롬프트 구성: 장르 프리픽스 + bookContext + agentPrompt + (chapterContext)
- GPT-5.4-mini 400K 컨텍스트 활용

## User-First Principle (사용자 주도 원칙)
- 모든 단계에서 UserFeedbackBar가 하단에 표시됨
- 사용자는 어떤 단계에서든 프롬프트를 입력하여 AI 결과를 수정할 수 있음
- AI는 보조 도구이고, 최종 결정은 항상 사용자가 함
- 사용자가 직접 작성/수정한 내용은 AI가 절대 되돌리지 않음
- 사용자의 디테일 수준에 AI가 맞춤 (세부 집중 작성 원칙)

## Supabase (Optional)
- Auth: Google OAuth로 로그인
- DB: books 테이블 (user_id, genre, title, chapters, is_published)
- RLS: 본인 책만 수정, 공개 책은 누구나 읽기
- Supabase 없으면 localStorage 폴백
- 페이지: 내 서재 (MyLibrary), 커뮤니티 (Community), 뷰어 (BookReader)

## Forbidden
- npm install openai (SDK 금지, fetch 직접 사용)
- CSS 파일 생성 (TailwindCSS 클래스만)
- Redux, Zustand 등 외부 상태관리
- Next.js, Remix 등 프레임워크 (순수 Vite만)
- console.log를 프로덕션 코드에 남기기

## Reference Documents
- docs/GUIDE.md: Phase별 구현 가이드
- docs/PROMPTS.md: 에이전트 시스템 프롬프트 + Function Calling JSON 스키마
- docs/DEMO_SCENARIO.md: 데모 시나리오
- mock/*.json: Mock 데이터
