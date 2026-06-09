import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion } from 'framer-motion'
import { FiCopy, FiCheck, FiRefreshCw } from 'react-icons/fi'   // 新增刷新图标

interface MessageItemProps {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  onRegenerate?: () => void   // 新增重新生成回调（仅 assistant）
}

function MessageItem(props: MessageItemProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(props.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const timeStr = new Date(props.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <motion.div
      className={`message ${props.role}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="message-content">
        <ReactMarkdown
          components={{
            code({ className, children }) {
              const match = /language-(\w+)/.exec(className || '')
              return match ? (
                <SyntaxHighlighter style={oneDark} language={match[1]}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code>{children}</code>
              )
            }
          }}
        >
          {props.content}
        </ReactMarkdown>
      </div>

      <div className="message-footer">
        <span className="message-time">{timeStr}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? <FiCheck /> : <FiCopy />}
          <span>{copied ? '已复制' : '复制'}</span>
        </button>
        {props.role === 'assistant' && props.onRegenerate && (
          <button className="regenerate-btn" onClick={props.onRegenerate} title="重新生成">
            <FiRefreshCw size={16} />
            <span>重新生成</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default MessageItem