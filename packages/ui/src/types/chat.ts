export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
  isStreaming?: boolean
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  result?: unknown
}

export interface ChatEvent {
  type: 'text' | 'tool_use' | 'tool_result' | 'done' | 'error'
  data: Record<string, unknown>
}
