# E2E Testing with Playwright - PrepGenie

This document outlines the E2E testing strategy, test cases, and implementation status for PrepGenie using Playwright and Next.js 16 App Router.

## 📚 Resources

- [Playwright Next.js Testing Guide](https://nextjs.org/docs/pages/guides/testing/playwright)
- [Playwright Authentication Guide](https://playwright.dev/docs/auth)
- [Playwright Best Practices](https://ray.run/blog/testing-nextjs-apps-using-playwright)
- [Next.js Testing Documentation](https://nextjs.org/docs/app/guides/testing)

## 🎯 Testing Strategy

### Best Practices Applied

1. **Page Object Model (POM)** - Abstraction layer between tests and UI elements
2. **Auto-waiting** - Playwright waits for elements automatically
3. **Authentication Setup File** - Sign in once, reuse state across all tests
4. **User Journey Testing** - Focus on critical user workflows
5. **Parallel Execution** - Tests run in parallel for speed
6. **Production Build Testing** - Test against production builds

### Authentication Strategy

We use Playwright's **authentication setup file** pattern to avoid repeating login in every test:

1. **Setup Project** (`tests/e2e/auth.setup.ts`):
   - Runs once before all tests
   - Signs in using credentials from `process.env.LOGIN_EMAIL` and `process.env.LOGIN_PASSWORD`
   - Saves authenticated state to `playwright/.auth/user.json`

2. **Test Projects**:
   - All browser projects depend on the setup project
   - Reuse saved authentication state via `storageState`
   - Tests assume user is already logged in

3. **Environment Variables**:
   ```bash
   # Required for E2E tests
   LOGIN_EMAIL=your-test-user@example.com
   LOGIN_PASSWORD=your-test-password
   ```

**Why this approach?**
- ✅ No email verification needed in tests
- ✅ Faster test execution (login happens once)
- ✅ Tests focus on user journeys, not authentication
- ✅ Matches Playwright best practices

### Browser Coverage

- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit/Safari (Desktop)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## 📋 User Journey Tests

These tests focus on end-to-end user workflows rather than exhaustive feature testing.

### 1. Authentication Setup ✅

**File:** `tests/e2e/auth.setup.ts`

- [x] Authenticates once before all tests
- [x] Saves state to `playwright/.auth/user.json`
- [x] Used by all test projects

### 2. Meal Plan Generation ✅

**File:** `tests/e2e/meal-plan.spec.ts`

**User Journey:**
1. Navigate to meal plan generator
2. Select cuisine type (Japanese, Korean, etc.)
3. Generate meal plan with AI
4. View generated meal plan
5. Click on meal to view details
6. Mark meal as completed

**Test Scenarios:**
- [x] Generate complete meal plan with Japanese cuisine
- [x] Display meal details when clicking on a meal
- [x] Mark meal as completed

### 3. Grocery List ✅

**File:** `tests/e2e/grocery-list.spec.ts`

**User Journey:**
1. View meal plan
2. Generate grocery list from meal plan
3. View categorized grocery items
4. Check off purchased items
5. View estimated cost

**Test Scenarios:**
- [x] Generate grocery list from meal plan
- [x] Check off grocery items as purchased
- [x] Display estimated cost

### 4. Recipe Analyzer ✅

**File:** `tests/e2e/recipe-analyzer.spec.ts`

**User Journey:**
1. Navigate to recipe analyzer
2. Input recipe text or URL
3. Analyze recipe with AI
4. View nutrition breakdown
5. See improvement suggestions (budget/high-protein/lower-calorie)
6. Save analyzed recipe

**Test Scenarios:**
- [x] Analyze recipe text and display nutrition breakdown
- [x] Display AI improvement suggestions
- [x] Save analyzed recipe to meal library
- [x] Handle recipe URL input

### 5. Meal Swap ✅

**File:** `tests/e2e/meal-swap.spec.ts`

**User Journey:**
1. Navigate to meal plan
2. Open meal swap menu
3. Select swap type (budget/speed/dietary/macro)
4. Confirm swap
5. Verify meal is replaced

**Test Scenarios:**
- [x] Open meal swap menu
- [x] Perform budget swap
- [x] Perform speed swap
- [x] Perform dietary swap
- [x] Perform macro swap (high-protein)

### 6. AI Nutrition Assistant ✅

**File:** `tests/e2e/ai-chat.spec.ts`

**User Journey:**
1. Navigate to AI chat
2. Ask nutrition question
3. Receive AI response
4. Ask follow-up questions
5. View chat history

**Test Scenarios:**
- [x] Send nutrition question and receive AI response
- [x] Handle follow-up questions
- [x] Ask about ingredient substitutions
- [x] Display chat history
- [x] Clear chat history


## 🏗️ Test File Structure

Following Playwright best practices for clean, maintainable test organization:

```
tests/e2e/
├── auth.setup.ts                   # Authentication setup (runs once)
├── meal-plan.spec.ts               # Meal plan generation tests
├── grocery-list.spec.ts            # Grocery list creation tests
├── recipe-analyzer.spec.ts         # Recipe analyzer tests
├── meal-swap.spec.ts               # Meal swap tests
├── ai-chat.spec.ts                 # AI chat tests
├── models/                         # Page Object Models (POMs)
│   └── auth-page.ts               # Auth page model
└── fixtures/                       # Test data and custom fixtures
    ├── test-users.ts              # User test data
    └── test-data.ts               # Sample meal/recipe data
```

**Key Principles:**
- **Flat structure** - Test files at root for easy discovery
- **Models folder** - Page Object Models following Playwright convention
- **Fixtures folder** - Test data and custom test fixtures
- **Kebab-case naming** - Consistent file naming convention

## 🚀 Running Tests

### Prerequisites

1. **Set Environment Variables** in `.env.local`:
   ```bash
   # Authentication credentials for E2E tests
   LOGIN_EMAIL=your-test-user@example.com
   LOGIN_PASSWORD=your-test-password
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   pnpm exec playwright install
   ```

### Run All Tests
```bash
pnpm test:e2e
```

This will:
1. Run the auth setup file first (signs in and saves state)
2. Run all journey tests in parallel using the saved auth state

### Run Specific Test File
```bash
pnpm exec playwright test tests/e2e/meal-plan.spec.ts
```

### Run Only Setup (to refresh auth state)
```bash
pnpm exec playwright test tests/e2e/auth.setup.ts
```

### Run in UI Mode (Interactive)
```bash
pnpm test:e2e:ui
```

### Run in Debug Mode
```bash
pnpm test:e2e:debug
```

### View Test Report
```bash
pnpm exec playwright show-report
```

## 📊 Test Coverage Goals

- ✅ **Critical Paths:** 100% (Auth, Meal Generation, Grocery Lists)
- 🎯 **High Priority:** 90% (Meal Swaps, AI Chat)
- 🎯 **Medium Priority:** 80% (Recipe Analyzer, Meal Library, Settings)
- 🎯 **Low Priority:** 70% (Progress Tracking)

## 🔧 CI/CD Integration

Tests run automatically on:
- ✅ Pull requests to `main` branch
- ✅ Pushes to `main` branch
- ✅ Nightly builds

**GitHub Actions Configuration:**
- Runs on: Ubuntu latest, macOS latest, Windows latest
- Browsers: Chromium, Firefox, WebKit
- Retries: 2 attempts on failure

## 📝 Writing New Tests - Guidelines

### 1. Use Page Object Model
```typescript
// Good ✅
import { MealPlanGeneratorPage } from './pages/MealPlanGeneratorPage'

test('should generate meal plan', async ({ page }) => {
  const generator = new MealPlanGeneratorPage(page)
  await generator.goto()
  await generator.selectCuisine('japanese')
  await generator.generate()
  await generator.waitForCompletion()
})

// Bad ❌
test('should generate meal plan', async ({ page }) => {
  await page.goto('/meal-plans/generate')
  await page.click('button:has-text("Japanese")')
  await page.click('button:has-text("Generate")')
})
```

### 2. Use Descriptive Test Names
```typescript
// Good ✅
test('should display error when email is invalid during signup')

// Bad ❌
test('test signup')
```

### 3. Use Auto-waiting
```typescript
// Good ✅
await page.click('button:has-text("Submit")')
await expect(page.locator('h1')).toHaveText('Success')

// Bad ❌
await page.click('button:has-text("Submit")')
await page.waitForTimeout(2000) // Brittle!
```

### 4. Isolate Tests
```typescript
// Each test should be independent
test.beforeEach(async ({ page }) => {
  // Set up fresh state for each test
  await page.goto('/login')
  await login(page)
})
```

## 🐛 Debugging Tips

1. **Use --debug flag:**
   ```bash
   pnpm exec playwright test --debug
   ```

2. **Use Playwright Inspector:**
   ```bash
   PWDEBUG=1 pnpm test:e2e
   ```

3. **Generate trace files:**
   ```bash
   pnpm exec playwright test --trace on
   pnpm exec playwright show-trace trace.zip
   ```

4. **Take screenshots:**
   ```typescript
   await page.screenshot({ path: 'screenshot.png' })
   ```

## 📈 Current Status

**Test Strategy:** User journey-focused E2E tests with authentication setup

- **Total Test Files:** 6
  - 1 authentication setup file
  - 5 user journey test files
- **Total Test Cases:** ~18 focused user journey tests
- **Status:** ✅ All core user journeys implemented

**Test Coverage:**
- ✅ Authentication setup with state reuse
- ✅ Meal plan generation
- ✅ Grocery list creation
- ✅ Recipe analyzer
- ✅ Meal swap
- ✅ AI chat

**Next Steps (Optional Enhancements):**
1. Add visual regression testing with screenshot comparisons
2. Set up CI/CD pipeline (GitHub Actions)
3. Add accessibility testing with @axe-core/playwright
4. Expand test coverage for edge cases
5. Add performance benchmarking

---

**Last Updated:** 2025-01-26
**Maintained By:** PrepGenie Team
