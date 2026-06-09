// components/MessageItem.tsx
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion } from 'framer-motion'          // ① 导入动画库
import { FiCopy, FiCheck } from 'react-icons/fi' // ② 复制图标

interface MessageItemProps {
  role: 'user' | 'assistant'
  content: string
  timestamp: number   // 新增时间戳
}

function MessageItem(props: MessageItemProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(props.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 格式化时间
  const timeStr = new Date(props.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <motion.div                            // ③ 使用 motion.div 实现动画
      className={`message ${props.role}`}
      initial={{ opacity: 0, y: 20 }}     // 初始：透明 + 下移
      animate={{ opacity: 1, y: 0 }}      // 结束：可见 + 原位
      transition={{ duration: 0.3 }}      // 动画时长
      whileHover={{ scale: 1.02 }}        // ④ 悬停时稍微放大（趣味效果）
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
      </div>
    </motion.div>
  )
}

export default MessageItem