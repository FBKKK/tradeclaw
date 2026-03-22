import { Hono } from 'hono'
import Anthropic from '@anthropic-ai/sdk'
import { executeTool, getSkillDescriptionsForPrompt } from '@tradeclaw/agent'

const anthropic = new Anthropic()

// Get skill descriptions for the system prompt
const SKILL_DESCRIPTIONS = getSkillDescriptionsForPrompt()

// System prompt for TradeClaw AI assistant
const SYSTEM_PROMPT = `You are TradeClaw, an AI-powered trading assistant. Your role is to help users with:

1. Market Analysis - Query prices, klines, orderbooks using real-time data
2. Index Analysis - Analyze SSI indices, ETF flows, sector performance
3. On-Chain Analysis - Chain TVL, DEX volumes, BTC holdings
4. Trading - Execute paper trades, manage strategies
5. Alerts - Create and manage price alerts
6. Reports - Generate daily/weekly/monthly reports

## Available Tools

When users ask about market data, prices, or any data-related questions, you MUST use the available tools to get real data.

**IMPORTANT Guidelines:**
- Always prioritize risk management. Warn users about potential risks, fees, and market conditions.
- Default to paper/simulation trading unless users explicitly request live trading.
- Use the tools to get real-time data whenever possible.
- Be concise and actionable in your responses.
- When users ask about specific symbols (BTC, ETH, etc.), use the appropriate tool to get current data.
- Format numerical data in a readable way (e.g., $50,000.00 instead of 50000).

## Tool Categories

${SKILL_DESCRIPTIONS}
`

// Tool definitions for Claude API (built from skill tools)
const TOOLS = [
  {
    name: 'get_global_market',
    description: 'Get global crypto market overview',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'search_tokens',
    description: 'Search for tokens by keyword',
    input_schema: {
      type: 'object' as const,
      properties: {
        keyword: { type: 'string', description: 'Search keyword' },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'get_hot_sectors',
    description: 'Get hot trading sectors',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_token_list',
    description: 'Get top tokens list',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Number of tokens' },
      },
    },
  },
  {
    name: 'get_news',
    description: 'Get latest crypto news',
    input_schema: {
      type: 'object' as const,
      properties: {
        sector: { type: 'string' },
      },
    },
  },
  {
    name: 'get_index_info',
    description: 'Get SSI index details',
    input_schema: {
      type: 'object' as const,
      properties: {
        indexTicker: { type: 'string', description: 'Index ticker (e.g., ssiMAG7, ssiMeme)' },
      },
      required: ['indexTicker'],
    },
  },
  {
    name: 'get_etf_data',
    description: 'Get ETF fund data and flows',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_chart_data',
    description: 'Get chart indicator data',
    input_schema: {
      type: 'object' as const,
      properties: {
        innerKey: { type: 'string' },
      },
      required: ['innerKey'],
    },
  },
  {
    name: 'get_chain_stats',
    description: 'Get blockchain statistics',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_btc_holdings',
    description: 'Get BTC holdings by region',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_crypto_stocks',
    description: 'Get crypto-related stocks',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'create_alert',
    description: 'Create a price alert',
    input_schema: {
      type: 'object' as const,
      properties: {
        symbol: { type: 'string' },
        condition: { type: 'string', enum: ['above', 'below'] },
        price: { type: 'number' },
      },
      required: ['symbol', 'condition', 'price'],
    },
  },
  {
    name: 'list_alerts',
    description: 'List all alerts',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'delete_alert',
    description: 'Delete an alert',
    input_schema: {
      type: 'object' as const,
      properties: {
        alertId: { type: 'string' },
      },
      required: ['alertId'],
    },
  },
  {
    name: 'get_strategies',
    description: 'Get trading strategies',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'create_strategy',
    description: 'Create a trading strategy',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' },
        entryCondition: { type: 'string' },
        exitCondition: { type: 'string' },
      },
      required: ['name', 'entryCondition', 'exitCondition'],
    },
  },
  {
    name: 'backtest_strategy',
    description: 'Backtest a strategy',
    input_schema: {
      type: 'object' as const,
      properties: {
        strategyId: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
      },
      required: ['strategyId', 'startDate', 'endDate'],
    },
  },
  {
    name: 'execute_trade',
    description: 'Execute a paper trade',
    input_schema: {
      type: 'object' as const,
      properties: {
        symbol: { type: 'string' },
        side: { type: 'string', enum: ['buy', 'sell'] },
        amount: { type: 'number' },
        exchange: { type: 'string' },
      },
      required: ['symbol', 'side', 'amount'],
    },
  },
  {
    name: 'get_positions',
    description: 'Get open positions',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'generate_daily_report',
    description: 'Generate daily report',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'generate_weekly_report',
    description: 'Generate weekly report',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'generate_monthly_report',
    description: 'Generate monthly report',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
]

export const chatRoutes = new Hono()

/**
 * Execute tool and format result for AI
 */
async function handleToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<string> {
  const result = await executeTool(toolName, toolInput)

  if (!result.success) {
    return `Error: ${result.error}`
  }

  // Format the result nicely
  if (typeof result.result === 'object') {
    return JSON.stringify(result.result, null, 2)
  }

  return String(result.result)
}

/**
 * Build messages array with tool results for continuation
 */
function buildToolResultMessages(
  originalMessages: Anthropic.MessageParam[],
  toolResults: Array<{
    toolUseId: string
    toolName: string
    toolInput: Record<string, unknown>
    toolResult: string
  }>
): Anthropic.MessageParam[] {
  const messages = [...originalMessages]

  // Add assistant message with tool_use blocks
  const toolUseBlocks = toolResults.map((tr) => ({
    type: 'tool_use' as const,
    id: tr.toolUseId,
    name: tr.toolName,
    input: tr.toolInput,
  }))

  messages.push({
    role: 'assistant',
    content: toolUseBlocks,
  })

  // Add user message with tool results
  messages.push({
    role: 'user',
    content: toolResults.map((tr) => ({
      type: 'tool_result' as const,
      tool_use_id: tr.toolUseId,
      content: tr.toolResult,
    })),
  })

  return messages
}

// Non-streaming chat endpoint
chatRoutes.post('/', async (c) => {
  const { message, history } = await c.req.json<{
    message: string
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  }>()

  const messages: Anthropic.MessageParam[] = (history || []).map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }))
  messages.push({ role: 'user', content: message })

  try {
    let currentMessages = messages
    let maxIterations = 5 // Prevent infinite loops
    let finalTextContent = ''

    while (maxIterations > 0) {
      maxIterations--

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: currentMessages,
        tools: TOOLS as Anthropic.Tool[],
      })

      // Check if AI wants to use tools
      const toolUses = response.content.filter(
        (block) => block.type === 'tool_use'
      ) as Anthropic.ToolUseBlock[]

      if (toolUses.length === 0) {
        // No more tools, get text content
        finalTextContent = response.content
          .filter((block) => block.type === 'text')
          .map((block) => (block as Anthropic.TextBlock).text)
          .join('')
        break
      }

      // Execute all tool calls and collect results
      const toolResults = await Promise.all(
        toolUses.map(async (toolUse) => {
          const toolResult = await handleToolCall(toolUse.name, toolUse.input as Record<string, unknown>)
          return {
            toolUseId: toolUse.id,
            toolName: toolUse.name,
            toolInput: toolUse.input as Record<string, unknown>,
            toolResult,
          }
        })
      )

      // Build messages with tool results and add assistant's tool_use
      const assistantToolUseBlocks = toolUses.map((toolUse) => ({
        type: 'tool_use' as const,
        id: toolUse.id,
        name: toolUse.name,
        input: toolUse.input as Record<string, unknown>,
      }))

      currentMessages.push({
        role: 'assistant',
        content: assistantToolUseBlocks,
      })

      // Add user message with tool results
      currentMessages.push({
        role: 'user',
        content: toolResults.map((tr) => ({
          type: 'tool_result' as const,
          tool_use_id: tr.toolUseId,
          content: tr.toolResult,
        })),
      })
    }

    return c.json({ success: true, data: { content: finalTextContent } })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json({ success: false, error: errorMessage }, 500)
  }
})

// Streaming chat endpoint
chatRoutes.post('/stream', async (c) => {
  const { message, history } = await c.req.json<{
    message: string
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  }>()

  const messages: Anthropic.MessageParam[] = (history || []).map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }))
  messages.push({ role: 'user', content: message })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages,
          tools: TOOLS as Anthropic.Tool[],
        })

        let streamedText = ''
        let toolResults: Array<{
          toolUseId: string
          toolName: string
          toolInput: Record<string, unknown>
          toolResult: string
        }> = []
        let finalMessages = messages

        for await (const event of response) {
          // Handle text delta - stream to client
          if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              streamedText += event.delta.text
              controller.enqueue(
                encoder.encode(`event: text\ndata: ${JSON.stringify({ content: event.delta.text })}\n\n`)
              )
            }
          }

          // Handle message stop
          if (event.type === 'message_stop') {
            // @ts-expect-error message is available on the event
            const msg = event.message as Anthropic.Message | undefined
            if (msg) {
              const toolUses = msg.content.filter(
                (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
              )

              if (toolUses.length > 0) {
                // Execute each tool
                for (const toolUse of toolUses) {
                  // Notify tool execution start
                  controller.enqueue(
                    encoder.encode(
                      `event: tool_start\ndata: ${JSON.stringify({
                        name: toolUse.name,
                      })}\n\n`
                    )
                  )

                  const toolResult = await handleToolCall(toolUse.name, toolUse.input as Record<string, unknown>)

                  toolResults.push({
                    toolUseId: toolUse.id,
                    toolName: toolUse.name,
                    toolInput: toolUse.input as Record<string, unknown>,
                    toolResult,
                  })

                  // Notify tool completion
                  controller.enqueue(
                    encoder.encode(
                      `event: tool_result\ndata: ${JSON.stringify({
                        id: toolUse.id,
                        name: toolUse.name,
                        result: toolResult,
                      })}\n\n`
                    )
                  )
                }

                // Add tool results to messages
                finalMessages = buildToolResultMessages(messages, toolResults)

                // Continue with tool results - send continuation header
                controller.enqueue(
                  encoder.encode(`event: continuation\ndata: ${JSON.stringify({})}\n\n`)
                )

                // Stream the continuation response
                const continuation = anthropic.messages.stream({
                  model: 'claude-sonnet-4-20250514',
                  max_tokens: 4096,
                  system: SYSTEM_PROMPT,
                  messages: finalMessages,
                  tools: TOOLS as Anthropic.Tool[],
                })

                for await (const contEvent of continuation) {
                  if (contEvent.type === 'content_block_delta') {
                    if (contEvent.delta.type === 'text_delta') {
                      controller.enqueue(
                        encoder.encode(
                          `event: text\ndata: ${JSON.stringify({ content: contEvent.delta.text })}\n\n`
                        )
                      )
                    }
                  }
                  if (contEvent.type === 'message_stop') {
                    break
                  }
                }
              }
            }

            controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({})}\n\n`))
          }
        }

        controller.close()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ message: errorMessage })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
})
