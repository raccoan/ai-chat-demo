// components/MessageList.tsx
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'
import MessageItem from './MessageItem'
import type { Message } from '../types/message'

interface MessageListProps {
  messages: Message[]
  loading: boolean
}

function MessageList({ messages, loading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  // 滚动到底部
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 检查滚动位置并更新按钮显示状态
  const checkScrollPosition = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    const shouldShow = distanceFromBottom > 200  // 距离底部超过200px时显示
    setShowScrollBtn(shouldShow)
  }

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('scroll', checkScrollPosition)
    // 初始检查一次（防止一开始就在底部却显示了按钮）
    checkScrollPosition()
    return () => container.removeEventListener('scroll', checkScrollPosition)
  }, [])

  // 消息变化时滚动到底部，并重新检查按钮状态
  useEffect(() => {
    scrollToBottom()
    // 延迟一下再检查，确保滚动完成
    setTimeout(() => checkScrollPosition(), 100)
  }, [messages, loading])

  return (
    <div
      className="chat-container"
      ref={containerRef}
      style={{ position: 'relative' }}  // 确保绝对定位按钮的参考系
    >
      {messages.map((msg, idx) => (
        <MessageItem
          key={idx}
          role={msg.role}
          content={msg.content}
          timestamp={msg.timestamp}
        />
      ))}

      {loading && (
        <div className="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      )}

      <div ref={bottomRef} />

      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            className="scroll-to-bottom"
            onClick={scrollToBottom}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ y: -2 }}
          >
            <FiChevronDown size={24} />

          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MessageList