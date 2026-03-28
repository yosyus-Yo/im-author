import type { StoredBook } from '../lib/bookStorage'
import type { BookProject } from '../types/agent'

interface LibraryHubProps {
  currentProject: BookProject
  myBooks: StoredBook[]
  publishedBooks: StoredBook[]
  selectedBook: StoredBook | null
  isBusy: boolean
  onSelectBook: (bookId: string) => Promise<void>
  onRefresh: () => Promise<void>
  onSaveCurrent: () => Promise<void>
  onPublishCurrent: () => Promise<void>
}

function StatusChip({
  label,
  tone,
}: {
  label: string
  tone: 'green' | 'yellow' | 'gray'
}) {
  const toneClass =
    tone === 'green'
      ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
      : tone === 'yellow'
        ? 'border border-amber-200 bg-amber-100 text-amber-800'
        : 'border border-stone-200 bg-stone-100 text-stone-600'

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>{label}</span>
}

function BookCard({
  book,
  actionLabel,
  onClick,
}: {
  book: StoredBook
  actionLabel: string
  onClick: () => void
}) {
  return (
    <article className="rounded-[28px] border border-stone-200 bg-[#fffdfa] p-4 shadow-[0_10px_24px_rgba(120,113,108,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-stone-900">{book.title}</h4>
          <p className="mt-1 text-sm text-stone-500">{book.subtitle || '부제 없음'}</p>
        </div>
        <StatusChip
          label={book.is_published ? '공개됨' : '비공개'}
          tone={book.is_published ? 'green' : 'gray'}
        />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
        {book.publication?.metadata.description || book.synopsis?.synopsis || book.topic}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-stone-500">
          점수 {book.score ? `${book.score.toFixed(1)}/10` : '미집계'}
        </span>
        <button
          type="button"
          onClick={onClick}
          className="rounded-2xl border border-stone-200 bg-[#f7efe3] px-3 py-2 text-sm font-semibold text-stone-700"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  )
}

export default function LibraryHub({
  currentProject,
  myBooks,
  publishedBooks,
  selectedBook,
  isBusy,
  onSelectBook,
  onRefresh,
  onSaveCurrent,
  onPublishCurrent,
}: LibraryHubProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_1.15fr_1.4fr]">
      <div className="rounded-[32px] border border-stone-200 bg-[#fbf7f1] p-5 shadow-[0_18px_44px_rgba(120,113,108,0.14)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">내 서재</h3>
            <p className="mt-1 text-sm text-stone-500">저장한 책과 현재 작업본을 서재 카드로 관리해</p>
          </div>
          <button
            type="button"
            onClick={() => void onRefresh()}
            className="rounded-2xl border border-stone-200 bg-[#fffdfa] px-3 py-2 text-sm font-semibold text-stone-700"
          >
            새로고침
          </button>
        </div>

        <div className="mt-5 rounded-[28px] border border-amber-200 bg-amber-100/70 p-4">
          <h4 className="font-semibold text-amber-950">
            현재 프로젝트: {currentProject.outline?.title || currentProject.topic || '미작성'}
          </h4>
          <p className="mt-2 text-sm text-amber-900">
            챕터 {currentProject.chapters.length}개 · 현재 단계 {currentProject.currentPhase}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onSaveCurrent()}
              disabled={isBusy || !currentProject.topic}
              className="rounded-2xl bg-stone-900 px-3 py-2 text-sm font-semibold text-amber-50 disabled:bg-stone-400"
            >
              현재 책 저장
            </button>
            <button
              type="button"
              onClick={() => void onPublishCurrent()}
              disabled={isBusy || !currentProject.topic}
              className="rounded-2xl border border-amber-300 bg-[#fffdfa] px-3 py-2 text-sm font-semibold text-amber-900 disabled:text-amber-400"
            >
              커뮤니티에 공개
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {myBooks.length > 0 ? (
            myBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                actionLabel="열기"
                onClick={() => void onSelectBook(book.id)}
              />
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-stone-300 bg-[#f7efe3] px-4 py-10 text-center text-sm text-stone-500">
              저장된 책이 아직 없어
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[32px] border border-stone-200 bg-[#fbf7f1] p-5 shadow-[0_18px_44px_rgba(120,113,108,0.14)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">커뮤니티</h3>
            <p className="mt-1 text-sm text-stone-500">공개된 책을 둘러보고 작가의 결과물을 읽어</p>
          </div>
          <StatusChip
            label={`${publishedBooks.length}권`}
            tone={publishedBooks.length > 0 ? 'green' : 'yellow'}
          />
        </div>

        <div className="mt-5 space-y-3">
          {publishedBooks.length > 0 ? (
            publishedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                actionLabel="뷰어 열기"
                onClick={() => void onSelectBook(book.id)}
              />
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-stone-300 bg-[#f7efe3] px-4 py-10 text-center text-sm text-stone-500">
              공개된 책이 아직 없어
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[32px] border border-stone-200 bg-[#fbf7f1] p-5 shadow-[0_18px_44px_rgba(120,113,108,0.14)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">웹 뷰어</h3>
            <p className="mt-1 text-sm text-stone-500">선택한 책을 종이책 프리뷰 느낌으로 보여줘</p>
          </div>
          {selectedBook ? (
            <StatusChip
              label={selectedBook.is_published ? '공개 뷰' : '내부 뷰'}
              tone={selectedBook.is_published ? 'green' : 'gray'}
            />
          ) : null}
        </div>

        {selectedBook ? (
          <div className="mt-5 overflow-hidden rounded-[28px] border border-stone-200 bg-[#f7efe3]">
            <div
              className="px-6 py-8 text-white"
              style={{
                backgroundColor:
                  selectedBook.publication?.coverDesign.primaryColor || '#2563EB',
              }}
            >
              <p className="text-sm opacity-90">{selectedBook.genre}</p>
              <h4 className="mt-2 text-2xl font-bold">{selectedBook.title}</h4>
              <p className="mt-2 text-sm opacity-90">{selectedBook.subtitle}</p>
            </div>

            <div className="space-y-6 px-6 py-6">
              <section>
                <h5 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  소개
                </h5>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-stone-700">
                  {selectedBook.publication?.metadata.description ||
                    selectedBook.synopsis?.synopsis ||
                    selectedBook.topic}
                </p>
              </section>

              <section>
                <h5 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  목차
                </h5>
                <div className="mt-3 space-y-3">
                  {selectedBook.outline?.chapters.map((chapter) => (
                    <div key={chapter.number} className="rounded-2xl bg-[#fffdfa] p-4">
                      <p className="font-semibold text-stone-900">
                        {chapter.number}. {chapter.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{chapter.summary}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h5 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  본문 미리보기
                </h5>
                <div className="mt-3 space-y-4">
                  {selectedBook.chapters.map((chapter) => (
                    <article key={chapter.chapterNumber} className="rounded-2xl bg-[#fffdfa] p-4">
                      <p className="font-semibold text-stone-900">
                        {chapter.chapterNumber}장 · {chapter.title}
                      </p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-stone-700">
                        {chapter.content}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[28px] border border-dashed border-stone-300 bg-[#f7efe3] px-4 py-16 text-center text-sm text-stone-500">
            서재나 커뮤니티에서 책을 선택하면 웹 뷰어가 열려
          </div>
        )}
      </div>
    </section>
  )
}
