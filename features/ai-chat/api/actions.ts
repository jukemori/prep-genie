'use server'

import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/ai/openai'
import { NUTRITION_ASSISTANT_SYSTEM_PROMPT, generateNutritionQuestionPrompt } from '@/lib/ai/prompts/nutrition-assistant'
import { createStreamableValue } from 'ai/rsc'

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

    const messages: any[] = [
      { role: 'system', content: NUTRITION_ASSISTANT_SYSTEM_PROMPT },
    ]

    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory)
    }

    messages.push({ role: 'user', content: userPrompt })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      stream: true,
      temperature: 0.7,
    })

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || ''
      stream.update(content)
    }

    stream.done()
  })()

  return { stream: stream.value }
}
