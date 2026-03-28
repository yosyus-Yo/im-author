import sampleChapter from '../../mock/sample-chapter.json'
import sampleTopic from '../../mock/sample-topic.json'
import { createEmptyProject } from './orchestrator'
import type {
  AgentMessage,
  AgentMessageStatus,
  BookOutline,
  BookGenre,
  BookProject,
  ChapterDraft,
  EditReview,
  PublicationInfo,
  Synopsis,
  TopicResearch,
} from '../types/agent'

function createMessage(
  role: AgentMessage['role'],
  content: string,
  phase: string,
  status: AgentMessageStatus,
): AgentMessage {
  return {
    role,
    content,
    phase,
    status,
    timestamp: new Date(),
  }
}

function sleep(duration: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration)
  })
}

function getDelay() {
  return 1000 + Math.floor(Math.random() * 1000)
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function appendProjectMessage(project: BookProject, message: AgentMessage): BookProject {
  return {
    ...project,
    messages: [...project.messages, message],
  }
}

function createApprovedReview(baseReview: EditReview): EditReview {
  return {
    ...baseReview,
    status: 'APPROVED',
    issues: [
      {
        type: 'STRUCTURE_CHECK',
        location: '마지막 문단',
        issue: '각 병목과 에이전트 역할 연결이 조금 더 선명해졌습니다.',
        suggestion: '현재 수준이면 출판 진행 가능',
      },
    ],
    score: {
      clarity: 8.5,
      evidence: 8,
      structure: 9,
      engagement: 8.5,
      overall: 8.4,
    },
  }
}

function createRevisedChapter(baseChapter: ChapterDraft): ChapterDraft {
  return {
    ...baseChapter,
    revision: 1,
    wordCount: 1280,
    content: `${baseChapter.content}

## 세 병목은 어떻게 해결되는가

리서처 에이전트는 주제 검증을 맡아 시장성과 독자 수요를 먼저 확인합니다. 작가 에이전트는 구조 설계와 초안 작성을 담당해 글쓰기의 빈 페이지 공포를 줄여줍니다. 편집자 에이전트는 반복 편집을 체계화해 초안을 출판 품질에 가까운 원고로 끌어올립니다.`,
    selfEditLog: [
      ...baseChapter.selfEditLog,
      {
        layer: 'clarity',
        before: 'AI 에이전트는 바로 이 세 병목을 해결합니다.',
        after:
          '리서처는 주제 검증을, 작가는 구조 설계를, 편집자는 반복 편집을 맡아 병목을 나눠 해결합니다.',
        reason: '병목과 역할의 대응 관계를 더 분명하게 보여주기 위해 수정',
      },
    ],
  }
}

function createPublicationInfo(project: BookProject): PublicationInfo {
  const outline = project.outline || sampleTopic.outline

  return {
    metadata: {
      title: outline.title,
      subtitle: outline.subtitle,
      author: 'AI Book Agent',
      keywords: ['AI', '글쓰기', '에이전트', '출판', '생산성', '워크플로우'],
      category: '출판/콘텐츠 기획',
      description:
        'AI 에이전트와 함께 주제 검증부터 집필, 편집, 출판 준비까지 한 권의 책을 완성하는 실전 가이드입니다.',
    },
    coverDesign: {
      concept: '푸른 배경 위에 네 개의 에이전트가 협업하는 흐름을 시각화한 현대적 표지',
      primaryColor: '#2563EB',
      style: 'typographic',
      imagePrompt:
        'A clean Korean book cover, blue dominant color, modern typography, AI agents collaborating on a publishing workflow, minimal and professional',
    },
    format: {
      pageSize: 'A5',
      estimatedPages: 210,
      ebookPrice: 15000,
      printPrice: 22000,
    },
    readyForPublish: true,
  }
}

function hasUsableApiKey() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim()

  if (!apiKey) {
    return false
  }

  if (apiKey === 'sk-your-openai-api-key-here') {
    return false
  }

  return true
}

export function shouldUseMockMode() {
  return !hasUsableApiKey()
}

export async function runMockPipeline(
  topic: string,
  genre: BookGenre,
  onMessage: (msg: AgentMessage) => void,
  onProjectUpdate: (project: BookProject) => void,
): Promise<BookProject> {
  let project = createEmptyProject(topic || sampleTopic.topic, genre)

  const updateProject = (updater: (current: BookProject) => BookProject) => {
    project = updater(project)
    onProjectUpdate(project)
  }

  const pushMessage = (
    role: AgentMessage['role'],
    content: string,
    phase: string,
    status: AgentMessageStatus,
  ) => {
    const message = createMessage(role, content, phase, status)
    onMessage(message)
    updateProject((current) => appendProjectMessage(current, message))
  }

  const mockResearch = clone(sampleTopic.research as TopicResearch)
  const mockSynopsis = clone(sampleTopic.synopsis as Synopsis)
  const mockOutline = clone(sampleTopic.outline as BookOutline)
  const mockChapter = clone(sampleChapter) as ChapterDraft & { editReview: EditReview }
  const firstReview = clone(mockChapter.editReview)
  const revisedChapter = createRevisedChapter(mockChapter)
  const approvedReview = createApprovedReview(firstReview)

  updateProject((current) => ({
    ...current,
    topic: topic || sampleTopic.topic,
    genre,
    currentPhase: 'researching',
  }))
  pushMessage('researcher', '리서처가 주제를 분석하고 있습니다...', 'RESEARCH', 'thinking')
  await sleep(getDelay())

  updateProject((current) => ({
    ...current,
    research: {
      ...mockResearch,
      topic: topic || sampleTopic.topic,
    },
  }))
  pushMessage(
    'researcher',
    `시장 분석이 완료되었습니다. ${mockResearch.reasoning}`,
    'RESEARCH',
    'done',
  )

  updateProject((current) => ({
    ...current,
    currentPhase: 'synopsis',
  }))
  pushMessage('writer', '작가가 시놉시스를 작성하고 있습니다...', 'SYNOPSIS', 'thinking')
  await sleep(getDelay())

  updateProject((current) => ({
    ...current,
    synopsis: mockSynopsis,
    synopsisConfirmed: true,
  }))
  pushMessage('writer', '시놉시스 초안을 생성했고 자동 확정 처리했습니다.', 'SYNOPSIS', 'done')

  updateProject((current) => ({
    ...current,
    currentPhase: 'outlining',
  }))
  pushMessage('writer', '작가가 목차를 설계하고 있습니다...', 'OUTLINE', 'thinking')
  await sleep(getDelay())

  updateProject((current) => ({
    ...current,
    outline: mockOutline,
    outlineConfirmed: true,
  }))
  pushMessage(
    'writer',
    `${mockOutline.chapters.length}개 챕터로 구성된 목차를 생성했습니다.`,
    'OUTLINE',
    'done',
  )

  updateProject((current) => ({
    ...current,
    currentPhase: 'writing',
  }))
  pushMessage('writer', '작가가 1장을 집필하고 있습니다...', 'WRITE', 'thinking')

  let streamedContent = ''
  for (const chunk of mockChapter.content.split(/(?<=\.)\s+/)) {
    streamedContent += `${streamedContent ? ' ' : ''}${chunk}`
    updateProject((current) => ({
      ...current,
      chapters: [
        {
          chapterNumber: mockChapter.chapterNumber,
          title: mockChapter.title,
          content: streamedContent,
          wordCount: Math.max(1, streamedContent.trim().split(/\s+/).length),
          selfEditLog: [],
          revision: 0,
        },
      ],
    }))
    await sleep(180)
  }

  updateProject((current) => ({
    ...current,
    chapters: [mockChapter],
  }))
  pushMessage('writer', '1장 초안 작성이 완료되었습니다.', 'WRITE', 'done')

  updateProject((current) => ({
    ...current,
    currentPhase: 'editing',
  }))
  pushMessage('editor', '편집자가 1장을 검수하고 있습니다...', 'EDIT', 'thinking')
  await sleep(getDelay())

  updateProject((current) => ({
    ...current,
    reviews: [firstReview],
  }))
  pushMessage(
    'editor',
    `1차 검수 결과는 ${firstReview.status}입니다. 작가에게 피드백을 전달합니다.`,
    'EDIT',
    'done',
  )

  pushMessage(
    'editor',
    '편집자가 수정을 요청했습니다. 작가가 재작성합니다...',
    'EDIT',
    'thinking',
  )
  await sleep(getDelay())

  updateProject((current) => ({
    ...current,
    chapters: [revisedChapter],
  }))
  pushMessage('writer', '피드백을 반영한 2차 원고가 작성되었습니다.', 'WRITE', 'done')

  pushMessage('editor', '편집자가 재검수하고 있습니다...', 'EDIT', 'thinking')
  await sleep(getDelay())

  updateProject((current) => ({
    ...current,
    reviews: [firstReview, approvedReview],
  }))
  pushMessage('editor', '재검수 결과 APPROVED입니다.', 'EDIT', 'done')

  updateProject((current) => ({
    ...current,
    currentPhase: 'publishing',
  }))
  pushMessage('publisher', '출판담당이 출판 정보를 준비하고 있습니다...', 'PUBLISH', 'thinking')
  await sleep(getDelay())

  const publication = createPublicationInfo(project)

  updateProject((current) => ({
    ...current,
    publication,
  }))
  pushMessage('publisher', '출판 메타데이터와 표지 방향이 준비되었습니다.', 'PUBLISH', 'done')

  updateProject((current) => ({
    ...current,
    currentPhase: 'complete',
  }))
  pushMessage('publisher', 'Mock 파이프라인이 완료되었습니다.', 'COMPLETE', 'done')

  return project
}
