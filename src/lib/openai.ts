type OpenAIFunction = Record<string, unknown>

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_MODEL = import.meta.env.VITE_MODEL || 'gpt-5.4-mini'
const REQUEST_TIMEOUT = 120000

function createController() {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  return {
    controller,
    clear: () => window.clearTimeout(timeoutId),
  }
}

async function parseErrorResponse(response: Response) {
  try {
    const data = (await response.json()) as {
      error?: { message?: string }
    }

    return data.error?.message || `OpenAI API 요청에 실패했습니다. (${response.status})`
  } catch {
    return `OpenAI API 요청에 실패했습니다. (${response.status})`
  }
}

function getApiKey() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY가 설정되지 않았습니다.')
  }

  return apiKey
}

function createHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getApiKey()}`,
  }
}

export async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  functions?: OpenAIFunction[],
  functionCall?: string,
): Promise<string> {
  const { controller, clear } = createController()

  try {
    const tools = functions?.map((fn) => ({
      type: 'function' as const,
      function: fn,
    }))

    const toolChoice = functionCall
      ? { type: 'function' as const, function: { name: functionCall } }
      : undefined

    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: createHeaders(),
      signal: controller.signal,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        tools,
        tool_choice: toolChoice,
        max_completion_tokens: Number(import.meta.env.VITE_MAX_TOKENS || '8192'),
      }),
    })

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response))
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null
          tool_calls?: Array<{
            function?: {
              arguments?: string
            }
          }>
        }
      }>
    }

    const message = data.choices?.[0]?.message
    const toolArguments = message?.tool_calls?.[0]?.function?.arguments

    if (toolArguments) {
      return toolArguments
    }

    if (typeof message?.content === 'string') {
      return message.content
    }

    throw new Error('OpenAI 응답에서 유효한 결과를 찾지 못했습니다.')
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('OpenAI 요청 시간이 초과되었습니다.')
    }

    throw error instanceof Error
      ? error
      : new Error('OpenAI 호출 중 알 수 없는 오류가 발생했습니다.')
  } finally {
    clear()
  }
}

export async function callOpenAIStream(
  systemPrompt: string,
  userMessage: string,
  onChunk: (chunk: string) => void,
): Promise<string> {
  const { controller, clear } = createController()

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: createHeaders(),
      signal: controller.signal,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_completion_tokens: Number(import.meta.env.VITE_MAX_TOKENS || '8192'),
      }),
    })

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response))
    }

    if (!response.body) {
      throw new Error('스트리밍 응답 본문이 비어 있습니다.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let fullText = ''

    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        buffer += decoder.decode()
      } else if (value) {
        buffer += decoder.decode(value, { stream: true })
      }

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const rawLine of lines) {
        const line = rawLine.trim()

        if (!line.startsWith('data:')) {
          continue
        }

        const payload = line.slice(5).trim()

        if (!payload || payload === '[DONE]') {
          continue
        }

        const data = JSON.parse(payload) as {
          choices?: Array<{
            delta?: {
              content?: string
            }
          }>
        }

        const chunk = data.choices?.[0]?.delta?.content

        if (!chunk) {
          continue
        }

        fullText += chunk
        onChunk(chunk)
      }

      if (done) {
        break
      }
    }

    return fullText
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('OpenAI 스트리밍 요청 시간이 초과되었습니다.')
    }

    throw error instanceof Error
      ? error
      : new Error('OpenAI 스트리밍 호출 중 알 수 없는 오류가 발생했습니다.')
  } finally {
    clear()
  }
}
