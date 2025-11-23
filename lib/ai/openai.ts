import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const MODELS = {
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',
  GPT5_NANO: 'gpt-5-nano',
  GPT5_MINI: 'gpt-5-mini',
  GPT5: 'gpt-5',
  GPT5_1: 'gpt-5.1',
} as const
