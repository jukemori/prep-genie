'use server'

import { createStreamableValue } from '@ai-sdk/rsc'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import {
  generateNutritionQuestionPrompt,
  NUTRITION_ASSISTANT_SYSTEM_PROMPT,
} from '@/features/ai-chat/prompts/nutrition-assistant'
import { openai } from '@/lib/ai/openai'
import { createClient } from '@/lib/supabase/server'

export async function chatWithNutritionAssistant(
  question: string,
  conversationHistory?: Array<{ role: string; content: string }>
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user profile for context
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('goal, dietary_preference, allergies')
    .eq('id', user.id)
    .single()

  const stream = createStreamableValue('')

  ;(async () => {
    const userContext = profile
      ? {
          goal: profile.goal || undefined,
          dietaryPreference: profile.dietary_preference || undefined,
          allergies: profile.allergies || undefined,
        }
      : undefined

    const userPrompt = generateNutritionQuestionPrompt(question, userContext)

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: NUTRITION_ASSISTANT_SYSTEM_PROMPT },
    ]

    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }))
      )
    }

    messages.push({ role: 'user', content: userPrompt })

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages,
      stream: true,
    })

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || ''
      stream.update(content)
    }

    stream.done()
  })()

  return { stream: stream.value }
}
