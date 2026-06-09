import { useRef, useEffect, useState } from 'react'
import { FiSend, FiStopCircle } from 'react-icons/fi'   // 新增停止图标
import { motion } from 'framer-motion'

interface InputBoxProps {
  loading: boolean
  onSend: (text: string) => void
  onStop?: () => void      // 新增停止回调
}

function InputBox({ loading, onSend, onStop }: InputBoxProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = () => {
    if (!text.trim() || loading) return
    onSend(text)
    setText('')
    inputRef.current?.focus()
  }

  const handleStop = () => {
    if (onStop) onStop()
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
      {loading ? (
        <motion.button
          onClick={handleStop}
          whileTap={{ scale: 0.95 }}
          className="stop-btn"
        >
          <FiStopCircle size={18} />
          <span>停止</span>
        </motion.button>
      ) : (
        <motion.button
          onClick={handleSend}
          disabled={loading || !text.trim()}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: loading
              ? '0 0 0 0 rgba(128, 187, 232, 0.7)'
              : '0 4px 15px rgba(99, 210, 241, 0.4)'
          }}
          transition={{ repeat: loading ? Infinity : 0, duration: 0.8 }}
        >
          <FiSend size={18} />
          <span>发送</span>
        </motion.button>
      )}
    </div>
  )
}

export default InputBox