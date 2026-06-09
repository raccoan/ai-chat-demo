// App.tsx
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ChatView } from './pages/ChatView'
import type { Conversation } from './types/conversation'
import type { Message } from './types/message'
import './App.css'

// 存储 key
const STORAGE_KEY = 'chat_conversations'

// 默认欢迎消息
const DEFAULT_MESSAGE: Message = {
  role: 'assistant',
  content: '你好，我是AI助手',
  timestamp: Date.now(),
}

// 生成唯一 ID
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

// 创建默认会话
function createDefaultConversation(): Conversation {
  return {
    id: generateId(),
    title: '新对话',
    createdAt: Date.now(),
    messages: [{ ...DEFAULT_MESSAGE, timestamp: Date.now() }], // 确保每次新建时间独立
  }
}

function App() {
  // 全局会话列表
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          // 兼容旧数据：补全缺失的 timestamp
          return parsed.map((conv: Conversation) => ({
            ...conv,
            messages: conv.messages.map((msg: Message) => ({
              ...msg,
              timestamp: msg.timestamp ?? Date.now(),
            })),
          }))
        }
      } catch (e) {
        console.error('解析 localStorage 失败', e)
      }
    }
    return [createDefaultConversation()]
  })

  // 侧边栏开关（移动端）
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 自动保存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  }, [conversations])

  // 新建会话
  const handleNewConversation = () => {
    const newConv = createDefaultConversation()
    setConversations(prev => [newConv, ...prev])
    // 路由跳转由 ChatView 内部的 useEffect 自动完成（监听 conversations 长度变化）
  }

  // 删除会话
  const handleDeleteConversation = (id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id)
      if (filtered.length === 0) {
        // 如果全部删完，创建一个默认会话
        const defaultConv = createDefaultConversation()
        return [defaultConv]
      }
      return filtered
    })
    // 注意：如果删除的是当前正在查看的会话，ChatView 中的 useEffect 会自动重定向到第一个会话
  }

  return (
    <Routes>
      {/* 根路径重定向到第一个会话 */}
      <Route
        path="/"
        element={
          <Navigate
            to={conversations[0] ? `/chat/${conversations[0].id}` : '/chat/placeholder'}
            replace
          />
        }
      />

      {/* 聊天路由 */}
      <Route
        path="/chat/:conversationId"
        element={
          <ChatView
            conversations={conversations}
            setConversations={setConversations}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        }
      />

      {/* 404 */}
      <Route path="*" element={<div style={{ padding: 20 }}>页面不存在</div>} />
    </Routes>
  )
}

export default App