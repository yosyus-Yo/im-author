import { hasSupabaseConfig, supabase } from './supabase'
import type { BookProject } from '../types/agent'

const BOOKS_STORAGE_KEY = 'ai-book-agent.books'
const DEMO_USER_STORAGE_KEY = 'ai-book-agent.demo-user'

export interface StoredBook {
  id: string
  user_id: string
  genre: string
  topic: string
  title: string
  subtitle: string
  synopsis: BookProject['synopsis']
  outline: BookProject['outline']
  chapters: BookProject['chapters']
  publication: BookProject['publication']
  score: number
  is_published: boolean
  created_at: string
  updated_at: string
}

function readLocalBooks() {
  const raw = window.localStorage.getItem(BOOKS_STORAGE_KEY)

  if (!raw) {
    return [] as StoredBook[]
  }

  return JSON.parse(raw) as StoredBook[]
}

function writeLocalBooks(books: StoredBook[]) {
  window.localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books))
}

async function getSupabaseUserId(): Promise<string | null> {
  if (!hasSupabaseConfig || !supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

function getDemoUserId(): string {
  const raw = window.localStorage.getItem(DEMO_USER_STORAGE_KEY)
  if (raw) {
    const user = JSON.parse(raw) as { id?: string }
    if (user.id) return user.id
  }
  const demoId = crypto.randomUUID()
  window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ id: demoId }))
  return demoId
}

async function getCurrentUserId() {
  return (await getSupabaseUserId()) || getDemoUserId()
}

async function isSupabaseAuthenticated(): Promise<boolean> {
  return Boolean(await getSupabaseUserId())
}

function createStoredBook(project: BookProject, userId: string, existingId?: string): StoredBook {
  const title =
    project.publication?.metadata.title ||
    project.outline?.title ||
    project.topic ||
    '제목 미정'
  const subtitle = project.publication?.metadata.subtitle || project.outline?.subtitle || ''
  const score = project.reviews[project.reviews.length - 1]?.score.overall || 0
  const timestamp = new Date().toISOString()

  return {
    id: existingId || crypto.randomUUID(),
    user_id: userId,
    genre: project.genre || 'nonfiction',
    topic: project.topic,
    title,
    subtitle,
    synopsis: project.synopsis,
    outline: project.outline,
    chapters: project.chapters,
    publication: project.publication,
    score,
    is_published: false,
    created_at: timestamp,
    updated_at: timestamp,
  }
}

async function saveToSupabase(book: StoredBook) {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
  }

  const payload = {
    ...book,
    is_published: book.is_published,
  }

  const { data, error } = await supabase
    .from('books')
    .upsert(payload)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as StoredBook
}

export async function saveBook(project: BookProject, existingId?: string) {
  const userId = await getCurrentUserId()

  const baseBook = createStoredBook(project, userId, existingId)

  if (await isSupabaseAuthenticated()) {
    try {
      return await saveToSupabase(baseBook)
    } catch {
      const localBooks = readLocalBooks()
      const targetIndex = localBooks.findIndex((book) => book.id === baseBook.id)
      const nextBook =
        targetIndex >= 0
          ? {
              ...baseBook,
              created_at: localBooks[targetIndex].created_at,
              is_published: localBooks[targetIndex].is_published,
            }
          : baseBook

      const nextBooks =
        targetIndex >= 0
          ? localBooks.map((book, index) => (index === targetIndex ? nextBook : book))
          : [nextBook, ...localBooks]

      writeLocalBooks(nextBooks)
      return nextBook
    }
  }

  const localBooks = readLocalBooks()
  const targetIndex = localBooks.findIndex((book) => book.id === baseBook.id)
  const nextBook =
    targetIndex >= 0
      ? {
          ...baseBook,
          created_at: localBooks[targetIndex].created_at,
          is_published: localBooks[targetIndex].is_published,
        }
      : baseBook
  const nextBooks =
    targetIndex >= 0
      ? localBooks.map((book, index) => (index === targetIndex ? nextBook : book))
      : [nextBook, ...localBooks]

  writeLocalBooks(nextBooks)

  return nextBook
}

export async function getMyBooks() {
  const userId = await getCurrentUserId()

  if (await isSupabaseAuthenticated()) {
    try {
      const { data, error } = await supabase!
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as StoredBook[]) || []
    } catch {
      // Supabase 실패 시 localStorage 폴백
    }
  }

  return readLocalBooks()
    .filter((book) => book.user_id === userId)
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
}

export async function publishBook(bookId: string) {
  const userId = await getCurrentUserId()

  if (await isSupabaseAuthenticated()) {
    try {
      const { data, error } = await supabase!
        .from('books')
        .update({
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as StoredBook
    } catch {
      const localBooks = readLocalBooks()
      const nextBooks = localBooks.map((book) =>
        book.id === bookId && book.user_id === userId
          ? { ...book, is_published: true, updated_at: new Date().toISOString() }
          : book,
      )

      writeLocalBooks(nextBooks)

      return nextBooks.find((book) => book.id === bookId) || null
    }
  }

  const localBooks = readLocalBooks()
  const nextBooks = localBooks.map((book) =>
    book.id === bookId && book.user_id === userId
      ? { ...book, is_published: true, updated_at: new Date().toISOString() }
      : book,
  )

  writeLocalBooks(nextBooks)

  return nextBooks.find((book) => book.id === bookId) || null
}

export async function getPublishedBooks() {
  if (await isSupabaseAuthenticated()) {
    try {
      const { data, error } = await supabase!
        .from('books')
        .select('*')
        .eq('is_published', true)
        .order('updated_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data as StoredBook[]) || []
    } catch {
      return readLocalBooks()
        .filter((book) => book.is_published)
        .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    }
  }

  return readLocalBooks()
    .filter((book) => book.is_published)
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
}

export async function getBookById(id: string) {
  if (await isSupabaseAuthenticated()) {
    try {
      const { data, error } = await supabase!.from('books').select('*').eq('id', id).single()

      if (error) {
        throw error
      }

      return data as StoredBook
    } catch {
      return readLocalBooks().find((book) => book.id === id) || null
    }
  }

  return readLocalBooks().find((book) => book.id === id) || null
}
