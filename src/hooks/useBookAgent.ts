import { useCallback, useState } from 'react'
import { runMockPipeline, shouldUseMockMode } from '../lib/mockAgent'
import { createEmptyProject, runBookPipeline } from '../lib/orchestrator'
import type { AgentMessage, BookGenre, BookProject } from '../types/agent'

export function useBookAgent() {
  const [project, setProject] = useState<BookProject>(createEmptyProject())
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startPipeline = useCallback(async (topic: string, genre: BookGenre) => {
    setIsRunning(true)
    setError(null)
    setMessages([])
    setProject(createEmptyProject(topic, genre))

    try {
      const isMock = shouldUseMockMode()
      const runPipeline = isMock ? runMockPipeline : runBookPipeline

      if (isMock) {
        console.warn('[AI Book Agent] API 키가 없어 Mock 모드로 실행합니다.')
      }

      await runPipeline(
        topic,
        genre,
        (message) => {
          setMessages((current) => [...current, message])
        },
        (nextProject) => {
          setProject(nextProject)
        },
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '파이프라인 실행 중 오류가 발생했습니다.'
      console.error('[AI Book Agent] Pipeline error:', err)
      setError(errorMessage)
      setMessages((current) => [
        ...current,
        {
          role: 'publisher' as const,
          content: `오류 발생: ${errorMessage}`,
          phase: 'ERROR',
          status: 'error' as const,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsRunning(false)
    }
  }, [])

  const reset = useCallback(() => {
    setMessages([])
    setProject(createEmptyProject())
    setIsRunning(false)
    setError(null)
  }, [])

  return {
    project,
    messages,
    isRunning,
    error,
    startPipeline,
    reset,
  }
}
