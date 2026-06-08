import ReactMarkdown from 'react-markdown'

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
      <ReactMarkdown>{props.content}</ReactMarkdown>
    </div>
  )
}

export default MessageItem