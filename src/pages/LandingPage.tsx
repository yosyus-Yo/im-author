import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="bg-surface selection:bg-secondary-fixed text-[#1d1b16] font-body min-h-screen">
      <nav className="bg-[#fdf9f3]/80 dark:bg-stone-950/80 backdrop-blur-md flex justify-between items-center w-full px-8 py-4 sticky top-0 z-50">
        <div className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-50 tracking-tight leading-relaxed">
          I'm Author
        </div>
        <div className="hidden md:flex items-center space-x-8 font-serif tracking-tight leading-relaxed">
          <Link
            to="/app/write"
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors duration-300"
          >
            Write
          </Link>
          <Link
            to="/app/library"
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors duration-300"
          >
            Library
          </Link>
          <Link
            to="/app/community"
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors duration-300"
          >
            Community
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden lg:block relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
              search
            </span>
            <input
              className="bg-surface-container-highest border-none rounded-sm pl-10 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-primary w-48"
              placeholder="Search..."
              type="text"
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="material-symbols-outlined text-stone-800 dark:text-stone-100 cursor-pointer hover:text-amber-700 transition-colors">
              notifications
            </span>
            <span className="material-symbols-outlined text-stone-800 dark:text-stone-100 cursor-pointer hover:text-amber-700 transition-colors">
              settings
            </span>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20 flex items-center justify-center">
              👤
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative min-h-[870px] flex items-center overflow-hidden px-8 py-20 bg-gradient-to-br from-surface to-surface-container-low">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full text-xs font-semibold tracking-widest uppercase">
                AI Literary Technology
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-on-surface leading-[1.1] tracking-tight font-headline">
                I'm <span className="text-secondary italic">Author</span>
                <br />
                <span className="text-4xl md:text-5xl mt-4 block font-medium font-serif">
                  AI 에이전트 4명이 당신의 책을 만들어드립니다
                </span>
              </h1>
              <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed font-body">
                주제만 입력하세요. 시장 조사, 집필, 편집, 출판 준비까지 모든 과정을 인공지능
                전문가들이 자동화합니다.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/app/write"
                  className="bg-primary text-on-primary px-8 py-4 rounded-md font-semibold text-lg hover:opacity-90 transition-all active:scale-95 shadow-sm"
                >
                  무료로 시작하기
                </Link>
                <Link
                  to="/app/write"
                  className="border border-outline text-primary px-8 py-4 rounded-md font-semibold text-lg hover:bg-surface-container-high transition-all active:scale-95"
                >
                  데모 보기
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] bg-surface-container-lowest rounded-xl shadow-2xl shadow-on-surface/5 p-4 transform rotate-2 relative z-10 overflow-hidden">
                <img
                  alt="Book design mockup"
                  className="w-full h-full object-cover rounded-lg"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBprWOLjMZkMYapq_c8H5QVsZZQ4CsN305je2xHvR2LQMN6GkBJZ6hMjcfAL9VZlAQiCkPQBzCQO9zBMEFXJ2bpwnRhehE4hfgN2zmQXCENFSWHUR8cVHRBH2VvY4j17qir2syHzfUyL6GoipUPOlhsX00aEgcRgcBcAZEJwWti2mcV_uOkYgQdaFqTV0bdUwu5dPe4wzdygvnFPyLKZSNqIV_LX1bIkLvT5CqWC_GXSFFI6X-5znbG5Zbn6mda_Pg3dfPqNNWWS6I"
                />
              </div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary-fixed-dim/20 rounded-full blur-3xl -z-0"></div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-tertiary-fixed/30 rounded-full blur-2xl -z-0"></div>
            </div>
          </div>
        </section>

        <section className="py-32 px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-on-surface mb-4 font-serif">
                완벽한 출판을 위한
                <br />
                4단계 인공지능 프로세스
              </h2>
              <p className="text-on-surface-variant text-lg">
                단 한 줄의 아이디어가 완성된 원고가 되기까지, 각 분야의 전문 AI 에이전트가
                협업합니다.
              </p>
            </div>
            <div className="pb-2">
              <span className="text-secondary font-semibold text-sm tracking-widest uppercase border-b-2 border-secondary pb-1">
                Our Technology
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#fbf7f1] p-8 rounded-xl flex flex-col h-full hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-2xl">search</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 font-serif">시장 조사</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                최신 트렌드와 키워드를 분석하여 독자들이 원하는 주제와 목차를 제안합니다.
              </p>
              <div className="mt-auto pt-4 border-t border-outline-variant/10">
                <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                  Phase 01
                </span>
              </div>
            </div>
            <div className="bg-[#fbf7f1] p-8 rounded-xl flex flex-col h-full hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-2xl">edit_note</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 font-serif">AI 집필</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                당신의 문체와 의도를 파악하여 고품질의 서술과 에피소드를 생성합니다.
              </p>
              <div className="mt-auto pt-4 border-t border-outline-variant/10">
                <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                  Phase 02
                </span>
              </div>
            </div>
            <div className="bg-[#fbf7f1] p-8 rounded-xl flex flex-col h-full hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-2xl">
                  fact_check
                </span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 font-serif">자동 편집</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                맞춤법 검수부터 문장 다듬기, 구성 최적화까지 전문 편집자의 시선으로 정교화합니다.
              </p>
              <div className="mt-auto pt-4 border-t border-outline-variant/10">
                <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                  Phase 03
                </span>
              </div>
            </div>
            <div className="bg-[#fbf7f1] p-8 rounded-xl flex flex-col h-full hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-2xl">
                  auto_stories
                </span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 font-serif">출판 준비</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                표지 디자인 제안, 내지 레이아웃 구성 등 즉시 출판 가능한 포맷으로 변환합니다.
              </p>
              <div className="mt-auto pt-4 border-t border-outline-variant/10">
                <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                  Phase 04
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container py-24 px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-on-surface mb-4 font-serif">
                어떤 장르든 가능합니다
              </h2>
              <p className="text-on-surface-variant">
                다양한 문체와 전문 지식을 갖춘 AI가 모든 분야의 집필을 지원합니다.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {[
                '논픽션',
                '판타지',
                '자기계발',
                '에세이',
                '비즈니스',
                '스릴러',
                '기술 과학',
                '인문학',
                '시나리오',
              ].map((genre) => (
                <span
                  key={genre}
                  className="px-6 py-3 bg-secondary-fixed text-on-secondary-fixed rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow cursor-default"
                >
                  {genre}
                </span>
              ))}
            </div>
            <div className="mt-20 relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                <img
                  alt="Book 1"
                  className="rounded-lg shadow-lg aspect-[3/4] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5bEC42Z1-cxe6666Q_xP5jsL8CpH8Lu55V_WJmg6G6Wd-K82Fj5kH9Ck_EYvZerUsTvYy8u9jhvu42JgjmPHEoNFlPYdOUcd_RYYBm0yhdJ7F8CCLUJFG6GeIQlc1WjO_86XtlQijHlTPgILamUl9G8MJ8OujUDY-PZelPNOlGmEvQdZd6JYHaJ-1381H_uIqN4jFt63ea6bQ-xW5OeJr_atK8Y05C9OE7maBreC26x-9aVJX601chlM7KqF1fz74FKQI6LmFT0s"
                />
                <img
                  alt="Book 2"
                  className="rounded-lg shadow-lg aspect-[3/4] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw4YlAcKjlxTPejLW8ZI9zKWb5LS_1r99FERbXk9zkJQEnWnJTKqPPlhxqUV_yujqwqddVBt90xx4SLUbs3FMUwmKhZuQOkm9YODQUiFJrR4TRLH9kJdH1nvI0AO73fDhrt6kDBp7UJAGbMzNbmdULdH_vsgdi7rUu3r3evSEi9ML3mjxc45E9aAk1x3-lrNN0ToURinAYJaG0bnksUAVA9YZigSxNSfCqa1uhn1y68nC_rRoyinjClEgfl7IBo7vMN1AqG3J3B1Q"
                />
                <img
                  alt="Book 3"
                  className="rounded-lg shadow-lg aspect-[3/4] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJsn5nc4vn1sX_rtyGPdoUFi5FHSAiSqTdbat4N9p8V3AuCbaiUxx9NopSz3KWwsAn-FvVdbr5cjx3y4f4Mrb1BFdgJywvAbNX_nNPABF_wVgN2Ym661DC6eZ1ZqOBbe87_lSPpNRUNFR66qT_-XR-3MdhxhZk6UNoORmrytndEuXN9fqKl9z9RLRkRYij572uZPMfwvHuq66HhUV0HNMbNu43ICzrDxf2bsrJQKg3XhKLy7ysnRAajNlc7rb-zlrpnc2Bc0X1ojY"
                />
                <img
                  alt="Book 4"
                  className="rounded-lg shadow-lg aspect-[3/4] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxOsKWpNDC_xqrU1l74rkYInpEQIDc2Qbnbfa-S0whMSPTS4WKGXt0dmXS-U8RTb_YqBBcjLBy5Y2pLcH3FjJ1moIF3KDNSG4BRnUlSf7stbjklCvKyBe7eIAmgeWvV5rRU_xI-dLI3YxHzQvpnTi6iUDpifqt5bk0ci8pqrgucfu5gYIPMDieEyrQ7jgfQNoTsXFrcYhLuxxeIZ-Ketx3MeML0cXBpN9CK0W81_JqhCa4GyYq9ZnNl_v2WVQEhF3oUlFwlulyjG4"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-surface-container pointer-events-none"></div>
            </div>
          </div>
        </section>

        <section className="py-32 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 order-2 lg:order-1">
            <div className="bg-surface-container-high rounded-2xl p-2 shadow-xl border border-outline-variant/20">
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-inner flex h-[400px]">
                <div className="w-16 md:w-48 bg-surface-container-high h-full p-4 flex flex-col gap-4 border-r border-outline-variant/10">
                  <div className="w-8 h-8 rounded-md bg-secondary flex-shrink-0"></div>
                  <div className="hidden md:block space-y-4 pt-4">
                    <div className="h-2 w-24 bg-outline-variant/30 rounded"></div>
                    <div className="h-2 w-16 bg-outline-variant/30 rounded"></div>
                    <div className="h-2 w-20 bg-outline-variant/30 rounded"></div>
                    <div className="h-2 w-12 bg-outline-variant/30 rounded"></div>
                  </div>
                </div>
                <div className="flex-1 p-8 overflow-hidden">
                  <div className="h-4 w-1/3 bg-on-surface/10 rounded mb-8"></div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-on-surface/5 rounded"></div>
                    <div className="h-2 w-full bg-on-surface/5 rounded"></div>
                    <div className="h-2 w-5/6 bg-on-surface/5 rounded"></div>
                    <div className="h-2 w-full bg-on-surface/5 rounded"></div>
                    <div className="h-2 w-4/6 bg-on-surface/5 rounded"></div>
                    <div className="mt-8 h-32 w-full bg-surface-container-low rounded border-dashed border-2 border-outline-variant/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline-variant">
                        add_circle
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 space-y-6 order-1 lg:order-2">
            <h2 className="text-4xl font-bold text-on-surface tracking-tight leading-tight font-serif">
              작가의 책상을
              <br />
              디지털로 재현했습니다
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              복잡한 도구는 필요 없습니다. 우리의 워크스페이스는 당신이 오직 창의성에만 집중할 수
              있도록 정갈하고 효율적으로 설계되었습니다. manuscripts부터 character sheets까지 모든
              도구가 준비되어 있습니다.
            </p>
            <div className="pt-4 flex items-center gap-4 text-secondary font-semibold group cursor-pointer">
              <Link to="/app/write" className="flex items-center gap-2">
                워크스페이스 더 알아보기
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#f5efe6] dark:bg-stone-950 w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center border-t border-stone-200/30 dark:border-stone-800/30 pt-12 text-stone-900 dark:text-stone-100 font-sans text-xs uppercase tracking-widest">
        <div className="flex flex-col items-center md:items-start space-y-4 mb-8 md:mb-0">
          <div className="font-serif italic text-stone-500 text-lg">I'm Author</div>
          <p className="text-stone-400 dark:text-stone-600 normal-case tracking-normal">
            © 2024 I'm Author Publishing. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a
            className="text-stone-400 dark:text-stone-600 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-stone-400 dark:text-stone-600 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="text-stone-400 dark:text-stone-600 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
            href="#"
          >
            Author Support
          </a>
          <a
            className="text-stone-400 dark:text-stone-600 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
            href="#"
          >
            Editorial Guidelines
          </a>
        </div>
      </footer>
    </div>
  )
}
