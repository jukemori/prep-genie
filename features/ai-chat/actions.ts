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

    // Truncate conversation history to last 10 messages for performance
    // This keeps context manageable and reduces token usage significantly
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10)
      messages.push(
        ...recentHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }))
      )
    }

    messages.push({ role: 'user', content: userPrompt })

    // Use OpenAI runner for better performance
    const runner = openai.chat.completions
      .stream({
        model: 'gpt-5-nano',
        messages,
        max_completion_tokens: 1000, // Limit response length for faster generation (GPT-5 parameter)
        // Note: GPT-5-nano only supports temperature=1 (default), so we omit it
      })
      .on('content', (delta) => {
        stream.update(delta)
      })
      .on('error', (error) => {
        console.error('[chatWithNutritionAssistant] Stream error:', error)
        stream.error(error)
      })

    await runner.finalChatCompletion()
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
