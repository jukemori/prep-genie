import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Page Object Model for Meal Plan Generator
 * Tests chunked generation with real-time progress
 */
export class MealPlanGeneratorPage {
  readonly page: Page
  readonly cuisineJapanese: Locator
  readonly cuisineKorean: Locator
  readonly cuisineMediterranean: Locator
  readonly cuisineWestern: Locator
  readonly cuisineHalal: Locator
  readonly generateButton: Locator
  readonly loadingIndicator: Locator
  readonly progressBar: Locator
  readonly progressText: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.cuisineJapanese = page.locator('button:has-text("Japanese"), [role="button"]:has-text("Japanese")')
    this.cuisineKorean = page.locator('button:has-text("Korean"), [role="button"]:has-text("Korean")')
    this.cuisineMediterranean = page.locator('button:has-text("Mediterranean"), [role="button"]:has-text("Mediterranean")')
    this.cuisineWestern = page.locator('button:has-text("Western"), [role="button"]:has-text("Western")')
    this.cuisineHalal = page.locator('button:has-text("Halal"), [role="button"]:has-text("Halal")')
    this.generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Meal Plan")')
    this.loadingIndicator = page.locator('[role="status"], .loading, .spinner')
    this.progressBar = page.locator('[role="progressbar"], .progress-bar')
    this.progressText = page.locator('text=/Generating Day \\d+ of 7/')
    this.errorMessage = page.locator('[role="alert"], .error-message')
  }

  async goto() {
    await this.page.goto('/meal-plans/generate')
    await expect(this.page).toHaveURL(/.*meal-plans\/generate/)
  }

  async selectCuisine(cuisine: 'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal') {
    const cuisineMap = {
      japanese: this.cuisineJapanese,
      korean: this.cuisineKorean,
      mediterranean: this.cuisineMediterranean,
      western: this.cuisineWestern,
      halal: this.cuisineHalal,
    }

    await cuisineMap[cuisine].click()
    // Verify selection (button should have selected state)
    await expect(cuisineMap[cuisine]).toHaveAttribute('data-state', 'on')
  }

  async generate() {
    await this.generateButton.click()
  }

  async expectGenerating() {
    await expect(this.loadingIndicator).toBeVisible({ timeout: 5000 })
    await expect(this.progressBar).toBeVisible({ timeout: 5000 })
  }

  async waitForDayProgress(day: number) {
    await expect(this.progressText).toContainText(`Day ${day} of 7`, { timeout: 30000 })
  }

  async waitForCompletion() {
    // Wait for redirect to meal plan detail page
    await this.page.waitForURL(/.*meal-plans\/[a-f0-9-]+$/, { timeout: 120000 }) // 2 min timeout for 7 days
  }

  async expectError(message?: string) {
    await expect(this.errorMessage).toBeVisible()
    if (message) {
      await expect(this.errorMessage).toContainText(message)
    }
  }

  async generateMealPlan(cuisine?: 'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal') {
    await this.goto()

    if (cuisine) {
      await this.selectCuisine(cuisine)
    }

    await this.generate()
    await this.expectGenerating()

    // Optionally watch progress
    for (let day = 1; day <= 7; day++) {
      await this.waitForDayProgress(day)
    }

    await this.waitForCompletion()
  }
}
