import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Page Object Model for Onboarding Multi-Step Form
 * Follows Playwright + Next.js App Router best practices
 */
export class OnboardingPage {
  readonly page: Page
  readonly nextButton: Locator
  readonly backButton: Locator
  readonly progressIndicator: Locator

  // Step 1: Personal Info
  readonly ageInput: Locator
  readonly weightInput: Locator
  readonly heightInput: Locator
  readonly genderSelect: Locator

  // Step 2: Activity & Goals
  readonly activityLevelSelect: Locator
  readonly goalSelect: Locator

  // Step 3: Dietary Preferences
  readonly dietaryPreferenceSelect: Locator
  readonly allergiesInput: Locator

  // Step 4: Cooking Skills
  readonly cookingSkillSelect: Locator
  readonly timeAvailableInput: Locator
  readonly budgetLevelSelect: Locator

  // Results
  readonly tdeeDisplay: Locator
  readonly calorieTargetDisplay: Locator
  readonly proteinTargetDisplay: Locator
  readonly carbsTargetDisplay: Locator
  readonly fatsTargetDisplay: Locator
  readonly completeButton: Locator

  constructor(page: Page) {
    this.page = page
    this.nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")')
    this.backButton = page.locator('button:has-text("Back")')
    this.progressIndicator = page.locator('[role="progressbar"], .progress')

    // Step 1
    this.ageInput = page.locator('input[name="age"]')
    this.weightInput = page.locator('input[name="weight"]')
    this.heightInput = page.locator('input[name="height"]')
    this.genderSelect = page.locator('select[name="gender"], [role="combobox"]:has-text("Gender")')

    // Step 2
    this.activityLevelSelect = page.locator('select[name="activity_level"], [role="radiogroup"]')
    this.goalSelect = page.locator('select[name="goal"], [role="radiogroup"]')

    // Step 3
    this.dietaryPreferenceSelect = page.locator('select[name="dietary_preference"]')
    this.allergiesInput = page.locator('input[name="allergies"]')

    // Step 4
    this.cookingSkillSelect = page.locator('select[name="cooking_skill_level"]')
    this.timeAvailableInput = page.locator('input[name="time_available"]')
    this.budgetLevelSelect = page.locator('select[name="budget_level"]')

    // Results
    this.tdeeDisplay = page.locator('text=/TDEE.*\\d+/')
    this.calorieTargetDisplay = page.locator('text=/Target.*\\d+.*kcal/')
    this.proteinTargetDisplay = page.locator('text=/Protein.*\\d+.*g/')
    this.carbsTargetDisplay = page.locator('text=/Carbs.*\\d+.*g/')
    this.fatsTargetDisplay = page.locator('text=/Fats.*\\d+.*g/')
    this.completeButton = page.locator('button:has-text("Complete"), button:has-text("Finish")')
  }

  async goto() {
    await this.page.goto('/onboarding')
    await expect(this.page).toHaveURL(/.*onboarding/)
  }

  async fillPersonalInfo(data: {
    age: number
    weight: number
    height: number
    gender: string
  }) {
    await this.ageInput.fill(data.age.toString())
    await this.weightInput.fill(data.weight.toString())
    await this.heightInput.fill(data.height.toString())

    // Handle gender selection (could be select or radio group)
    if (await this.genderSelect.count() > 0) {
      const tagName = await this.genderSelect.evaluate(el => el.tagName)
      if (tagName === 'SELECT') {
        await this.genderSelect.selectOption(data.gender)
      } else {
        await this.page.locator(`[role="radio"][value="${data.gender}"]`).click()
      }
    }
  }

  async fillActivityAndGoals(data: {
    activityLevel: string
    goal: string
  }) {
    // Handle activity level (could be select or radio group)
    const activityRadio = this.page.locator(`[role="radio"][value="${data.activityLevel}"]`)
    if (await activityRadio.count() > 0) {
      await activityRadio.click()
    } else {
      await this.activityLevelSelect.selectOption(data.activityLevel)
    }

    // Handle goal (could be select or radio group)
    const goalRadio = this.page.locator(`[role="radio"][value="${data.goal}"]`)
    if (await goalRadio.count() > 0) {
      await goalRadio.click()
    } else {
      await this.goalSelect.selectOption(data.goal)
    }
  }

  async fillDietaryPreferences(data: {
    dietaryPreference: string
    allergies: string[]
  }) {
    await this.dietaryPreferenceSelect.selectOption(data.dietaryPreference)

    if (data.allergies.length > 0) {
      await this.allergiesInput.fill(data.allergies.join(', '))
    }
  }

  async fillCookingSkills(data: {
    cookingSkillLevel: string
    timeAvailable: number
    budgetLevel: string
  }) {
    await this.cookingSkillSelect.selectOption(data.cookingSkillLevel)
    await this.timeAvailableInput.fill(data.timeAvailable.toString())
    await this.budgetLevelSelect.selectOption(data.budgetLevel)
  }

  async clickNext() {
    await this.nextButton.click()
  }

  async clickBack() {
    await this.backButton.click()
  }

  async expectOnStep(stepNumber: number) {
    // Verify step indicator shows correct step
    await expect(this.progressIndicator).toBeVisible()
  }

  async expectTDEECalculated() {
    await expect(this.tdeeDisplay).toBeVisible()
    await expect(this.calorieTargetDisplay).toBeVisible()
    await expect(this.proteinTargetDisplay).toBeVisible()
    await expect(this.carbsTargetDisplay).toBeVisible()
    await expect(this.fatsTargetDisplay).toBeVisible()
  }

  async complete() {
    await this.completeButton.click()
    // Wait for redirect to dashboard
    await this.page.waitForURL((url) => !url.pathname.includes('onboarding'), {
      timeout: 10000,
    })
  }

  async completeOnboarding(profile: {
    age: number
    weight: number
    height: number
    gender: string
    activityLevel: string
    goal: string
    dietaryPreference: string
    allergies: string[]
    cookingSkillLevel: string
    timeAvailable: number
    budgetLevel: string
  }) {
    await this.goto()

    // Step 1: Personal Info
    await this.fillPersonalInfo({
      age: profile.age,
      weight: profile.weight,
      height: profile.height,
      gender: profile.gender,
    })
    await this.clickNext()

    // Step 2: Activity & Goals
    await this.fillActivityAndGoals({
      activityLevel: profile.activityLevel,
      goal: profile.goal,
    })
    await this.clickNext()

    // Step 3: Dietary Preferences
    await this.fillDietaryPreferences({
      dietaryPreference: profile.dietaryPreference,
      allergies: profile.allergies,
    })
    await this.clickNext()

    // Step 4: Cooking Skills
    await this.fillCookingSkills({
      cookingSkillLevel: profile.cookingSkillLevel,
      timeAvailable: profile.timeAvailable,
      budgetLevel: profile.budgetLevel,
    })
    await this.clickNext()

    // Verify TDEE calculated
    await this.expectTDEECalculated()

    // Complete onboarding
    await this.complete()
  }
}
