# AI Chat - 智能对话助手

一个基于 React + TypeScript + Vite 构建的现代化 AI 聊天应用，集成 DeepSeek API，支持流式响应、多会话管理、Markdown 渲染和代码高亮。

[在线演示](https://your-demo-url.vercel.app) | [快速开始](#快速开始)

---

## ✨ 功能特性

### 💬 对话功能

- **多会话管理**：创建、切换、重命名、删除会话
- **流式响应**：实时显示 AI 回复，支持中途停止生成
- **Markdown 渲染**：支持标题、列表、链接等格式
- **代码高亮**：支持 20+ 编程语言的语法高亮

### 🎨 用户体验

- **平滑动画**：基于 Framer Motion 的流畅过渡效果
- **一键复制**：快速复制消息和代码内容
- **自动滚动**：新消息自动滚动到底部
- **滚动按钮**：快速回到最新消息

### 📱 响应式设计

- 完美适配桌面端和移动端
- 侧边栏可折叠
- 触摸友好的交互设计

---

## 🛠️ 技术栈

### 前端

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Framer Motion** - 动画库
- **React Router** - 路由管理
- **React Markdown** - Markdown 渲染
- **React Syntax Highlighter** - 代码高亮
- **React Icons** - 图标库

### 后端

- **Vercel Serverless** - 边缘函数部署
- **DeepSeek API** - AI 对话能力

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置环境变量

在项目根目录创建 `.env` 文件：

```env
DEEPSEEK_API_KEY=your_api_key_here
```

> [!TIP]
> 获取 API Key：访问 [DeepSeek 开放平台](https://platform.deepseek.com/)

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
npm run build
npm run preview
```

---

## 📁 项目结构

```
ai-chat/
├── api/
│   └── chat.ts              # Vercel Serverless API
├── src/
│   ├── api/
│   │   └── chat.ts          # 前端 API 调用
│   ├── assets/              # 静态资源
│   ├── components/          # React 组件
│   │   ├── Header.tsx       # 顶部导航栏
│   │   ├── InputBox.tsx     # 消息输入框
│   │   ├── MessageItem.tsx  # 单条消息
│   │   └── MessageList.tsx  # 消息列表
│   ├── pages/
│   │   └── ChatView.tsx     # 聊天页面
│   ├── types/               # TypeScript 类型定义
│   │   ├── conversation.ts  # 会话类型
│   │   └── message.ts       # 消息类型
│   ├── App.tsx              # 根组件
│   ├── App.css              # 应用样式
│   ├── index.css            # 全局样式
│   └── main.tsx             # 入口文件
├── public/
│   ├── favicon.svg          # 网站图标
│   └── icons.svg            # 图标资源
├── package.json             # 项目配置
├── vite.config.ts           # Vite 配置
├── vercel.json              # Vercel 配置
└── tsconfig.json            # TypeScript 配置
```

---

## 🎯 技术亮点

### 1. 流式响应实现

```typescript
// 使用 Fetch API + ReadableStream 实现实时流式输出
const response = await fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify({ messages }),
});

const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // 处理数据块...
}
```

### 2. 会话持久化

- 使用 localStorage 自动保存会话
- 支持数据迁移和版本兼容
- 离线可用

### 3. 响应式布局

- CSS Grid/Flexbox 自适应布局
- 媒体查询适配多端
- 触摸设备优化

### 4. 性能优化

- Vite 快速热更新
- React 19 最新特性
- 按需加载组件

---

## 🌐 部署

### Vercel 部署（推荐）

1. Fork 本项目到 GitHub
2. 登录 [Vercel](https://vercel.com)
3. Import 你的仓库
4. 添加环境变量 `DEEPSEEK_API_KEY`
5. Deploy！

### 环境变量说明

| 变量名             | 描述              | 必填 |
| ------------------ | ----------------- | ---- |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | ✅   |

---

## 🔮 未来规划

- [ ] 支持多模态对话（图片上传）
- [ ] 添加对话搜索功能
- [ ] 消息编辑功能
- [ ] 对话导出/分享
- [ ] 深色/浅色主题切换
- [ ] 键盘快捷键支持
- [ ] 单元测试覆盖

---

## 📄 许可证

[MIT License](LICENSE) - 欢迎 Star 和 PR！

---

## 🙏 致谢

- [DeepSeek](https://deepseek.com/) - 提供强大的 AI 能力
- [Vercel](https://vercel.com/) - 免费托管服务
- [React](https://react.dev/) - 优秀的 UI 框架
