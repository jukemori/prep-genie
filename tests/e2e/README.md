# E2E Testing with Playwright

End-to-end tests for PrepGenie using Playwright and Next.js 16 App Router.

## 🚀 Quick Start

### Install Playwright Browsers

```bash
pnpm exec playwright install
```

### Run All Tests

```bash
pnpm test:e2e
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm test:e2e` | Run all E2E tests (headless) |
| `pnpm test:e2e:ui` | Run tests in UI mode (interactive) |
| `pnpm test:e2e:debug` | Run tests in debug mode |
| `pnpm test:e2e:headed` | Run tests with browser visible |
| `pnpm test:e2e:chromium` | Run tests in Chromium only |
| `pnpm test:e2e:firefox` | Run tests in Firefox only |
| `pnpm test:e2e:webkit` | Run tests in WebKit only |
| `pnpm test:e2e:report` | View test report |

## 🧪 Running Specific Tests

### Run Single Test File

```bash
pnpm exec playwright test e2e/01-auth-onboarding.spec.ts
```

### Run Tests Matching Pattern

```bash
pnpm exec playwright test --grep "meal plan"
```

### Run Tests in Specific Browser

```bash
pnpm exec playwright test --project=chromium
```

## 🎯 Test Structure

```
e2e/
├── pages/                    # Page Object Models (POM)
│   ├── AuthPage.ts          # Sign in/up/out
│   ├── OnboardingPage.ts    # Multi-step onboarding
│   └── MealPlanGeneratorPage.ts  # Meal plan generation
├── fixtures/                # Test data and helpers
│   ├── test-users.ts        # User credentials
│   └── test-data.ts         # Sample data
├── 01-auth-onboarding.spec.ts     # Auth & onboarding tests
├── 02-meal-plan-generation.spec.ts  # Meal plan tests
└── README.md                # This file
```

## 📝 Writing Tests

### 1. Follow Page Object Model Pattern

```typescript
import { test, expect } from '@playwright/test'
import { MealPlanGeneratorPage } from './pages/MealPlanGeneratorPage'

test('should generate meal plan', async ({ page }) => {
  const generator = new MealPlanGeneratorPage(page)
  await generator.goto()
  await generator.selectCuisine('japanese')
  await generator.generate()
  await generator.waitForCompletion()
})
```

### 2. Use Descriptive Test Names

```typescript
test('should display error when email is invalid during signup')
```

### 3. Isolate Tests

Each test should be independent and set up its own state.

```typescript
test.beforeEach(async ({ page }) => {
  // Set up fresh state
  await page.context().clearCookies()
})
```

## 🐛 Debugging

### 1. Run in Debug Mode

```bash
pnpm test:e2e:debug
```

### 2. Run with Browser Visible

```bash
pnpm test:e2e:headed
```

### 3. Use Playwright Inspector

```bash
PWDEBUG=1 pnpm test:e2e
```

### 4. Generate Trace

```bash
pnpm exec playwright test --trace on
pnpm exec playwright show-trace trace.zip
```

## 📊 Test Coverage

See [E2E_TESTING.md](../docs/E2E_TESTING.md) for detailed test plan and coverage.

**Current Status:**
- ✅ Authentication & Onboarding (8 tests)
- ✅ Meal Plan Generation (15 tests)
- ⏳ Grocery Lists (pending)
- ⏳ Meal Swaps (pending)
- ⏳ AI Chat (pending)

## 🔧 Configuration

Configuration is in `playwright.config.ts` at the project root.

**Key Settings:**
- **baseURL:** http://localhost:3000
- **Browsers:** Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries:** 2 on CI, 0 locally
- **webServer:** Auto-starts `pnpm dev` before tests

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing/playwright)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

## ⚠️ Important Notes

1. **Test Isolation:** Each test creates a new user account
2. **Timeout:** Meal plan generation takes ~2 minutes (7 days × ~15s per day)
3. **CI/CD:** Tests run on pull requests and main branch
4. **Environment:** Tests run against local dev server (`http://localhost:3000`)
5. **Email Confirmation:** Some tests may fail if email confirmation is enabled

## 🚨 Troubleshooting

### Tests Timeout

Increase timeout in specific tests:

```typescript
test('long running test', async ({ page }) => {
  // Set test timeout to 3 minutes
  test.setTimeout(180000)
})
```

### Port Already in Use

Kill the process using port 3000:

```bash
lsof -ti:3000 | xargs kill -9
```

### Playwright Browsers Not Installed

```bash
pnpm exec playwright install
```

---

**Last Updated:** 2025-11-26
