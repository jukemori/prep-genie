import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Page Object Model for Authentication (Sign In/Sign Up)
 * Follows Playwright + Next.js best practices
 */
export class AuthPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly signInButton: Locator
  readonly signUpButton: Locator
  readonly signUpLink: Locator
  readonly signInLink: Locator
  readonly errorMessage: Locator
  readonly successMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('input[name="email"], input[type="email"]')
    // More specific selectors to avoid strict mode violations
    this.passwordInput = page.locator('input[name="password"]#password, input[id="password"]')
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"], input[id="confirmPassword"]')
    this.signInButton = page.locator('button:has-text("Sign In"), button:has-text("Log In")')
    this.signUpButton = page.locator('button:has-text("Sign Up"), button:has-text("Create Account")')
    this.signUpLink = page.locator('a:has-text("Sign Up"), a:has-text("Create an account")')
    this.signInLink = page.locator('a:has-text("Sign In"), a:has-text("Already have an account")')
    this.errorMessage = page.locator('[role="alert"], .error-message')
    this.successMessage = page.locator('.success-message, [role="status"]')
  }

  async gotoSignIn() {
    await this.page.goto('/login')
    await expect(this.page).toHaveURL(/.*login/)
  }

  async gotoSignUp() {
    await this.page.goto('/register')
    await expect(this.page).toHaveURL(/.*register/)
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.signInButton.click()
  }

  async signUp(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.confirmPasswordInput.fill(password)
    await this.signUpButton.click()
  }

  async waitForRedirect() {
    // Wait for navigation away from auth pages
    await this.page.waitForURL((url) => !url.pathname.includes('login') && !url.pathname.includes('register'), {
      timeout: 10000,
    })
  }

  async expectError(message?: string) {
    await expect(this.errorMessage).toBeVisible()
    if (message) {
      await expect(this.errorMessage).toContainText(message)
    }
  }

  async expectSuccess(message?: string) {
    await expect(this.successMessage).toBeVisible()
    if (message) {
      await expect(this.successMessage).toContainText(message)
    }
  }

  async navigateToSignUp() {
    await this.signUpLink.click()
    await expect(this.page).toHaveURL(/.*register/)
  }

  async navigateToSignIn() {
    await this.signInLink.click()
    await expect(this.page).toHaveURL(/.*login/)
  }

  async signOut() {
    // Navigate to a page with sign out (e.g., settings or header)
    const signOutButton = this.page.locator('button:has-text("Sign Out"), button:has-text("Log Out")')
    await signOutButton.click()
    await this.waitForRedirect()
  }
}
