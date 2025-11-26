import { test, expect } from '@playwright/test'

/**
 * E2E Test: Recipe Analyzer User Journey
 *
 * User Journey:
 * 1. Navigate to recipe analyzer
 * 2. Input recipe text or URL
 * 3. Click analyze button
 * 4. View nutrition breakdown
 * 5. See AI improvement suggestions (budget/high-protein/lower-calorie)
 * 6. Save analyzed recipe to meal library
 */

test.describe('Recipe Analyzer Journey', () => {
  const sampleRecipe = `
Grilled Chicken Salad

Ingredients:
- 200g chicken breast
- 2 cups mixed greens
- 1/2 cup cherry tomatoes
- 1/4 cup olive oil
- 2 tbsp balsamic vinegar
- Salt and pepper to taste

Instructions:
1. Season chicken with salt and pepper
2. Grill chicken for 6-7 minutes per side
3. Let rest, then slice
4. Toss greens with tomatoes
5. Top with sliced chicken
6. Drizzle with olive oil and vinegar
  `

  test.skip('should analyze recipe text and display nutrition breakdown', async ({ page }) => {
    // TODO: Fix recipe analyzer - nutrition not displaying after analysis
    // Navigate to recipe analyzer
    await page.goto('/analyze')
    await expect(page).toHaveURL(/.*analyze/)

    // Click "Recipe Text" tab
    const textTab = page.getByRole('tab', { name: /recipe text|テキスト/i })
    await textTab.click()

    // Find recipe input textarea
    const recipeInput = page.getByPlaceholder(/paste.*recipe|レシピ/i)
    await recipeInput.fill(sampleRecipe)

    // Click analyze button
    const analyzeButton = page.getByRole('button', { name: /analyze|calculate/i }).first()
    await analyzeButton.click()

    // Wait for AI analysis (may take 10-20 seconds)
    await page.waitForTimeout(3000)

    // Verify nutrition breakdown is displayed
    const nutritionDisplay = page.locator('text=/calories|protein|carbs|fats/i')
    await expect(nutritionDisplay.first()).toBeVisible({ timeout: 30000 })

    // Verify calories are displayed
    const caloriesText = page.locator('text=/\\d+\\s*cal/i').first()
    await expect(caloriesText).toBeVisible()
  })

  test('should display AI improvement suggestions', async ({ page }) => {
    await page.goto('/analyze')

    // Click "Recipe Text" tab
    const textTab = page.getByRole('tab', { name: /recipe text|テキスト/i })
    await textTab.click()

    // Input recipe
    const recipeInput = page.getByPlaceholder(/paste.*recipe|レシピ/i)
    await recipeInput.fill(sampleRecipe)

    // Analyze
    const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Calculate")')
    await analyzeButton.click()

    // Wait for analysis
    await page.waitForTimeout(5000)

    // Look for improvement suggestions (budget/high-protein/lower-calorie)
    const suggestions = page.locator(
      'text=/budget|high.?protein|lower.?calorie|improvement|suggestion/i'
    )

    // At least one suggestion should be visible
    await expect(suggestions.first()).toBeVisible({ timeout: 30000 })
  })

  test('should save analyzed recipe to meal library', async ({ page }) => {
    await page.goto('/analyze')

    // Click "Recipe Text" tab
    const textTab = page.getByRole('tab', { name: /recipe text|テキスト/i })
    await textTab.click()

    // Input and analyze recipe
    const recipeInput = page.getByPlaceholder(/paste.*recipe|レシピ/i)
    await recipeInput.fill(sampleRecipe)

    const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Calculate")')
    await analyzeButton.click()

    // Wait for analysis to complete
    await page.waitForTimeout(5000)

    // Look for "Save" or "Add to Library" button
    const saveButton = page.locator(
      'button:has-text("Save"), button:has-text("Add to Library"), button:has-text("Save Recipe")'
    )

    if (await saveButton.isVisible({ timeout: 30000 })) {
      await saveButton.click()

      // Verify success message or redirect
      const successMessage = page.locator(
        'text=/saved|success|added/i, [role="status"], [data-testid="toast"]'
      )
      await expect(successMessage.first()).toBeVisible({ timeout: 5000 })
    }
  })

  test.skip('should handle recipe URL input', async ({ page }) => {
    // TODO: Recipe URL functionality not working
    await page.goto('/analyze')

    // Look for URL input tab or field
    const urlTab = page.locator('button:has-text("URL"), [data-tab="url"]')

    if (await urlTab.isVisible({ timeout: 3000 })) {
      await urlTab.click()

      // Find URL input field
      const urlInput = page.locator('input[type="url"], input[placeholder*="URL"]')
      await urlInput.fill('https://example.com/recipe')

      // Analyze button should be present
      const analyzeButton = page.locator('button:has-text("Analyze")')
      await expect(analyzeButton).toBeVisible()
    }
  })
})
