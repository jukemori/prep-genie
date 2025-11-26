import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { TEST_USERS, generateUniqueEmail } from './fixtures/test-users'

/**
 * E2E Tests for Authentication & Onboarding Flow
 * Following Playwright + Next.js 16 best practices
 *
 * Test Scenarios:
 * 1. User signup with email/password
 * 2. Email validation
 * 3. Complete onboarding questionnaire (4 steps)
 * 4. TDEE and macro calculation
 * 5. User signin with existing credentials
 * 6. User signout
 */

test.describe('Authentication & Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Each test starts with a fresh session
    await page.context().clearCookies()
  })

  test('should display sign in page correctly', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.gotoSignIn()

    await expect(authPage.emailInput).toBeVisible()
    await expect(authPage.passwordInput).toBeVisible()
    await expect(authPage.signInButton).toBeVisible()
    await expect(authPage.signUpLink).toBeVisible()
  })

  test('should display sign up page correctly', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.gotoSignUp()

    await expect(authPage.emailInput).toBeVisible()
    await expect(authPage.passwordInput).toBeVisible()
    await expect(authPage.signUpButton).toBeVisible()
    await expect(authPage.signInLink).toBeVisible()
  })

  test('should navigate between sign in and sign up', async ({ page }) => {
    const authPage = new AuthPage(page)

    await authPage.gotoSignIn()
    await authPage.navigateToSignUp()
    await expect(page).toHaveURL(/.*register/)

    await authPage.navigateToSignIn()
    await expect(page).toHaveURL(/.*login/)
  })

  test('should validate email format on signup', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.gotoSignUp()

    await authPage.signUp('invalid-email', 'Password123!')

    // Expect validation error
    await authPage.expectError()
  })

  test('should require password strength on signup', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.gotoSignUp()

    const email = generateUniqueEmail()
    await authPage.signUp(email, '123') // Weak password

    // Expect validation error
    await authPage.expectError()
  })

  test('should complete full signup and onboarding flow', async ({ page }) => {
    const authPage = new AuthPage(page)
    const onboardingPage = new OnboardingPage(page)

    // Step 1: Sign up
    const email = generateUniqueEmail()
    const password = 'TestPassword123!'

    await authPage.gotoSignUp()
    await authPage.signUp(email, password)

    // Should redirect to onboarding or email confirmation
    await page.waitForURL((url) => url.pathname.includes('onboarding') || url.pathname.includes('confirm'), {
      timeout: 10000,
    })

    // If email confirmation required, skip this test
    if (page.url().includes('confirm')) {
      test.skip()
      return
    }

    // Step 2: Complete onboarding
    await onboardingPage.completeOnboarding(TEST_USERS.newUser.profile)

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard|meal-plans/, { timeout: 10000 })
  })

  test('should complete onboarding with Japanese user profile', async ({ page }) => {
    const authPage = new AuthPage(page)
    const onboardingPage = new OnboardingPage(page)

    // Sign up
    const email = generateUniqueEmail()
    await authPage.gotoSignUp()
    await authPage.signUp(email, 'JapaneseUser123!')

    await page.waitForURL((url) => url.pathname.includes('onboarding') || url.pathname.includes('confirm'), {
      timeout: 10000,
    })

    if (page.url().includes('confirm')) {
      test.skip()
      return
    }

    // Complete onboarding with Japanese user profile
    await onboardingPage.completeOnboarding(TEST_USERS.japaneseUser.profile)

    await expect(page).toHaveURL(/.*dashboard|meal-plans/, { timeout: 10000 })
  })

  test('should calculate TDEE and macros correctly', async ({ page }) => {
    const authPage = new AuthPage(page)
    const onboardingPage = new OnboardingPage(page)

    const email = generateUniqueEmail()
    await authPage.gotoSignUp()
    await authPage.signUp(email, 'TDEETest123!')

    await page.waitForURL((url) => url.pathname.includes('onboarding') || url.pathname.includes('confirm'), {
      timeout: 10000,
    })

    if (page.url().includes('confirm')) {
      test.skip()
      return
    }

    await onboardingPage.goto()

    // Fill form
    await onboardingPage.fillPersonalInfo({
      age: 30,
      weight: 75,
      height: 180,
      gender: 'male',
    })
    await onboardingPage.clickNext()

    await onboardingPage.fillActivityAndGoals({
      activityLevel: 'moderate',
      goal: 'maintain',
    })
    await onboardingPage.clickNext()

    await onboardingPage.fillDietaryPreferences({
      dietaryPreference: 'omnivore',
      allergies: [],
    })
    await onboardingPage.clickNext()

    await onboardingPage.fillCookingSkills({
      cookingSkillLevel: 'intermediate',
      timeAvailable: 60,
      budgetLevel: 'medium',
    })
    await onboardingPage.clickNext()

    // Verify TDEE and macros are calculated and displayed
    await onboardingPage.expectTDEECalculated()

    // TDEE for 30yo, 75kg, 180cm, male, moderate activity should be ~2600-2800 kcal
    const tdeeText = await onboardingPage.tdeeDisplay.textContent()
    expect(tdeeText).toMatch(/2[567]\d\d/) // Rough range check
  })

  test('should allow user to go back and edit onboarding steps', async ({ page }) => {
    const authPage = new AuthPage(page)
    const onboardingPage = new OnboardingPage(page)

    const email = generateUniqueEmail()
    await authPage.gotoSignUp()
    await authPage.signUp(email, 'EditTest123!')

    await page.waitForURL((url) => url.pathname.includes('onboarding') || url.pathname.includes('confirm'), {
      timeout: 10000,
    })

    if (page.url().includes('confirm')) {
      test.skip()
      return
    }

    await onboardingPage.goto()

    // Fill step 1
    await onboardingPage.fillPersonalInfo({
      age: 25,
      weight: 65,
      height: 170,
      gender: 'female',
    })
    await onboardingPage.clickNext()

    // Go back to step 1
    await onboardingPage.clickBack()

    // Verify can edit
    await expect(onboardingPage.ageInput).toHaveValue('25')
    await onboardingPage.ageInput.fill('26')

    await onboardingPage.clickNext()

    // Continue flow
    await onboardingPage.fillActivityAndGoals({
      activityLevel: 'light',
      goal: 'weight_loss',
    })
    await onboardingPage.clickNext()
  })

  test.describe('Sign In with Existing Account', () => {
    // These tests would require a seeded test account in the database
    // Skip for now unless you have test data seeding

    test.skip('should sign in with existing credentials', async ({ page }) => {
      const authPage = new AuthPage(page)

      await authPage.gotoSignIn()
      await authPage.signIn(TEST_USERS.existingUser.email, TEST_USERS.existingUser.password)

      await authPage.waitForRedirect()
      await expect(page).toHaveURL(/.*dashboard|meal-plans/)
    })

    test.skip('should show error for incorrect password', async ({ page }) => {
      const authPage = new AuthPage(page)

      await authPage.gotoSignIn()
      await authPage.signIn(TEST_USERS.existingUser.email, 'WrongPassword123!')

      await authPage.expectError('Invalid')
    })

    test.skip('should sign out successfully', async ({ page }) => {
      const authPage = new AuthPage(page)

      // Sign in first
      await authPage.gotoSignIn()
      await authPage.signIn(TEST_USERS.existingUser.email, TEST_USERS.existingUser.password)
      await authPage.waitForRedirect()

      // Sign out
      await authPage.signOut()

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/)
    })
  })
})
