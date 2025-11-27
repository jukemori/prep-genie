import { test as setup, expect } from '@playwright/test'
import { AuthPage } from './models/auth-page'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  const authPage = new AuthPage(page)

  // Navigate to login page
  await authPage.gotoSignIn()

  // Sign in with credentials from environment variables
  const email = process.env.LOGIN_EMAIL
  const password = process.env.LOGIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'LOGIN_EMAIL and LOGIN_PASSWORD environment variables must be set for E2E tests'
    )
  }

  await authPage.signIn(email, password)

  // Wait for redirect to dashboard or meal plans page
  await page.waitForURL((url) => {
    return url.pathname === '/dashboard' || url.pathname === '/meal-plans'
  })

  // Verify we're authenticated
  await expect(page).not.toHaveURL(/.*login/)

  // Save signed-in state to reuse in all tests
  await page.context().storageState({ path: authFile })
})
