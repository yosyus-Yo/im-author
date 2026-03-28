export type BookGenre =
  | 'nonfiction'
  | 'fantasy'
  | 'romance'
  | 'webnovel'
  | 'essay'
  | 'autobiography'
  | 'mystery'
  | 'sf'

export const GENRE_OPTIONS: Array<{ value: BookGenre; label: string }> = [
  { value: 'nonfiction', label: '논픽션' },
  { value: 'fantasy', label: '판타지' },
  { value: 'romance', label: '로맨스' },
  { value: 'webnovel', label: '웹소설' },
  { value: 'essay', label: '수필/에세이' },
  { value: 'autobiography', label: '자서전' },
  { value: 'mystery', label: '미스터리' },
  { value: 'sf', label: 'SF' },
]

export type AgentRole = 'researcher' | 'writer' | 'editor' | 'publisher'

export type AgentMessageStatus = 'thinking' | 'done' | 'error'

export type BookPhase =
  | 'idle'
  | 'researching'
  | 'synopsis'
  | 'outlining'
  | 'writing'
  | 'editing'
  | 'publishing'
  | 'complete'

export interface AgentMessage {
  role: AgentRole
  content: string
  timestamp: Date
  phase: string
  status: AgentMessageStatus
}

export interface TopicResearch {
  topic: string
  marketAnalysis: {
    trend: string
    targetAudience: string
    estimatedReaders: string
  }
  competition: Array<{
    title: string
    strength: string
    weakness: string
  }>
  differentiation: string
  goNoGo: 'GO' | 'NO_GO'
  confidence: number
  reasoning: string
}

export interface Synopsis {
  synopsis: string
  characters: Array<{
    name: string
    role: string
    description: string
  }>
  coreConflict: string
  theme: string
  targetAudience: string
}

export interface BookOutline {
  title: string
  subtitle: string
  chapters: Array<{
    number: number
    title: string
    summary: string
  }>
}

export interface ChapterSelfEdit {
  layer: 'structure' | 'clarity' | 'style'
  before: string
  after: string
  reason: string
}

export interface ChapterDraft {
  chapterNumber: number
  title: string
  content: string
  wordCount: number
  selfEditLog: ChapterSelfEdit[]
  revision?: number
}

export interface EditReview {
  chapterNumber: number
  status: 'APPROVED' | 'NEEDS_REVISION' | 'MAJOR_REVISION'
  issues: Array<{
    type:
      | 'CLARITY_CHECK'
      | 'EVIDENCE_CHECK'
      | 'STRUCTURE_CHECK'
      | 'GRAMMAR_CHECK'
      | 'CONSISTENCY_CHECK'
      | 'ENGAGEMENT_CHECK'
      | 'PEDAGOGY_CHECK'
    location: string
    issue: string
    suggestion: string
  }>
  score: {
    clarity: number
    evidence: number
    structure: number
    engagement: number
    overall: number
  }
}

export interface PublicationInfo {
  metadata: {
    title: string
    subtitle: string
    author?: string
    keywords: string[]
    category: string
    description: string
  }
  coverDesign: {
    concept: string
    primaryColor: string
    style: 'minimal' | 'illustrated' | 'photographic' | 'typographic'
    imagePrompt: string
  }
  format: {
    pageSize: 'A5' | 'B5' | '신국판'
    estimatedPages: number
    ebookPrice: number
    printPrice: number
  }
  readyForPublish: boolean
}

export interface BookProject {
  topic: string
  genre: BookGenre | null
  research: TopicResearch | null
  synopsis: Synopsis | null
  synopsisConfirmed: boolean
  outline: BookOutline | null
  outlineConfirmed: boolean
  chapters: ChapterDraft[]
  reviews: EditReview[]
  publication: PublicationInfo | null
  currentPhase: BookPhase
  messages: AgentMessage[]
}
