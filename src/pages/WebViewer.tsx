import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getBookById, type StoredBook } from '../lib/bookStorage'
import { exportAsMarkdown, exportAsPDF, exportAsEPUB } from '../lib/exportBook'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function WebViewer() {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<StoredBook | null>(null)
  const [currentChapter, setCurrentChapter] = useState(0)

  useEffect(() => {
    if (id) {
      getBookById(id).then(setBook)
    }
  }, [id])

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5efe6]">
        Loading...
      </div>
    )
  }

  const chapters = book.chapters || []
  const chapter = chapters[currentChapter]

  return (
    <div className="bg-[#f5efe6] font-body text-on-surface min-h-screen">
      <header className="bg-[#fdf9f3]/80 backdrop-blur-md border-b border-stone-200/50 flex justify-between items-center w-full px-8 py-4 sticky top-0 z-50">
        <Link to="/app/library" className="flex items-center space-x-2 text-stone-500 hover:text-stone-900 transition-colors group">
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
          <span className="font-medium text-sm">Library</span>
        </Link>
        <div className="text-center min-w-0 flex-1 px-4">
          <h1 className="text-xl font-bold font-serif text-stone-900 tracking-tight truncate">
            {book.title || 'Untitled'}
          </h1>
          <p className="text-xs text-stone-500 font-medium tracking-widest uppercase mt-1">
            {book.genre} · {(book.chapters || []).length} chapters
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => exportAsMarkdown(book)} className="text-stone-500 hover:text-amber-700 transition-colors text-sm px-2 py-1 rounded border border-stone-300 bg-white">
            MD
          </button>
          <button onClick={() => exportAsPDF(book)} className="text-stone-500 hover:text-amber-700 transition-colors text-sm px-2 py-1 rounded border border-stone-300 bg-white">
            PDF
          </button>
          <button onClick={() => void exportAsEPUB(book)} className="text-stone-500 hover:text-amber-700 transition-colors text-sm px-2 py-1 rounded border border-stone-300 bg-white">
            EPUB
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <aside className="w-72 bg-[#fbf7f1] border-r border-stone-200/50 overflow-y-auto hidden lg:block">
          <div className="p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">
              Contents
            </h2>
            <nav className="space-y-1">
              {chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentChapter(idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                    currentChapter === idx
                      ? 'bg-stone-200/50 text-stone-900 font-bold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="block text-xs text-stone-400 font-medium mb-1 uppercase tracking-wider">
                    Chapter {idx + 1}
                  </span>
                  <span className="block truncate">{ch.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#fdf9f4]">
          <div className="max-w-3xl mx-auto px-8 py-16 lg:py-24">
            <header className="mb-16 text-center">
              <span className="text-amber-700 font-bold tracking-widest uppercase text-sm mb-4 block">
                Chapter {currentChapter + 1}
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold font-serif text-stone-900 leading-tight">
                {chapter?.title}
              </h2>
            </header>

            <article className="prose prose-stone prose-lg max-w-none font-serif leading-loose text-stone-800">
              <MarkdownRenderer content={chapter?.content || 'No content.'} />
            </article>

            <div className="mt-24 pt-12 border-t border-stone-200/50 flex justify-between items-center">
              <button
                onClick={() => setCurrentChapter((prev) => Math.max(0, prev - 1))}
                disabled={currentChapter === 0}
                className="group flex flex-col items-start disabled:opacity-30 max-w-[45%] min-w-0"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 group-hover:text-amber-700 transition-colors">
                  Previous Chapter
                </span>
                <span className="text-stone-800 font-serif font-bold group-hover:text-stone-600 transition-colors truncate w-full">
                  {currentChapter > 0 ? chapters[currentChapter - 1]?.title : '-'}
                </span>
              </button>

              <button
                onClick={() => setCurrentChapter((prev) => Math.min(chapters.length - 1, prev + 1))}
                disabled={currentChapter === chapters.length - 1}
                className="group flex flex-col items-end text-right disabled:opacity-30 max-w-[45%] min-w-0"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 group-hover:text-amber-700 transition-colors">
                  Next Chapter
                </span>
                <span className="text-stone-800 font-serif font-bold group-hover:text-stone-600 transition-colors truncate w-full">
                  {currentChapter < chapters.length - 1 ? chapters[currentChapter + 1]?.title : '-'}
                </span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
