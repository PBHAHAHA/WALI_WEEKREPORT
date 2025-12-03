interface AskResponse {
  answer: string
}

interface GenerateWeeklyReportResponse {
  content: string
}

interface ImproveDailyLogResponse {
  content: string
}

export const useAi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBaseUrl || 'http://localhost:3001/api'
  const token = useCookie('auth_token')

  // AI 问答（流式）
  const askStream = async (
    question: string, 
    onChunk: (content: string) => void,
    systemPrompt?: string
  ) => {
    const response = await fetch(`${apiBase}/ai/ask/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token.value ? `Bearer ${token.value}` : '',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ question, systemPrompt }),
    })

    if (!response.ok) {
      throw new Error('AI 请求失败')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        try {
          const data = JSON.parse(trimmed.slice(6))
          if (data.content) {
            onChunk(data.content)
          }
          if (data.error) {
            throw new Error(data.error)
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }

  // AI 问答（非流式）
  const ask = async (question: string, systemPrompt?: string) => {
    const api = useApi()
    return api.post<AskResponse>('/ai/ask', { question, systemPrompt })
  }

  // 根据日报生成周报（流式）
  const generateWeeklyReportStream = async (
    dailyLogs: Array<{ date: string; content: string }>,
    onChunk: (content: string) => void
  ) => {
    const response = await fetch(`${apiBase}/ai/generate-weekly-report/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token.value ? `Bearer ${token.value}` : '',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ dailyLogs }),
    })

    if (!response.ok) {
      throw new Error('生成周报失败')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        try {
          const data = JSON.parse(trimmed.slice(6))
          if (data.content) {
            onChunk(data.content)
          }
          if (data.error) {
            throw new Error(data.error)
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }

  // 根据日报生成周报（非流式）
  const generateWeeklyReport = async (dailyLogs: Array<{ date: string; content: string }>) => {
    const api = useApi()
    return api.post<GenerateWeeklyReportResponse>('/ai/generate-weekly-report', { dailyLogs })
  }

  // 优化日报内容
  const improveDailyLog = async (content: string) => {
    const api = useApi()
    return api.post<ImproveDailyLogResponse>('/ai/improve-daily-log', { content })
  }

  return {
    ask,
    askStream,
    generateWeeklyReport,
    generateWeeklyReportStream,
    improveDailyLog,
  }
}
