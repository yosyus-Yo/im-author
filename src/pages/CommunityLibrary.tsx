import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getPublishedBooks, type StoredBook } from '../lib/bookStorage'

export default function CommunityLibrary() {
  const [books, setBooks] = useState<StoredBook[]>([])

  useEffect(() => {
    getPublishedBooks().then(setBooks)
  }, [])

  return (
    <div className="bg-[#f5efe6] font-body text-on-surface min-h-screen">
      <header className="bg-[#fdf9f3]/80 dark:bg-stone-950/80 backdrop-blur-md text-stone-800 dark:text-stone-100 font-serif tracking-tight leading-relaxed docked full-width top-0 z-50 flex justify-between items-center w-full px-8 py-4 sticky">
        <Link to="/app" className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-50">
          I'm Author
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/app/write"
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-300"
          >
            Write
          </Link>
          <Link
            to="/app/library"
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-300"
          >
            Library
          </Link>
          <Link
            to="/app/community"
            className="text-amber-700 dark:text-amber-500 font-semibold border-b-2 border-amber-700 dark:border-amber-500 pb-1"
          >
            Community
          </Link>
        </nav>
        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center bg-surface-container-highest px-4 py-2 rounded-sm">
            <span className="text-outline text-sm">🔍</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-48 ml-2"
              placeholder="Search manuscripts..."
              type="text"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-stone-600 hover:text-amber-700 transition-all">🔔</button>
            <button className="text-stone-600 hover:text-amber-700 transition-all">⚙️</button>
            <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden bg-white flex items-center justify-center">
              👤
            </div>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen">
        <aside className="bg-[#f3ede4] dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-sans text-sm tracking-wide h-screen w-64 fixed left-0 top-0 pt-20 pb-8 flex flex-col px-4 z-40 hidden md:flex">
          <div className="mb-8 px-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-tertiary rounded flex items-center justify-center text-white font-serif">
                A
              </div>
              <div>
                <p className="font-semibold text-on-surface">Current Workspace</p>
                <p className="text-xs text-outline">The Great Novel</p>
              </div>
            </div>
            <Link
              to="/app/write"
              className="w-full py-3 px-4 bg-primary text-on-primary rounded-md flex items-center justify-center space-x-2 font-medium hover:opacity-90 transition-opacity"
            >
              <span>➕</span>
              <span>New Chapter</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1">
            <a
              className="flex items-center space-x-3 px-4 py-3 text-stone-500 dark:text-stone-400 hover:bg-white/50 dark:hover:bg-stone-800/50 rounded-md transition-all"
              href="#"
            >
              <span>📄</span>
              <span>Manuscripts</span>
            </a>
            <a
              className="flex items-center space-x-3 px-4 py-3 text-stone-500 dark:text-stone-400 hover:bg-white/50 dark:hover:bg-stone-800/50 rounded-md transition-all"
              href="#"
            >
              <span>📑</span>
              <span>Chapters</span>
            </a>
          </nav>
        </aside>

        <section className="flex-1 md:ml-64 p-8 lg:p-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
              Community Library
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mt-3 max-w-2xl leading-relaxed">
              Explore manuscripts published by other authors. Discover new perspectives, learn from
              their structure, and get inspired.
            </p>
          </div>

          <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
            <button className="px-5 py-2 bg-stone-800 text-stone-100 rounded-full text-sm font-medium whitespace-nowrap">
              All Genres
            </button>
            <button className="px-5 py-2 bg-surface-container-high text-stone-700 hover:bg-stone-200 rounded-full text-sm font-medium whitespace-nowrap transition-colors">
              Non-Fiction
            </button>
            <button className="px-5 py-2 bg-surface-container-high text-stone-700 hover:bg-stone-200 rounded-full text-sm font-medium whitespace-nowrap transition-colors">
              Fantasy
            </button>
            <button className="px-5 py-2 bg-surface-container-high text-stone-700 hover:bg-stone-200 rounded-full text-sm font-medium whitespace-nowrap transition-colors">
              Romance
            </button>
            <button className="px-5 py-2 bg-surface-container-high text-stone-700 hover:bg-stone-200 rounded-full text-sm font-medium whitespace-nowrap transition-colors">
              Sci-Fi
            </button>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="break-inside-avoid bg-[#fbf7f1] dark:bg-stone-800 rounded-xl p-6 border border-outline-variant/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-secondary-container/20 text-secondary-container dark:text-secondary-fixed">
                    {book.genre}
                  </span>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-stone-400 hover:text-amber-700">🔖</button>
                  </div>
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-50 mb-2 leading-tight line-clamp-2">
                  {book.title || 'Untitled'}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed line-clamp-4">
                  {book.topic || 'No description available.'}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-stone-300 flex items-center justify-center text-xs">
                      👤
                    </div>
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      Author
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-stone-500">
                    <span className="text-sm">👁️</span>
                    <span className="text-xs font-medium">1.2k</span>
                  </div>
                </div>
                <Link
                  to={`/app/reader/${book.id}`}
                  className="mt-4 block w-full text-center py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Read Manuscript
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
