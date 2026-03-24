import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      tailwindcss(),
      react(),
      {
        name: 'api-dev-server',
        configureServer(server) {
          server.middlewares.use('/api/generate-email', async (req: IncomingMessage, res: ServerResponse) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            try {
              // 요청 바디 읽기
              const chunks: Buffer[] = []
              for await (const chunk of req) chunks.push(chunk as Buffer)
              const rawBody = Buffer.concat(chunks).toString()

              const { buyerName, companyName, country, purpose, tone, additionalNotes } = JSON.parse(rawBody)

              const toneMap: Record<string, string> = {
                formal: 'very formal and professional',
                friendly: 'warm and friendly but professional',
                urgent: 'urgent yet polite',
              }
              const purposeMap: Record<string, string> = {
                first_contact: 'first contact / introduction',
                quote_request: 'requesting a quotation',
                follow_up: 'follow-up after previous communication',
                thank_you: 'expressing gratitude',
                meeting_summary: 'meeting summary and next steps',
              }

              const userPrompt = `Write a ${toneMap[tone] ?? 'professional'} business email:
- Recipient: ${buyerName} at ${companyName} (${country})
- Purpose: ${purposeMap[purpose] ?? purpose}
${additionalNotes ? `- Additional context: ${additionalNotes}` : ''}

Requirements:
- Start with "Subject:" line
- Professional international B2B email format
- Natural, fluent English, under 200 words
- Sign off as [Your Name] from [Your Company]`

              // OpenAI 스트리밍 직접 호출
              const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [
                    {
                      role: 'system',
                      content: 'You are an expert international business email writer for Korean exporters. Write professional, natural English emails.',
                    },
                    { role: 'user', content: userPrompt },
                  ],
                  max_tokens: 800,
                  stream: true,
                }),
              })

              if (!openaiRes.ok) {
                const err = await openaiRes.text()
                console.error('[api] OpenAI error:', err)
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'OpenAI API error' }))
                return
              }

              // useCompletion이 기대하는 AI SDK 데이터스트림 포맷으로 응답
              res.statusCode = 200
              res.setHeader('Content-Type', 'text/plain; charset=utf-8')
              res.setHeader('X-Vercel-AI-Data-Stream', 'v1')
              res.setHeader('Cache-Control', 'no-cache')
              res.setHeader('Connection', 'keep-alive')

              const reader = openaiRes.body!.getReader()
              const decoder = new TextDecoder()

              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                for (const line of chunk.split('\n')) {
                  if (!line.startsWith('data: ')) continue
                  const data = line.slice(6).trim()
                  if (data === '[DONE]') continue
                  try {
                    const parsed = JSON.parse(data)
                    const text = parsed.choices?.[0]?.delta?.content
                    if (text) res.write(`0:${JSON.stringify(text)}\n`)
                  } catch { /* skip malformed chunks */ }
                }
              }

              res.write('d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n')
              res.end()

            } catch (e) {
              console.error('[api] generate-email error:', e)
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Internal server error' }))
            }
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      sourcemap: false,
    },
  }
})
