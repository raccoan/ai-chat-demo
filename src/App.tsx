
import { sendMessageStream } from './api/chat'
import Header from './components/Header'
import MessageList from './components/MessageList'
import InputBox from './components/InputBox'
import { useState, useEffect } from 'react'
import type { Conversation } from './types/conversation'
import type { Message } from './types/message'

import './App.css'

// App.tsx 顶部，组件外
const STORAGE_KEY = 'chat_conversations'   // 存储聊天记录的 key 名称，可以任意取
const DEFAULT_MESSAGE: Message = {
  role: 'assistant',
  content: '你好，我是AI助手',
  timestamp: Date.now()   // 这里调用是安全的，因为不在 React 渲染内
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // fallback
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

function createDefaultConversation(): Conversation {
  return {
    id: generateId(),
    title: '新对话',
    createdAt: Date.now(),
    messages: [
      DEFAULT_MESSAGE
    ],
  }
}

function App() {

  // 添加loading状态
  const [loading, setLoading] = useState(false)
  // 
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // 确保 parsed 是数组
        if (Array.isArray(parsed)) {
          const convWithTimestamp = parsed.map((conv: Conversation) => ({
            ...conv,
            messages: conv.messages.map((msg: Message) => ({
              ...msg,
              timestamp: msg.timestamp ?? Date.now()
            }))
          }))
          // 直接返回数组，不要加额外方括号
          return convWithTimestamp
        }
      } catch (e) {
        console.error('解析 localStorage 失败', e)
      }
    }
    // 没有存储或解析失败时，返回默认会话数组
    return [createDefaultConversation()]
  })

  // 当前对话ID
  const [currentConversationId, setCurrentConversationId] = useState<string>(() => {
    return conversations[0]?.id || ''
  })

  // 控制当前对话的消息列表面板打开或关闭
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentConversation = conversations.find(c => c.id === currentConversationId)
  const messages = currentConversation?.messages || []

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  }, [conversations])

  // ----- 新建会话 -----
  function handleNewConversation() {
    const newConv = createDefaultConversation()
    setConversations(prev => [newConv, ...prev])   // 新会话放在最前面
    setCurrentConversationId(newConv.id)
  }

  // ----- 删除会话 -----
  function handleDeleteConversation(convId: string) {
    setConversations(prev => {
      const newList = prev.filter(c => c.id !== convId)
      if (newList.length === 0) {
        // 如果没有会话了，创建一个默认会话
        const defaultConv = createDefaultConversation()
        setCurrentConversationId(defaultConv.id)
        return [defaultConv]
      }
      if (convId === currentConversationId) {
        // 如果删的是当前会话，自动切换到第一个会话
        setCurrentConversationId(newList[0].id)
      }
      return newList
    })
  }

  // ----- 切换会话 -----
  function handleSwitchConversation(convId: string) {
    setCurrentConversationId(convId)
    // 小屏幕可自动关闭侧边栏（可选）
    // setSidebarOpen(false)
  }

  // 这是一个处理发送消息的函数，包含以下步骤：
  const handleSend = async (text: string) => {
    if (!currentConversation) return
    setLoading(true)

    try {
      // 当前会话的旧消息
      const oldMessages = currentConversation.messages

      // 1. 构造用户消息
      const userMessage: Message = {
        role: 'user',
        content: text,
        timestamp: Date.now()
      }

      // 2. 添加用户消息后的临时消息数组
      const afterUser = [...oldMessages, userMessage]

      // 更新当前会话的消息（先显示用户消息）
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversationId
            ? { ...conv, messages: afterUser }
            : conv
        )
      )

      // 3. 添加一个空白 AI 占位消息
      const withAssistantPlaceholder: Message = {
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      }
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversationId
            ? { ...conv, messages: [...afterUser, withAssistantPlaceholder] }
            : conv
        )
      )

      // 4. 调用流式 API（传入不含占位的消息历史，即 afterUser）
      await sendMessageStream(afterUser, (streamText) => {
        // 流式回调：更新当前会话的最后一条消息（assistant 占位）的内容
        setConversations(prev =>
          prev.map(conv => {
            if (conv.id !== currentConversationId) return conv
            const updatedMessages = [...conv.messages]
            const lastIndex = updatedMessages.length - 1
            // 确保最后一条是 assistant 角色，更新其 content
            if (updatedMessages[lastIndex]?.role === 'assistant') {
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                content: streamText,
                timestamp: Date.now()
              }
            } else {
              // 防御：如果没有占位，就追加一条
              updatedMessages.push({
                role: 'assistant',
                content: streamText,
                timestamp: Date.now()
              })
            }
            // 自动更新会话标题（取第一条用户消息的前20字符）
            const userMsg = updatedMessages.find(m => m.role === 'user')
            const title = userMsg
              ? userMsg.content.slice(0, 20) + (userMsg.content.length > 20 ? '…' : '')
              : '新对话'
            return { ...conv, messages: updatedMessages, title }
          })
        )
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {/* Header 增加一个菜单按钮，点击时切换侧边栏 */}
      <Header title="AI Chat" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="app-body">
        {/* 侧边栏 */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <button className="new-chat-btn" onClick={handleNewConversation}>
              + 新对话
            </button>
            <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
              ×
            </button>
          </div>
          <div className="conversation-list">
            {conversations.map(conv => (
              <div key={conv.id} className="conversation-item-wrapper">
                <div
                  className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
                  onClick={() => handleSwitchConversation(conv.id)}
                >
                  <div className="conv-title">{conv.title}</div>
                  <div className="conv-date">
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="delete-conv"
                  onClick={(e) => {
                    e.stopPropagation()  // 防止触发父级的 onClick（切换会话）
                    handleDeleteConversation(conv.id)
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* 主聊天区域 */}
        <main className="chat-main">
          <div className="chat-container">
            <MessageList messages={messages} loading={loading} />
          </div>
          <InputBox loading={loading} onSend={handleSend} />
        </main>
      </div>

      {/* 侧边栏关闭时，显示一个浮动按钮重新打开 */}
      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
      )}
    </div>
  )
}

export default App
