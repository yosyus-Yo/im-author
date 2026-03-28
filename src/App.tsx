import { useCallback, useEffect, useRef, useState } from 'react'
import AgentChat from './components/AgentChat'
import AuthButton from './components/AuthButton'
import BookPreview from './components/BookPreview'
import DesignShowcase from './components/DesignShowcase'
import LibraryHub from './components/LibraryHub'
import {
  getBookById,
  getMyBooks,
  getPublishedBooks,
  publishBook,
  saveBook,
  type StoredBook,
} from './lib/bookStorage'
import { useAuth } from './hooks/useAuth'
import { useBookAgent } from './hooks/useBookAgent'
import type { BookGenre } from './types/agent'

const GENRE_OPTIONS: Array<{ value: BookGenre; label: string }> = [
  { value: 'nonfiction', label: '논픽션' },
  { value: 'fantasy', label: '판타지' },
  { value: 'romance', label: '로맨스' },
  { value: 'webnovel', label: '웹소설' },
  { value: 'essay', label: '수필/에세이' },
  { value: 'autobiography', label: '자서전' },
  { value: 'mystery', label: '미스터리' },
  { value: 'sf', label: 'SF' },
]

function App() {
  const { project, messages, isRunning, startPipeline, reset } = useBookAgent()
  const { user, isLoading: isAuthLoading, signIn, signOut, authModeLabel } = useAuth()
  const [topic, setTopic] = useState('')
  const [genre, setGenre] = useState<BookGenre>('nonfiction')
  const [inputError, setInputError] = useState('')
  const [isFeedbackProcessing, setIsFeedbackProcessing] = useState(false)
  const [feedbackNotice, setFeedbackNotice] = useState('')
  const [storageNotice, setStorageNotice] = useState('')
  const [isShelfBusy, setIsShelfBusy] = useState(false)
  const [myBooks, setMyBooks] = useState<StoredBook[]>([])
  const [publishedBooks, setPublishedBooks] = useState<StoredBook[]>([])
  const [selectedBook, setSelectedBook] = useState<StoredBook | null>(null)
  const librarySectionRef = useRef<HTMLElement | null>(null)

  const refreshBooks = useCallback(async () => {
    setIsShelfBusy(true)

    try {
      const [nextMyBooks, nextPublishedBooks] = await Promise.all([
        getMyBooks(),
        getPublishedBooks(),
      ])

      setMyBooks(nextMyBooks)
      setPublishedBooks(nextPublishedBooks)
      setSelectedBook((current) => {
        if (!current) {
          return nextPublishedBooks[0] || nextMyBooks[0] || null
        }

        return (
          nextMyBooks.find((book) => book.id === current.id) ||
          nextPublishedBooks.find((book) => book.id === current.id) ||
          current
        )
      })
    } finally {
      setIsShelfBusy(false)
    }
  }, [])

  useEffect(() => {
    void refreshBooks()
  }, [refreshBooks, user])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTopic = topic.trim()

    if (!trimmedTopic) {
      setInputError('주제를 먼저 입력해주세요.')
      return
    }

    setInputError('')

    try {
      await startPipeline(trimmedTopic, genre)
    } catch (error) {
      setInputError(
        error instanceof Error
          ? error.message
          : '파이프라인 실행 중 오류가 발생했습니다.',
      )
    }
  }

  const handleReset = () => {
    reset()
    setTopic('')
    setGenre('nonfiction')
    setInputError('')
    setFeedbackNotice('')
    setStorageNotice('')
  }

  const handleFeedbackSubmit = async (instruction: string) => {
    setIsFeedbackProcessing(true)
    setFeedbackNotice('')

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 500)
      })
      setFeedbackNotice(`사용자 피드백 저장됨: ${instruction}`)
    } finally {
      setIsFeedbackProcessing(false)
    }
  }

  const handleOpenLibrary = () => {
    librarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSelectBook = async (bookId: string) => {
    setIsShelfBusy(true)
    setStorageNotice('')

    try {
      const book = await getBookById(bookId)

      if (book) {
        setSelectedBook(book)
      }
    } finally {
      setIsShelfBusy(false)
    }
  }

  const handleSaveCurrent = async () => {
    setIsShelfBusy(true)
    setStorageNotice('')

    try {
      const existingBookId =
        selectedBook && selectedBook.user_id === user?.id ? selectedBook.id : undefined
      const savedBook = await saveBook(project, existingBookId)
      setSelectedBook(savedBook)
      setStorageNotice('현재 프로젝트를 저장했어.')
      await refreshBooks()
    } catch (error) {
      setStorageNotice(
        error instanceof Error ? error.message : '책 저장 중 오류가 발생했어.',
      )
    } finally {
      setIsShelfBusy(false)
    }
  }

  const handlePublishCurrent = async () => {
    setIsShelfBusy(true)
    setStorageNotice('')

    try {
      const existingBookId =
        selectedBook && selectedBook.user_id === user?.id ? selectedBook.id : undefined
      const savedBook = await saveBook(project, existingBookId)
      const publishedBook = await publishBook(savedBook.id)

      if (publishedBook) {
        setSelectedBook(publishedBook)
      }

      setStorageNotice('현재 책을 커뮤니티에 공개했어.')
      await refreshBooks()
    } catch (error) {
      setStorageNotice(
        error instanceof Error ? error.message : '책 공개 중 오류가 발생했어.',
      )
    } finally {
      setIsShelfBusy(false)
    }
  }

  const handleSignIn = async () => {
    setStorageNotice('')

    try {
      await signIn()
      setStorageNotice('로그인에 성공했어.')
    } catch (error) {
      setStorageNotice(
        error instanceof Error ? error.message : '로그인 중 오류가 발생했어.',
      )
    }
  }

  const handleSignOut = async () => {
    setStorageNotice('')

    try {
      await signOut()
      setSelectedBook(null)
      setStorageNotice('로그아웃했어.')
      await refreshBooks()
    } catch (error) {
      setStorageNotice(
        error instanceof Error ? error.message : '로그아웃 중 오류가 발생했어.',
      )
    }
  }

  return (
    <main className="min-h-screen bg-[#f5efe6] bg-[radial-gradient(circle_at_top,_rgba(245,228,188,0.35),_transparent_40%),linear-gradient(180deg,_#f8f3ec_0%,_#efe4d3_100%)] px-4 py-6 text-stone-900 md:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-[32px] border border-stone-200 bg-[#fbf7f1] p-6 shadow-[0_24px_60px_rgba(120,113,108,0.16)]">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-amber-200 bg-amber-100/80 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-amber-900">
              CLASSIC TYPEWRITER
            </span>
            <span className="rounded-full border border-stone-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-stone-600">
              작가가 원고에 몰입하는 서재형 인터페이스
            </span>
          </div>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-amber-200 bg-amber-100 text-2xl shadow-sm">
                  📚
                </div>
                <div>
                  <h1 className="text-xl font-bold text-stone-900 md:text-3xl">
                    AI Book Agent
                  </h1>
                  <p className="mt-1 text-sm text-stone-600">
                    작가 몰입형 멀티에이전트 출판 시스템
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-3 xl:max-w-3xl xl:flex-row xl:items-center"
            >
              <select
                value={genre}
                onChange={(event) => setGenre(event.target.value as BookGenre)}
                disabled={isRunning}
                className="h-12 rounded-2xl border border-stone-300 bg-[#f8f2ea] px-4 text-sm font-medium text-stone-700 outline-none ring-0 transition focus:border-amber-500 lg:w-32"
              >
                {GENRE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                disabled={isRunning}
                placeholder="어떤 주제의 책을 만들까요?"
                className="h-12 flex-1 rounded-2xl border border-stone-300 bg-[#fdf9f4] px-4 text-sm text-stone-700 outline-none transition focus:border-amber-500"
              />

              <button
                type="submit"
                disabled={isRunning}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 text-sm font-semibold text-amber-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {isRunning ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    진행 중
                  </>
                ) : (
                  '시작'
                )}
              </button>
            </form>

            <AuthButton
              user={user}
              isLoading={isAuthLoading}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
              onOpenLibrary={handleOpenLibrary}
              authModeLabel={authModeLabel}
            />
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="rounded-[24px] border border-stone-200 bg-[#f7efe3] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                UX 방향
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                좌측은 에이전트 작업 일지, 우측은 실제 원고와 편집 뷰를 보여줘서 작가가
                서재에서 집필하는 흐름처럼 느끼도록 구성했어.
              </p>
            </div>
            <div className="rounded-[24px] border border-amber-200 bg-amber-100/70 px-5 py-4 text-sm text-amber-900">
              현재 장르 · {GENRE_OPTIONS.find((option) => option.value === genre)?.label}
            </div>
          </div>

          {inputError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {inputError}
            </div>
          ) : null}

          {!inputError && feedbackNotice ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {feedbackNotice}
            </div>
          ) : null}

          {!inputError && storageNotice ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {storageNotice}
            </div>
          ) : null}
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(360px,1.1fr)_minmax(0,1.6fr)]">
          <AgentChat messages={messages} isRunning={isRunning} />
          <BookPreview
            project={project}
            onReset={handleReset}
            onFeedbackSubmit={handleFeedbackSubmit}
            isFeedbackProcessing={isFeedbackProcessing}
          />
        </section>

        <section ref={librarySectionRef}>
          <LibraryHub
            currentProject={project}
            myBooks={myBooks}
            publishedBooks={publishedBooks}
            selectedBook={selectedBook}
            isBusy={isShelfBusy}
            onSelectBook={handleSelectBook}
            onRefresh={refreshBooks}
            onSaveCurrent={handleSaveCurrent}
            onPublishCurrent={handlePublishCurrent}
          />
        </section>

        <DesignShowcase genre={genre} />
      </div>
    </main>
  )
}

export default App
