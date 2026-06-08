import { useState } from 'react'

interface InputBoxProps {
  loading?: boolean
  onSend: (text: string) => void
}

function InputBox(props: InputBoxProps) {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return

    props.onSend(text)

    setText('')
  }

  return (
    <div className="input-box">
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value)
        }}
        placeholder="有问题,尽管问"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSend()
          }
        }}
      />

      <button
        disabled={props.loading}
        onClick={handleSend}>
        {props.loading ? '生成中' : '发送'}
      </button>
    </div>
  )
}

export default InputBox