import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Page Object Model for Meal Plan Generator Page
 * Follows Playwright best practices: role-based locators, web-first assertions
 */
export class MealPlanGeneratorPage {
  readonly page: Page
  readonly heading: Locator
  readonly cuisineButtons: Locator
  readonly generateButton: Locator
  readonly loadingSpinner: Locator
  readonly errorCard: Locator
  readonly retryButton: Locator

  constructor(page: Page) {
    this.page = page
    // Best Practice: Use role-based locators for resilience
    this.heading = page.getByRole('heading', { level: 1 })
    this.cuisineButtons = page.locator('[data-cuisine]')
    this.generateButton = page.getByRole('button', { name: /Generate Meal Plan/i })
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"], .animate-spin')
    this.errorCard = page.locator('[class*="border-destructive"]')
    this.retryButton = page.getByRole('button', { name: /Retry/i })
  }

  async goto() {
    await this.page.goto('/meal-plans/generate')
    await expect(this.page).toHaveURL(/.*meal-plans\/generate/)
  }

  async selectCuisine(cuisine: 'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal') {
    const cuisineButton = this.page.locator(`[data-cuisine="${cuisine}"]`)
    await cuisineButton.click()
    // Verify selection
    await expect(cuisineButton).toHaveAttribute('data-selected', 'true')
  }

  async clearCuisineSelection() {
    const clearButton = this.page.getByRole('button', { name: /Clear selection/i })
    if (await clearButton.isVisible()) {
      await clearButton.click()
    }
  }

  async generate() {
    await this.generateButton.click()
  }

  async waitForGeneration(timeout = 10000) {
    // For instant database-based generation, this should be very fast
    await expect(this.page).toHaveURL(/.*meal-plans\/[a-f0-9-]+/, { timeout })
  }

  async waitForError() {
    await expect(this.errorCard).toBeVisible({ timeout: 5000 })
  }

  async getErrorMessage(): Promise<string | null> {
    if (await this.errorCard.isVisible()) {
      return this.errorCard.locator('p.text-muted-foreground').textContent()
    }
    return null
  }

  async retry() {
    await this.retryButton.click()
  }

  async isLoading(): Promise<boolean> {
    return this.loadingSpinner.isVisible()
  }
}

/**
 * Page Object Model for Meal Plan View Page
 */
export class MealPlanPage {
  readonly page: Page
  readonly title: Locator
  readonly dayCards: Locator
  readonly mealItems: Locator
  readonly swapButtons: Locator
  readonly nutritionSummary: Locator
  readonly backButton: Locator
  readonly deleteButton: Locator

  constructor(page: Page) {
    this.page = page
    // Use main content area to avoid matching sidebar headings
    this.title = page.locator('main').getByRole('heading', { level: 1 }).first()
    this.dayCards = page.locator('[data-testid="day-card"]')
    this.mealItems = page.locator('[data-testid="meal-item"]')
    // Best Practice: Chain and filter locators for precision
    this.swapButtons = page.getByRole('button', { name: /swap/i })
    this.nutritionSummary = page.locator('[data-testid="nutrition-summary"]')
    this.backButton = page.getByRole('link', { name: /back/i })
    this.deleteButton = page.getByRole('button', { name: /delete meal plan/i })
  }

  async getMealCountForDay(dayIndex: number): Promise<number> {
    const dayCard = this.dayCards.nth(dayIndex)
    return await dayCard.locator('[data-testid="meal-item"]').count()
  }

  async getTotalMealCount(): Promise<number> {
    // Wait for at least one meal item to appear before counting
    await this.mealItems.first().waitFor({ state: 'visible', timeout: 10000 })
    return await this.mealItems.count()
  }

  async swapMeal(mealIndex: number) {
    await this.swapButtons.nth(mealIndex).click()
  }

  async markMealCompleted(mealIndex: number) {
    const checkbox = this.page
      .locator('[data-testid="meal-completed"], input[type="checkbox"]')
      .nth(mealIndex)
    await checkbox.click()
    await expect(checkbox).toBeChecked()
  }

  async goBack() {
    await this.backButton.click()
    await expect(this.page).toHaveURL(/.*meal-plans$/)
  }

  async deletePlan() {
    await this.deleteButton.click()
    // Handle confirmation dialog if present
    const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i })
    if (await confirmButton.isVisible()) {
      await confirmButton.click()
    }
  }
}
