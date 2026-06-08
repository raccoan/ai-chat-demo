import ReactMarkdown from 'react-markdown'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MessageItemProps {
  role: 'user' | 'assistant'
  content: string
}

function MessageItem(props: MessageItemProps) {
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
    </div>
  )
}

export default MessageItem