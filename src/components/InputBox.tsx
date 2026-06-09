// components/InputBox.tsx
import { useRef, useEffect, useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface InputBoxProps {
  loading: boolean
  onSend: (text: string) => void
}

function InputBox({ loading, onSend }: InputBoxProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = () => {
    if (!text.trim() || loading) return
    onSend(text)
    setText('')
    // 发送后重新聚焦
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="input-box">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="输入消息... (Enter 发送)"
        disabled={loading}
      />
      <motion.button
        onClick={handleSend}
        disabled={loading || !text.trim()}
        whileTap={{ scale: 0.95 }}     // 点击时轻微缩小，趣味效果
        animate={{
          boxShadow: loading
            ? '0 0 0 0 rgba(99, 102, 241, 0.7)'
            : '0 4px 15px rgba(99, 102, 241, 0.4)'
        }}
        transition={{ repeat: loading ? Infinity : 0, duration: 0.8 }}
      >
        <FiSend size={18} />
        <span>发送</span>
      </motion.button>
    </div>
  )
}

export default InputBox