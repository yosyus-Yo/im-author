import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBookAgent } from '../hooks/useBookAgent'
import AgentChat from '../components/AgentChat'
import BookPreview from '../components/BookPreview'
import { writerAgent } from '../lib/agents'
import { saveBook, type StoredBook } from '../lib/bookStorage'
import { exportAsMarkdown, exportAsPDF, exportAsEPUB } from '../lib/exportBook'
import { GENRE_OPTIONS, type BookGenre } from '../types/agent'

export default function CreationWorkspace() {
  const { project, messages, isRunning, error, startPipeline, reset } = useBookAgent()

  const [topic, setTopic] = useState('')
  const [genre, setGenre] = useState<BookGenre>(GENRE_OPTIONS[0].value)
  const [isFeedbackProcessing, setIsFeedbackProcessing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [savedBookId, setSavedBookId] = useState<string | null>(null)
  const [savedBook, setSavedBook] = useState<StoredBook | null>(null)
  const prevPhaseRef = useRef(project.currentPhase)

  // 파이프라인 완료 시 자동 저장
  useEffect(() => {
    if (prevPhaseRef.current !== 'complete' && project.currentPhase === 'complete' && project.chapters.length > 0) {
      saveBook(project, savedBookId || undefined)
        .then((stored) => {
          setSavedBookId(stored.id)
          setSavedBook(stored)
          showToast('책이 자동 저장되었습니다')
        })
        .catch((err) => {
          console.error('Auto-save failed:', err)
        })
    }
    prevPhaseRef.current = project.currentPhase
  }, [project.currentPhase, project.chapters.length, savedBookId, project])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2500)
  }

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setSavedBookId(null)
    setSavedBook(null)
    startPipeline(topic, genre)
  }

  const handleFeedback = async (instruction: string) => {
    const latestChapter = project.chapters[project.chapters.length - 1]
    if (!latestChapter) return

    setIsFeedbackProcessing(true)
    try {
      const revised = await writerAgent.reviseWithInstruction(
        latestChapter.content,
        instruction,
        genre,
      )
      console.log('Feedback applied, revised length:', revised.length)
    } catch (err) {
      console.error('Feedback processing failed:', err)
    } finally {
      setIsFeedbackProcessing(false)
    }
  }

  const getExportableBook = (): StoredBook => {
    if (savedBook) return savedBook
    return {
      id: savedBookId || crypto.randomUUID(),
      user_id: 'local',
      genre: genre,
      topic: project.topic,
      title: project.publication?.metadata.title || project.outline?.title || project.topic || 'Untitled',
      subtitle: project.publication?.metadata.subtitle || project.outline?.subtitle || '',
      synopsis: project.synopsis,
      outline: project.outline,
      chapters: project.chapters,
      publication: project.publication,
      score: project.reviews[project.reviews.length - 1]?.score.overall || 0,
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  const handleExportMD = () => {
    exportAsMarkdown(getExportableBook())
    setShowExportMenu(false)
    showToast('Markdown 파일이 다운로드되었습니다')
  }

  const handleExportPDF = () => {
    exportAsPDF(getExportableBook())
    setShowExportMenu(false)
    showToast('PDF 파일이 다운로드되었습니다')
  }

  const handleExportEPUB = async () => {
    await exportAsEPUB(getExportableBook())
    setShowExportMenu(false)
    showToast('EPUB 파일이 다운로드되었습니다')
  }

  const handleShare = async () => {
    const title = project.publication?.metadata.title || project.outline?.title || 'Untitled'
    const subtitle = project.outline?.subtitle || ''
    const totalWords = project.chapters.reduce((sum, ch) => sum + ch.wordCount, 0)

    const summary = [
      `Title: ${title}`,
      subtitle ? `Subtitle: ${subtitle}` : null,
      `Genre: ${genre}`,
      `Chapters: ${project.chapters.length}`,
      `Words: ${totalWords.toLocaleString()}`,
      '',
      "Created with I'm Author - AI Book Agent",
    ].filter((line) => line !== null).join('\n')

    try {
      await navigator.clipboard.writeText(summary)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = summary
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    showToast('Summary copied to clipboard')
  }

  const handleSaveAndPublish = async () => {
    try {
      const stored = await saveBook(project, savedBookId || undefined)
      setSavedBookId(stored.id)
      setSavedBook(stored)
      showToast('책이 저장되었습니다')
    } catch (err) {
      console.error('Save failed:', err)
      showToast('저장 실패: 로그인이 필요합니다')
    }
  }

  return (
    <div className="bg-[#f5efe6] font-body text-on-surface min-h-screen flex flex-col h-screen overflow-hidden">
      {toast && (
        <div className="fixed top-4 right-4 z-[100] rounded-2xl border border-stone-200 bg-stone-900 px-4 py-2.5 text-sm font-medium text-amber-50 shadow-xl">
          {toast}
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 shadow-xl max-w-lg truncate">
          {error}
        </div>
      )}

      <header className="bg-[#fdf9f3]/80 backdrop-blur-md border-b border-stone-200/50 px-6 py-3 flex items-center justify-between shrink-0 z-50 relative overflow-hidden">
        <div className="flex items-center gap-6">
          <Link to="/app" className="text-xl font-bold font-serif text-stone-900">
            I'm Author
          </Link>
          <div className="h-4 w-[1px] bg-stone-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Workspace
            </span>
            <span className="text-stone-400">/</span>
            <span className="text-sm font-medium text-stone-700 truncate max-w-[200px]">
              {project.outline?.title || 'Untitled Draft'}
            </span>
          </div>
        </div>

        <form onSubmit={handleStart} className="flex-1 max-w-2xl mx-auto px-8 flex items-center gap-3">
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as BookGenre)}
            disabled={isRunning}
            className="h-9 w-[120px] shrink-0 rounded border border-stone-300 bg-[#f8f2ea] px-3 text-sm font-medium text-stone-700 outline-none focus:border-amber-500"
          >
            {GENRE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isRunning}
            placeholder="What will you write about today?"
            className="h-9 flex-1 rounded border border-stone-300 bg-white px-3 text-sm text-stone-700 outline-none focus:border-amber-500 placeholder:text-stone-400"
          />
          <button
            type="submit"
            disabled={isRunning || !topic.trim()}
            className="h-9 px-4 rounded bg-stone-900 text-amber-50 text-sm font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {isRunning ? 'Writing...' : 'Start Draft'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <button
            onClick={() => void handleShare()}
            disabled={project.chapters.length === 0}
            className="text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded border border-stone-300 bg-white text-sm font-medium transition-colors disabled:opacity-40"
          >
            Share
          </button>

          <button
            onClick={() => void handleSaveAndPublish()}
            disabled={project.chapters.length === 0}
            className="text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded border border-stone-300 bg-white text-sm font-medium transition-colors disabled:opacity-40"
          >
            Save
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              disabled={project.chapters.length === 0}
              className="text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded border border-stone-300 bg-white text-sm font-medium transition-colors disabled:opacity-40"
            >
              Export ▾
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-10 w-44 rounded-2xl border border-stone-200 bg-[#fffdfa] p-2 shadow-xl z-50">
                <button onClick={handleExportMD} className="block w-full whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100">
                  Markdown (.md)
                </button>
                <button onClick={handleExportPDF} className="block w-full whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100">
                  PDF (.pdf)
                </button>
                <button onClick={() => void handleExportEPUB()} className="block w-full whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100">
                  EPUB (.epub)
                </button>
              </div>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center overflow-hidden ml-1">
            <span className="text-xs">👤</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-stone-200/50 bg-[#fbf7f1] flex flex-col shrink-0">
          <div className="p-4 border-b border-stone-200/50 bg-[#f8f2ea]">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">
              Agent Log
            </h2>
            <p className="text-[11px] text-stone-400">Real-time writing process</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AgentChat messages={messages} isRunning={isRunning} />
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#f5efe6] relative">
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
            <div className="max-w-3xl mx-auto">
              <BookPreview
                project={project}
                onReset={reset}
                onFeedbackSubmit={handleFeedback}
                isFeedbackProcessing={isFeedbackProcessing}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
