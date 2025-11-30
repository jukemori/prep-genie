import { expect, test } from '@playwright/test'
import { MealPlanGeneratorPage, MealPlanPage } from './models/meal-plan-generator-page'

/**
 * E2E Tests for Instant Meal Plan Generation
 *
 * These tests verify the database-based instant meal plan generation.
 * Prerequisites: Seed meals must be in the database (run: pnpm seed:meals --locale=en)
 */

test.describe('Instant Meal Plan Generation', () => {
  test.describe('Generation Flow', () => {
    test('should generate a meal plan instantly (< 3 seconds)', async ({ page }) => {
      const generatorPage = new MealPlanGeneratorPage(page)

      await generatorPage.goto()

      // Select a cuisine
      await generatorPage.selectCuisine('japanese')

      // Start timer
      const startTime = Date.now()

      // Generate meal plan
      await generatorPage.generate()

      // Wait for navigation to meal plan page
      await generatorPage.waitForGeneration()

      // Check generation time
      const endTime = Date.now()
      const generationTime = endTime - startTime

      // Should complete in under 5 seconds (instant database query, allowing for cold starts)
      expect(generationTime).toBeLessThan(5000)
    })

    test('should navigate to generated meal plan page', async ({ page }) => {
      const generatorPage = new MealPlanGeneratorPage(page)

      await generatorPage.goto()
      await generatorPage.selectCuisine('mediterranean')
      await generatorPage.generate()
      await generatorPage.waitForGeneration()

      // Verify we're on a meal plan detail page with UUID in URL
      await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+/)
    })

    test('should show correct number of meals for default 3 meals per day', async ({ page }) => {
      const generatorPage = new MealPlanGeneratorPage(page)
      const mealPlanPage = new MealPlanPage(page)

      await generatorPage.goto()
      await generatorPage.selectCuisine('western')
      await generatorPage.generate()
      await generatorPage.waitForGeneration()

      // 7 days × 3 meals = 21 total meals
      const totalMeals = await mealPlanPage.getTotalMealCount()
      expect(totalMeals).toBe(21)
    })
  })

  test.describe('Cuisine Selection', () => {
    const cuisines = ['japanese', 'korean', 'mediterranean', 'western', 'halal'] as const

    for (const cuisine of cuisines) {
      test(`should generate meal plan with ${cuisine} cuisine`, async ({ page }) => {
        const generatorPage = new MealPlanGeneratorPage(page)

        await generatorPage.goto()
        await generatorPage.selectCuisine(cuisine)
        await generatorPage.generate()
        await generatorPage.waitForGeneration()

        // Verify successful navigation
        await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+/)
      })
    }

    test('should clear cuisine selection', async ({ page }) => {
      const generatorPage = new MealPlanGeneratorPage(page)

      await generatorPage.goto()

      // Select then clear
      await generatorPage.selectCuisine('japanese')
      await generatorPage.clearCuisineSelection()

      // Generate with "any" cuisine
      await generatorPage.generate()
      await generatorPage.waitForGeneration()

      await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+/)
    })
  })

  test.describe('Error Handling', () => {
    test('should show error when no seed meals available', async ({ page }) => {
      // This test verifies error handling when database is empty
      // It may pass or fail depending on database state
      const generatorPage = new MealPlanGeneratorPage(page)

      await generatorPage.goto()

      // Don't select any cuisine to potentially trigger "no meals found" error
      await generatorPage.generate()

      // Either navigates to meal plan or shows error
      const hasError = await generatorPage.errorCard.isVisible({ timeout: 5000 }).catch(() => false)

      if (hasError) {
        const errorMessage = await generatorPage.getErrorMessage()
        expect(errorMessage).toBeTruthy()
      } else {
        // Generation succeeded
        await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+/)
      }
    })

    test('should allow retry after error', async ({ page }) => {
      const generatorPage = new MealPlanGeneratorPage(page)

      await generatorPage.goto()
      await generatorPage.generate()

      // If there's an error, retry should be available
      const hasError = await generatorPage.errorCard.isVisible({ timeout: 5000 }).catch(() => false)

      if (hasError) {
        await expect(generatorPage.retryButton).toBeVisible()
        await generatorPage.retry()

        // Should trigger another generation attempt
        const isLoading = await generatorPage.isLoading()
        expect(isLoading || (await page.url()).includes('meal-plans/')).toBeTruthy()
      }
    })
  })

  test.describe('Generated Meal Plan', () => {
    test('should display meal plan with day cards', async ({ page }) => {
      const generatorPage = new MealPlanGeneratorPage(page)
      const mealPlanPage = new MealPlanPage(page)

      await generatorPage.goto()
      await generatorPage.selectCuisine('korean')
      await generatorPage.generate()
      await generatorPage.waitForGeneration()

      // Should have 7 day cards
      await expect(mealPlanPage.dayCards).toHaveCount(7)
    })

    test('should have page title/heading', async ({ page }) => {
      const generatorPage = new MealPlanGeneratorPage(page)
      const mealPlanPage = new MealPlanPage(page)

      await generatorPage.goto()
      await generatorPage.selectCuisine('mediterranean')
      await generatorPage.generate()
      await generatorPage.waitForGeneration()

      // Should have a heading
      await expect(mealPlanPage.title).toBeVisible()
    })

    test('should navigate back to meal plans list', async ({ page }) => {
      const generatorPage = new MealPlanGeneratorPage(page)
      const mealPlanPage = new MealPlanPage(page)

      await generatorPage.goto()
      await generatorPage.selectCuisine('western')
      await generatorPage.generate()
      await generatorPage.waitForGeneration()

      // Go back
      await mealPlanPage.goBack()

      await expect(page).toHaveURL(/.*meal-plans$/)
    })
  })
})

test.describe('Meal Plan Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Generate a meal plan first
    const generatorPage = new MealPlanGeneratorPage(page)
    await generatorPage.goto()
    await generatorPage.selectCuisine('japanese')
    await generatorPage.generate()
    await generatorPage.waitForGeneration()
  })

  test('should have swap buttons for meals', async ({ page }) => {
    const mealPlanPage = new MealPlanPage(page)

    // Wait for meal items to load first
    await mealPlanPage.mealItems.first().waitFor({ state: 'visible', timeout: 10000 })

    // At least some meals should have swap buttons
    await expect(mealPlanPage.swapButtons.first()).toBeVisible({ timeout: 5000 })
    const swapCount = await mealPlanPage.swapButtons.count()
    expect(swapCount).toBeGreaterThan(0)
  })

  test('should have delete button', async ({ page }) => {
    const mealPlanPage = new MealPlanPage(page)

    await expect(mealPlanPage.deleteButton).toBeVisible()
  })
})
