import type { BookGenre } from '../types/agent'

const DESIGN_STYLES = [
  {
    name: 'Modern Minimalist',
    tone: '현재 기본형',
    description: '여백과 명확한 카드 구성을 살린 생산성 중심 스타일',
    shellClassName: 'border-gray-200 bg-white text-gray-900 shadow-lg',
    accentClassName: 'bg-blue-600 text-white',
    badgeClassName: 'bg-blue-100 text-blue-700',
    panelClassName: 'border-gray-100 bg-gray-50',
  },
  {
    name: 'Classic Typewriter',
    tone: '작가 몰입형',
    description: '종이책과 원고지 감성을 살린 따뜻한 글쓰기 스타일',
    shellClassName: 'border-stone-300 bg-stone-50 text-stone-900 shadow-[0_12px_32px_rgba(120,113,108,0.18)]',
    accentClassName: 'bg-amber-700 text-amber-50',
    badgeClassName: 'bg-amber-100 text-amber-800',
    panelClassName: 'border-stone-200 bg-[#fbfaf8]',
  },
  {
    name: 'Night Owl',
    tone: '다크 모드',
    description: '야간 집필과 긴 세션에 맞춘 고대비 집중형 스타일',
    shellClassName: 'border-slate-700 bg-slate-900 text-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.45)]',
    accentClassName: 'bg-indigo-400 text-slate-950',
    badgeClassName: 'bg-slate-800 text-indigo-300',
    panelClassName: 'border-slate-700 bg-slate-800',
  },
] as const

const PAGE_FLOW = [
  {
    title: 'Library Hub',
    description: '내 서재와 커뮤니티를 탐색하고 작업할 책을 선택',
  },
  {
    title: 'Project Setup',
    description: '장르와 주제를 정하고 새 파이프라인을 시작',
  },
  {
    title: 'Workspace',
    description: '에이전트 채팅과 북 프리뷰를 보며 집필을 진행',
  },
  {
    title: 'Feedback Loop',
    description: '사용자 피드백과 편집 결과를 반영해 원고를 정교화',
  },
  {
    title: 'Publish',
    description: '표지·메타데이터를 정리하고 커뮤니티에 공개',
  },
] as const

const GENRE_LABELS: Record<BookGenre, string> = {
  nonfiction: '논픽션',
  fantasy: '판타지',
  romance: '로맨스',
  webnovel: '웹소설',
  essay: '수필/에세이',
  autobiography: '자서전',
  mystery: '미스터리',
  sf: 'SF',
}

interface DesignShowcaseProps {
  genre: BookGenre
}

export default function DesignShowcase({ genre }: DesignShowcaseProps) {
  return (
    <section className="rounded-[32px] border border-stone-200 bg-[#fbf7f1] p-6 shadow-[0_18px_44px_rgba(120,113,108,0.14)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            Pencil 디자인 핸드오프
          </span>
          <h2 className="mt-3 text-2xl font-bold text-stone-900">작가 몰입형 스타일 보드와 페이지 플로우</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            현재 장르 <span className="font-semibold text-gray-700">{GENRE_LABELS[genre]}</span>
            에 맞춰 최종 적용한 시안과 확인 포인트를 한 화면에 정리했어.
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-[#f7efe3] px-4 py-3 text-sm text-stone-600">
          작업실 · 서재 · 커뮤니티 흐름을 한 번에 점검
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {DESIGN_STYLES.map((style) => (
          <article
            key={style.name}
            className={`rounded-3xl border p-5 transition ${style.shellClassName} ${
              style.name === 'Classic Typewriter' ? 'ring-2 ring-amber-300' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                  {style.tone}
                </p>
                <h3 className="mt-2 text-xl font-bold">{style.name}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.badgeClassName}`}>
                {GENRE_LABELS[genre]}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 opacity-80">{style.description}</p>
            {style.name === 'Classic Typewriter' ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-100/80 px-3 py-2 text-xs font-semibold text-amber-900">
                현재 전체 페이지에 적용된 시안
              </div>
            ) : null}

            <div className={`mt-5 rounded-3xl border p-4 ${style.panelClassName}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs opacity-70">Workspace Header</p>
                  <p className="mt-1 text-base font-semibold">AI Book Agent</p>
                </div>
                <button
                  type="button"
                  className={`rounded-full px-3 py-2 text-xs font-semibold ${style.accentClassName}`}
                >
                  시작
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-black/5 p-3">
                  <p className="text-xs opacity-70">Agent Panel</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${style.badgeClassName}`}>
                        🔍 리서처
                      </span>
                      <span className="text-xs opacity-70">시장성 분석</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${style.badgeClassName}`}>
                        ✍️ 작가
                      </span>
                      <span className="text-xs opacity-70">스트리밍 집필</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-black/5 p-3">
                  <p className="text-xs opacity-70">Preview Panel</p>
                  <div className="mt-3 space-y-2">
                    <div className="h-2 rounded-full bg-black/10" />
                    <div className="h-2 w-4/5 rounded-full bg-black/10" />
                    <div className="h-2 w-3/5 rounded-full bg-black/10" />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-3xl border border-stone-200 bg-[#f7efe3] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-stone-900">페이지 플로우 템플릿</h3>
              <p className="mt-1 text-sm text-stone-500">
                실제 앱 구조에 맞춰 진입부터 공개까지의 흐름을 정리했어.
              </p>
            </div>
            <span className="rounded-full bg-[#fffdfa] px-3 py-1 text-xs font-semibold text-stone-600 shadow-sm">
              5 Steps
            </span>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-5">
            {PAGE_FLOW.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-stone-200 bg-[#fffdfa] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-stone-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {index < PAGE_FLOW.length - 1 ? (
                    <span className="hidden text-stone-300 lg:inline">→</span>
                  ) : null}
                </div>
                <p className="mt-4 font-semibold text-stone-900">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">{step.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-lg font-semibold text-amber-950">컨펌 포인트</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-amber-900">
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="font-semibold">서재 / 커뮤니티 감성</p>
              <p className="mt-1">책 카드와 웹 뷰어가 충분히 종이책처럼 느껴지는지 확인</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="font-semibold">집필 몰입감</p>
              <p className="mt-1">오른쪽 미리보기와 에디터가 원고지처럼 편안한지 확인</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="font-semibold">강조 컬러 톤</p>
              <p className="mt-1">앰버·스톤 계열 포인트가 브랜드 톤으로 적절한지 확인</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
