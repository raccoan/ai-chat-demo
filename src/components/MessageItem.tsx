import ReactMarkdown from 'react-markdown'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MessageItemProps {
  role: 'user' | 'assistant'
  content: string,
  timestamp: number
}

// MessageItem.tsx
const formatTime = (timestamp?: number) => {
  if (!timestamp || isNaN(timestamp)) return ''
  const date = new Date(timestamp)
  // 检查是否有效
  if (isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// JSX 中


function MessageItem(props: MessageItemProps) {
  const time = new Date(props.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  console.log(props.timestamp, typeof props.timestamp)
  return (
    <div
      className={
        props.role === 'user'
          ? 'message user'
          : 'message assistant'
      }
    >
      <ReactMarkdown
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(
              className || ''
            )

            return match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
              >
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
      <div className="message-time">{formatTime(props.timestamp)}</div>
    </div>
  )
}

export default MessageItem