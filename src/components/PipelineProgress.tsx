import type { BookProject } from '../types/agent'

interface PipelineProgressProps {
  currentPhase: BookProject['currentPhase']
}

const STEPS = [
  { phase: 'researching', label: '주제 조사', icon: '🔍', detail: 'GO/NO_GO 판정' },
  { phase: 'synopsis', label: '시놉시스', icon: '📖', detail: '줄거리 확인' },
  { phase: 'outlining', label: '목차 설계', icon: '📋', detail: '챕터 흐름 확정' },
  { phase: 'writing', label: '챕터 집필', icon: '✍️', detail: '1장 작성 중' },
  { phase: 'editing', label: '편집 검수', icon: '📝', detail: '피드백 루프' },
  { phase: 'publishing', label: '출판 준비', icon: '📦', detail: '메타데이터 생성' },
  { phase: 'complete', label: '완료', icon: '✅', detail: '출판 준비 완료' },
] as const

const PHASE_ORDER: Record<BookProject['currentPhase'], number> = {
  idle: -1,
  researching: 0,
  synopsis: 1,
  outlining: 2,
  writing: 3,
  editing: 4,
  publishing: 5,
  complete: 6,
}

function getStepState(index: number, currentPhase: BookProject['currentPhase']) {
  const currentIndex = PHASE_ORDER[currentPhase]

  if (currentPhase === 'idle') {
    return 'pending'
  }

  if (index < currentIndex) {
    return 'completed'
  }

  if (index === currentIndex) {
    return currentPhase === 'complete' ? 'completed' : 'current'
  }

  return 'pending'
}

export default function PipelineProgress({
  currentPhase,
}: PipelineProgressProps) {
  return (
    <section className="rounded-[32px] border border-stone-200 bg-[#fbf7f1] p-5 shadow-[0_18px_44px_rgba(120,113,108,0.14)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center overflow-x-auto">
        {STEPS.map((step, index) => {
          const state = getStepState(index, currentPhase)

          return (
            <div key={step.phase} className="flex flex-1 items-center gap-3 min-w-0">
              <div className="flex shrink-0 items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ${
                    state === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : state === 'current'
                        ? 'bg-amber-700 text-amber-50'
                        : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {state === 'completed' ? '✓' : step.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900 whitespace-nowrap">{step.label}</p>
                  <p
                    className={`text-xs whitespace-nowrap ${
                      state === 'current' ? 'text-amber-800' : 'text-stone-500'
                    }`}
                  >
                    {step.detail}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 ? (
                <div className="hidden h-1 flex-1 rounded-full bg-stone-200 xl:block">
                  <div
                    className={`h-full rounded-full ${
                      state === 'completed'
                        ? 'w-full bg-emerald-600'
                        : state === 'current'
                          ? 'w-1/2 bg-amber-700'
                          : 'w-0'
                    }`}
                  />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
