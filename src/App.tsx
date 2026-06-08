import { useState } from 'react'
import { sendMessageStream } from './api/chat'
import Header from './components/Header'
import MessageList from './components/MessageList'
import InputBox from './components/InputBox'


import type { Message } from './types/message'

import './App.css'

function App() {

  // 添加loading状态
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好，我是AI助手'
    }
  ])
  // 这是一个处理发送消息的函数，包含以下步骤：
  const handleSend = async (text: string) => {
    setLoading(true)

    try {
      const newMessages = [
        ...messages,
        {
          role: 'user',
          content: text
        } as const
      ]

      setMessages(newMessages)

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: ''
        }
      ])

      await sendMessageStream(
        newMessages,
        (text) => {
          setMessages(prev => {
            const copy = [...prev]

            copy[copy.length - 1] = {
              role: 'assistant',
              content: text
            }

            return copy
          })
        }
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Header title="AI Chat" />

      <div className="chat-container">
        <MessageList messages={messages} loading={loading} />
      </div>

      <InputBox loading={loading} onSend={handleSend} />
    </div>
  )
}

export default App