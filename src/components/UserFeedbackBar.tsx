import { useMemo, useState } from 'react'
import type { BookProject } from '../types/agent'

interface UserFeedbackBarProps {
  currentPhase: string
  onSubmit: (instruction: string) => Promise<void>
  isProcessing: boolean
  placeholder?: string
}

const PLACEHOLDERS: Partial<Record<BookProject['currentPhase'], string>> = {
  researching: '시장 분석에 추가로 고려할 점이 있나요?',
  synopsis: '줄거리에서 수정하고 싶은 부분을 알려주세요',
  outlining: '목차 순서나 제목을 변경하고 싶으면 말해주세요',
  writing: '이 챕터에서 수정하고 싶은 부분을 알려주세요',
  editing: '편집 결과에 대해 의견이 있으면 말해주세요',
  publishing: '출판 정보에서 수정할 사항이 있나요?',
}

const QUICK_ACTIONS: Partial<Record<BookProject['currentPhase'], string[]>> = {
  synopsis: ['이대로 진행', '다시 생성'],
  outlining: ['목차 확정', '다시 생성'],
  writing: ['확장', '축소', '톤 변경'],
  editing: ['편집 의견 수락', '재검수 요청'],
  publishing: ['출판 준비 완료'],
}

export default function UserFeedbackBar({
  currentPhase,
  onSubmit,
  isProcessing,
  placeholder,
}: UserFeedbackBarProps) {
  const [value, setValue] = useState('')
  const activePlaceholder =
    placeholder ||
    PLACEHOLDERS[currentPhase as BookProject['currentPhase']] ||
    'AI에게 전달할 의견이나 수정 요청을 입력해주세요'

  const quickActions = useMemo(
    () => QUICK_ACTIONS[currentPhase as BookProject['currentPhase']] || [],
    [currentPhase],
  )

  const handleSubmit = async () => {
    const trimmed = value.trim()

    if (!trimmed || isProcessing) {
      return
    }

    await onSubmit(trimmed)
    setValue('')
  }

  const handleQuickAction = async (action: string) => {
    if (isProcessing) {
      return
    }

    await onSubmit(action)
  }

  return (
    <div className="sticky bottom-0 border-t border-stone-200 bg-[#f8f2ea] p-4 shadow-[0_-12px_32px_rgba(120,113,108,0.10)]">
      {quickActions.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => void handleQuickAction(action)}
              disabled={isProcessing}
              className="rounded-2xl border border-stone-200 bg-[#fffdfa] px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
            >
              {action}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void handleSubmit()
            }
          }}
          placeholder={activePlaceholder}
          disabled={isProcessing}
          className="flex-1 rounded-2xl border border-stone-300 bg-[#fffdfa] p-3 text-sm text-stone-700 outline-none transition focus:border-amber-500 disabled:cursor-not-allowed disabled:bg-stone-100"
        />

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isProcessing || !value.trim()}
          className="inline-flex items-center justify-center rounded-2xl bg-amber-700 px-4 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-amber-300"
        >
          {isProcessing ? 'AI가 수정 중...' : '전송'}
        </button>
      </div>
    </div>
  )
}
