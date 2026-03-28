-- AI Book Agent - Books 테이블 생성
-- Supabase Dashboard > SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  genre TEXT NOT NULL DEFAULT 'nonfiction',
  topic TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '제목 미정',
  subtitle TEXT DEFAULT '',
  synopsis JSONB,
  outline JSONB,
  chapters JSONB DEFAULT '[]'::jsonb,
  publication JSONB,
  score NUMERIC DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_is_published ON public.books(is_published);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- 정책: 누구나 출판된 책을 읽을 수 있음
CREATE POLICY "Published books are viewable by everyone"
  ON public.books FOR SELECT
  USING (is_published = true);

-- 정책: 본인의 책만 CRUD 가능
CREATE POLICY "Users can manage their own books"
  ON public.books FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 정책: 비로그인 사용자도 출판된 책 조회 가능 (anon)
CREATE POLICY "Anon can read published books"
  ON public.books FOR SELECT
  TO anon
  USING (is_published = true);
