# Vitest Unit Test Cases Checklist

**Last Updated:** 2025-11-25
**Purpose:** Track unit and integration tests using Vitest 4.0.7
**Related:** See `TEST_CASES.md` for E2E Playwright tests

---

## Coverage Summary

| Category | Total | Completed | Progress |
|----------|-------|-----------|----------|
| Utility Functions | 60 | 0 | ☐ 0% |
| Schema Validation | 48 | 0 | ☐ 0% |
| React Components | 44 | 0 | ☐ 0% |
| Zustand Stores | 9 | 0 | ☐ 0% |
| Server Actions | 49 | 0 | ☐ 0% |
| Test Infrastructure | 11 | 0 | ☐ 0% |
| **TOTAL** | **221** | **0** | **☐ 0%** |

---

## 1. Utility Functions Tests (60 tests)

### 1.1 Nutrition Utilities - TDEE (`features/nutrition/utils/tdee.ts`) - 13 tests

#### calculateBMR Function
- [ ] calculates BMR for male using Mifflin-St Jeor equation
- [ ] calculates BMR for female using Mifflin-St Jeor equation
- [ ] handles edge case: age = 0
- [ ] handles edge case: weight = 0
- [ ] handles edge case: height = 0
- [ ] handles extreme values (very high weight/height)

#### calculateTDEE Function
- [ ] multiplies BMR by sedentary activity multiplier (1.2)
- [ ] multiplies BMR by light activity multiplier (1.375)
- [ ] multiplies BMR by moderate activity multiplier (1.55)
- [ ] multiplies BMR by active activity multiplier (1.725)
- [ ] multiplies BMR by very_active activity multiplier (1.9)
- [ ] rounds result to nearest integer
- [ ] handles invalid activity level gracefully

### 1.2 Nutrition Utilities - Macros (`features/nutrition/utils/macros.ts`) - 10 tests

#### calculateMacros Function
- [ ] weight_loss goal (protein: 2.0g/kg, carbs: 40%, fats: 25%)
- [ ] muscle_gain goal (protein: 2.2g/kg, carbs: 45%, fats: 25%)
- [ ] maintain goal (protein: 1.8g/kg, carbs: 40%, fats: 30%)
- [ ] balanced goal (protein: 1.6g/kg, carbs: 40%, fats: 30%)
- [ ] ensures protein minimum (1.6g/kg body weight)
- [ ] distributes remaining calories correctly
- [ ] returns integers (rounded values)
- [ ] handles zero calorie target
- [ ] handles negative calorie target
- [ ] total calories from macros matches input (within rounding)

### 1.3 i18n Utilities - Unit Conversions (`lib/i18n/units.ts`) - 22 tests

#### convertWeight Function
- [ ] converts kg to lb (80kg → 176.37lb)
- [ ] converts lb to kg (176lb → 79.83kg)
- [ ] returns same value when from === to (kg to kg)
- [ ] handles zero weight
- [ ] handles decimal values

#### convertHeight Function
- [ ] converts cm to ft_in (180cm → 5.11)
- [ ] converts ft_in to cm (5.11 → 180cm)
- [ ] returns same value when from === to
- [ ] handles zero height
- [ ] handles edge case: 6ft exactly (6.00)

#### convertVolume Function
- [ ] converts ml to cups_us (240ml → 1 cup)
- [ ] converts ml to cups_jp (200ml → 1 cup)
- [ ] converts cups_us to ml (1 cup → 240ml)
- [ ] converts cups_jp to ml (1 cup → 200ml)
- [ ] converts cups_us to cups_jp
- [ ] converts cups_jp to cups_us
- [ ] handles decimal cup values

#### formatCurrency Function
- [ ] formats USD with en locale ($1,234.56)
- [ ] formats JPY with ja locale (¥1,235)
- [ ] handles zero amount
- [ ] handles negative amounts

### 1.4 i18n Utilities - Locale Formatting (`lib/i18n/use-locale-format.ts`) - 10 tests

#### useLocaleFormat Hook
- [ ] formats numbers with Japanese locale (1,000 separator)
- [ ] formats numbers with English locale
- [ ] formats dates with Japanese locale
- [ ] formats dates with English locale
- [ ] formats weight in kg for Japanese locale
- [ ] formats height in cm for Japanese locale
- [ ] formats volume with Japanese cup size (200mL)
- [ ] formats volume with US cup size (240mL)
- [ ] formats currency in JPY for Japanese locale
- [ ] formats currency in USD for English locale

### 1.5 Common Utilities (`lib/utils/`) - 5 tests

#### Tailwind Utils (`cn.ts`)
- [ ] merges multiple class names
- [ ] handles conditional classes (clsx)
- [ ] resolves Tailwind conflicts (tailwind-merge)
- [ ] handles empty strings
- [ ] handles undefined/null values

---

## 2. Schema Validation Tests (48 tests)

### 2.1 User Profile Schema (`features/user-profile/schemas/`) - 17 tests

- [ ] validates complete valid profile
- [ ] rejects missing required fields (age, weight, height, gender)
- [ ] rejects invalid gender values
- [ ] rejects negative age
- [ ] rejects age > 120
- [ ] rejects negative weight
- [ ] rejects weight > 500kg
- [ ] rejects negative height
- [ ] rejects height > 300cm
- [ ] validates valid activity_level values
- [ ] rejects invalid activity_level
- [ ] validates valid goal values
- [ ] rejects invalid goal
- [ ] validates valid dietary_preference values
- [ ] validates allergies as array
- [ ] validates empty allergies array
- [ ] validates optional fields can be null/undefined

### 2.2 Meal Schema (`features/meals/schemas/`) - 19 tests

- [ ] validates complete valid meal
- [ ] rejects missing required fields (name, ingredients, instructions)
- [ ] rejects empty name
- [ ] rejects empty ingredients array
- [ ] rejects empty instructions array
- [ ] rejects negative calories
- [ ] rejects negative protein
- [ ] rejects negative carbs
- [ ] rejects negative fats
- [ ] rejects negative prep_time
- [ ] rejects negative cook_time
- [ ] rejects servings < 1
- [ ] validates valid meal_type values
- [ ] rejects invalid meal_type
- [ ] validates valid difficulty_level values
- [ ] validates ingredient structure (name, quantity, unit)
- [ ] validates tags as array of strings
- [ ] validates optional fields

### 2.3 Meal Plan Schema (`features/meal-plans/schemas/`) - 7 tests

- [ ] validates complete valid meal plan
- [ ] rejects missing required fields
- [ ] validates date format (YYYY-MM-DD)
- [ ] rejects invalid date format
- [ ] rejects end_date before start_date
- [ ] validates type values (daily, weekly, custom)
- [ ] rejects negative total_calories

### 2.4 Grocery List Schema (`features/grocery-lists/schemas/`) - 5 tests

- [ ] validates complete valid grocery list
- [ ] rejects missing required fields
- [ ] validates items array structure
- [ ] validates item properties (name, quantity, unit, category, is_purchased)
- [ ] rejects empty items array

---

## 3. React Component Tests (44 tests)

### 3.1 MealCard Component (`components/molecules/meal-card.tsx`) - 16 tests

#### Rendering
- [ ] renders meal name correctly
- [ ] renders meal description correctly
- [ ] renders calories per serving
- [ ] renders protein per serving with unit (g)
- [ ] renders carbs per serving with unit (g)
- [ ] renders fats per serving with unit (g)
- [ ] calculates and displays total time (prep + cook)
- [ ] handles missing prep_time (defaults to 0)
- [ ] handles missing cook_time (defaults to 0)
- [ ] handles missing description (no crash)
- [ ] displays difficulty level badge
- [ ] displays cuisine type badge
- [ ] displays tags as badges

#### Interactions
- [ ] calls onSave with meal.id when save button clicked
- [ ] calls onSave only once per click

#### Edge Cases
- [ ] renders image if image_url provided
- [ ] shows placeholder if no image_url

### 3.2 MacroDisplay Component (`components/molecules/macro-display.tsx`) - 10 tests

- [ ] renders protein value and unit
- [ ] renders carbs value and unit
- [ ] renders fats value and unit
- [ ] renders total calories calculated from macros
- [ ] displays progress bars for each macro
- [ ] calculates percentage of daily target correctly
- [ ] handles zero values gracefully
- [ ] handles missing target values
- [ ] displays color coding based on target achievement
- [ ] formats numbers with proper separators

### 3.3 IngredientItem Component (`components/molecules/ingredient-item.tsx`) - 8 tests

- [ ] renders ingredient name
- [ ] renders quantity with unit
- [ ] handles fractional quantities (1/2, 1/4)
- [ ] renders checkbox for grocery list mode
- [ ] calls onToggle when checkbox clicked
- [ ] applies strikethrough when checked
- [ ] handles missing unit (displays quantity only)

### 3.4 LanguageSwitcher Component (`components/molecules/language-switcher.tsx`) - 6 tests

- [ ] renders current locale selection
- [ ] displays language options (English, Japanese)
- [ ] calls locale change API when selection changes
- [ ] disables select during transition
- [ ] shows loading state during transition
- [ ] refreshes page after locale change

### 3.5 NutritionDashboard Component (`components/organisms/nutrition-dashboard/`) - 10 tests

- [ ] renders user's daily calorie target
- [ ] renders current calorie consumption
- [ ] calculates remaining calories
- [ ] displays macro breakdown chart
- [ ] shows progress towards protein target
- [ ] shows progress towards carbs target
- [ ] shows progress towards fats target
- [ ] displays color coding for over/under targets
- [ ] handles no data state gracefully
- [ ] updates when props change

---

## 4. Zustand Store Tests (9 tests)

### 4.1 UI Store (`stores/ui-store.ts`) - 7 tests

- [ ] initializes with default state (sidebarOpen: true)
- [ ] toggleSidebar - changes sidebarOpen from true to false
- [ ] toggleSidebar - changes sidebarOpen from false to true
- [ ] toggleSidebar - works multiple times consecutively
- [ ] persists state to localStorage
- [ ] restores state from localStorage on initialization
- [ ] handles missing localStorage data gracefully

### 4.2 Meal Store (`stores/meal-store.ts`) - 9 tests

- [ ] initializes with empty meals array
- [ ] addMeal - adds meal to meals array
- [ ] addMeal - maintains immutability
- [ ] updateMeal - updates existing meal by id
- [ ] updateMeal - does not affect other meals
- [ ] deleteMeal - removes meal from array
- [ ] deleteMeal - does nothing if id not found
- [ ] setFilter - updates current filter
- [ ] filtered meals computed correctly based on filter

---

## 5. Integration Tests - Server Actions (49 tests)

### 5.1 Auth Actions (`features/auth/actions.ts`) - 9 tests

- [ ] signIn - successfully authenticates with valid credentials
- [ ] signIn - throws error with invalid credentials
- [ ] signIn - throws error with missing email
- [ ] signIn - throws error with missing password
- [ ] signUp - creates new user with valid data
- [ ] signUp - throws error if email already exists
- [ ] signUp - sends confirmation email
- [ ] signUp - validates email format
- [ ] signOut - successfully signs out user

### 5.2 Meal Actions (`features/meals/actions.ts`) - 18 tests

- [ ] createMeal - creates meal with valid data
- [ ] createMeal - sets user_id from auth context
- [ ] createMeal - throws error with invalid data
- [ ] createMeal - revalidates /meals path
- [ ] updateMeal - updates existing meal
- [ ] updateMeal - only allows owner to update (RLS)
- [ ] updateMeal - throws error if meal not found
- [ ] updateMeal - revalidates meal path
- [ ] deleteMeal - deletes existing meal
- [ ] deleteMeal - only allows owner to delete (RLS)
- [ ] deleteMeal - throws error if meal not found
- [ ] deleteMeal - revalidates meals list
- [ ] getMeals - returns user's meals only (RLS)
- [ ] getMeals - includes public meals
- [ ] getMeals - filters by cuisine_type
- [ ] getMeals - filters by meal_type
- [ ] getMeals - searches by name
- [ ] saveMeal - adds meal to saved_meals

### 5.3 Meal Plan Actions (`features/meal-plans/actions.ts`) - 11 tests

- [ ] generateAIMealPlan - calls OpenAI with correct prompt
- [ ] generateAIMealPlan - parses JSON response correctly
- [ ] generateAIMealPlan - validates response against schema
- [ ] generateAIMealPlan - handles OpenAI API errors
- [ ] generateAIMealPlan - handles invalid JSON response
- [ ] saveMealPlan - saves plan to database
- [ ] saveMealPlan - creates meal_plan_items
- [ ] swapMeal - generates alternative meal
- [ ] swapMeal - maintains nutrition profile
- [ ] toggleMealCompleted - toggles is_completed flag
- [ ] toggleMealCompleted - only allows owner (RLS)

### 5.4 Recipe Analyzer Actions (`features/recipes/actions.ts`) - 7 tests

- [ ] analyzeRecipe - extracts ingredients from URL
- [ ] analyzeRecipe - extracts ingredients from text
- [ ] analyzeRecipe - calculates nutrition breakdown
- [ ] analyzeRecipe - generates improvement suggestions
- [ ] analyzeRecipe - handles invalid URL
- [ ] saveAnalyzedRecipe - saves recipe as meal
- [ ] saveAnalyzedRecipe - marks as is_ai_generated

### 5.5 Settings Actions (`features/settings/actions.ts`) - 6 tests

- [ ] updateProfile - updates user profile fields
- [ ] updateProfile - recalculates TDEE if weight/height/age changed
- [ ] updateProfile - validates data against schema
- [ ] updateLocalePreferences - updates locale, unit_system, currency
- [ ] updateNutritionTargets - allows manual override of targets
- [ ] resetNutritionTargets - recalculates from TDEE

---

## 6. Test Infrastructure (11 tests)

### 6.1 Test Setup (`tests/setup.ts`) - 4 tests

- [ ] Cleanup after each test
- [ ] Mock environment variables
- [ ] Mock Next.js navigation modules
- [ ] Mock Next.js cache modules

### 6.2 Test Utilities (`tests/helpers/test-utils.tsx`) - 4 tests

- [ ] Provides QueryClient wrapper
- [ ] Provides custom render function
- [ ] Disables retries in test environment
- [ ] Exports all @testing-library/react functions

### 6.3 Mock Data (`tests/helpers/mock-data.ts`) - 3 tests

- [ ] Provides mockUserProfile
- [ ] Provides mockMeal
- [ ] Provides mockMealPlan

---

## Priority Legend

- 🔴 **P0 (Critical)**: Core business logic, security, data integrity
- 🟡 **P1 (High)**: User-facing features, common flows
- 🟢 **P2 (Medium)**: Edge cases, error handling
- ⚪ **P3 (Low)**: Nice-to-have, rare scenarios

---

## Test Execution Commands

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/unit/features/nutrition/tdee.test.ts

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run only unit tests
pnpm test tests/unit

# Run only integration tests
pnpm test tests/integration
```

---

**Progress Tracking:**
- Use checkboxes [x] to mark completed tests
- Update coverage summary after each test session
- Document any bugs found in TEST_RESULTS.md
