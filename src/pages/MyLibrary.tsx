import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getMyBooks, type StoredBook } from '../lib/bookStorage'

export default function MyLibrary() {
  const [books, setBooks] = useState<StoredBook[]>([])

  useEffect(() => {
    getMyBooks().then(setBooks)
  }, [])

  return (
    <div className="font-body selection:bg-secondary-fixed min-h-screen bg-[#f5efe6] text-[#1c1917]">
      <nav className="flex justify-between items-center w-full px-8 py-4 sticky top-0 bg-[#fdf9f3]/80 backdrop-blur-md text-stone-800 font-serif tracking-tight leading-relaxed docked full-width z-50 no-border bg-stone-100/50">
        <div className="flex items-center gap-8">
          <Link to="/app" className="text-2xl font-bold font-serif text-stone-900">
            I'm Author
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link
              to="/app/write"
              className="text-stone-600 hover:text-stone-900 transition-colors duration-300"
            >
              Write
            </Link>
            <Link
              to="/app/library"
              className="text-amber-700 font-semibold border-b-2 border-amber-700 pb-1"
            >
              Library
            </Link>
            <Link
              to="/app/community"
              className="text-stone-600 hover:text-stone-900 transition-colors duration-300"
            >
              Community
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center bg-surface-container-highest px-3 py-1.5 rounded-md gap-2">
            <span className="text-stone-500 text-sm">🔍</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm p-0 w-48"
              placeholder="Search manuscripts..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-stone-600 cursor-pointer hover:text-amber-700 transition-colors">
              🔔
            </span>
            <span className="text-stone-600 cursor-pointer hover:text-amber-700 transition-colors">
              ⚙️
            </span>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 bg-white flex items-center justify-center">
              👤
            </div>
          </div>
        </div>
      </nav>
      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 h-full pt-20 pb-8 flex flex-col px-4 bg-[#f3ede4] text-stone-800 font-sans text-sm tracking-wide w-64 border-r-0 tonal-shift bg-stone-200/40 z-40 hidden md:flex">
          <div className="mb-8 px-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-6 h-6 rounded bg-primary-container flex items-center justify-center">
                <span className="text-[14px] text-white">📖</span>
              </div>
              <span className="font-bold text-stone-900 uppercase tracking-tighter">
                Current Workspace
              </span>
            </div>
            <p className="text-xs text-stone-500 ml-9">The Great Novel</p>
          </div>
          <nav className="flex-1 space-y-1">
            <a
              className="flex items-center gap-3 px-4 py-2.5 bg-stone-200/20 text-stone-500 hover:bg-white/50 rounded-md transition-all duration-200"
              href="#"
            >
              <span>📄</span>
              <span>Manuscripts</span>
            </a>
            <a
              className="flex items-center gap-3 px-4 py-2.5 bg-stone-200/20 text-stone-500 hover:bg-white/50 rounded-md transition-all duration-200"
              href="#"
            >
              <span>📑</span>
              <span>Chapters</span>
            </a>
          </nav>
        </aside>

        <main className="flex-1 md:ml-64 p-8 lg:p-12">
          <header className="mb-12">
            <h1 className="text-4xl font-bold font-serif text-stone-900 tracking-tight">
              My Library
            </h1>
            <p className="text-stone-500 mt-2 font-serif italic text-lg">
              A collection of your thoughts, drafts, and published works.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Link
              to="/app/write"
              className="group flex flex-col items-center justify-center h-72 rounded-lg border-2 border-dashed border-stone-300 bg-stone-100/50 hover:bg-stone-100 hover:border-amber-600/50 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-4">
                <span className="text-amber-700">➕</span>
              </div>
              <span className="font-bold text-stone-600 group-hover:text-amber-800 uppercase tracking-widest text-sm">
                New Manuscript
              </span>
            </Link>

            {books.map((book) => (
              <article
                key={book.id}
                className="bg-[#fbf7f1] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-stone-200/60 relative group"
              >
                <div className="absolute top-4 right-4">
                  <button className="text-stone-400 hover:text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm">⋮</span>
                  </button>
                </div>
                <div className="mb-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-stone-200/50 text-stone-600`}
                  >
                    {book.genre}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-900 mb-1 leading-tight line-clamp-2">
                  {book.title || 'Untitled Project'}
                </h3>
                <p className="text-stone-500 text-xs mb-6 font-medium">
                  {new Date(book.created_at).toLocaleDateString()}
                </p>
                <p className="text-stone-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                  {book.topic || 'No description available'}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-200/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      {book.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <Link
                    to={book.is_published ? `/app/reader/${book.id}` : `/app/write`}
                    className="text-amber-700 font-bold text-sm hover:text-amber-900 transition-colors"
                  >
                    {book.is_published ? 'Read' : 'Continue'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
