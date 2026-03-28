import { callOpenAI, callOpenAIStream } from './openai'
import type {
  BookGenre,
  BookOutline,
  ChapterDraft,
  EditReview,
  PublicationInfo,
  Synopsis,
  TopicResearch,
} from '../types/agent'

const GENRE_PROMPTS: Record<BookGenre, string> = {
  nonfiction: `[장르: 논픽션]
- 정보 전달 중심. 모든 주장에 근거를 제시
- 독자가 실제로 적용할 수 있는 실용적 내용
- 사례, 데이터, 연구 결과를 적극 활용
- 챕터 구조: 문제 제기 → 분석 → 해결책`,
  fantasy: `[장르: 판타지 소설]
- 세계관 구축 우선. 마법 체계와 규칙을 일관되게 유지
- 인물의 성장 서사(영웅의 여정)를 따름
- 대화문 비중 40% 이상, 묘사와 행동 균형
- 챕터 마무리: 다음 전개에 대한 기대감(훅)`,
  romance: `[장르: 로맨스]
- 감정선과 관계 발전이 핵심 축
- 두 주인공의 시점을 번갈아 사용
- 감각적 묘사(오감)와 내면 독백 적극 활용
- 갈등 → 오해 → 해소의 리듬 유지`,
  webnovel: `[장르: 웹소설]
- 문단을 짧게 (2~3문장). 모바일 가독성 우선
- 챕터 끝마다 클리프행어 필수
- 독자와의 거리를 좁히는 친근한 서술체
- 능력치, 시스템 등 장르 문법 활용
- 1인칭 또는 3인칭 제한 시점`,
  essay: `[장르: 수필/에세이]
- 개인 경험에서 출발하여 보편적 통찰로 연결
- 솔직하고 담백한 목소리
- 일상의 순간에서 의미를 발견하는 관찰력
- 강요하지 않는 자연스러운 메시지 전달`,
  autobiography: `[장르: 자서전/회고록]
- 시간 순서를 기반으로 하되, 핵심 에피소드 중심 구성
- 구체적 장면과 감정 묘사 (보여주기 > 설명하기)
- 인생의 전환점과 교훈을 부각
- 1인칭 화자의 진정성 있는 목소리`,
  mystery: `[장르: 미스터리/추리]
- 첫 챕터에서 사건(미스터리)을 제시
- 단서를 챕터마다 하나씩 공개 (페어플레이)
- 독자가 추리할 수 있도록 정보를 공정하게 배치
- 레드 헤링(거짓 단서)을 적절히 활용
- 결말에서 모든 복선을 회수`,
  sf: `[장르: SF/공상과학]
- 과학적 설정에 내적 일관성을 유지
- "만약 ~라면?" 질문에서 출발하여 사회적 함의를 탐구
- 기술 설명은 서사에 녹여서 전달 (인포덤프 금지)
- 인물의 인간적 갈등이 기술적 배경만큼 중요`,
}

const RESEARCHER_SYSTEM_PROMPT = `당신은 10년 경력의 출판 기획 편집자입니다. 주어진 주제에 대해 시장성, 독창성, 실현 가능성을 분석하고 Go/No-Go 판정을 내립니다.

## 분석 원칙
1. 시장 트렌드를 기반으로 독자 수요를 추정합니다
2. 기존 유사 도서와의 차별화 포인트를 식별합니다
3. 주제의 깊이와 확장 가능성을 평가합니다
4. 냉정하고 객관적으로 판단합니다 (감정적 판단 금지)

## Go/No-Go 기준
- GO: 시장 수요 존재 + 차별화 가능 + 실현 가능
- NO_GO: 시장 포화 | 차별화 불가 | 주제가 너무 좁음/넓음

## 출력 규칙
- 반드시 analyze_topic 함수를 호출하여 구조화된 결과를 반환합니다
- 추측이 아닌 논리적 근거를 제시합니다
- confidence는 0.0~1.0 사이 값으로, 판단의 확신도를 나타냅니다`

const WRITER_SYSTEM_PROMPT = `당신은 논픽션 전문 작가입니다. 주어진 주제와 조사 결과를 바탕으로 책의 목차를 설계하고 챕터를 집필합니다.

## 집필 원칙
1. 독자가 이해할 수 없는 문장은 좋은 문장이 아닙니다
2. 한 문단은 하나의 아이디어만 담습니다
3. 추상적 설명보다 구체적 예시를 우선합니다
4. 능동태를 선호하고, 수동태는 최소화합니다
5. 전문 용어는 첫 등장 시 설명을 덧붙입니다

## 목차 설계 원칙
- 각 챕터는 독자의 질문에 답하는 구조입니다
- 앞 챕터가 뒤 챕터의 기반이 되는 논리적 흐름을 만듭니다
- 5~7개 챕터가 적정합니다

## 챕터 작성 규칙
- 챕터당 800~1500단어
- 도입(왜?) → 본론(무엇/어떻게) → 정리(그래서)
- 소제목(##)으로 3~5개 섹션 구분

## 3계층 자기편집 (LAYERED_EDIT)
초안 작성 후 반드시 3단계 자기편집을 수행합니다:

**Layer 1 - 구조 편집**: 논리적 흐름이 자연스러운가? 빠진 연결고리는 없는가?
**Layer 2 - 명확성 편집**: 모호한 문장은 없는가? 독자가 한 번에 이해할 수 있는가?
**Layer 3 - 문체 편집**: 능동태 우선, 불필요한 수식어 제거, 문장 길이 균형

각 Layer에서 수정한 내용을 selfEditLog에 기록합니다.`

const EDITOR_SYSTEM_PROMPT = `당신은 대형 출판사의 수석 편집자입니다. 원고의 품질을 다각도로 검수하고, 구체적인 개선 제안을 합니다.

## 편집 원칙
1. 모든 주장에는 근거가 있어야 합니다
2. 독자의 이해를 방해하는 요소를 찾아냅니다
3. 일관성 (톤, 용어, 시제)을 확인합니다
4. 교육적 가치를 평가합니다

## 검수 체크리스트 (7단계)
1. CLARITY_CHECK: 문장이 명확한가? 모호한 표현은 없는가?
2. EVIDENCE_CHECK: 주장에 근거가 있는가? 사실 확인이 필요한 부분은?
3. STRUCTURE_CHECK: 논리적 흐름이 자연스러운가?
4. GRAMMAR_CHECK: 한국어 맞춤법, 띄어쓰기, 조사 사용이 올바른가?
   - 자주 틀리는 표현: "됬다→됐다", "되요→돼요", "몇일→며칠"
   - 외래어 표기법: "메세지→메시지", "컨텐츠→콘텐츠"
   - 불필요한 피동 표현: "~되어지다→~되다"
5. CONSISTENCY_CHECK: 용어, 톤, 시제가 일관적인가?
6. ENGAGEMENT_CHECK: 독자의 관심을 유지하는가?
7. PEDAGOGY_CHECK: 독자가 실제로 배울 수 있는가?

## 점수 기준 (0~10)
- 9~10: 출판 가능 품질
- 7~8: 소규모 수정 후 출판 가능
- 5~6: 상당한 수정 필요
- 4 이하: 대폭 재작성 필요

## 판정 기준
- APPROVED: overall >= 8
- NEEDS_REVISION: overall 6~7
- MAJOR_REVISION: overall <= 5`

const PUBLISHER_SYSTEM_PROMPT = `당신은 전자책 출판 전문가입니다. 편집이 완료된 원고를 출판 가능한 형태로 준비합니다.

## 출판 준비 원칙
1. 메타데이터는 검색 최적화를 고려합니다 (키워드, 카테고리)
2. 표지 디자인 설명은 구체적이고 시각적이어야 합니다
3. 판형과 가격은 장르와 타겟 독자에 맞게 결정합니다
4. 모든 출판 정보는 실제 유통 플랫폼 기준에 맞춰야 합니다

## 출판 체크리스트
1. 메타데이터 생성 (제목, 부제, 저자, 키워드, 카테고리)
2. 표지 디자인 방향 (컬러, 이미지 컨셉, 레이아웃)
3. 판형 결정 (A5/B5/신국판)
4. 가격 책정 (전자책/종이책)
5. 목차 최종 확정
6. ISBN/KDC 분류 제안`

const ANALYZE_TOPIC_FUNCTION = {
  name: 'analyze_topic',
  description: '주제의 시장성과 실현 가능성을 분석하고 Go/No-Go 판정을 내립니다',
  parameters: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        description: '분석 대상 주제',
      },
      marketAnalysis: {
        type: 'object',
        properties: {
          trend: { type: 'string', description: '시장 트렌드 요약 (1~2문장)' },
          targetAudience: { type: 'string', description: '주요 타겟 독자층' },
          estimatedReaders: { type: 'string', description: '예상 독자 수 범위' },
        },
        required: ['trend', 'targetAudience', 'estimatedReaders'],
      },
      competition: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '유사 도서 제목' },
            strength: { type: 'string', description: '해당 도서의 강점' },
            weakness: {
              type: 'string',
              description: '해당 도서의 약점 (우리가 차별화할 지점)',
            },
          },
          required: ['title', 'strength', 'weakness'],
        },
        description: '유사 경쟁 도서 2~3권 분석',
      },
      differentiation: {
        type: 'string',
        description: '이 책만의 차별화 포인트 (1~2문장)',
      },
      goNoGo: {
        type: 'string',
        enum: ['GO', 'NO_GO'],
        description: '출판 추진 여부 판정',
      },
      confidence: {
        type: 'number',
        description: '판정 신뢰도 (0.0~1.0)',
      },
      reasoning: {
        type: 'string',
        description: '판정 근거 (2~3문장)',
      },
    },
    required: [
      'topic',
      'marketAnalysis',
      'competition',
      'differentiation',
      'goNoGo',
      'confidence',
      'reasoning',
    ],
  },
}

const CREATE_SYNOPSIS_FUNCTION = {
  name: 'create_synopsis',
  description: '사용자의 아이디어를 장르에 맞는 시놉시스(줄거리 요약)로 정리합니다',
  parameters: {
    type: 'object',
    properties: {
      synopsis: {
        type: 'string',
        description: '3~5문장의 전체 줄거리 요약',
      },
      characters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '인물 이름' },
            role: { type: 'string', description: '역할 (주인공, 라이벌, 조력자 등)' },
            description: { type: 'string', description: '1줄 설명' },
          },
          required: ['name', 'role', 'description'],
        },
        description: '주요 인물 (소설류) 또는 핵심 개념 (논픽션)',
      },
      coreConflict: {
        type: 'string',
        description: '핵심 갈등 또는 핵심 질문 (1~2문장)',
      },
      theme: {
        type: 'string',
        description: '관통하는 테마/메시지 (1문장)',
      },
      targetAudience: {
        type: 'string',
        description: '이 책을 읽을 독자 (1문장)',
      },
    },
    required: ['synopsis', 'characters', 'coreConflict', 'theme', 'targetAudience'],
  },
}

const CREATE_OUTLINE_FUNCTION = {
  name: 'create_outline',
  description: '책의 목차를 설계합니다',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: '책 제목',
      },
      subtitle: {
        type: 'string',
        description: '부제 (1문장)',
      },
      chapters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            number: { type: 'number' },
            title: { type: 'string', description: '챕터 제목' },
            summary: { type: 'string', description: '챕터 요약 (1~2문장)' },
          },
          required: ['number', 'title', 'summary'],
        },
      },
    },
    required: ['title', 'subtitle', 'chapters'],
  },
}

const WRITE_CHAPTER_FUNCTION = {
  name: 'write_chapter',
  description: '지정된 챕터의 초안을 작성합니다',
  parameters: {
    type: 'object',
    properties: {
      chapterNumber: {
        type: 'number',
        description: '챕터 번호',
      },
      title: {
        type: 'string',
        description: '챕터 제목',
      },
      content: {
        type: 'string',
        description: '챕터 본문 (Markdown 형식, 800~1500단어)',
      },
      wordCount: {
        type: 'number',
        description: '실제 글자 수',
      },
      selfEditLog: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            layer: {
              type: 'string',
              enum: ['structure', 'clarity', 'style'],
              description: '편집 계층',
            },
            before: { type: 'string', description: '수정 전 문장/문단 (핵심 부분만)' },
            after: { type: 'string', description: '수정 후 문장/문단' },
            reason: { type: 'string', description: '수정 이유 (1문장)' },
          },
          required: ['layer', 'before', 'after', 'reason'],
        },
        description: '3계층 자기편집 기록 (3~5개)',
      },
    },
    required: ['chapterNumber', 'title', 'content', 'wordCount', 'selfEditLog'],
  },
}

const REVISE_CHAPTER_FUNCTION = {
  name: 'revise_chapter',
  description: '편집 피드백을 반영하여 챕터를 재작성합니다',
  parameters: {
    type: 'object',
    properties: {
      chapterNumber: {
        type: 'number',
        description: '챕터 번호',
      },
      title: {
        type: 'string',
        description: '챕터 제목',
      },
      content: {
        type: 'string',
        description: '수정된 챕터 본문 (Markdown 형식)',
      },
      wordCount: {
        type: 'number',
        description: '수정 후 글자 수',
      },
      selfEditLog: WRITE_CHAPTER_FUNCTION.parameters.properties.selfEditLog,
      revision: {
        type: 'number',
        description: '재작성 횟수',
      },
    },
    required: ['chapterNumber', 'title', 'content', 'wordCount', 'selfEditLog', 'revision'],
  },
}

const REVIEW_CHAPTER_FUNCTION = {
  name: 'review_chapter',
  description: '챕터를 검수하고 편집 의견을 제시합니다',
  parameters: {
    type: 'object',
    properties: {
      chapterNumber: {
        type: 'number',
        description: '검수 대상 챕터 번호',
      },
      status: {
        type: 'string',
        enum: ['APPROVED', 'NEEDS_REVISION', 'MAJOR_REVISION'],
        description: '검수 판정',
      },
      issues: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: [
                'CLARITY_CHECK',
                'EVIDENCE_CHECK',
                'STRUCTURE_CHECK',
                'GRAMMAR_CHECK',
                'CONSISTENCY_CHECK',
                'ENGAGEMENT_CHECK',
                'PEDAGOGY_CHECK',
              ],
              description: '이슈 유형',
            },
            location: { type: 'string', description: '문제 위치 (문단 번호 또는 소제목)' },
            issue: { type: 'string', description: '문제점 설명' },
            suggestion: { type: 'string', description: '구체적 수정 제안' },
          },
          required: ['type', 'location', 'issue', 'suggestion'],
        },
      },
      score: {
        type: 'object',
        properties: {
          clarity: { type: 'number', description: '명확성 (0~10)' },
          evidence: { type: 'number', description: '근거 (0~10)' },
          structure: { type: 'number', description: '구조 (0~10)' },
          engagement: { type: 'number', description: '몰입도 (0~10)' },
          overall: { type: 'number', description: '종합 (0~10)' },
        },
        required: ['clarity', 'evidence', 'structure', 'engagement', 'overall'],
      },
    },
    required: ['chapterNumber', 'status', 'issues', 'score'],
  },
}

const PREPARE_PUBLICATION_FUNCTION = {
  name: 'prepare_publication',
  description: '출판을 위한 메타데이터, 표지 방향, 포맷 정보를 생성합니다',
  parameters: {
    type: 'object',
    properties: {
      metadata: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '최종 책 제목' },
          subtitle: { type: 'string', description: '부제' },
          author: { type: 'string', description: '저자명' },
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: '검색 키워드 5~10개',
          },
          category: { type: 'string', description: 'KDC 또는 BISAC 분류' },
          description: { type: 'string', description: '책 소개글 (200자 내외)' },
        },
        required: ['title', 'subtitle', 'keywords', 'category', 'description'],
      },
      coverDesign: {
        type: 'object',
        properties: {
          concept: { type: 'string', description: '표지 컨셉 설명 (1~2문장)' },
          primaryColor: { type: 'string', description: '주 색상 (예: #2563EB)' },
          style: {
            type: 'string',
            enum: ['minimal', 'illustrated', 'photographic', 'typographic'],
            description: '표지 스타일',
          },
          imagePrompt: {
            type: 'string',
            description: 'AI 이미지 생성용 프롬프트 (영어)',
          },
        },
        required: ['concept', 'primaryColor', 'style', 'imagePrompt'],
      },
      format: {
        type: 'object',
        properties: {
          pageSize: {
            type: 'string',
            enum: ['A5', 'B5', '신국판'],
            description: '판형',
          },
          estimatedPages: { type: 'number', description: '예상 페이지 수' },
          ebookPrice: { type: 'number', description: '전자책 가격 (원)' },
          printPrice: { type: 'number', description: '종이책 가격 (원)' },
        },
        required: ['pageSize', 'estimatedPages', 'ebookPrice', 'printPrice'],
      },
      readyForPublish: {
        type: 'boolean',
        description: '출판 준비 완료 여부',
      },
    },
    required: ['metadata', 'coverDesign', 'format', 'readyForPublish'],
  },
}

function getSystemPrompt(basePrompt: string, genre: BookGenre, context?: string) {
  return [GENRE_PROMPTS[genre], context, basePrompt].filter(Boolean).join('\n\n')
}

function parseStructuredResult<T>(raw: string): T {
  return JSON.parse(raw) as T
}

function countWords(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length
}

interface AgentOptions {
  genre: BookGenre
  bookContext?: string
}

interface WriteChapterOptions extends AgentOptions {
  topic: string
  outline: BookOutline
  chapterNumber: number
  synopsis: Synopsis
  chapterContext?: string
  editFeedback?: EditReview
  revision?: number
  onChunk?: (chunk: string) => void
}

export const researcherAgent = {
  async analyzeTopic(
    topic: string,
    { genre, bookContext }: AgentOptions,
  ): Promise<TopicResearch> {
    const result = await callOpenAI(
      getSystemPrompt(RESEARCHER_SYSTEM_PROMPT, genre, bookContext),
      `다음 주제를 분석해주세요: ${topic}`,
      [ANALYZE_TOPIC_FUNCTION],
      'analyze_topic',
    )

    return parseStructuredResult<TopicResearch>(result)
  },
}

export const writerAgent = {
  async createSynopsis(
    topic: string,
    research: TopicResearch,
    { genre, bookContext }: AgentOptions,
  ): Promise<Synopsis> {
    const result = await callOpenAI(
      getSystemPrompt(WRITER_SYSTEM_PROMPT, genre, bookContext),
      `주제: ${topic}

조사 결과:
${JSON.stringify(research, null, 2)}

위 정보를 바탕으로 장르에 맞는 시놉시스를 작성해주세요.
- 소설류: 줄거리 요약 + 주요 인물 + 핵심 갈등을 선명하게 정리
- 논픽션/에세이류: 핵심 주장 + 독자 문제 + 배울 포인트를 선명하게 정리`,
      [CREATE_SYNOPSIS_FUNCTION],
      'create_synopsis',
    )

    return parseStructuredResult<Synopsis>(result)
  },

  async createOutline(
    topic: string,
    research: TopicResearch,
    synopsis: Synopsis,
    { genre, bookContext }: AgentOptions,
  ): Promise<BookOutline> {
    const result = await callOpenAI(
      getSystemPrompt(WRITER_SYSTEM_PROMPT, genre, bookContext),
      `주제: ${topic}

조사 결과:
${JSON.stringify(research, null, 2)}

시놉시스:
${JSON.stringify(synopsis, null, 2)}

위 정보를 바탕으로 5~7개 챕터로 구성된 목차를 설계해주세요.`,
      [CREATE_OUTLINE_FUNCTION],
      'create_outline',
    )

    return parseStructuredResult<BookOutline>(result)
  },

  async writeChapter({
    topic,
    outline,
    chapterNumber,
    synopsis,
    genre,
    bookContext,
    chapterContext,
    editFeedback,
    revision = 0,
    onChunk,
  }: WriteChapterOptions): Promise<ChapterDraft> {
    const chapter = outline.chapters.find((item) => item.number === chapterNumber)

    if (!chapter) {
      throw new Error(`${chapterNumber}장 정보를 목차에서 찾지 못했습니다.`)
    }

    const chapterBodyPrompt = `주제: ${topic}

책 시놉시스:
${JSON.stringify(synopsis, null, 2)}

목차:
${JSON.stringify(outline, null, 2)}

대상 챕터:
${JSON.stringify(chapter, null, 2)}

추가 컨텍스트:
${chapterContext || '없음'}

${editFeedback ? `편집 피드백:\n${JSON.stringify(editFeedback, null, 2)}\n` : ''}
${revision > 0 ? `현재는 ${revision}차 수정본입니다.\n` : ''}
Markdown 형식으로 챕터 본문만 작성해주세요.
- 800~1500단어 분량
- 소제목(##)으로 3~5개 섹션 구분
- 도입 → 본론 → 정리 구조 유지
- 함수 호출이나 JSON 없이 본문 텍스트만 출력`

    const content = await callOpenAIStream(
      getSystemPrompt(WRITER_SYSTEM_PROMPT, genre, bookContext),
      chapterBodyPrompt,
      (chunk) => {
        onChunk?.(chunk)
      },
    )

    const structuredPrompt = `다음 챕터 본문을 기준으로 구조화된 write_chapter 결과를 생성해주세요.
본문은 수정하지 말고 그대로 content 필드에 넣어주세요.

챕터 번호: ${chapter.number}
챕터 제목: ${chapter.title}
재작성 횟수: ${revision}

본문:
${content}

반드시 3개 이상의 selfEditLog를 포함하세요.`

    const result = await callOpenAI(
      getSystemPrompt(WRITER_SYSTEM_PROMPT, genre, bookContext),
      structuredPrompt,
      [revision > 0 ? REVISE_CHAPTER_FUNCTION : WRITE_CHAPTER_FUNCTION],
      revision > 0 ? 'revise_chapter' : 'write_chapter',
    )

    const parsed = parseStructuredResult<ChapterDraft>(result)

    return {
      ...parsed,
      chapterNumber: chapter.number,
      title: chapter.title,
      content,
      wordCount: parsed.wordCount || countWords(content),
      revision,
    }
  },

  async reviseChapter(options: WriteChapterOptions): Promise<ChapterDraft> {
    return this.writeChapter({
      ...options,
      revision: options.revision ?? 1,
    })
  },

  async reviseWithInstruction(content: string, instruction: string, genre: BookGenre): Promise<string> {
    return callOpenAI(
      getSystemPrompt(WRITER_SYSTEM_PROMPT, genre),
      `다음 본문을 "${instruction}" 요청에 맞게 수정해주세요.\n\n원본:\n${content}\n\n수정된 본문만 출력하세요. JSON이나 설명 없이 본문 텍스트만 반환합니다.`,
    )
  },

  async expandSelection(text: string, genre: BookGenre): Promise<string> {
    return callOpenAI(
      getSystemPrompt(WRITER_SYSTEM_PROMPT, genre),
      `다음 문장/문단을 더 상세하고 풍부하게 확장해주세요. 맥락과 배경, 구체적 묘사를 추가합니다.\n\n원본:\n${text}\n\n확장된 텍스트만 출력하세요.`,
    )
  },

  async condenseSelection(text: string, genre: BookGenre): Promise<string> {
    return callOpenAI(
      getSystemPrompt(WRITER_SYSTEM_PROMPT, genre),
      `다음 문장/문단을 핵심만 남기고 간결하게 축소해주세요.\n\n원본:\n${text}\n\n축소된 텍스트만 출력하세요.`,
    )
  },

  async changeTone(text: string, tone: string, genre: BookGenre): Promise<string> {
    return callOpenAI(
      getSystemPrompt(WRITER_SYSTEM_PROMPT, genre),
      `다음 문장/문단의 톤을 "${tone}"으로 변경해주세요. 내용은 유지하되 문체만 바꿉니다.\n\n원본:\n${text}\n\n톤이 변경된 텍스트만 출력하세요.`,
    )
  },
}

export const editorAgent = {
  async reviewChapter(
    chapter: ChapterDraft,
    { genre, bookContext }: AgentOptions,
  ): Promise<EditReview> {
    const result = await callOpenAI(
      getSystemPrompt(EDITOR_SYSTEM_PROMPT, genre, bookContext),
      `다음 챕터를 검수해주세요.

${JSON.stringify(chapter, null, 2)}`,
      [REVIEW_CHAPTER_FUNCTION],
      'review_chapter',
    )

    return parseStructuredResult<EditReview>(result)
  },
}

export const publisherAgent = {
  async preparePublication(
    outline: BookOutline,
    reviews: EditReview[],
    chapters: ChapterDraft[],
    { genre, bookContext }: AgentOptions,
  ): Promise<PublicationInfo> {
    const result = await callOpenAI(
      getSystemPrompt(PUBLISHER_SYSTEM_PROMPT, genre, bookContext),
      `다음 책 정보를 바탕으로 출판 정보를 준비해주세요.

목차:
${JSON.stringify(outline, null, 2)}

챕터:
${JSON.stringify(chapters, null, 2)}

편집 결과:
${JSON.stringify(reviews, null, 2)}`,
      [PREPARE_PUBLICATION_FUNCTION],
      'prepare_publication',
    )

    return parseStructuredResult<PublicationInfo>(result)
  },
}

export {
  CREATE_OUTLINE_FUNCTION,
  CREATE_SYNOPSIS_FUNCTION,
  EDITOR_SYSTEM_PROMPT,
  GENRE_PROMPTS,
  PUBLISHER_SYSTEM_PROMPT,
  RESEARCHER_SYSTEM_PROMPT,
  REVIEW_CHAPTER_FUNCTION,
  WRITER_SYSTEM_PROMPT,
  WRITE_CHAPTER_FUNCTION,
  getSystemPrompt,
}
