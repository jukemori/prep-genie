import { test, expect } from '@playwright/test'

/**
 * E2E Test: AI Nutrition Assistant User Journey
 *
 * User Journey:
 * 1. Navigate to AI chat
 * 2. Send a nutrition question
 * 3. Receive AI response
 * 4. Ask follow-up question
 * 5. View chat history
 */

test.describe('AI Nutrition Assistant Journey', () => {
  test('should send nutrition question and receive AI response', async ({ page }) => {
    // Navigate to AI chat
    await page.goto('/chat')
    await expect(page).toHaveURL(/.*chat/)

    // Find chat input by placeholder text
    const chatInput = page.getByPlaceholder(/ask.*question|質問/i)
    await chatInput.fill('What are good protein sources for muscle gain?')

    // Find and click send button (icon-only button)
    const sendButton = page.getByRole('button', { name: '' }).last()
    await sendButton.click()

    // Wait for AI response (streaming may take a few seconds)
    const aiResponse = page.locator(
      '[data-role="assistant"], .ai-message, .assistant-message'
    ).first()
    await expect(aiResponse).toBeVisible({ timeout: 15000 })

    // Verify response contains relevant content
    const responseText = await aiResponse.textContent()
    expect(responseText).toBeTruthy()
    expect(responseText!.length).toBeGreaterThan(20)
  })

  test('should handle follow-up questions', async ({ page }) => {
    await page.goto('/chat')

    // Send first question
    const chatInput = page.getByPlaceholder(/ask.*question|質問/i)
    await chatInput.fill('What is TDEE?')

    const sendButton = page.getByRole('button', { name: '' }).last() // Send icon button
    await sendButton.click()

    // Wait for first response
    const firstResponse = page.locator('[data-role="assistant"]').first()
    await expect(firstResponse).toBeVisible({ timeout: 20000 })

    // Send follow-up question
    await chatInput.fill('How do I calculate it?')
    const sendButton2 = page.getByRole('button', { name: '' }).last()
    await sendButton2.click()

    // Wait a moment for state to update
    await page.waitForTimeout(1000)

    // Wait for second AI response to appear (increased timeout for slow AI responses)
    const messages = page.locator('[data-role="assistant"]')
    await expect(messages.nth(1)).toBeVisible({ timeout: 60000 })

    const messageCount = await messages.count()
    expect(messageCount).toBeGreaterThanOrEqual(2)
  })

  test('should ask about ingredient substitutions', async ({ page }) => {
    await page.goto('/chat')

    const chatInput = page.getByPlaceholder(/ask.*question|質問/i)
    await chatInput.fill('Can I substitute chicken with tofu in recipes?')

    const sendButton = page.getByRole('button', { name: '' }).last()
    await sendButton.click()

    // Wait for response
    const aiResponse = page.locator(
      '[data-role="assistant"], .ai-message, .assistant-message'
    ).first()
    await expect(aiResponse).toBeVisible({ timeout: 15000 })

    // Verify response mentions tofu or substitution
    const responseText = await aiResponse.textContent()
    expect(responseText?.toLowerCase()).toMatch(/tofu|substitut|replace/)
  })

  test('should display chat history', async ({ page }) => {
    await page.goto('/chat')

    // Send a message
    const chatInput = page.getByPlaceholder(/ask.*question|質問/i)
    await chatInput.fill('Hello')

    const sendButton = page.getByRole('button', { name: '' }).last()
    await sendButton.click()

    // Wait for AI response to complete
    const aiMessage = page.locator('[data-role="assistant"]')
    await expect(aiMessage.first()).toBeVisible({ timeout: 20000 })

    // Verify user message is visible in chat history
    const userMessage = page.locator('[data-role="user"]')
    await expect(userMessage.first()).toBeVisible()
  })

  test('should clear chat history', async ({ page }) => {
    await page.goto('/chat')

    // Look for clear/delete chat button
    const clearButton = page.locator(
      'button:has-text("Clear"), button:has-text("Delete"), button[aria-label*="clear"]'
    )

    if (await clearButton.isVisible({ timeout: 3000 })) {
      await clearButton.click()

      // Confirm if dialog appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")')
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click()
      }

      // Verify chat is cleared (no messages visible)
      const messages = page.locator('[data-role="assistant"], [data-role="user"]')
      const messageCount = await messages.count()
      expect(messageCount).toBe(0)
    }
  })
})
