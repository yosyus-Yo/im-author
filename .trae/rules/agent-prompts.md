# Agent Implementation Rules

## 에이전트 구현 시 필수 참조
에이전트를 구현할 때 반드시 docs/PROMPTS.md의 시스템 프롬프트와 Function Calling 스키마를 정확히 따를 것.

## 4 에이전트 요약

### 1. Researcher (리서처)
- 역할: 주제의 시장성, 독창성, 실현 가능성 평가
- Function: analyze_topic
- 출력: TopicResearch (goNoGo: GO/NO_GO)
- NO_GO 시 파이프라인 중단

### 2. Writer (작가)
- 역할: 시놉시스, 목차 설계, 챕터 집필, 3계층 자기편집
- Functions:
  - create_synopsis (장르별 시놉시스 생성, 사용자 확인 필요)
  - create_outline (목차 생성, 사용자 확인 필요)
  - write_chapter (챕터 작성 + selfEditLog 포함)
  - revise_chapter (편집자 피드백 기반 재작성)
  - revise_with_instruction (사용자 프롬프트 기반 수정)
  - expand_selection / condense_selection / change_tone (부분 편집)
- 출력: Synopsis, BookOutline, ChapterDraft (selfEditLog 포함)
- 챕터 본문은 callOpenAIStream으로 스트리밍 생성
- selfEditLog: structure → clarity → style 3단계 편집 기록
- 세부 집중 작성: 사용자가 디테일하게 쓰면 AI도 동일 수준으로 맞춤 (앵커 효과)

### 3. Editor (편집자)
- 역할: 7단계 검수 (CLARITY, EVIDENCE, STRUCTURE, GRAMMAR, CONSISTENCY, ENGAGEMENT, PEDAGOGY)
- Function: review_chapter
- 출력: EditReview (status: APPROVED/NEEDS_REVISION/MAJOR_REVISION)
- GRAMMAR_CHECK: 한국어 맞춤법 ("됬다→됐다", "컨텐츠→콘텐츠" 등)
- NEEDS_REVISION 시 피드백 루프 (작가에게 재작성 요청, 최대 2회)

### 4. Publisher (출판담당)
- 역할: 메타데이터, 표지 방향, 포맷/가격 결정
- Function: prepare_publication
- 출력: PublicationInfo (metadata + coverDesign + format)

## 7단계 파이프라인
```
RESEARCH → SYNOPSIS(사용자확인) → OUTLINE(사용자확인) → WRITE(스트리밍) → EDIT(피드백루프) → PUBLISH → COMPLETE
```

## 장르별 프롬프트
docs/PROMPTS.md Section 0에 8개 장르별 프리픽스 정의.
모든 에이전트 호출 시 `getSystemPrompt(basePrompt, genre)` 패턴으로 장르 프리픽스 추가.

## 사용자 인터랙션
- 모든 단계에서 UserFeedbackBar 표시 (사용자 프롬프트 입력)
- 사용자가 직접 수정한 내용은 AI가 절대 되돌리지 않음
- revise_with_instruction: 자연어 수정 지시
- expand_selection / condense_selection / change_tone: 부분 선택 편집

## Context Management
모든 API 호출 시 시스템 프롬프트 구성:
```
systemPrompt = genrePrefix + buildBookContext(project) + agentBasePrompt
```
챕터 작성/수정 시 추가:
```
userMessage = buildChapterContext(project, chapterNum) + 실제 요청
```

## Function Calling 패턴
```typescript
const result = await callOpenAI(
  getSystemPrompt(SYSTEM_PROMPT, genre),
  userMessage,
  [FUNCTION_SCHEMA],
  'function_name'
);
return JSON.parse(result);
```

## 스트리밍 패턴 (작가 챕터 작성)
```typescript
let fullText = '';
await callOpenAIStream(
  getSystemPrompt(WRITER_PROMPT, genre),
  `${chapterTitle} 챕터를 작성해줘`,
  (chunk) => {
    fullText += chunk;
    onChunk(chunk);
  }
);
```
