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

    // TODO: Get locale from user profile once locale field is added to database
    const userPrompt = generateNutritionQuestionPrompt(question, 'en', userContext)

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

export async function loadChatHistory() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Get the most recent chat history for this user
  const { data, error } = await supabase
    .from('ai_chat_history')
    .select('id, messages')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // No chat history found is not an error
    if (error.code === 'PGRST116') {
      return { data: null, error: null }
    }
    return { data: null, error: error.message }
  }

  return { data: data.messages || [], chatId: data.id, error: null }
}

export async function saveChatHistory(
  messages: Array<{ role: string; content: string }>,
  chatId?: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Add timestamps to messages if not present
  const messagesWithTimestamps = messages.map((msg) => ({
    ...msg,
    timestamp: new Date().toISOString(),
  }))

  if (chatId) {
    // Update existing chat history
    const { error } = await supabase
      .from('ai_chat_history')
      .update({
        messages: messagesWithTimestamps,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatId)
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message }
    }

    return { chatId, error: null }
  }

  // Create new chat history
  const { data, error } = await supabase
    .from('ai_chat_history')
    .insert({
      user_id: user.id,
      messages: messagesWithTimestamps,
      context_type: 'nutrition_question',
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  return { chatId: data.id, error: null }
}
