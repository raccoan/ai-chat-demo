// pages/ChatView.tsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import MessageList from '../components/MessageList'
import InputBox from '../components/InputBox'
import { sendMessageStream } from '../api/chat'
import type { Conversation } from '../types/conversation'
import type { Message } from '../types/message'

interface ChatViewProps {
  conversations: Conversation[]
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
}

export function ChatView({
  conversations,
  setConversations,
  sidebarOpen,
  setSidebarOpen,
  onNewConversation,
  onDeleteConversation,
}: ChatViewProps) {
  // 从 URL 中获取会话 ID
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()

  // 找出当前会话
  const currentConversation = conversations.find(c => c.id === conversationId)
  const messages = currentConversation?.messages || []
  const [loading, setLoading] = useState(false)

  // 记录会话数量变化（用于新建会话后自动跳转）
  const prevLengthRef = useRef(conversations.length)

  // 如果 URL 中的 ID 无效，重定向到第一个有效会话
  useEffect(() => {
    if (conversations.length > 0 && !currentConversation) {
      navigate(`/chat/${conversations[0].id}`, { replace: true })
    }
  }, [conversations, currentConversation, navigate])

  // 新建会话后自动跳转到最新的会话（新建时会话被添加到数组最前面）
  useEffect(() => {
    if (conversations.length > prevLengthRef.current) {
      const newest = conversations[0]
      if (newest && newest.id !== conversationId) {
        navigate(`/chat/${newest.id}`, { replace: true })
      }
    }
    prevLengthRef.current = conversations.length
  }, [conversations, conversationId, navigate])

  // 切换会话
  const handleSwitchConversation = (id: string) => {
    navigate(`/chat/${id}`)
    setSidebarOpen(false) // 移动端自动关闭侧边栏
  }

  // 发送消息（流式）
  const handleSend = async (text: string) => {
    if (!currentConversation) return
    setLoading(true)

    try {
      const oldMessages = currentConversation.messages
      const userMessage: Message = {
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }
      const afterUser = [...oldMessages, userMessage]

      // 1. 显示用户消息
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversation.id
            ? { ...conv, messages: afterUser }
            : conv
        )
      )

      // 2. 添加空白 AI 占位
      const placeholder: Message = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversation.id
            ? { ...conv, messages: [...afterUser, placeholder] }
            : conv
        )
      )

      // 3. 调用流式 API
      await sendMessageStream(afterUser, (streamText) => {
        setConversations(prev =>
          prev.map(conv => {
            if (conv.id !== currentConversation.id) return conv
            const updated = [...conv.messages]
            const lastIndex = updated.length - 1
            if (updated[lastIndex]?.role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: streamText,
                timestamp: Date.now(),
              }
            } else {
              updated.push({
                role: 'assistant',
                content: streamText,
                timestamp: Date.now(),
              })
            }
            // 自动生成标题（取第一条用户消息的前20字）
            const firstUser = updated.find(m => m.role === 'user')
            const title = firstUser
              ? firstUser.content.slice(0, 20) + (firstUser.content.length > 20 ? '…' : '')
              : '新对话'
            return { ...conv, messages: updated, title }
          })
        )
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Header title="AI Chat" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="app-body">
        {/* 侧边栏 */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <button className="new-chat-btn" onClick={onNewConversation}>
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
                  className={`conversation-item ${conv.id === conversationId ? 'active' : ''}`}
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
                    e.stopPropagation()
                    onDeleteConversation(conv.id)
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* 聊天区域 */}
        <main className="chat-main">
          <div className="chat-container">
            <MessageList messages={messages} loading={loading} />
          </div>
          <InputBox loading={loading} onSend={handleSend} />
        </main>
      </div>

      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
      )}
    </div>
  )
}