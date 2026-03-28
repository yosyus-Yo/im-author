import { useMemo, useRef, useState } from 'react'
import type { BookGenre, ChapterDraft } from '../types/agent'
import { writerAgent } from '../lib/agents'

interface ChapterEditorProps {
  chapter: ChapterDraft
  genre: BookGenre
  onUpdate: (updated: ChapterDraft) => void
}

type EditorMode = 'read' | 'edit' | 'ai'

interface ChapterVersion {
  id: string
  label: string
  chapter: ChapterDraft
}

interface SelectionState {
  start: number
  end: number
  text: string
}

function countWords(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length
}

function createUpdatedChapter(chapter: ChapterDraft, content: string): ChapterDraft {
  return {
    ...chapter,
    content,
    wordCount: countWords(content),
  }
}

function normalizeContentForTone(text: string, tone: string) {
  switch (tone) {
    case 'formal':
      return text.replace(/합니다\./g, '합니다.').replace(/해요\./g, '합니다.')
    case 'casual':
      return text.replace(/습니다\./g, '어요.').replace(/입니다\./g, '이에요.')
    case 'emotional':
      return `${text}\n\n이 장면이 남기는 감정의 진폭은 생각보다 큽니다.`
    case 'objective':
      return text.replace(/정말|매우|아주/g, '').trim()
    default:
      return text
  }
}

function createAiRevision(base: string, instruction: string, genre: BookGenre) {
  const lowered = instruction.toLowerCase()

  if (lowered.includes('감성')) {
    return `${base}\n\n이 문장은 ${genre === 'essay' ? '사적인 결' : '정서적 여운'}을 더 살리기 위해 감정의 진폭과 장면의 온도를 조금 더 선명하게 다듬었습니다.`
  }

  if (lowered.includes('확장')) {
    return `${base}\n\n추가 설명: 이 부분을 더 구체적으로 풀어 쓰면 독자가 맥락과 의도를 더 쉽게 따라올 수 있습니다.`
  }

  if (lowered.includes('축소')) {
    return base
      .split('\n')
      .slice(0, Math.max(1, Math.ceil(base.split('\n').length / 2)))
      .join('\n')
  }

  if (lowered.includes('격식')) {
    return normalizeContentForTone(base, 'formal')
  }

  if (lowered.includes('캐주얼')) {
    return normalizeContentForTone(base, 'casual')
  }

  if (lowered.includes('객관')) {
    return normalizeContentForTone(base, 'objective')
  }

  return `${base}\n\nAI 수정 메모: "${instruction}" 요청을 반영해 표현을 더 선명하고 읽기 쉽게 다듬었습니다.`
}

function createSelectionRevision(
  content: string,
  selection: SelectionState,
  action: string,
  tone?: string,
) {
  const before = content.slice(0, selection.start)
  const after = content.slice(selection.end)
  let replacement = selection.text

  switch (action) {
    case 'expand':
      replacement = `${selection.text} 이 장면의 배경과 맥락, 그리고 독자가 얻을 수 있는 의미까지 한층 더 자세히 풀어 설명합니다.`
      break
    case 'condense':
      replacement = selection.text.split(/[.?!]/)[0]?.trim() || selection.text
      break
    case 'changeTone':
      replacement = normalizeContentForTone(selection.text, tone || 'formal')
      break
    default:
      replacement = `${selection.text} [AI가 이 부분을 더 자연스럽게 다듬었습니다.]`
      break
  }

  return `${before}${replacement}${after}`
}

function createVersionLabel(index: number) {
  return `v${index}`
}

function DiffView({
  original,
  revised,
}: {
  original: string
  revised: string
}) {
  if (original === revised) {
    return null
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">이전</p>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-red-700 line-through">
          {original}
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-600">수정안</p>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-green-800">
          {revised}
        </div>
      </div>
    </div>
  )
}

export default function ChapterEditor({
  chapter,
  genre,
  onUpdate,
}: ChapterEditorProps) {
  const versionCounter = useRef(1)
  const [mode, setMode] = useState<EditorMode>('read')
  const [draftContent, setDraftContent] = useState(chapter.content)
  const [aiPrompt, setAiPrompt] = useState('')
  const [selection, setSelection] = useState<SelectionState | null>(null)
  const [showToneMenu, setShowToneMenu] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [proposedContent, setProposedContent] = useState<string | null>(null)
  const [streamedContent, setStreamedContent] = useState('')
  const [versions, setVersions] = useState<ChapterVersion[]>([
    {
      id: 'version-1',
      label: createVersionLabel(1),
      chapter,
    },
  ])

  const getNextVersionId = () => {
    versionCounter.current += 1
    return `version-${versionCounter.current}`
  }

  const currentWordCount = useMemo(() => countWords(draftContent), [draftContent])
  const displayContent = proposedContent ? streamedContent || proposedContent : draftContent

  const pushVersion = (nextChapter: ChapterDraft) => {
    setVersions((current) =>
      [
        {
          id: getNextVersionId(),
          label: createVersionLabel(1),
          chapter: nextChapter,
        },
        ...current.map((item, index) => ({
          ...item,
          label: createVersionLabel(index + 2),
        })),
      ].slice(0, 5),
    )
  }

  const handleSave = () => {
    const updated = createUpdatedChapter(chapter, draftContent)
    onUpdate(updated)
    pushVersion(updated)
    setMode('read')
  }

  const streamProposal = async (content: string) => {
    setIsGenerating(true)
    setProposedContent(content)
    setStreamedContent('')

    const chunks = content.match(/.{1,90}/g) || [content]
    let built = ''

    for (const chunk of chunks) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 40)
      })
      built += chunk
      setStreamedContent(built)
    }

    setIsGenerating(false)
  }

  const handleAiRequest = async () => {
    if (!aiPrompt.trim() || isGenerating) {
      return
    }

    try {
      const revised = await writerAgent.reviseWithInstruction(draftContent, aiPrompt, genre)
      await streamProposal(revised)
    } catch (error) {
      console.error('AI revision failed:', error)
      const fallback = createAiRevision(draftContent, aiPrompt, genre)
      await streamProposal(fallback)
    }
  }

  const handleSelectionAction = async (
    action: 'ai' | 'expand' | 'condense' | 'changeTone',
    tone?: 'formal' | 'casual' | 'emotional' | 'objective',
  ) => {
    if (!selection || isGenerating) {
      return
    }

    setShowToneMenu(false)

    try {
      let revisedSelection: string

      if (action === 'expand') {
        revisedSelection = await writerAgent.expandSelection(selection.text, genre)
      } else if (action === 'condense') {
        revisedSelection = await writerAgent.condenseSelection(selection.text, genre)
      } else if (action === 'changeTone') {
        const toneLabel = tone === 'formal' ? '격식체' : tone === 'casual' ? '캐주얼' : tone === 'emotional' ? '감성적' : '객관적'
        revisedSelection = await writerAgent.changeTone(selection.text, toneLabel, genre)
      } else {
        revisedSelection = await writerAgent.reviseWithInstruction(selection.text, '더 자연스럽고 매력적으로 다듬어줘', genre)
      }

      const before = draftContent.slice(0, selection.start)
      const after = draftContent.slice(selection.end)
      await streamProposal(`${before}${revisedSelection}${after}`)
    } catch (error) {
      console.error('Selection action failed:', error)
      const fallback = createSelectionRevision(draftContent, selection, action === 'ai' ? 'ai' : action, tone)
      await streamProposal(fallback)
    }
  }

  const handleApplyProposal = () => {
    if (!proposedContent) {
      return
    }

    const updated = createUpdatedChapter(chapter, proposedContent)
    setDraftContent(proposedContent)
    setProposedContent(null)
    setStreamedContent('')
    setAiPrompt('')
    setSelection(null)
    onUpdate(updated)
    pushVersion(updated)
  }

  const handleKeepOriginal = () => {
    setProposedContent(null)
    setStreamedContent('')
    setAiPrompt('')
    setSelection(null)
    setShowToneMenu(false)
  }

  const handleSelectionChange = (
    event: React.SyntheticEvent<HTMLTextAreaElement>,
  ) => {
    const target = event.currentTarget
    const start = target.selectionStart
    const end = target.selectionEnd
    const text = target.value.slice(start, end)

    if (!text.trim()) {
      setSelection(null)
      setShowToneMenu(false)
      return
    }

    setSelection({ start, end, text })
  }

  const restoreVersion = (version: ChapterVersion) => {
    setDraftContent(version.chapter.content)
    onUpdate(version.chapter)
    pushVersion(version.chapter)
    setMode('read')
    setProposedContent(null)
    setStreamedContent('')
  }

  return (
    <section className="rounded-[32px] border border-stone-200 bg-[#fffdfa] p-6 shadow-[0_12px_30px_rgba(120,113,108,0.10)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">
            {chapter.chapterNumber}장 · {chapter.title}
          </h3>
          <p className="mt-1 text-sm text-stone-500">글자 수: {currentWordCount}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['read', 'edit', 'ai'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMode(tab)}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold ${
                mode === tab
                  ? 'bg-amber-700 text-amber-50'
                  : 'border border-stone-200 bg-[#f7efe3] text-stone-700'
              }`}
            >
              {tab === 'read' ? '읽기' : tab === 'edit' ? '편집' : 'AI 수정'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-6">
        {mode === 'read' ? (
          <div className="min-h-[420px] whitespace-pre-wrap rounded-[28px] border border-stone-200 bg-[#f8f2ea] p-6 font-serif text-[15px] leading-8 text-stone-700">
            {draftContent}
          </div>
        ) : (
          <div className="relative">
            <textarea
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              onSelect={handleSelectionChange}
              onMouseUp={handleSelectionChange}
              className="min-h-[420px] w-full resize-y rounded-[28px] border border-stone-300 bg-[#fffdfa] p-6 font-serif text-[15px] leading-8 text-stone-700 outline-none transition focus:border-amber-500"
            />

            {selection ? (
              <div className="absolute right-4 top-4 z-10 flex flex-nowrap gap-2 rounded-2xl border border-stone-200 bg-[#fffdfa] p-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => void handleSelectionAction('ai')}
                  className="rounded-xl border border-stone-200 bg-[#f7efe3] px-3 py-1 text-sm text-stone-700"
                >
                  AI로 수정
                </button>
                <button
                  type="button"
                  onClick={() => void handleSelectionAction('expand')}
                  className="rounded-xl border border-stone-200 bg-[#f7efe3] px-3 py-1 text-sm text-stone-700"
                >
                  확장
                </button>
                <button
                  type="button"
                  onClick={() => void handleSelectionAction('condense')}
                  className="rounded-xl border border-stone-200 bg-[#f7efe3] px-3 py-1 text-sm text-stone-700"
                >
                  축소
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowToneMenu((current) => !current)}
                    className="rounded-xl border border-stone-200 bg-[#f7efe3] px-3 py-1 text-sm text-stone-700"
                  >
                    톤 변경
                  </button>

                  {showToneMenu ? (
                    <div className="absolute right-0 top-10 w-44 rounded-2xl border border-stone-200 bg-[#fffdfa] p-2 shadow-xl">
                      {[
                        ['formal', '더 격식체'],
                        ['casual', '더 캐주얼'],
                        ['emotional', '더 감성적'],
                        ['objective', '더 객관적'],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            void handleSelectionAction(
                              'changeTone',
                              value as 'formal' | 'casual' | 'emotional' | 'objective',
                            )
                          }
                          className="block w-full whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {mode === 'edit' ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm text-stone-500">실시간 글자 수: {currentWordCount}</span>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-semibold text-amber-50"
          >
            저장
          </button>
        </div>
      ) : null}

      {mode === 'ai' ? (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              placeholder="AI에게 수정 요청: 예) '2문단을 더 감성적으로 바꿔줘'"
              className="flex-1 rounded-2xl border border-stone-300 bg-[#f8f2ea] p-3 text-sm text-stone-700 outline-none transition focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => void handleAiRequest()}
              disabled={isGenerating || !aiPrompt.trim()}
              className="rounded-2xl bg-amber-700 px-4 py-3 text-sm font-semibold text-amber-50 disabled:bg-amber-300"
            >
              {isGenerating ? '수정 중...' : '수정 요청 📤'}
            </button>
          </div>

          {proposedContent ? (
            <div className="space-y-4 rounded-[28px] border border-stone-200 bg-[#f8f2ea] p-4">
              <p className="text-sm font-semibold text-stone-900">AI 수정 결과</p>
              <DiffView original={draftContent} revised={displayContent} />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleApplyProposal}
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  수정본 적용
                </button>
                <button
                  type="button"
                  onClick={handleKeepOriginal}
                  className="rounded-2xl border border-stone-200 bg-[#fffdfa] px-4 py-2 text-sm font-semibold text-stone-700"
                >
                  원본 유지
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 rounded-[28px] border border-stone-200 bg-[#f8f2ea] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-stone-900">버전 히스토리</p>
          <span className="text-xs text-stone-500">최근 5개 버전</span>
        </div>
        <div className="mt-4 space-y-2">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className="flex items-center justify-between rounded-2xl bg-[#fffdfa] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-stone-900">
                  {version.label} {index === 0 ? '(현재 기준)' : ''}
                </p>
                <p className="text-xs text-stone-500">
                  글자 수 {version.chapter.wordCount} · 수정본 {version.chapter.revision ?? 0}
                </p>
              </div>
              {index > 0 ? (
                <button
                  type="button"
                  onClick={() => restoreVersion(version)}
                  className="rounded-2xl border border-stone-200 bg-[#f7efe3] px-3 py-2 text-xs font-semibold text-stone-700"
                >
                  이전 버전
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
