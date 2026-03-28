import { useEffect, useMemo, useRef } from 'react'
import type { AgentMessage } from '../types/agent'

interface AgentChatProps {
  messages: AgentMessage[]
  isRunning: boolean
}

const ROLE_META: Record<
  AgentMessage['role'],
  { label: string; icon: string; color: string }
> = {
  researcher: {
    label: '리서처',
    icon: '🔍',
    color: 'border border-purple-200 bg-purple-100 text-purple-700',
  },
  writer: {
    label: '작가',
    icon: '✍️',
    color: 'border border-amber-200 bg-amber-100 text-amber-800',
  },
  editor: {
    label: '편집자',
    icon: '📝',
    color: 'border border-emerald-200 bg-emerald-100 text-emerald-700',
  },
  publisher: {
    label: '출판담당',
    icon: '📦',
    color: 'border border-orange-200 bg-orange-100 text-orange-700',
  },
}

function formatTime(timestamp: Date) {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-2 w-2 animate-pulse rounded-full bg-current"
          style={{ animationDelay: `${dot * 0.15}s` }}
        />
      ))}
    </div>
  )
}

export default function AgentChat({ messages, isRunning }: AgentChatProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const hasMessages = messages.length > 0
  const orderedMessages = useMemo(() => messages, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [orderedMessages, isRunning])

  return (
    <section className="flex h-[72vh] flex-col overflow-hidden rounded-[32px] border border-stone-200 bg-[#fbf7f1] shadow-[0_18px_44px_rgba(120,113,108,0.16)]">
      <header className="border-b border-stone-200 bg-[#f4eadb] px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">에이전트 기록실</h2>
            <p className="mt-1 text-sm text-stone-600">
              각 에이전트가 남긴 판단과 초안의 흐름을 서재 노트처럼 보여줘
            </p>
          </div>
          <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs font-semibold text-stone-500">
            Live Log
          </span>
        </div>
      </header>

      <div className="border-b border-stone-200 bg-[#f8f2ea] px-6 py-4">
        <div className="flex flex-wrap gap-3">
          {Object.values(ROLE_META).map((meta) => (
            <div key={meta.label} className="rounded-2xl border border-stone-200 bg-[#fffdfa] px-3 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm shrink-0 ${meta.color}`}>
                  {meta.icon}
                </div>
                <span className="text-sm font-semibold text-stone-800 whitespace-nowrap">{meta.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,_rgba(255,255,255,0.55)_0%,_rgba(251,247,241,0.9)_100%)] px-4 py-4">
        {!hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-dashed border-stone-300 bg-[#f7efe3] px-8 text-center">
            <div className="text-5xl">🪶</div>
            <p className="mt-5 text-base font-semibold text-stone-900">
              주제를 입력하고 &apos;시작&apos;을 누르면
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              리서처와 작가, 편집자, 출판담당이 차례대로 원고를 준비합니다
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderedMessages.map((message, index) => {
              const meta = ROLE_META[message.role]
              const statusIcon =
                message.status === 'done' ? '✓' : message.status === 'error' ? '✕' : null

              return (
                <article
                  key={`${message.timestamp.toISOString()}-${index}`}
                  className="rounded-[28px] border border-stone-200 bg-[#fffdfa] p-4 shadow-[0_10px_24px_rgba(120,113,108,0.10)]"
                >
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${meta.color}`}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 whitespace-nowrap">{meta.label}</span>
                          {statusIcon ? (
                            <span
                              className={`text-sm ${
                                message.status === 'error'
                                  ? 'text-red-500'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {statusIcon}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-xs text-stone-500 whitespace-nowrap">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-stone-200 bg-[#f7efe3] px-3 py-1 text-xs font-medium text-stone-600 whitespace-nowrap">
                      {message.phase}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-stone-100 bg-[#f8f2ea] px-4 py-3 text-sm leading-7 text-stone-700">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.status === 'thinking' ? (
                      <div className="mt-3 text-amber-700">
                        <ThinkingDots />
                      </div>
                    ) : null}
                  </div>
                </article>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </section>
  )
}
