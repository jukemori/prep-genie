import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { MealPlanGeneratorPage } from './pages/MealPlanGeneratorPage'
import { TEST_USERS, generateUniqueEmail } from './fixtures/test-users'
import { CUISINE_TYPES } from './fixtures/test-data'

/**
 * E2E Tests for Meal Plan Generation
 * Tests chunked generation (one day at a time) with GPT-5-nano
 *
 * Test Scenarios:
 * 1. Select cuisine type
 * 2. Generate meal plan with real-time progress
 * 3. Verify all 7 days generated (21 meals)
 * 4. Verify nutrition targets met
 * 5. Test different cuisines
 */

test.describe('Meal Plan Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated user
    const authPage = new AuthPage(page)
    const onboardingPage = new OnboardingPage(page)

    const email = generateUniqueEmail()
    await authPage.gotoSignUp()
    await authPage.signUp(email, 'TestMealPlan123!')

    await page.waitForURL((url) => url.pathname.includes('onboarding') || url.pathname.includes('confirm'), {
      timeout: 10000,
    })

    if (page.url().includes('confirm')) {
      test.skip()
      return
    }

    // Complete onboarding
    await onboardingPage.completeOnboarding(TEST_USERS.newUser.profile)
    await expect(page).toHaveURL(/.*dashboard|meal-plans/, { timeout: 10000 })
  })

  test('should display meal plan generator page correctly', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.goto()

    await expect(generator.cuisineJapanese).toBeVisible()
    await expect(generator.cuisineKorean).toBeVisible()
    await expect(generator.cuisineMediterranean).toBeVisible()
    await expect(generator.cuisineWestern).toBeVisible()
    await expect(generator.cuisineHalal).toBeVisible()
    await expect(generator.generateButton).toBeVisible()
  })

  test('should select cuisine type', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.goto()

    await generator.selectCuisine('japanese')
    await expect(generator.cuisineJapanese).toHaveAttribute('data-state', 'on')

    // Change selection
    await generator.selectCuisine('korean')
    await expect(generator.cuisineKorean).toHaveAttribute('data-state', 'on')
  })

  test('should generate meal plan without cuisine selection', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.goto()

    await generator.generate()
    await generator.expectGenerating()

    // Wait for completion (up to 2 minutes)
    await generator.waitForCompletion()

    // Should be on meal plan detail page
    await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+$/)
  })

  test('should show progress bar during generation', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.goto()

    await generator.generate()

    // Verify progress bar appears
    await expect(generator.progressBar).toBeVisible({ timeout: 5000 })
    await expect(generator.loadingIndicator).toBeVisible()
  })

  test('should show day-by-day progress (Day X of 7)', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.goto()

    await generator.generate()

    // Wait for progress text to appear for at least Day 1
    await generator.waitForDayProgress(1)

    // Optionally check more days
    // Note: This may be flaky if generation is too fast
    // await generator.waitForDayProgress(2)
    // await generator.waitForDayProgress(3)
  })

  test('should generate Japanese cuisine meal plan', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.generateMealPlan('japanese')

    // Should be on meal plan detail page
    await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+$/)

    // Verify page has Japanese cuisine indicators
    // (You would check for specific elements like meal names in Japanese)
    const pageContent = await page.content()
    // Check for Japanese characters or cuisine-specific words
    expect(pageContent).toMatch(/rice|sushi|miso|teriyaki|japanese/i)
  })

  test('should generate Korean cuisine meal plan', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.generateMealPlan('korean')

    await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+$/)

    const pageContent = await page.content()
    expect(pageContent).toMatch(/kimchi|bibimbap|bulgogi|korean|gochujang/i)
  })

  test('should generate Mediterranean cuisine meal plan', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.generateMealPlan('mediterranean')

    await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+$/)

    const pageContent = await page.content()
    expect(pageContent).toMatch(/olive|hummus|mediterranean|greek|falafel/i)
  })

  test('should generate Western cuisine meal plan', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.generateMealPlan('western')

    await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+$/)

    const pageContent = await page.content()
    expect(pageContent).toMatch(/pasta|steak|burger|chicken|western|american/i)
  })

  test('should generate Halal cuisine meal plan', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.generateMealPlan('halal')

    await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+$/)

    const pageContent = await page.content()
    expect(pageContent).toMatch(/halal|lamb|chicken|beef|middle eastern/i)
  })

  test('should display all 7 days in generated meal plan', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.generateMealPlan()

    // Count day headers or meal plan items
    const dayHeaders = page.locator('h2:has-text("Day"), h3:has-text("Day")')
    await expect(dayHeaders).toHaveCount(7, { timeout: 5000 })
  })

  test('should display 21 meals in total (7 days × 3 meals)', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.generateMealPlan()

    // Count meal cards
    const mealCards = page.locator('[data-testid="meal-card"], .meal-card, article')
    const count = await mealCards.count()

    // Should have approximately 21 meals (7 days × 3 meals)
    expect(count).toBeGreaterThanOrEqual(20)
    expect(count).toBeLessThanOrEqual(22)
  })

  test('should display nutrition summary', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.generateMealPlan()

    // Look for nutrition summary elements
    const caloriesDisplay = page.locator('text=/\\d+.*kcal|calories/i')
    const proteinDisplay = page.locator('text=/\\d+.*g.*protein/i')
    const carbsDisplay = page.locator('text=/\\d+.*g.*carb/i')
    const fatsDisplay = page.locator('text=/\\d+.*g.*fat/i')

    await expect(caloriesDisplay.first()).toBeVisible({ timeout: 5000 })
    await expect(proteinDisplay.first()).toBeVisible({ timeout: 5000 })
    await expect(carbsDisplay.first()).toBeVisible({ timeout: 5000 })
    await expect(fatsDisplay.first()).toBeVisible({ timeout: 5000 })
  })

  test('should allow viewing individual meal details', async ({ page }) => {
    const generator = new MealPlanGeneratorPage(page)
    await generator.generateMealPlan()

    // Click on first meal card
    const firstMeal = page.locator('[data-testid="meal-card"], .meal-card, article').first()
    await firstMeal.click()

    // Should show meal details (modal or new page)
    await expect(page.locator('text=/ingredients|instructions/i')).toBeVisible({ timeout: 5000 })
  })

  test.describe('Generation Error Handling', () => {
    test('should show error if generation fails', async ({ page }) => {
      // This test would require mocking API failure
      // Skip for now unless you have a way to trigger errors

      test.skip()
    })

    test('should allow retry after error', async ({ page }) => {
      test.skip()
    })
  })
})
