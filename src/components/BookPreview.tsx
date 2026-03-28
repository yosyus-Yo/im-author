import { useMemo, useState } from 'react'
import ChapterEditor from './ChapterEditor'
import PipelineProgress from './PipelineProgress'
import UserFeedbackBar from './UserFeedbackBar'
import type { BookProject, ChapterDraft, EditReview } from '../types/agent'

interface BookPreviewProps {
  project: BookProject
  onReset?: () => void
  onFeedbackSubmit?: (instruction: string) => Promise<void>
  isFeedbackProcessing?: boolean
}

function LoadingBlock({ text }: { text: string }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-stone-300 bg-[#f7efe3] px-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-amber-700" />
      <p className="mt-4 text-base font-semibold text-stone-900">{text}</p>
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-sm font-medium text-stone-600 whitespace-nowrap">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-amber-700 transition-all duration-500"
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-bold text-stone-900">
        {value}
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: EditReview['status'] }) {
  const style =
    status === 'APPROVED'
      ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
      : status === 'NEEDS_REVISION'
        ? 'border border-amber-200 bg-amber-100 text-amber-800'
        : 'border border-red-200 bg-red-100 text-red-700'

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  )
}

function PublicationReadyBadge({ ready }: { ready: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        ready
          ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
          : 'border border-stone-200 bg-stone-100 text-stone-600'
      }`}
    >
      {ready ? '출판 준비 완료' : '출판 준비 중'}
    </span>
  )
}

export default function BookPreview({
  project,
  onReset,
  onFeedbackSubmit,
  isFeedbackProcessing = false,
}: BookPreviewProps) {
  const [showSelfEdit, setShowSelfEdit] = useState(false)
  const [editableChapter, setEditableChapter] = useState<ChapterDraft | null>(null)
  const latestChapter = useMemo(
    () => project.chapters[project.chapters.length - 1] || null,
    [project.chapters],
  )
  const latestReview = useMemo(
    () => project.reviews[project.reviews.length - 1] || null,
    [project.reviews],
  )
  const activeChapter =
    editableChapter &&
    latestChapter &&
    editableChapter.chapterNumber === latestChapter.chapterNumber
      ? editableChapter
      : latestChapter

  const renderIdle = () => (
    <div className="flex min-h-[520px] flex-col justify-center rounded-[28px] bg-[#fffdfa]">
      <div className="text-center">
        <div className="text-5xl">📚</div>
        <h2 className="mt-6 text-3xl font-bold text-stone-900">AI Book Agent</h2>
        <p className="mt-3 text-base text-stone-600">
          조용한 서재에서 원고를 다듬듯 4명의 AI 에이전트가 협업해 책을 만듭니다
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            { icon: '🔍', title: '리서처', description: '시장성 분석과 GO/NO_GO 판단' },
            { icon: '✍️', title: '작가', description: '시놉시스, 목차, 챕터 집필' },
            { icon: '📝', title: '편집자', description: '7단계 검수와 피드백 루프' },
            { icon: '📦', title: '출판담당', description: '메타데이터와 출판 정보 준비' },
          ].map((agent) => (
            <article
              key={agent.title}
              className="rounded-[28px] border border-stone-200 bg-[#f8f2ea] p-5"
            >
              <div className="text-2xl">{agent.icon}</div>
              <h3 className="mt-4 font-semibold text-stone-900 whitespace-nowrap">{agent.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600 break-keep">{agent.description}</p>
            </article>
          ))}
        </div>
    </div>
  )

  const renderResearch = () => {
    if (!project.research) {
      return <LoadingBlock text="주제를 분석하고 있습니다..." />
    }

    return (
      <div className="space-y-6">
        <section className="rounded-[28px] border border-stone-200 bg-[#fffdfa] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-stone-900">🔍 주제 분석 결과</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                project.research.goNoGo === 'GO'
                  ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
                  : 'border border-red-200 bg-red-100 text-red-700'
              }`}
            >
              {project.research.goNoGo}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] bg-[#f8f2ea] p-5">
              <h3 className="font-semibold text-stone-900">시장 트렌드</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {project.research.marketAnalysis.trend}
              </p>
            </article>
            <article className="rounded-[24px] bg-[#f8f2ea] p-5">
              <h3 className="font-semibold text-stone-900">타겟 독자</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {project.research.marketAnalysis.targetAudience}
              </p>
              <p className="mt-3 text-sm text-stone-500">
                예상 독자 수: {project.research.marketAnalysis.estimatedReaders}
              </p>
            </article>
          </div>

          <div className="mt-6 rounded-[24px] bg-[#f8f2ea] p-5">
            <h3 className="font-semibold text-stone-900">경쟁 도서 분석</h3>
            <div className="mt-4 space-y-3">
              {project.research.competition.map((book) => (
                <div key={book.title} className="rounded-2xl bg-[#fffdfa] p-4">
                  <p className="font-semibold text-stone-900">{book.title}</p>
                  <p className="mt-2 text-sm text-stone-600">강점: {book.strength}</p>
                  <p className="mt-1 text-sm text-stone-600">약점: {book.weakness}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-[#f8f2ea] p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-stone-900">신뢰도</h3>
              <span className="text-sm text-stone-500">
                {Math.round(project.research.confidence * 100)}%
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${project.research.confidence * 100}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-600">
              차별화 포인트: {project.research.differentiation}
            </p>
          </div>
        </section>
      </div>
    )
  }

  const renderSynopsis = () => {
    if (!project.synopsis) {
      return <LoadingBlock text="작가가 시놉시스를 정리하고 있습니다..." />
    }

    return (
      <section className="rounded-[28px] border border-stone-200 bg-[#fffdfa] p-6">
        <h2 className="text-xl font-semibold text-stone-900">📖 시놉시스</h2>
        <p className="mt-4 whitespace-pre-wrap font-serif text-[15px] leading-8 text-stone-700">
          {project.synopsis.synopsis}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-[24px] bg-[#f8f2ea] p-5">
            <h3 className="font-semibold text-stone-900">주요 인물/핵심 개념</h3>
            <div className="mt-4 space-y-3">
              {project.synopsis.characters.map((character) => (
                <div key={character.name} className="rounded-2xl bg-[#fffdfa] p-4">
                  <p className="font-medium text-stone-900">
                    {character.name} · {character.role}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">{character.description}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="space-y-4 rounded-[24px] bg-[#f8f2ea] p-5">
            <div>
              <h3 className="font-semibold text-stone-900">핵심 갈등</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {project.synopsis.coreConflict}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">테마</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {project.synopsis.theme}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">타겟 독자</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {project.synopsis.targetAudience}
              </p>
            </div>
          </article>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-2xl bg-amber-700 px-4 py-2 text-sm font-semibold text-amber-50"
          >
            이대로 진행
          </button>
          <button
            type="button"
            className="rounded-2xl border border-stone-200 bg-[#fffdfa] px-4 py-2 text-sm font-semibold text-stone-700"
          >
            다시 생성
          </button>
        </div>
      </section>
    )
  }

  const renderOutline = () => {
    if (!project.outline) {
      return <LoadingBlock text="목차를 설계하고 있습니다..." />
    }

    return (
      <section className="rounded-[28px] border border-stone-200 bg-[#fffdfa] p-6">
        <h2 className="text-xl font-semibold text-stone-900">📋 {project.outline.title}</h2>
        <p className="mt-2 text-sm text-stone-500">{project.outline.subtitle}</p>

        <div className="mt-6 space-y-3">
          {project.outline.chapters.map((chapter) => (
            <div
              key={chapter.number}
              className="rounded-[24px] border border-stone-200 bg-[#f8f2ea] p-4"
            >
              <p className="font-semibold text-stone-900">
                {chapter.number}. {chapter.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-600">{chapter.summary}</p>
            </div>
          ))}
        </div>
      </section>
    )
  }

  const renderWriting = () => {
    if (!activeChapter) {
      return <LoadingBlock text="1장을 집필하고 있습니다..." />
    }

    return (
      <div className="space-y-6">
        <ChapterEditor
          key={`${activeChapter.chapterNumber}-${activeChapter.revision ?? 0}-${activeChapter.wordCount}`}
          chapter={activeChapter}
          genre={project.genre || 'nonfiction'}
          onUpdate={(updated) => setEditableChapter(updated)}
        />
        {activeChapter.selfEditLog.length > 0 ? (
          <section className="rounded-[28px] border border-stone-200 bg-[#fffdfa] p-6">
            <button
              type="button"
              onClick={() => setShowSelfEdit((current) => !current)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="font-semibold text-stone-900">
                작가의 자기편집 과정 보기
              </span>
              <span className="text-sm text-stone-500">
                {showSelfEdit ? '접기' : '펼치기'}
              </span>
            </button>

            {showSelfEdit ? (
              <div className="mt-5 space-y-4">
                {activeChapter.selfEditLog.map((log, index) => (
                  <article
                    key={`${log.layer}-${index}`}
                    className="rounded-[24px] bg-[#f8f2ea] p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          log.layer === 'structure'
                            ? 'bg-purple-100 text-purple-700'
                            : log.layer === 'clarity'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {log.layer}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-stone-500">Before</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-stone-700">
                      {log.before}
                    </p>
                    <p className="mt-3 text-sm text-stone-500">After</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-stone-700">
                      {log.after}
                    </p>
                    <p className="mt-3 text-sm text-stone-500">이유: {log.reason}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    )
  }

  const renderEditing = () => {
    if (!activeChapter || !latestReview) {
      return <LoadingBlock text="편집 검수를 진행하고 있습니다..." />
    }

    return (
      <div className="space-y-6">
        <section className="rounded-[28px] border border-stone-200 bg-[#fffdfa] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-stone-900">📝 편집 검수 결과</h2>
            <StatusBadge status={latestReview.status} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="space-y-4 rounded-[24px] bg-[#f8f2ea] p-5">
              <ScoreBar label="명확성" value={latestReview.score.clarity} />
              <ScoreBar label="근거" value={latestReview.score.evidence} />
              <ScoreBar label="구조" value={latestReview.score.structure} />
              <ScoreBar label="몰입도" value={latestReview.score.engagement} />
              <ScoreBar label="종합" value={latestReview.score.overall} />
            </article>

            <article className="rounded-[24px] bg-[#f8f2ea] p-5">
              <h3 className="font-semibold text-stone-900 whitespace-nowrap">수정 이력</h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-[#fffdfa] p-4 text-sm text-stone-600 break-keep">
                  현재 원고 버전: {activeChapter.revision ? `${activeChapter.revision + 1}차` : '초안'}
                </div>
                {latestReview.status === 'NEEDS_REVISION' ? (
                  <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
                    작가에게 수정 요청 중...
                  </div>
                ) : null}
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-[#fffdfa] p-6">
          <h3 className="font-semibold text-stone-900">이슈 목록</h3>
          <div className="mt-4 space-y-3">
            {latestReview.issues.map((issue, index) => (
              <article
                key={`${issue.type}-${index}`}
                className={`rounded-2xl p-4 ${
                  issue.type === 'GRAMMAR_CHECK'
                    ? 'border border-red-200 bg-red-50'
                    : 'border border-stone-200 bg-[#f8f2ea]'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-stone-200 bg-[#fffdfa] px-3 py-1 text-xs font-semibold text-stone-600">
                    {issue.type}
                  </span>
                  <span className="text-xs text-stone-500">{issue.location}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-stone-800">{issue.issue}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{issue.suggestion}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    )
  }

  const renderPublishing = () => {
    if (!project.publication) {
      return <LoadingBlock text="출판 정보를 준비하고 있습니다..." />
    }

    return (
      <div className="space-y-6">
        <section className="rounded-[28px] border border-stone-200 bg-[#fffdfa] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-stone-900">📦 출판 준비</h2>
            <PublicationReadyBadge ready={project.publication.readyForPublish} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] bg-[#f8f2ea] p-5">
              <h3 className="font-semibold text-stone-900">메타데이터</h3>
              <p className="mt-3 text-lg font-semibold text-stone-900">
                {project.publication.metadata.title}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {project.publication.metadata.subtitle}
              </p>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                {project.publication.metadata.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.publication.metadata.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-stone-200 bg-[#fffdfa] px-3 py-1 text-xs font-medium text-stone-600"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-[24px] bg-[#f8f2ea] p-5">
              <h3 className="font-semibold text-stone-900">표지 디자인 방향</h3>
              <div className="mt-4 rounded-[24px] border border-stone-200 bg-[#fffdfa] p-5">
                <div
                  className="h-28 rounded-xl"
                  style={{ backgroundColor: project.publication.coverDesign.primaryColor }}
                />
                <p className="mt-4 font-semibold text-stone-900">
                  {project.publication.coverDesign.style}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {project.publication.coverDesign.concept}
                </p>
                <p className="mt-3 text-xs leading-5 text-stone-500">
                  {project.publication.coverDesign.imagePrompt}
                </p>
              </div>
            </article>
          </div>

          <div className="mt-6 rounded-[24px] bg-[#f8f2ea] p-5">
            <h3 className="font-semibold text-stone-900">포맷 정보</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-[#fffdfa] p-4 text-sm text-stone-600">
                판형
                <p className="mt-2 font-semibold text-stone-900">
                  {project.publication.format.pageSize}
                </p>
              </div>
              <div className="rounded-2xl bg-[#fffdfa] p-4 text-sm text-stone-600">
                예상 페이지
                <p className="mt-2 font-semibold text-stone-900">
                  {project.publication.format.estimatedPages}쪽
                </p>
              </div>
              <div className="rounded-2xl bg-[#fffdfa] p-4 text-sm text-stone-600">
                전자책 가격
                <p className="mt-2 font-semibold text-stone-900">
                  {project.publication.format.ebookPrice.toLocaleString()}원
                </p>
              </div>
              <div className="rounded-2xl bg-[#fffdfa] p-4 text-sm text-stone-600">
                종이책 가격
                <p className="mt-2 font-semibold text-stone-900">
                  {project.publication.format.printPrice.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const renderComplete = () => {
    const chaptersForStats = activeChapter
      ? [activeChapter, ...project.chapters.slice(1)]
      : project.chapters
    const totalWords = chaptersForStats.reduce((sum, chapter) => sum + chapter.wordCount, 0)

    return (
      <section className="rounded-[28px] border border-stone-200 bg-[#fffdfa] p-6">
        <div className="text-center">
          <div className="text-4xl">✅</div>
          <h2 className="mt-4 text-2xl font-bold text-stone-900">책 제작 완료!</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-[24px] bg-[#f8f2ea] p-5">
            <h3 className="text-lg font-semibold text-stone-900">
              {project.publication?.metadata.title || project.outline?.title || '제목 미정'}
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              {project.publication?.metadata.subtitle || project.outline?.subtitle || ''}
            </p>
            <div
              className="mt-6 h-32 rounded-2xl"
              style={{
                backgroundColor: project.publication?.coverDesign.primaryColor || '#2563eb',
              }}
            />
          </article>

          <article className="space-y-3 rounded-[24px] bg-[#f8f2ea] p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">챕터 수</span>
              <span className="font-semibold text-stone-900">{chaptersForStats.length}장</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">총 글자 수</span>
              <span className="font-semibold text-stone-900">{totalWords.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">편집 점수</span>
              <span className="font-semibold text-stone-900">
                {latestReview?.score.overall ?? '-'} / 10
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">출판 준비</span>
              <span className="font-semibold text-green-600">
                {project.publication?.readyForPublish ? '완료' : '진행 중'}
              </span>
            </div>
          </article>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onReset}
            className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-amber-50"
          >
            새로운 책 만들기
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="flex min-h-[72vh] flex-col gap-6 overflow-hidden rounded-[32px]">
      <PipelineProgress currentPhase={project.currentPhase} />

      <div className="flex flex-1 flex-col overflow-hidden rounded-[32px] border border-stone-200 bg-[#fbf7f1] shadow-[0_18px_44px_rgba(120,113,108,0.14)]">
        <div className="flex-1 overflow-y-auto p-1">
          <div className="p-5">
            {project.currentPhase === 'idle' ? renderIdle() : null}
            {project.currentPhase === 'researching' ? renderResearch() : null}
            {project.currentPhase === 'synopsis' ? renderSynopsis() : null}
            {project.currentPhase === 'outlining' ? renderOutline() : null}
            {project.currentPhase === 'writing' ? renderWriting() : null}
            {project.currentPhase === 'editing' ? renderEditing() : null}
            {project.currentPhase === 'publishing' ? renderPublishing() : null}
            {project.currentPhase === 'complete' ? renderComplete() : null}
          </div>
        </div>

        <UserFeedbackBar
          currentPhase={project.currentPhase}
          onSubmit={onFeedbackSubmit || (async () => {})}
          isProcessing={isFeedbackProcessing}
        />
      </div>
    </section>
  )
}
