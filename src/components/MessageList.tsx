// src/components/MessageList.tsx
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'
import MessageItem from './MessageItem'
import type { Message } from '../types/message'

interface MessageListProps {
  messages: Message[]
  loading: boolean
  onRegenerate?: (messageIndex: number) => void   // 保留重新生成回调
}

function MessageList({ messages, loading, onRegenerate }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const isNearBottom = () => {
    const container = containerRef.current
    if (!container) return true
    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight < 150
  }

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({
      behavior,
      block: 'end',
    })
  }

  // 滚动监听（控制按钮显示）
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const distance = scrollHeight - scrollTop - clientHeight
      setShowScrollBtn(distance > 100)
    }
    container.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // 新消息或 loading 变化时，如果接近底部则自动滚动
  useEffect(() => {
    if (!isNearBottom()) return

    requestAnimationFrame(() => {
      scrollToBottom('smooth')
    })
  }, [messages, loading])

  return (
    <div className="message-list-container" ref={containerRef}>
      {messages.map((msg, index) => (
        <MessageItem
          key={index}
          role={msg.role}
          content={msg.content}
          timestamp={msg.timestamp}
          onRegenerate={
            msg.role === 'assistant' && onRegenerate
              ? () => onRegenerate(index)
              : undefined
          }
        />
      ))}

      {loading && (
        <div className="typing-indicator">
          <span />
          <span />
          <span />
        </div>
      )}

      <div ref={bottomRef} />

      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            className="scroll-to-bottom"
            onClick={() => scrollToBottom('smooth')}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiChevronDown size={30} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MessageList