// 图片内容项
export interface ImageContent {
  type: 'image_url'
  image_url: {
    url: string // base64 格式: data:image/jpeg;base64,...
  }
}

// 文本内容项
export interface TextContent {
  type: 'text'
  text: string
}

// 消息内容类型（支持纯文本、纯图片、或混合）
export type MessageContent = string | (TextContent | ImageContent)[]

export interface Message {
  role: 'user' | 'assistant'
  content: MessageContent
  timestamp: number
  // 用于前端显示的图片预览（仅用户消息）
  images?: string[] // base64 格式的图片数组
}