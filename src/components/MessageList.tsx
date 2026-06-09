// src/components/MessageList.tsx
import { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'
import MessageItem from './MessageItem'
import type { Message } from '../types/message'

interface MessageListProps {
  messages: Message[]
  loading: boolean
  onRegenerate?: (messageIndex: number) => void
}

function MessageList({ messages, loading, onRegenerate }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  // 滚动到底部函数（直接操作容器）
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current
    if (!container) return
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    })
  }, [])

  // 判断是否接近底部（用于显示滚动按钮）
  const isNearBottom = useCallback(() => {
    const container = containerRef.current
    if (!container) return true
    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight < 150
  }, [])

  // 监听滚动事件，控制按钮显示
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const handleScroll = () => {
      setShowScrollBtn(!isNearBottom())
    }
    container.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [isNearBottom])

  // 首次挂载：滚动到底部（解决刷新后位置问题）
  useLayoutEffect(() => {
    scrollToBottom('auto')
  }, [scrollToBottom])

  // 消息变化时自动滚动（关键修复）
  useLayoutEffect(() => {
    // 如果消息列表为空，不滚动
    if (messages.length === 0) return
    // 直接滚动到底部，不再判断用户/AI，确保每次新消息都可见
    scrollToBottom('smooth')
  }, [messages, scrollToBottom]) // 依赖 messages 和 loading？loading 变化也可能需要滚动（比如显示打字指示器）
  // 如果你希望在 loading 状态变化时也滚动（例如开始显示“正在输入”时），可以添加 loading 依赖：
  // }, [messages, loading, scrollToBottom])

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