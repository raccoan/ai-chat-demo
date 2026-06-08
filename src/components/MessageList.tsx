import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'
import type { Message } from '../types/message'

interface MessageListProps {
  messages: Message[]
  loading: boolean
}

function MessageList(props: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [props.messages, props.loading])

  return (
    <div>
      {props.messages.map((item, index) => (
        <MessageItem
          key={index}
          role={item.role}
          content={item.content}
        />
      ))}

      {props.loading && (
        <div className="message assistant">
          AI正在输入...
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList