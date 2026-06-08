import type { Message } from '../types/message'

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY

export async function sendMessageStream(
  messages: Message[],
  onMessage: (text: string) => void
) {
  const response = await fetch(
    'https://api.deepseek.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        stream: true
      })
    }
  )

  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')

  if (!reader) return

  let fullText = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })

    // DeepSeek/OpenAI SSE格式解析
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.replace('data: ', '')

        if (data === '[DONE]') return

        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content

          if (content) {
            fullText += content
            onMessage(fullText)
          }
        } catch (e) { console.error('解析消息失败', e) }
      }
    }
  }
}