// src/pages/ChatView.tsx
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
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const currentConversation = conversations.find(c => c.id === conversationId)
  const messages = currentConversation?.messages || []
  const [loading, setLoading] = useState(false)
  const prevLengthRef = useRef(conversations.length)

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

  const handleSend = async (text: string) => {
    if (!currentConversation) return
    setLoading(true)
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

      await sendMessageStream(afterUser, streamText => {
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
      })
    } finally {
      setLoading(false)
    }
  }

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
                  <div className="conv-title">{conv.title}</div>
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
          <MessageList messages={messages} loading={loading} />
          <InputBox loading={loading} onSend={handleSend} />
        </main>
      </div>

      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>☰</button>
      )}
    </div>
  )
}