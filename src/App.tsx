import { useState } from 'react'
import { sendMessageStream } from './api/chat'
import Header from './components/Header'
import MessageList from './components/MessageList'
import InputBox from './components/InputBox'


import type { Message } from './types/message'

import './App.css'

// App.tsx 顶部，组件外
const STORAGE_KEY = 'chat_messages'   // 存储聊天记录的 key 名称，可以任意取
const DEFAULT_MESSAGE: Message = {
  role: 'assistant',
  content: '你好，我是AI助手',
  timestamp: Date.now()   // 这里调用是安全的，因为不在 React 渲染内
}

function App() {

  // 添加loading状态
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const messagesWithTimestamp = parsed.map((msg: Message) => ({
        ...msg,
        timestamp: msg.timestamp ?? Date.now()
      }))
      return messagesWithTimestamp
    }
    return [DEFAULT_MESSAGE]
  })
  // 这是一个处理发送消息的函数，包含以下步骤：
  const handleSend = async (text: string) => {
    setLoading(true)

    try {
      const newMessages = [
        ...messages,
        {
          role: 'user',
          content: text,
          timestamp: Date.now()
        } as const
      ]

      setMessages(newMessages)

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '',
          timestamp: Date.now()
        }
      ])

      await sendMessageStream(
        newMessages,
        (text) => {
          setMessages(prev => {
            const copy = [...prev]

            copy[copy.length - 1] = {
              role: 'assistant',
              content: text,
              timestamp: Date.now()
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