// src/pages/ChatView.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
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
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const currentConversation = conversations.find(c => c.id === conversationId)
  const messages = currentConversation?.messages || []
  const [loading, setLoading] = useState(false)
  const prevLengthRef = useRef(conversations.length)

  // ----- 停止生成相关 -----
  const abortControllerRef = useRef<AbortController | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsStreaming(false)
      setLoading(false)
    }
  }, [])

  // ----- 会话重命名相关 -----
  const [editingConvId, setEditingConvId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const startRename = (convId: string, currentTitle: string) => {
    setEditingConvId(convId)
    setEditTitle(currentTitle)
  }

  const saveRename = (convId: string) => {
    if (!editTitle.trim()) return
    setConversations(prev =>
      prev.map(conv =>
        conv.id === convId ? { ...conv, title: editTitle.trim() } : conv
      )
    )
    setEditingConvId(null)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent, convId: string) => {
    if (e.key === 'Enter') saveRename(convId)
    if (e.key === 'Escape') setEditingConvId(null)
  }

  // ----- 路由跳转逻辑（原有）-----
  useEffect(() => {
    if (conversations.length > 0 && !currentConversation) {
      navigate(`/chat/${conversations[0].id}`, { replace: true })
    }
  }, [conversations, currentConversation, navigate])

  useEffect(() => {
    if (conversations.length > prevLengthRef.current) {
      const newest = conversations[0]
      if (newest && newest.id !== conversationId) {
        navigate(`/chat/${newest.id}`, { replace: true })
      }
    }
    prevLengthRef.current = conversations.length
  }, [conversations, conversationId, navigate])

  const handleSwitchConversation = (id: string) => {
    navigate(`/chat/${id}`)
    setSidebarOpen(false)
  }

  // ----- 重新生成功能 -----
  const handleRegenerate = useCallback(async (assistantIndex: number) => {
    if (!currentConversation) return
    const allMessages = currentConversation.messages

    // 找到该 AI 消息之前的最近一条用户消息
    let userIndex = -1
    for (let i = assistantIndex - 1; i >= 0; i--) {
      if (allMessages[i].role === 'user') {
        userIndex = i
        break
      }
    }
    if (userIndex === -1) return

    const historyUpToUser = allMessages.slice(0, userIndex + 1)

    // 清空当前 AI 消息内容（占位）
    setConversations(prev =>
      prev.map(conv =>
        conv.id === currentConversation.id
          ? {
            ...conv,
            messages: conv.messages.map((msg, idx) =>
              idx === assistantIndex ? { ...msg, content: '' } : msg
            ),
          }
          : conv
      )
    )

    setLoading(true)
    const controller = new AbortController()
    abortControllerRef.current = controller
    setIsStreaming(true)

    try {
      await sendMessageStream(historyUpToUser, (streamText) => {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversation.id
              ? {
                ...conv,
                messages: conv.messages.map((msg, idx) =>
                  idx === assistantIndex ? { ...msg, content: streamText, timestamp: Date.now() } : msg
                ),
              }
              : conv
          )
        )
      }, controller.signal)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('重新生成失败', error)
      }
    } finally {
      setIsStreaming(false)
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [currentConversation, setConversations])

  // ----- 发送消息（加入停止控制）-----
  const handleSend = async (text: string) => {
    if (!currentConversation) return
    if (isStreaming) {
      stopGeneration()
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setLoading(true)
    setIsStreaming(true)
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const userMessage: Message = {
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }
      const afterUser = [...currentConversation.messages, userMessage]
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversation.id
            ? { ...conv, messages: afterUser }
            : conv
        )
      )

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

      await sendMessageStream(afterUser, (streamText) => {
        setConversations(prev =>
          prev.map(conv => {
            if (conv.id !== currentConversation.id) return conv
            const updated = [...conv.messages]
            const lastIndex = updated.length - 1
            if (updated[lastIndex]?.role === 'assistant') {
              updated[lastIndex] = { ...updated[lastIndex], content: streamText, timestamp: Date.now() }
            } else {
              updated.push({ role: 'assistant', content: streamText, timestamp: Date.now() })
            }
            const firstUser = updated.find(m => m.role === 'user')
            const title = firstUser
              ? firstUser.content.slice(0, 20) + (firstUser.content.length > 20 ? '…' : '')
              : '新对话'
            return { ...conv, messages: updated, title }
          })
        )
      }, controller.signal)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('发送失败', error)
      }
    } finally {
      setIsStreaming(false)
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  // ----- 渲染侧边栏（支持重命名）-----
  return (
    <div className="app">
      <Header title="AI Chat" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="app-body">
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <button className="new-chat-btn" onClick={onNewConversation}>
              + 新对话
            </button>
            <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>×</button>
          </div>
          <div className="conversation-list">
            {conversations.map(conv => (
              <div key={conv.id} className="conversation-item-wrapper">
                <div
                  className={`conversation-item ${conv.id === conversationId ? 'active' : ''}`}
                  onClick={() => handleSwitchConversation(conv.id)}
                >
                  {editingConvId === conv.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => saveRename(conv.id)}
                      onKeyDown={(e) => handleRenameKeyDown(e, conv.id)}
                      autoFocus
                      className="rename-input"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className="conv-title"
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        startRename(conv.id, conv.title)
                      }}
                    >
                      {conv.title}
                    </div>
                  )}
                  <div className="conv-date">{new Date(conv.createdAt).toLocaleDateString()}</div>
                </div>
                <button
                  className="delete-conv"
                  onClick={e => { e.stopPropagation(); onDeleteConversation(conv.id) }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </aside>

        <main className="chat-main">
          <MessageList messages={messages} loading={loading} onRegenerate={handleRegenerate} />
          <InputBox loading={loading} onSend={handleSend} onStop={stopGeneration} />
        </main>
      </div>

      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>☰</button>
      )}
    </div>
  )
}