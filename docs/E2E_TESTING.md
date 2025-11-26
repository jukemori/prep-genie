# E2E Testing with Playwright - PrepGenie

This document outlines the E2E testing strategy, test cases, and implementation status for PrepGenie using Playwright and Next.js 16 App Router.

## 📚 Resources

- [Playwright Next.js Testing Guide](https://nextjs.org/docs/pages/guides/testing/playwright)
- [Playwright Best Practices](https://ray.run/blog/testing-nextjs-apps-using-playwright)
- [Next.js Testing Documentation](https://nextjs.org/docs/app/guides/testing)

## 🎯 Testing Strategy

### Best Practices Applied

1. **Page Object Model (POM)** - Abstraction layer between tests and UI elements
2. **Auto-waiting** - Playwright waits for elements automatically
3. **Visual Regression Testing** - Screenshot comparisons for UI changes
4. **Parallel Execution** - Tests run in parallel for speed
5. **Production Build Testing** - Test against production builds
6. **Network Interception** - Mock API responses for consistent tests

### Browser Coverage

- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit/Safari (Desktop)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## 📋 Test Cases & Status

### 1. Authentication & Onboarding Flow ✅

**Priority:** Critical
**Status:** ✅ Completed

**Test Scenarios:**
- [x] User can sign up with email and password
- [x] Email validation works correctly
- [x] User can complete onboarding questionnaire
  - [x] Step 1: Personal info (age, weight, height, gender)
  - [x] Step 2: Activity level and goals
  - [x] Step 3: Dietary preferences and allergies
  - [x] Step 4: Cooking skills and time available
- [x] TDEE and macros are calculated correctly
- [x] User is redirected to dashboard after completion
- [x] User can sign in with existing credentials
- [x] User can sign out successfully

**File:** `tests/e2e/01-auth-onboarding.spec.ts`

---

### 2. Meal Plan Generation Flow 🚧

**Priority:** Critical
**Status:** 🚧 In Progress

**Test Scenarios:**
- [ ] User can access meal plan generator
- [ ] User can select cuisine type (Japanese, Korean, Mediterranean, Western, Halal)
- [ ] Generate button triggers AI generation
- [ ] Progress bar shows day-by-day progress (Day X of 7)
- [ ] Complete meal plan is generated (21 meals)
- [ ] Meal plan displays correctly with all details
- [ ] User can view individual meal details
- [ ] Nutrition summary matches daily targets

**File:** `tests/e2e/02-meal-plan-generation.spec.ts`

**Page Objects:**
- `pages/MealPlanGeneratorPage.ts`
- `pages/MealPlanDetailPage.ts`

---

### 3. Grocery List Generation 📋

**Priority:** High
**Status:** ⏳ Pending

**Test Scenarios:**
- [ ] User can generate grocery list from meal plan
- [ ] Ingredients are consolidated correctly
- [ ] Categories are assigned properly (produce, protein, dairy, etc.)
- [ ] User can check off purchased items
- [ ] User can edit quantities
- [ ] Estimated cost is displayed
- [ ] User can delete grocery list

**File:** `tests/e2e/03-grocery-list.spec.ts`

**Page Objects:**
- `pages/GroceryListPage.ts`

---

### 4. Meal Swap System 🔄

**Priority:** High
**Status:** ⏳ Pending

**Test Scenarios:**
- [ ] User can access meal swap menu
- [ ] Budget swap generates cheaper alternative
- [ ] Speed swap generates faster recipe
- [ ] Dietary swap respects restrictions (dairy-free, gluten-free, vegan, low-FODMAP)
- [ ] Macro swap adjusts for high-protein/low-carb/low-fat
- [ ] Swapped meal replaces original in meal plan
- [ ] Nutrition totals update correctly after swap
- [ ] User can swap multiple meals

**File:** `tests/e2e/04-meal-swap.spec.ts`

**Page Objects:**
- `pages/MealSwapPage.ts`

---

### 5. AI Nutrition Chat 💬

**Priority:** Medium
**Status:** ⏳ Pending

**Test Scenarios:**
- [ ] User can access AI chat
- [ ] User can send messages
- [ ] AI responds with streaming text
- [ ] Chat history is preserved
- [ ] User can ask nutrition questions
- [ ] User can request ingredient substitutions
- [ ] User can clear chat history

**File:** `tests/e2e/05-ai-chat.spec.ts`

**Page Objects:**
- `pages/AIChatPage.ts`

---

### 6. Recipe Analyzer 🔍

**Priority:** Medium
**Status:** ⏳ Pending

**Test Scenarios:**
- [ ] User can input recipe URL
- [ ] User can input recipe text
- [ ] AI extracts ingredients and portions
- [ ] Nutrition breakdown displays correctly
- [ ] Budget version suggestion works
- [ ] High-protein version suggestion works
- [ ] Lower-calorie version suggestion works
- [ ] User can save analyzed recipe to meal library

**File:** `tests/e2e/06-recipe-analyzer.spec.ts`

**Page Objects:**
- `pages/RecipeAnalyzerPage.ts`

---

### 7. Meal Library 📚

**Priority:** Medium
**Status:** ⏳ Pending

**Test Scenarios:**
- [ ] User can view saved meals
- [ ] User can search meals
- [ ] User can filter by tags
- [ ] User can create custom meal
- [ ] User can edit meal macros
- [ ] User can delete meal
- [ ] User can mark meal as favorite

**File:** `tests/e2e/07-meal-library.spec.ts`

**Page Objects:**
- `pages/MealLibraryPage.ts`

---

### 8. Settings & Profile Management ⚙️

**Priority:** Medium
**Status:** ⏳ Pending

**Test Scenarios:**
- [ ] User can update profile information
- [ ] User can change activity level
- [ ] User can update dietary preferences
- [ ] User can switch language (English ⇄ Japanese)
- [ ] User can change unit system (Imperial/Metric)
- [ ] User can adjust nutrition targets
- [ ] User can reset to AI recommendations
- [ ] User can delete account

**File:** `tests/e2e/08-settings.spec.ts`

**Page Objects:**
- `pages/SettingsPage.ts`

---

### 9. Progress Tracking 📈

**Priority:** Low
**Status:** ⏳ Pending

**Test Scenarios:**
- [ ] User can log weight
- [ ] User can log daily nutrition
- [ ] Progress logs display correctly
- [ ] User can view history
- [ ] User can edit past logs
- [ ] User can delete logs

**File:** `tests/e2e/09-progress-tracking.spec.ts`

**Page Objects:**
- `pages/ProgressPage.ts`

---

## 🏗️ Page Object Model Structure

```
tests/e2e/
├── pages/                          # Page Object Models
│   ├── AuthPage.ts                # Sign in/up/out
│   ├── OnboardingPage.ts          # Multi-step onboarding
│   ├── DashboardPage.ts           # Main dashboard
│   ├── MealPlanGeneratorPage.ts   # Meal plan generation
│   ├── MealPlanDetailPage.ts      # View meal plan
│   ├── GroceryListPage.ts         # Grocery lists
│   ├── MealSwapPage.ts            # Meal swap functionality
│   ├── AIChatPage.ts              # AI chat interface
│   ├── RecipeAnalyzerPage.ts      # Recipe analyzer
│   ├── MealLibraryPage.ts         # Meal library
│   ├── SettingsPage.ts            # Settings
│   └── ProgressPage.ts            # Progress tracking
├── fixtures/                       # Test data and helpers
│   ├── test-users.ts              # User credentials
│   ├── test-data.ts               # Sample meal/recipe data
│   └── helpers.ts                 # Utility functions
└── *.spec.ts                      # Test files
```

## 🚀 Running Tests

### Install Dependencies
```bash
pnpm install
pnpm exec playwright install
```

### Run All Tests
```bash
pnpm test:e2e
```

### Run Specific Test File
```bash
pnpm exec playwright test tests/e2e/01-auth-onboarding.spec.ts
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

- **Total Test Cases:** 60+
- **Completed:** 8 (Auth & Onboarding)
- **In Progress:** 8 (Meal Plan Generation)
- **Pending:** 44

**Next Steps:**
1. ✅ Complete meal plan generation tests
2. Create grocery list tests
3. Create meal swap tests
4. Create AI chat tests
5. Add visual regression tests
6. Set up CI/CD pipeline

---

**Last Updated:** 2025-11-26
**Maintained By:** PrepGenie Team
