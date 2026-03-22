import { useState, useCallback, useRef } from 'react'
import type { Message, ToolCall } from '../types/chat'
import api from '../api/client'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      // Create assistant message placeholder
      const assistantMessageId = (Date.now() + 1).toString()
      let fullContent = ''
      const toolCallsMap = new Map<string, ToolCall>()

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      try {
        const response = await api.chatStream(content, messages.map((m) => ({
          role: m.role,
          content: m.content,
        })))

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body')
        }

        const decoder = new TextDecoder()
        let buffer = ''
        let currentEvent = ''

        // Add assistant message placeholder
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true,
            toolCalls: [],
          },
        ])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim()
              continue
            }
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              try {
                const parsed = JSON.parse(data)

                // Handle text event
                if (currentEvent === 'text' && parsed.content) {
                  fullContent += parsed.content
                  setMessages((prev) => {
                    const updated = [...prev]
                    const lastMsg = updated[updated.length - 1]
                    if (lastMsg?.id === assistantMessageId) {
                      lastMsg.content = fullContent
                    }
                    return updated
                  })
                }

                // Handle tool_use event (tool call started)
                if (currentEvent === 'tool_use' && parsed.name) {
                  const toolCall: ToolCall = {
                    id: parsed.id || crypto.randomUUID(),
                    name: parsed.name,
                    input: parsed.input || {},
                  }
                  toolCallsMap.set(toolCall.id, toolCall)
                  setMessages((prev) => {
                    const updated = [...prev]
                    const lastMsg = updated[updated.length - 1]
                    if (lastMsg?.id === assistantMessageId) {
                      lastMsg.toolCalls = [...(lastMsg.toolCalls || []), toolCall]
                    }
                    return updated
                  })
                }

                // Handle tool_start event
                if (currentEvent === 'tool_start' && parsed.name) {
                  // Find or create tool call
                  const existingTool = Array.from(toolCallsMap.values()).find(
                    (tc) => tc.name === parsed.name
                  )
                  if (!existingTool) {
                    const toolCall: ToolCall = {
                      id: crypto.randomUUID(),
                      name: parsed.name,
                      input: parsed.input || {},
                    }
                    toolCallsMap.set(toolCall.id, toolCall)
                    setMessages((prev) => {
                      const updated = [...prev]
                      const lastMsg = updated[updated.length - 1]
                      if (lastMsg?.id === assistantMessageId) {
                        lastMsg.toolCalls = [...(lastMsg.toolCalls || []), toolCall]
                      }
                      return updated
                    })
                  }
                }

                // Handle tool_result event
                if (currentEvent === 'tool_result' && parsed.id) {
                  const toolCall = toolCallsMap.get(parsed.id)
                  if (toolCall) {
                    toolCall.result = parsed.result
                    setMessages((prev) => {
                      const updated = [...prev]
                      const lastMsg = updated[updated.length - 1]
                      if (lastMsg?.id === assistantMessageId) {
                        lastMsg.toolCalls = lastMsg.toolCalls?.map((tc) =>
                          tc.id === parsed.id ? { ...tc, result: parsed.result } : tc
                        )
                      }
                      return updated
                    })
                  }
                }

                // Handle continuation event (AI is continuing after tools)
                if (currentEvent === 'continuation') {
                  fullContent = ''
                }

                // Handle done event
                if (currentEvent === 'done') {
                  // Final update done
                }
              } catch {
                // Ignore parse errors for incomplete JSON
              }
            }
          }

          // Reset event after processing each batch
          currentEvent = ''
        }

        // Mark as not streaming
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
          )
        )
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Request was cancelled, don't show error
          return
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Update last message with error
        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          if (lastMsg?.id === assistantMessageId) {
            lastMsg.content = `Error: ${errorMessage}`
            lastMsg.isStreaming = false
          } else {
            // Remove the placeholder message if there was an error
            return prev.filter((msg) => msg.id !== assistantMessageId)
          }
          return updated
        })
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [messages]
  )

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    cancel,
    clearMessages,
  }
}
