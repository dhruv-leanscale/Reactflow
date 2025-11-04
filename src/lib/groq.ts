import { createServerFn } from '@tanstack/react-start'
import Groq from "groq-sdk";

export type GroqInvocationParams = {
  prompt: string
  model?: string
  temperature?: number
  systemPrompt?: string
}

export type GroqInvocationResult = {
  output: string
  model: string
  mocked?: boolean
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export const invokeGroq = createServerFn({
  method: 'POST',
}).handler(async ({ data }) => {
  const { prompt, model = 'llama-3.1-8b-instant', temperature = 0.3, systemPrompt } =
    (data ?? {}) as GroqInvocationParams

  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt is required when invoking the Groq API.')
  }

  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return {
      output: `Mock Groq response (set GROQ_API_KEY to reach the real API).\n\n${prompt.slice(0, 280)}`,
      model,
      mocked: true,
    } satisfies GroqInvocationResult
  }

  const groq = new Groq({ apiKey });

  const messages = systemPrompt
    ? [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: prompt },
      ]
    : [{ role: 'user' as const, content: prompt }]

  let completionResponse: Awaited<ReturnType<typeof groq.chat.completions.create>>;
  try {
    completionResponse = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      stream: false,
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        output: `Mock Groq response (request canceled or timed out).\n\n${prompt.slice(0, 280)}`,
        model,
        mocked: true,
      } satisfies GroqInvocationResult
    }
    throw new Error(
      `Groq SDK request failed${error.status ? ': ' + error.status : ''}${error.statusText ? ' ' + error.statusText : ''} – ${error.message}`,
    );
  }

  const output =
    completionResponse.choices?.[0]?.message?.content?.trim() ??
    'Groq returned an empty response.';

  return {
    output,
    model,
    mocked: false,
    usage: completionResponse.usage
      ? {
          promptTokens: completionResponse.usage.prompt_tokens ?? 0,
          completionTokens: completionResponse.usage.completion_tokens ?? 0,
          totalTokens: completionResponse.usage.total_tokens ?? 0,
        }
      : undefined,
  } satisfies GroqInvocationResult
})
