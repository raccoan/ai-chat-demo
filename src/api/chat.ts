// src/api/chat.ts
import type { Message } from '../types/message'

export async function sendMessageStream(
  messages: Message[],
  onMessage: (text: string) => void
) {
  const response = await fetch('/api/chat', {   // 相对路径，Vercel 会自动处理
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (!response.body) return

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let fullText = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
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
        } catch (e) { console.error('解析流式响应失败', e) }
      }
    }
  }
}