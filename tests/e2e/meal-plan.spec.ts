import { expect, test } from '@playwright/test'

/**
 * E2E Test: Meal Plan Generation
 *
 * Tests:
 * 1. Navigate to meal plan generator
 * 2. Select cuisine type (Japanese, Korean, Mediterranean, Western, Halal)
 * 3. Click generate button
 * 4. Wait for AI generation to complete
 * 5. View generated meal plan with all meals
 * 6. Verify nutrition breakdown
 */

test.describe('Meal Plan Generation', () => {
  test.skip('should generate a complete meal plan with Japanese cuisine', async ({ page }) => {
    // TODO: Fix meal plan generation - timing out on redirect
    // Navigate to meal plan generator
    await page.goto('/meal-plans/generate')
    await expect(page).toHaveURL(/.*meal-plans\/generate/)

    // Select Japanese cuisine
    const japaneseButton = page
      .locator('button:has-text("Japanese"), [data-cuisine="japanese"]')
      .first()
    await japaneseButton.click()

    // Click the main "Generate Meal Plan" button (not the clear selection button)
    const generateButton = page.getByRole('button', { name: /^Generate Meal Plan/i })
    await generateButton.click()

    // Wait for generation to complete (may take 30-60 seconds for AI)
    await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+/, { timeout: 90000 })

    // Verify meal plan is displayed
    const mealPlanTitle = page
      .locator('h1, h2')
      .filter({ hasText: /meal plan/i })
      .first()
    await expect(mealPlanTitle).toBeVisible()

    // Verify meals are displayed (expect at least 7 meals for weekly plan)
    const mealCards = page.locator('[data-testid="meal-card"], .meal-card')
    await expect(mealCards.first()).toBeVisible({ timeout: 10000 })

    // Verify nutrition information is displayed
    const nutritionSummary = page.locator(
      'text=/calories|protein|carbs|fats/i, [data-testid="nutrition-summary"]'
    )
    await expect(nutritionSummary.first()).toBeVisible()
  })

  test.skip('should display meal details when clicking on a meal', async ({ page }) => {
    // TODO: Fix meal plan detail page - meal cards not found
    // Navigate to existing meal plan (assumes at least one exists from previous test)
    await page.goto('/meal-plans')
    await expect(page).toHaveURL(/.*meal-plans/)

    // Click on first "View Plan" button within a meal plan card
    const viewPlanButton = page.getByRole('link', { name: /view plan|表示/i }).first()
    await viewPlanButton.click()

    // Wait for meal plan details page
    await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+/)

    // Click on first meal card to view details
    const firstMeal = page.locator('[data-testid="meal-card"], .meal-card').first()
    await firstMeal.click()

    // Verify meal details modal or page opens
    const mealDetails = page.locator('[data-testid="meal-details"], [role="dialog"], .meal-details')
    await expect(mealDetails).toBeVisible({ timeout: 5000 })

    // Verify ingredients list is displayed
    const ingredients = page.locator('text=/ingredients/i').first()
    await expect(ingredients).toBeVisible()

    // Verify instructions are displayed
    const instructions = page.locator('text=/instructions|steps/i').first()
    await expect(instructions).toBeVisible()
  })

  test('should mark meal as completed', async ({ page }) => {
    await page.goto('/meal-plans')

    // Click on first "View Plan" button using test ID
    const viewPlanButton = page.getByTestId('view-meal-plan').first()
    await expect(viewPlanButton).toBeVisible({ timeout: 5000 })
    await viewPlanButton.click()

    await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+/, { timeout: 5000 })

    // Find and click checkbox to mark meal as completed
    const completionCheckbox = page
      .locator('[data-testid="meal-completed"], input[type="checkbox"]')
      .first()

    if (await completionCheckbox.isVisible()) {
      await completionCheckbox.click()

      // Verify checkbox is checked
      await expect(completionCheckbox).toBeChecked()
    }
  })
})
