import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { PageHeader } from '../components/PageHeader'
import { useChat } from '../hooks/useChat'

function ToolCallDisplay({ toolCall }: { toolCall: { name: string; input: Record<string, unknown>; result?: unknown } }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mt-2 border border-border/50 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 bg-bg-primary/50 flex items-center justify-between text-xs hover:bg-bg-primary transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-accent">⚡</span>
          <span className="text-text-muted font-mono">{toolCall.name}</span>
        </span>
        <span className="text-text-muted">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="p-3 bg-bg-primary/30 text-xs">
          <div className="mb-2">
            <span className="text-text-muted">Input:</span>
            <pre className="mt-1 p-2 bg-bg-secondary rounded text-text overflow-x-auto">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          </div>
          {toolCall.result ? (
            <div>
              <span className="text-text-muted">Result:</span>
              <pre className="mt-1 p-2 bg-bg-secondary rounded text-text overflow-x-auto max-h-48 overflow-y-auto">
                {typeof toolCall.result === 'string'
                  ? toolCall.result
                  : JSON.stringify(toolCall.result, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function ChatPage() {
  const { messages, isLoading, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    await sendMessage(userMessage)
  }

  // Example prompts for quick start
  const examplePrompts = [
    '查询 BTC 当前价格',
    '查询全球市场总览',
    '查看热门板块',
    '创建价格预警',
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        title="对话"
        description="与 AI 交易助手交互"
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col justify-center items-center h-full text-text-muted">
            <div className="text-center max-w-md">
              <p className="text-sm mb-4">发送消息开始对话</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="px-3 py-2 bg-bg-secondary/50 border border-border/50 rounded-lg hover:bg-bg-secondary hover:border-border transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-accent text-white rounded-br-md'
                  : 'bg-bg-secondary border border-border text-text rounded-bl-md'
              }`}
            >
              <div className="text-sm markdown-content">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>

              {/* Tool calls display for assistant messages */}
              {message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider">
                    Tool Calls ({message.toolCalls.length})
                  </div>
                  {message.toolCalls.map((toolCall) => (
                    <ToolCallDisplay key={toolCall.id} toolCall={toolCall} />
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] mt-1 ${
                  message.role === 'user' ? 'text-white/60' : 'text-text-muted'
                }`}
              >
                {message.isStreaming ? (
                  <span className="animate-pulse">输入中...</span>
                ) : (
                  message.timestamp.toLocaleTimeString()
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start message-enter">
            <div className="bg-bg-secondary border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入您的问题..."
            className="flex-1 px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent/60 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  )
}
