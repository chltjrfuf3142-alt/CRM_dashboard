import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rawBody = await req.text()
  if (rawBody.length > 2048) {
    return new Response(JSON.stringify({ error: 'Request body too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = JSON.parse(rawBody)
  const { buyerName, companyName, country, purpose, tone, additionalNotes, dealInfo } = body

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

  const prompt = `Write a ${toneMap[tone] ?? 'professional'} business email with the following context:
- Recipient: ${buyerName} at ${companyName} (${country})
- Purpose: ${purposeMap[purpose] ?? purpose}
${additionalNotes ? `- Additional context: ${additionalNotes}` : ''}
${dealInfo ? `- Deal context: ${dealInfo}` : ''}

Requirements:
- Start with "Subject:" line
- Professional international business email format
- Natural, fluent English
- Concise and clear (under 200 words)
- Sign off as [Your Name] from [Your Company]`

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: 'You are an expert international business email writer for Korean exporters dealing with global B2B buyers. Write professional, natural English emails.',
    prompt,
    maxTokens: 800,
  })

  return result.toDataStreamResponse()
}
