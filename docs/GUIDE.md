# AI Book Agent - TRAE 빌드 가이드

> Build with TRAE @Seoul 해커톤 (2026-03-28)
> 코딩 시간: 12:30~16:00 (3.5시간)

---

## 전체 타임라인

```
12:30 ──── Phase 0: 프로젝트 세팅 ──────── 12:40 (10분)
12:40 ──── Phase 1: 에이전트 코어 ──────── 13:40 (60분)
13:40 ──── Phase 2: UI 구현 ────────────── 14:40 (60분)
14:40 ──── Phase 3: 연결 + 부가기능 ────── 15:30 (50분)
15:30 ──── Phase 4: 데모 준비 ──────────── 16:00 (30분)
```

---

## Phase 0: 프로젝트 세팅 (10분)

### TRAE 프롬프트

```
React + Vite + TailwindCSS 프로젝트를 생성해줘.

요구사항:
- TypeScript 사용
- TailwindCSS v3 설정
- src/components/, src/hooks/, src/lib/, src/types/ 디렉토리 생성
- .env 파일에서 VITE_OPENAI_API_KEY 읽을 수 있도록 설정
- 폰트: Pretendard (CDN)

index.html의 title: "AI Book Agent - 멀티에이전트 출판 시스템"
```

### 수동 작업
```bash
cp .env.example .env
# .env에 OpenAI API 키 입력
```

---

## Phase 1: 에이전트 코어 (60분)

### Step 1-1: 타입 정의 (5분)

#### TRAE 프롬프트

```
src/types/agent.ts 파일을 만들어줘.

다음 타입을 정의해:

1. BookGenre = 'nonfiction' | 'fantasy' | 'romance' | 'webnovel' | 'essay' | 'autobiography' | 'mystery' | 'sf'

2. AgentRole = 'researcher' | 'writer' | 'editor' | 'publisher'

2. AgentMessage:
   - role: AgentRole
   - content: string
   - timestamp: Date
   - phase: string (작업 단계명)
   - status: 'thinking' | 'done' | 'error'

3. TopicResearch:
   - topic: string
   - marketAnalysis: { trend: string, targetAudience: string, estimatedReaders: string }
   - competition: Array<{ title: string, strength: string, weakness: string }>
   - differentiation: string
   - goNoGo: 'GO' | 'NO_GO'
   - confidence: number
   - reasoning: string

4. Synopsis:
   - synopsis: string (전체 줄거리 3~5문장)
   - characters: Array<{ name: string, role: string, description: string }>
   - coreConflict: string
   - theme: string
   - targetAudience: string

5. BookOutline:
   - title: string
   - subtitle: string
   - chapters: Array<{ number: number, title: string, summary: string }>

5. ChapterDraft:
   - chapterNumber: number
   - title: string
   - content: string
   - wordCount: number
   - selfEditLog: Array<{ layer: 'structure' | 'clarity' | 'style', before: string, after: string, reason: string }>
   - revision?: number (재작성 횟수, 0=초안)

6. EditReview:
   - chapterNumber: number
   - status: 'APPROVED' | 'NEEDS_REVISION' | 'MAJOR_REVISION'
   - issues: Array<{ type: string, location: string, issue: string, suggestion: string }>
   - score: { clarity: number, evidence: number, structure: number, engagement: number, overall: number }

7. PublicationInfo:
   - metadata: { title: string, subtitle: string, keywords: string[], category: string, description: string }
   - coverDesign: { concept: string, primaryColor: string, style: 'minimal' | 'illustrated' | 'photographic' | 'typographic', imagePrompt: string }
   - format: { pageSize: 'A5' | 'B5' | '신국판', estimatedPages: number, ebookPrice: number, printPrice: number }
   - readyForPublish: boolean

8. BookProject:
   - topic: string
   - research: TopicResearch | null
   - synopsis: Synopsis | null
   - synopsisConfirmed: boolean
   - outline: BookOutline | null
   - outlineConfirmed: boolean
   - chapters: ChapterDraft[]
   - reviews: EditReview[]
   - publication: PublicationInfo | null
   - currentPhase: 'idle' | 'researching' | 'synopsis' | 'outlining' | 'writing' | 'editing' | 'publishing' | 'complete'
   - messages: AgentMessage[]
```

### Step 1-2: OpenAI API 유틸리티 (10분)

#### TRAE 프롬프트

```
src/lib/openai.ts 파일을 만들어줘.

환경 변수 VITE_OPENAI_API_KEY에서 API 키를 읽어서 OpenAI Chat Completions API를 호출하는 함수를 만들어.

두 가지 함수를 만들어:

함수 1: callOpenAI (Function Calling용)
파라미터:
- systemPrompt: string
- userMessage: string
- functions?: Array (OpenAI function calling 스키마)
- functionCall?: string (호출할 함수명)
반환값: Promise<string> (function call arguments JSON)

함수 2: callOpenAIStream (스트리밍 텍스트 생성용)
파라미터:
- systemPrompt: string
- userMessage: string
- onChunk: (chunk: string) => void (실시간 청크 콜백)
반환값: Promise<string> (전체 텍스트)

주의사항:
- fetch로 직접 호출 (SDK 없이)
- 엔드포인트: https://api.openai.com/v1/chat/completions
- 모델: import.meta.env.VITE_MODEL || 'gpt-5.4-mini'
- callOpenAI: stream: false, function calling 응답 시 arguments 파싱
- callOpenAIStream: stream: true, ReadableStream으로 SSE 파싱, 각 청크마다 onChunk 호출
- 에러 핸들링 포함
```

### Step 1-3: 에이전트 시스템 프롬프트 (10분)

#### TRAE 프롬프트

```
src/lib/agents.ts 파일을 만들어줘.

docs/PROMPTS.md 파일을 참조해서 4개 에이전트의 시스템 프롬프트와 Function Calling 정의를 구현해.

각 에이전트:

1. researcherAgent:
   - systemPrompt: PROMPTS.md의 리서처 시스템 프롬프트
   - function: analyze_topic (주제 분석 결과 반환)
   - 입력: 사용자가 제안한 주제 텍스트
   - 출력: TopicResearch 타입의 JSON

2. writerAgent:
   - systemPrompt: PROMPTS.md의 작가 시스템 프롬프트 (3계층 자기편집 포함)
   - function: create_outline (목차 생성)
   - function: write_chapter (챕터 작성 + selfEditLog 포함)
   - function: revise_chapter (편집자 피드백 기반 재작성)
   - 입력: 주제 + 조사 결과 / 목차 + 챕터 번호 / 편집 피드백
   - 출력: BookOutline / ChapterDraft (selfEditLog 포함) 타입의 JSON
   - 챕터 본문은 callOpenAIStream으로 스트리밍 생성 (실시간 UI 표시)

3. editorAgent:
   - systemPrompt: PROMPTS.md의 편집자 시스템 프롬프트 (GRAMMAR_CHECK 포함)
   - function: review_chapter (챕터 검수, 7단계 체크리스트)
   - 입력: 챕터 내용
   - 출력: EditReview 타입의 JSON

4. publisherAgent:
   - systemPrompt: PROMPTS.md의 출판담당 시스템 프롬프트
   - function: prepare_publication (출판 정보 생성)
   - 입력: 책 제목 + 목차 + 편집 결과
   - 출력: PublicationInfo 타입의 JSON

각 에이전트는 callOpenAI를 사용하고, function calling으로 구조화된 JSON을 반환해.
```

### Step 1-4: 오케스트레이터 (20분)

#### TRAE 프롬프트

```
src/lib/orchestrator.ts 파일을 만들어줘.

4개 에이전트를 순차적으로 호출하는 파이프라인 오케스트레이터야.

컨텍스트 관리 함수 2개를 먼저 구현해:

함수 1: buildBookContext(project: BookProject): string
- 매 API 호출 시 시스템 프롬프트에 자동 삽입되는 책 상태 요약
- 포함 내용: 제목, 장르, 시놉시스 1줄, 완성 챕터 목록(제목+글자수), 현재 단계
- 모든 에이전트가 "이 책이 지금 어디까지 진행됐는지"를 항상 알 수 있게 함

함수 2: buildChapterContext(project: BookProject, targetChapter: number): string
- 챕터 작성/수정 시 슬라이딩 윈도우로 관련 컨텍스트를 구성
- 항상 포함: 시놉시스 + 목차
- 직전 챕터: 전문 포함 (바로 앞 챕터의 문맥 유지)
- 이전 챕터들: 요약만 (첫 200자)
- 다음 챕터: 목차의 summary만 (앞으로의 방향 인식)
- GPT-5.4-mini 400K 컨텍스트에 충분히 수용 가능

이 두 함수는 오케스트레이터의 모든 API 호출에서 사용됨:
- 시스템 프롬프트 = 장르 프리픽스 + buildBookContext() + 에이전트 프롬프트
- 챕터 작성 시 추가 = buildChapterContext()

함수명: runBookPipeline
파라미터:
- topic: string (사용자 입력 주제)
- onMessage: (msg: AgentMessage) => void (실시간 메시지 콜백)
- onProjectUpdate: (project: BookProject) => void (프로젝트 상태 업데이트 콜백)

실행 순서:
1. RESEARCH 단계
   - onMessage로 "리서처가 주제를 분석하고 있습니다..." 전달
   - researcherAgent.analyzeTopic(topic) 호출
   - 결과가 NO_GO이면 중단하고 이유 설명
   - GO이면 다음 단계로

2. SYNOPSIS 단계 (사용자 확인 필요!)
   - onMessage로 "작가가 시놉시스를 작성하고 있습니다..." 전달
   - writerAgent.createSynopsis(topic, research, genre) 호출
   - 장르에 따라 다른 시놉시스 생성:
     - 소설류: 줄거리 요약 + 주요 인물 + 핵심 갈등
     - 논픽션: 핵심 주장 + 타겟 독자 + 챕터별 질문
   - 시놉시스를 UI에 표시하고 사용자 확인 대기
   - 사용자 선택:
     a. [이대로 진행] → 다음 단계
     b. [수정 요청] → 사용자 지시를 반영하여 시놉시스 재생성
     c. [다시 생성] → 시놉시스를 처음부터 재생성

3. OUTLINE 단계 (사용자 확인 필요!)
   - onMessage로 "작가가 목차를 설계하고 있습니다..." 전달
   - writerAgent.createOutline(topic, research, synopsis) 호출
   - 목차를 UI에 표시하고 사용자 확인 대기
   - 사용자가 챕터 순서/제목을 수정할 수 있음
   - [목차 확정] 클릭 후 다음 단계

4. WRITE 단계 (챕터 1개만 - 해커톤용 축소)
   - onMessage로 "작가가 1장을 집필하고 있습니다..." 전달
   - writerAgent.writeChapter(outline, 1) 호출
   - 챕터 결과를 onProjectUpdate로 전달

4. EDIT 단계 (피드백 루프 포함)
   - onMessage로 "편집자가 1장을 검수하고 있습니다..." 전달
   - editorAgent.reviewChapter(chapter) 호출
   - 검수 결과를 onProjectUpdate로 전달

   피드백 루프 (최대 2회 반복):
   - 편집자가 NEEDS_REVISION 판정 시:
     a. onMessage로 "편집자가 수정을 요청했습니다. 작가가 재작성합니다..." 전달
     b. 편집자의 issues를 작가에게 전달
     c. writerAgent.writeChapter(outline, 1, editFeedback) 재호출
     d. 재작성된 챕터를 다시 editorAgent.reviewChapter() 호출
   - APPROVED이면 다음 단계로
   - MAJOR_REVISION이면 루프 중단, 사유 표시
   - 2회 반복 후에도 NEEDS_REVISION이면 현재 상태로 진행

5. PUBLISH 단계
   - onMessage로 "출판담당이 출판 정보를 준비하고 있습니다..." 전달
   - publisherAgent.preparePublication(outline, editReview) 호출
   - 메타데이터, 표지 방향, 포맷 정보를 onProjectUpdate로 전달

6. COMPLETE
   - onMessage로 최종 요약 전달 (전체 통계 + 출판 준비 상태)
   - currentPhase를 'complete'로 업데이트

각 단계에서 에러 발생 시 해당 에이전트의 에러 메시지를 onMessage로 전달하고 중단.
```

### Step 1-5: 커스텀 훅 (15분)

#### TRAE 프롬프트

```
src/hooks/useBookAgent.ts 커스텀 훅을 만들어줘.

이 훅은 UI와 오케스트레이터를 연결해.

반환값:
- project: BookProject (현재 프로젝트 상태)
- messages: AgentMessage[] (에이전트 메시지 히스토리)
- isRunning: boolean (파이프라인 실행 중 여부)
- startPipeline: (topic: string, genre: BookGenre) => Promise<void>
- reset: () => void

내부 동작:
- useState로 project, messages, isRunning 관리
- startPipeline 호출 시 runBookPipeline 실행
- onMessage 콜백으로 messages 배열에 추가
- onProjectUpdate 콜백으로 project 상태 업데이트
- 실행 완료 시 isRunning을 false로
```

---

## Phase 2: UI 구현 (60분)

### Step 2-1: 레이아웃 (10분)

#### TRAE 프롬프트

```
src/App.tsx를 만들어줘.

좌우 분할 레이아웃:
- 왼쪽 (w-1/2): 에이전트 채팅 패널
- 오른쪽 (w-1/2): 책 미리보기 패널
- 상단: 헤더 ("AI Book Agent" 제목 + 주제 입력 폼)

헤더:
- 왼쪽: "AI Book Agent" 로고 텍스트 (font-bold text-xl)
- 가운데 왼쪽: select 드롭다운 (장르 선택)
  - 옵션: 논픽션, 판타지, 로맨스, 웹소설, 수필/에세이, 자서전, 미스터리, SF
  - 기본값: "논픽션"
  - w-32, bg-white, border, rounded-lg
- 가운데 오른쪽: input 필드 (주제 입력, placeholder: "어떤 주제의 책을 만들까요?")
- 오른쪽: "시작" 버튼 (bg-blue-600 text-white)
- 실행 중일 때 버튼 비활성화 + 로딩 스피너

useBookAgent 훅을 사용해서 상태 관리.

전체 배경: bg-gray-50, 패널 배경: bg-white, 그림자: shadow-lg
```

### Step 2-2: 에이전트 채팅 패널 (20분)

#### TRAE 프롬프트

```
src/components/AgentChat.tsx 컴포넌트를 만들어줘.

props:
- messages: AgentMessage[]
- isRunning: boolean

각 메시지를 카드 형태로 표시:
- 에이전트 아이콘 (역할별 다른 색상)
  - researcher: bg-purple-100 text-purple-700 아이콘 "🔍"
  - writer: bg-blue-100 text-blue-700 아이콘 "✍️"
  - editor: bg-green-100 text-green-700 아이콘 "📝"
  - publisher: bg-orange-100 text-orange-700 아이콘 "📦"
- 에이전트 이름 (한글: 리서처, 작가, 편집자, 출판담당)
- 메시지 내용
- phase 태그 (작은 badge)
- status에 따라:
  - thinking: 로딩 애니메이션 (점 3개 깜빡임)
  - done: 체크마크
  - error: 빨간 X

메시지가 추가될 때 자동 스크롤 (useRef + scrollIntoView)
빈 상태일 때 안내 문구: "주제를 입력하고 '시작'을 누르면 AI 에이전트들이 책을 만들기 시작합니다"
```

### Step 2-3: 책 미리보기 패널 (20분)

#### TRAE 프롬프트

```
src/components/BookPreview.tsx 컴포넌트를 만들어줘.

props:
- project: BookProject

현재 phase에 따라 다른 내용 표시:

1. idle: 안내 화면
   - "AI Book Agent" 큰 텍스트
   - "3명의 AI 에이전트가 협업하여 책을 만듭니다" 설명
   - 3 에이전트 소개 카드 (리서처, 작가, 편집자)

2. researching: 조사 진행 중 표시
   - 로딩 스피너 + "주제를 분석하고 있습니다..."
   - 완료 시: TopicResearch 결과를 카드로 표시
     - 시장 분석, 경쟁 도서, 차별화 포인트
     - Go/No-Go 판정 (초록/빨강 배지)
     - 신뢰도 바 (progress bar)

3. outlining: 목차 표시
   - BookOutline의 제목, 부제
   - 챕터 목록 (번호 + 제목)

4. writing: 챕터 초안 표시
   - 현재 작성 중인 챕터 번호/제목
   - 스트리밍 모드: 글자가 실시간으로 한 글자씩 나타남 (타이핑 효과)
   - 완료된 챕터 내용을 Markdown 렌더링
   - 글자 수 카운터 (실시간 증가)
   - 자기편집 로그 토글 패널:
     - "작가의 자기편집 과정 보기" 접기/펼치기 버튼
     - selfEditLog 각 항목을 before→after diff로 표시
     - layer별 색상: structure=보라, clarity=파랑, style=초록
     - 수정 이유(reason) 표시

5. editing: 편집 검수 결과
   - 점수 차트 (clarity, evidence, structure, engagement)
   - 이슈 목록 (유형, 위치, 문제점, 제안)
     - GRAMMAR_CHECK 이슈는 빨간 밑줄 스타일로 강조
   - 판정 결과 배지 (APPROVED=초록, NEEDS_REVISION=노랑, MAJOR_REVISION=빨강)
   - 피드백 루프 표시:
     - NEEDS_REVISION일 때 "작가에게 수정 요청 중..." 메시지
     - 재작성 횟수 표시 (예: "2차 수정본")
     - 이전 버전과 비교 diff (있으면)

6. publishing: 출판 준비 결과
   - 메타데이터 카드 (제목, 부제, 키워드 태그, 카테고리, 소개글)
   - 표지 디자인 방향 (컬러 스와치 + 스타일 + AI 이미지 프롬프트)
   - 포맷 정보 (판형, 예상 페이지, 전자책/종이책 가격)
   - readyForPublish 배지 (초록: 준비 완료)

7. complete: 최종 결과
   - 책 표지 스타일 카드 (제목 + 부제 + 표지 컬러)
   - 전체 통계 (챕터 수, 총 글자 수, 편집 점수, 출판 준비 상태)
   - "새로운 책 만들기" 버튼
```

### Step 2-4: 파이프라인 진행 표시기 (10분)

#### TRAE 프롬프트

```
src/components/PipelineProgress.tsx 컴포넌트를 만들어줘.

props:
- currentPhase: BookProject['currentPhase']

7단계 진행 표시기를 수평으로 표시:
1. 주제 조사 (🔍)
2. 시놉시스 (📖) ← 사용자 확인 필요
3. 목차 설계 (📋) ← 사용자 확인 필요
4. 챕터 집필 (✍️)
5. 편집 검수 (📝)
6. 출판 준비 (📦)
7. 완료 (✅)

각 단계:
- 완료: bg-green-500 text-white + 체크 아이콘
- 현재: bg-blue-500 text-white + 로딩 애니메이션
- 대기: bg-gray-200 text-gray-500
- 단계 사이에 연결선 (hr)

BookPreview 컴포넌트 상단에 배치.
```

---

## Phase 3: 연결 + 부가 기능 (50분)

### Step 3-1: Mock 모드 (10분)

#### TRAE 프롬프트

```
src/lib/mockAgent.ts 파일을 만들어줘.

API 키가 없거나 데모용으로 mock 데이터를 반환하는 에이전트.

mock/ 디렉토리의 sample-topic.json과 sample-chapter.json을 import해서 사용.

runMockPipeline 함수:
- runBookPipeline과 같은 시그니처
- 각 단계마다 1~2초 setTimeout으로 지연 (실제 API 호출처럼 보이게)
- mock 데이터를 순차적으로 onMessage/onProjectUpdate 콜백에 전달
- 환경 변수에 API 키가 없으면 자동으로 mock 모드 사용

useBookAgent 훅에서 API 키 유무에 따라 실제/mock 전환.
```

### Step 3-2: 글로벌 사용자 피드백 바 (10분)

#### TRAE 프롬프트

```
src/components/UserFeedbackBar.tsx 컴포넌트를 만들어줘.

이 컴포넌트는 파이프라인의 모든 단계에서 항상 하단에 표시되는 사용자 입력 바야.
사용자가 어떤 단계에서든 자신의 생각을 프롬프트로 입력해서 AI에게 전달할 수 있어.

props:
- currentPhase: string (현재 파이프라인 단계)
- onSubmit: (instruction: string) => Promise<void>
- isProcessing: boolean
- placeholder?: string (단계별 다른 힌트)

UI 구조:
- 미리보기 패널 하단에 고정 (sticky bottom)
- 입력창 + 전송 버튼
- 단계별 placeholder 힌트 자동 변경:
  - researching: "시장 분석에 추가로 고려할 점이 있나요?"
  - synopsis: "줄거리에서 수정하고 싶은 부분을 알려주세요"
  - outlining: "목차 순서나 제목을 변경하고 싶으면 말해주세요"
  - writing: "이 챕터에서 수정하고 싶은 부분을 알려주세요"
  - editing: "편집 결과에 대해 의견이 있으면 말해주세요"
  - publishing: "출판 정보에서 수정할 사항이 있나요?"

- isProcessing일 때: 입력 비활성화 + "AI가 수정 중..." 표시

- 빠른 액션 버튼 (단계별):
  - synopsis 단계: [이대로 진행] [다시 생성]
  - outlining 단계: [목차 확정] [다시 생성]
  - writing 단계: [확장] [축소] [톤 변경 ▼]
  - editing 단계: [편집 의견 수락] [재검수 요청]
  - publishing 단계: [출판 준비 완료]

스타일:
- 고정 바: sticky bottom-0 bg-white border-t shadow-lg p-4
- 입력창: flex-1 bg-gray-50 border rounded-lg p-3
- 전송 버튼: bg-blue-600 text-white rounded-lg px-4 py-3
- 빠른 액션: flex gap-2 mb-2, 각 버튼 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1 text-sm
```

### Step 3-3: 사용자 편집 + AI 수정 요청 (20분)

#### TRAE 프롬프트

```
src/components/ChapterEditor.tsx 컴포넌트를 만들어줘.

이 컴포넌트는 AI가 생성한 챕터를 사용자가 수정하고, AI에게 추가 지시를 내릴 수 있는 편집기야.

props:
- chapter: ChapterDraft
- genre: BookGenre
- onUpdate: (updated: ChapterDraft) => void

3가지 편집 모드:

1. 직접 편집 모드:
   - 챕터 내용을 textarea로 표시 (font-mono, leading-relaxed)
   - 사용자가 직접 텍스트를 수정할 수 있음
   - 글자 수 실시간 카운터
   - [저장] 버튼으로 onUpdate 호출

2. AI 수정 요청 모드:
   - 챕터 하단에 프롬프트 입력창
   - placeholder: "AI에게 수정 요청: 예) '2문단을 더 감성적으로 바꿔줘'"
   - [수정 요청 📤] 버튼
   - 클릭하면 현재 챕터 내용 + 사용자 지시를 AI에게 전달
   - AI가 스트리밍으로 수정본 생성
   - 수정 전/후 diff 표시 (변경된 부분 하이라이트)
   - [수정본 적용] / [원본 유지] 버튼

3. 부분 선택 + AI 수정 모드:
   - 사용자가 텍스트의 일부분을 드래그로 선택
   - 선택하면 플로팅 툴바 표시: [AI로 수정] [확장] [축소] [톤 변경]
   - [AI로 수정] 클릭 → 선택된 부분만 AI에게 전달하여 수정
   - [확장] → 선택된 부분을 더 자세하게 확장 (세부 묘사 추가)
   - [축소] → 선택된 부분을 간결하게 압축
   - [톤 변경] → 드롭다운 (더 격식체 / 더 캐주얼 / 더 감성적 / 더 객관적)

추가 기능:
- 버전 히스토리: 최근 5개 버전 저장, [이전 버전] 버튼으로 되돌리기
- 모드 전환 탭: [읽기] [편집] [AI 수정]

스타일:
- textarea: bg-white border rounded-lg p-4 w-full min-h-[400px] resize-y
- 프롬프트 입력: bg-gray-50 border rounded-lg p-3 flex items-center
- 플로팅 툴바: absolute bg-white shadow-xl rounded-lg p-2 flex gap-2
- diff 하이라이트: bg-green-50 border-l-4 border-green-400 (추가), bg-red-50 line-through (삭제)
```

### Step 3-3: Markdown 렌더링 (10분)

#### TRAE 프롬프트

```
챕터 내용을 보여줄 때 Markdown을 예쁘게 렌더링해줘.

react-markdown 라이브러리를 설치하고,
src/components/MarkdownRenderer.tsx 컴포넌트를 만들어.

- ## 제목은 text-2xl font-bold
- 본문은 text-gray-700 leading-relaxed
- **볼드**는 font-semibold
- 목록은 list-disc ml-6
- 인용구는 border-l-4 border-gray-300 pl-4 italic

BookPreview의 챕터 내용 표시에 이 컴포넌트를 사용.
```

### Step 3-3: 점수 시각화 (15분)

#### TRAE 프롬프트

```
src/components/ScoreChart.tsx 컴포넌트를 만들어줘.

props:
- score: { clarity: number, evidence: number, structure: number, engagement: number, overall: number }

외부 라이브러리 없이 순수 CSS + div로 구현:
- 각 항목을 수평 바 차트로 표시
- 0~10 스케일, 바 너비가 점수에 비례
- 색상: 8+ 초록, 6~7 노랑, 5 이하 빨강
- overall은 굵은 텍스트로 하단에 별도 표시
- 한글 라벨: 명확성, 근거, 구조, 몰입도, 종합

편집 검수 결과 화면에서 EditReview.score를 이 컴포넌트에 전달.
```

### Step 3-4: Supabase 연동 - 로그인 + 책 저장 (시간 여유 시, 20min)

> TRAE에서 Supabase 통합이 내장 지원됩니다. 시간이 남으면 구현하세요.

#### TRAE 프롬프트 (Supabase 세팅)

```
Supabase를 연동해줘.

1. @supabase/supabase-js 패키지 설치
2. src/lib/supabase.ts 생성:
   - VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY로 클라이언트 초기화
3. Supabase 대시보드에서 다음 테이블 생성:
   - books: id(uuid), user_id(uuid), genre, title, subtitle, synopsis(jsonb), outline(jsonb), chapters(jsonb), publication(jsonb), score(float), is_published(bool), created_at
   - profiles: id(uuid), display_name, avatar_url
4. RLS(Row Level Security) 활성화:
   - books: 본인 books만 수정 가능, is_published=true인 것은 누구나 읽기 가능
```

#### TRAE 프롬프트 (로그인 UI)

```
src/components/AuthButton.tsx 컴포넌트를 만들어줘.

- 로그인 안 됨: [Google로 로그인] 버튼
- 로그인 됨: 프로필 아바타 + 이름 + [내 서재] [로그아웃]
- supabase.auth.signInWithOAuth({ provider: 'google' }) 사용
- 헤더 오른쪽에 배치

src/hooks/useAuth.ts 커스텀 훅:
- user: User | null
- isLoading: boolean
- signIn: () => void
- signOut: () => void
- supabase.auth.onAuthStateChange로 상태 추적
```

#### TRAE 프롬프트 (책 저장 + 내 서재)

```
src/lib/bookStorage.ts를 만들어줘.

함수들:
- saveBook(book: BookProject): Supabase books 테이블에 저장/업데이트
- getMyBooks(): 로그인한 사용자의 책 목록 조회
- publishBook(bookId): is_published를 true로 변경
- getPublishedBooks(): 전체 공개된 책 목록 (커뮤니티용)
- getBookById(id): 특정 책 조회 (뷰어용)

Supabase 없을 때: localStorage에 폴백 저장
```

#### TRAE 프롬프트 (내 서재 페이지)

```
src/components/MyLibrary.tsx를 만들어줘.

로그인한 사용자의 책 목록을 카드 그리드로 표시:
- 각 카드: 표지 컬러 + 제목 + 장르 + 챕터 수 + 편집 점수
- 상태 배지: "작성 중" / "출간 완료"
- 클릭 → 해당 책의 편집 화면으로 이동 (작성 중) 또는 뷰어 (출간 완료)
- [새 책 만들기] 버튼

빈 상태: "아직 만든 책이 없습니다. 첫 번째 책을 만들어보세요!"
```

#### TRAE 프롬프트 (커뮤니티 서재 + 웹 뷰어)

```
src/components/Community.tsx를 만들어줘.

커뮤니티 서재:
- getPublishedBooks()로 공개된 책 목록 조회
- 카드 그리드: 표지 + 제목 + 저자 + 장르 + 편집 점수
- 필터: [최신] [인기] [장르별]
- 카드 클릭 → 웹 뷰어로 이동

src/components/BookReader.tsx 웹 뷰어:
- getBookById(id)로 책 데이터 조회
- 챕터 네비게이션 (◀ 이전 / 다음 ▶)
- Markdown 렌더링으로 챕터 내용 표시
- 읽기 진행률 표시 (1/7장 - 14%)
- 깔끔한 읽기 모드 (여백 넉넉하게, serif 폰트)
```

### Step 3-5: 반응형 + 마무리 (15분)

#### TRAE 프롬프트

```
현재 UI를 모바일에서도 보기 좋게 반응형으로 수정해줘.

- md 이상: 좌우 분할 (현재 상태 유지)
- sm 이하: 세로 분할 (채팅 위, 미리보기 아래)
  - 탭으로 전환 가능 ("채팅" | "미리보기" 탭)

추가 작업:
- 에러 상태 표시 (API 키 없음, 네트워크 오류 등)
- 로딩 상태에서 입력 비활성화
- 메타 태그 설정 (og:title, og:description)
```

---

## Phase 4: 데모 준비 (30분)

### Step 4-1: 데모 데이터 확인 (10분)
- Mock 모드로 전체 파이프라인 실행 테스트
- API 키가 있으면 실제 GPT 호출 테스트
- 에러 상황 시 mock으로 폴백 확인

### Step 4-2: 발표 준비 (20분)
- docs/DEMO_SCENARIO.md 참조
- 브라우저 탭 정리 (앱만 보이게)
- 주제 미리 준비: "AI 시대의 글쓰기"

---

## 비상 계획

### API 키가 없을 때
→ Mock 모드가 자동 활성화됨. 미리 준비된 데이터로 데모 가능.

### Phase 2까지만 완료했을 때
→ UI가 있으면 Mock 데이터로 데모 가능. 에이전트 로직은 시연 시 설명.

### Phase 1까지만 완료했을 때
→ 콘솔에서 에이전트 호출 데모 + 아키텍처 발표로 대체.

---

## 체크리스트 (해커톤 전날)

- [ ] OpenAI API 키 확보
- [ ] TRAE 설치 및 로그인 확인
- [ ] Node.js 18+ 설치 확인
- [ ] 이 가이드 문서를 TRAE에서 접근 가능한 위치에 저장
- [ ] mock 데이터 확인 (sample-topic.json, sample-chapter.json)
- [ ] .env.example → .env 복사 후 API 키 입력
