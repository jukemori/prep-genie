# PrepGenie - Test Cases

**Last Updated:** 2025-11-24
**Test Environment:** Development (http://localhost:3000)
**Testing Tool:** Playwright MCP

---

## Test Coverage Summary

- **Total Features:** 11
- **Total Test Cases:** 18/206
- **Pass Rate:** 8.7%
- **Bugs Found:** 3 (All Fixed)
- **Last Test Run:** Feature 2 - AI Meal Generator (TC-041, TC-044, TC-047)
  - ✅ Feature 1 - User Profile & Settings (TC-141 to TC-153) - All Passed
  - ✅ Feature 2 - AI Meal Generator (TC-036, TC-038, TC-041, TC-044, TC-047) - All Passed

---

## 1. Authentication & User Registration

**Note:** Use `LOGIN_EMAIL` and `LOGIN_PASSWORD` from `.env.local` for all authentication tests.

### 1.1 User Registration
- [ ] TC-001: New user can register with valid email and password
- [ ] TC-002: Registration fails with invalid email format
- [ ] TC-003: Registration fails with weak password (< 8 characters)
- [ ] TC-004: Registration fails with already registered email
- [ ] TC-005: Email confirmation link is sent after registration
- [ ] TC-006: User can click confirmation link and verify email

### 1.2 User Login
- [ ] TC-007: User can login with valid credentials
- [ ] TC-008: Login fails with incorrect password
- [ ] TC-009: Login fails with non-existent email
- [ ] TC-010: User is redirected to dashboard after successful login
- [ ] TC-011: Unauthenticated user is redirected to login page

### 1.3 Password Reset
- [ ] TC-012: User can request password reset
- [ ] TC-013: Password reset email is sent
- [ ] TC-014: User can reset password using reset link
- [ ] TC-015: Old password no longer works after reset

---

## 2. User Profile & Onboarding (Feature 1)

### 2.1 Onboarding Flow
- [ ] TC-016: New user is redirected to onboarding after registration
- [ ] TC-017: Step 1: User can enter age (18-100)
- [ ] TC-018: Step 1: User can enter weight in kg
- [ ] TC-019: Step 1: User can enter height in cm
- [ ] TC-020: Step 1: User can select gender (male/female/other)
- [ ] TC-021: Step 2: User can select activity level (5 options)
- [ ] TC-022: Step 2: User can select fitness goal (weight loss/maintain/muscle gain/balanced)
- [ ] TC-023: Step 3: User can select dietary preference (omnivore/vegetarian/vegan/pescatarian/halal)
- [ ] TC-024: Step 3: User can add multiple allergies
- [ ] TC-025: Step 3: User can remove added allergies
- [ ] TC-026: Step 4: User can select budget level (low/medium/high)
- [ ] TC-027: Step 4: User can select cooking skill (beginner/intermediate/advanced)
- [ ] TC-028: Step 4: User can set time available for cooking (in minutes)
- [ ] TC-029: Onboarding calculates TDEE automatically
- [ ] TC-030: Onboarding calculates target macros (protein/carbs/fats)
- [ ] TC-031: User is redirected to dashboard after completing onboarding

### 2.2 Profile Validation
- [ ] TC-032: Age must be between 18 and 100
- [ ] TC-033: Weight must be a positive number
- [ ] TC-034: Height must be a positive number
- [ ] TC-035: Cannot proceed to next step with invalid data

---

## 3. AI Meal Generator (Feature 2)

### 3.1 Meal Plan Generation
- [x] TC-036: User can access "Generate Meal Plan" page
- [ ] TC-037: User can select plan type (daily/weekly) - NOT IMPLEMENTED (auto-weekly)
- [x] TC-038: User can select cuisine type
- [ ] TC-039: User can select meal complexity (easy/medium/hard) - NOT IMPLEMENTED (uses profile)
- [ ] TC-040: User can set time constraints (prep + cook time) - NOT IMPLEMENTED (uses profile)
- [x] TC-041: AI generates complete meal plan with all meals - PASSED (17.2s generation time)
- [ ] TC-042: Generated meals include name, description, ingredients
- [ ] TC-043: Generated meals include instructions
- [x] TC-044: Generated meals include nutrition data (calories, protein, carbs, fats) - PASSED
- [ ] TC-045: Generated meals respect user's dietary preferences
- [ ] TC-046: Generated meals respect user's allergies
- [x] TC-047: User can save generated meal plan - PASSED (saved and redirected to meal plan details)

### 3.2 Meal Plan Details
- [ ] TC-048: Each meal shows prep time and cook time
- [ ] TC-049: Each meal shows servings count
- [ ] TC-050: Each meal shows complete ingredient list with quantities
- [ ] TC-051: Each meal shows step-by-step instructions

---

## 4. Meal Prep Mode (Feature 3)

### 4.1 Meal Prep Features
- [ ] TC-052: Meals marked as "meal prep friendly" are displayed
- [ ] TC-053: Batch cooking multiplier is shown (e.g., "Make 4 servings")
- [ ] TC-054: Storage instructions are displayed
- [ ] TC-055: Reheating instructions are displayed
- [ ] TC-056: Container type recommendation is shown
- [ ] TC-057: Storage duration (days) is displayed

---

## 5. Grocery List Generator (Feature 4)

### 5.1 Grocery List Creation
- [ ] TC-058: User can generate grocery list from meal plan
- [ ] TC-059: Ingredients are automatically consolidated (no duplicates)
- [ ] TC-060: Ingredients are categorized (produce, proteins, dairy, etc.)
- [ ] TC-061: Each ingredient shows quantity and unit

### 5.2 Grocery List Management
- [ ] TC-062: User can view all grocery lists
- [ ] TC-063: User can edit ingredient quantities
- [ ] TC-064: User can mark items as purchased (checkbox)
- [ ] TC-065: User can unmark purchased items
- [ ] TC-066: Estimated cost is displayed
- [ ] TC-067: Shopping progress is tracked (e.g., "5/20 items purchased")

---

## 6. Meal Library (Feature 5)

### 6.1 Meal Browsing
- [ ] TC-068: User can view all meals in library
- [ ] TC-069: User can search meals by name
- [ ] TC-070: User can filter meals by tags
- [ ] TC-071: User can filter meals by meal type (breakfast/lunch/dinner/snack)
- [ ] TC-072: User can filter meals by cuisine type
- [ ] TC-073: Public meals are displayed
- [ ] TC-074: User's private meals are displayed

### 6.2 Meal Management
- [ ] TC-075: User can create custom meal
- [ ] TC-076: User can save meal to favorites
- [ ] TC-077: User can remove meal from favorites
- [ ] TC-078: User can edit own meal
- [ ] TC-079: User can delete own meal
- [ ] TC-080: User cannot edit/delete other users' public meals

---

## 7. AI Nutrition Assistant (Feature 6)

### 7.1 Chat Functionality
- [ ] TC-081: User can access AI chat page
- [ ] TC-082: User can send nutrition question
- [ ] TC-083: AI responds with relevant answer
- [ ] TC-084: Chat supports streaming responses
- [ ] TC-085: Conversation history is saved
- [ ] TC-086: User can view previous conversations

### 7.2 Meal Modifications
- [ ] TC-087: User can request ingredient substitution
- [ ] TC-088: AI suggests appropriate substitutions
- [ ] TC-089: User can request meal modifications
- [ ] TC-090: AI provides modified recipe

---

## 8. Recipe Nutrition Analyzer (Feature 7)

### 8.1 Recipe Analysis
- [ ] TC-091: User can access "Analyze Recipe" page
- [ ] TC-092: User can input recipe URL
- [ ] TC-093: User can input recipe text (tab switch)
- [ ] TC-094: AI extracts ingredients and portions
- [ ] TC-095: Complete nutrition breakdown is displayed

### 8.2 Recipe Improvements
- [ ] TC-096: AI suggests budget version with cost savings
- [ ] TC-097: AI suggests high-protein version with protein boost
- [ ] TC-098: AI suggests lower-calorie version
- [ ] TC-099: User can save original recipe to meal library
- [ ] TC-100: User can save improved version to meal library

---

## 9. Meal Swap System (Feature 8)

### 9.1 Swap Functionality
- [ ] TC-101: User can view meal plan with swap options
- [ ] TC-102: Each meal has swap dropdown menu
- [ ] TC-103: Budget swap option is available
- [ ] TC-104: Speed swap option is available
- [ ] TC-105: Dietary swap option is available
- [ ] TC-106: Macro swap option is available

### 9.2 Swap Execution
- [ ] TC-107: Budget swap suggests cheaper alternatives with cost savings
- [ ] TC-108: Speed swap suggests faster cooking methods with time reduction
- [ ] TC-109: Dietary swap suggests (dairy-free/gluten-free/vegan/low-FODMAP) options
- [ ] TC-110: Macro swap suggests (high-protein/low-carb/low-fat) versions
- [ ] TC-111: Swapped meal maintains similar nutrition profile
- [ ] TC-112: Confirmation dialog appears before swap
- [ ] TC-113: User can cancel swap
- [ ] TC-114: User can confirm swap
- [ ] TC-115: Meal is replaced in meal plan after swap

### 9.3 Meal Completion
- [ ] TC-116: User can mark meal as completed (checkbox)
- [ ] TC-117: Meal completion status is saved
- [ ] TC-118: Completed meals are visually distinct

---

## 10. Cultural Meal Modes (Feature 9)

### 10.1 Cuisine Selection
- [ ] TC-119: User can select Japanese cuisine
- [ ] TC-120: User can select Korean cuisine
- [ ] TC-121: User can select Mediterranean cuisine
- [ ] TC-122: User can select Western cuisine
- [ ] TC-123: User can select Halal cuisine

### 10.2 Cuisine-Specific Features
- [ ] TC-124: Japanese meals use authentic ingredients (miso, dashi, etc.)
- [ ] TC-125: Korean meals include banchan culture
- [ ] TC-126: Mediterranean meals use olive oil and fresh produce
- [ ] TC-127: Halal meals use halal-certified ingredients
- [ ] TC-128: Cuisine-specific cooking methods are recommended

---

## 11. Internationalization (Feature 10)

### 11.1 Language Switching
- [ ] TC-129: User can access language switcher
- [ ] TC-130: User can switch from English to Japanese
- [ ] TC-131: User can switch from Japanese to English
- [ ] TC-132: UI text updates after language change
- [ ] TC-133: Page refreshes to apply new locale

### 11.2 Unit System
- [ ] TC-134: User can select Imperial units (lb, ft, in)
- [ ] TC-135: User can select Metric units (kg, cm)
- [ ] TC-136: Weight displays in selected unit system
- [ ] TC-137: Height displays in selected unit system

### 11.3 Currency
- [ ] TC-138: User can select USD currency
- [ ] TC-139: User can select JPY currency
- [ ] TC-140: Prices display in selected currency

---

## 12. Settings Page (Feature 11)

### 12.1 Profile Settings
- [x] TC-141: User can access settings page
- [x] TC-142: User can edit age
- [x] TC-143: User can edit weight
- [x] TC-144: User can edit height
- [x] TC-145: User can edit gender
- [x] TC-146: User can edit activity level
- [x] TC-147: User can edit fitness goal
- [x] TC-148: User can edit dietary preferences
- [x] TC-149: User can edit allergies
- [x] TC-150: User can edit cooking skill
- [x] TC-151: User can edit time available
- [x] TC-152: User can edit budget level
- [x] TC-153: Profile changes are saved

### 12.2 Language & Units Settings
- [ ] TC-154: User can change language preference
- [ ] TC-155: User can change unit system preference
- [ ] TC-156: User can change currency preference
- [ ] TC-157: Preferences are saved to database

### 12.3 Nutrition Targets
- [ ] TC-158: User can view current TDEE calculation
- [ ] TC-159: User can manually adjust calorie target
- [ ] TC-160: User can manually adjust protein target
- [ ] TC-161: User can manually adjust carbs target
- [ ] TC-162: User can manually adjust fats target
- [ ] TC-163: User can reset to AI-recommended values

### 12.4 Danger Zone
- [ ] TC-164: User can access account deletion option
- [ ] TC-165: Confirmation dialog appears before deletion
- [ ] TC-166: User can cancel account deletion
- [ ] TC-167: User can confirm account deletion
- [ ] TC-168: Account is deleted after confirmation
- [ ] TC-169: User is logged out after account deletion

---

## 13. Dashboard

### 13.1 Dashboard Overview
- [ ] TC-170: User can access dashboard
- [ ] TC-171: Daily calorie target is displayed
- [ ] TC-172: Current macro breakdown is displayed
- [ ] TC-173: Today's meal plan is displayed
- [ ] TC-174: Quick actions are available (Generate Plan, Analyze Recipe, etc.)

---

## 14. Responsive Design

### 14.1 Mobile View
- [ ] TC-175: App is usable on mobile (375px width)
- [ ] TC-176: Navigation menu works on mobile
- [ ] TC-177: Forms are usable on mobile
- [ ] TC-178: Tables/lists are scrollable on mobile

### 14.2 Tablet View
- [ ] TC-179: App is usable on tablet (768px width)
- [ ] TC-180: Layout adapts appropriately for tablet

### 14.3 Desktop View
- [ ] TC-181: App is usable on desktop (1920px width)
- [ ] TC-182: Sidebar navigation is visible

---

## 15. Error Handling

### 15.1 Network Errors
- [ ] TC-183: Graceful error message on network failure
- [ ] TC-184: User can retry failed request

### 15.2 Validation Errors
- [ ] TC-185: Form validation errors are displayed clearly
- [ ] TC-186: User cannot submit form with invalid data

### 15.3 404 Pages
- [ ] TC-187: 404 page is shown for non-existent routes
- [ ] TC-188: User can navigate back from 404 page

---

## 16. Performance

### 16.1 Page Load Times
- [ ] TC-189: Dashboard loads in < 2 seconds
- [ ] TC-190: Meal plan generation completes in < 10 seconds
- [ ] TC-191: Recipe analysis completes in < 5 seconds

### 16.2 AI Response Times
- [ ] TC-192: AI chat responses start streaming in < 2 seconds
- [ ] TC-193: Meal swap suggestions appear in < 5 seconds

---

## 17. Data Persistence

### 17.1 Database Operations
- [ ] TC-194: Created meals persist after page refresh
- [ ] TC-195: Saved meal plans persist after page refresh
- [ ] TC-196: Grocery lists persist after page refresh
- [ ] TC-197: Settings changes persist after logout/login
- [ ] TC-198: Chat history persists after page refresh

---

## 18. Security & Authorization

### 18.1 Row Level Security
- [ ] TC-199: User can only view own meal plans
- [ ] TC-200: User can only edit own meals
- [ ] TC-201: User can only delete own data
- [ ] TC-202: User can view public meals from other users
- [ ] TC-203: User cannot edit/delete other users' data

### 18.2 Authentication Flow
- [ ] TC-204: Protected routes redirect to login when not authenticated
- [ ] TC-205: Authenticated user can access all app routes
- [ ] TC-206: Session persists across browser refresh

---

## Test Execution Notes

### Prerequisites
1. Supabase local instance running
2. Next.js dev server running (`pnpm dev`)
3. OpenAI API key configured
4. Test user credentials configured in `.env.local`:
   ```bash
   LOGIN_EMAIL=your-test-email@example.com
   LOGIN_PASSWORD=your-secure-password
   ```

### Test Data Setup
- **Test User Credentials:** Use `LOGIN_EMAIL` and `LOGIN_PASSWORD` from `.env.local` for all authentication tests
- Ensure test user has completed onboarding with a valid profile
- Generate at least one sample meal plan for testing
- Create at least one sample grocery list for testing

**Important:** All Playwright tests should read credentials from environment variables:
```javascript
const email = process.env.LOGIN_EMAIL
const password = process.env.LOGIN_PASSWORD
```

### Playwright Configuration
- Base URL: http://localhost:3000
- Browser: Chromium, Firefox, WebKit
- Viewport: 1280x720 (desktop), 375x667 (mobile)
- Timeout: 30 seconds

---

## Bug Tracking

| Test Case | Status | Bug ID | Priority | Notes |
|-----------|--------|--------|----------|-------|
| TC-041    | PASSED | BUG-001| Critical | ~~OpenAI API connection error (ECONNRESET)~~ FIXED: Changed model from 'gpt-5-nano' to 'gpt-4o' and added error handling in features/meal-plans/actions.ts:107,119-122 |
| TC-041    | PASSED | BUG-002| Critical | ~~Next.js 16 dynamic rendering issue with cookies()~~ FIXED: (1) Removed incorrect `connection()` call from i18n/request.ts (2) Added `connection()` to app/layout.tsx:32 and generateAIMealPlan server action (3) Disabled `cacheComponents: true` in next.config.ts. Root cause: next-intl's `getRequestConfig` should call `await cookies()` directly without `connection()`. The `connection()` call belongs at the layout/page level, not inside config functions. Server now runs cleanly without "Maximum call stack size exceeded" errors. |
| TC-041    | PASSED | BUG-003| High     | ~~OpenAI API key typo~~ FIXED: Removed extra "s" from beginning of API key in .env.local (ssk-proj → sk-proj). Required dev server restart to pick up new environment variable. |

---

**Testing Progress:**
- [ ] Authentication (TC-001 to TC-015)
- [ ] Onboarding (TC-016 to TC-035)
- [ ] AI Meal Generator (TC-036 to TC-051)
- [ ] Meal Prep Mode (TC-052 to TC-057)
- [ ] Grocery Lists (TC-058 to TC-067)
- [ ] Meal Library (TC-068 to TC-080)
- [ ] AI Chat (TC-081 to TC-090)
- [ ] Recipe Analyzer (TC-091 to TC-100)
- [ ] Meal Swap (TC-101 to TC-118)
- [ ] Cultural Cuisines (TC-119 to TC-128)
- [ ] i18n (TC-129 to TC-140)
- [ ] Settings (TC-141 to TC-169)
- [ ] Dashboard (TC-170 to TC-174)
- [ ] Responsive Design (TC-175 to TC-182)
- [ ] Error Handling (TC-183 to TC-188)
- [ ] Performance (TC-189 to TC-193)
- [ ] Data Persistence (TC-194 to TC-198)
- [ ] Security (TC-199 to TC-206)
