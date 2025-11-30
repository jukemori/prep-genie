# Pre-built Meal Database Design Document

## Overview

Replace slow AI-generated meal plans (~2 min) with instant database queries (~1 sec) using a pre-seeded meal database of **140 meals** (70 English + 70 Japanese). GPT API remains for on-demand features like meal swaps and recipe analysis.

### Multi-Language Support

Meals are stored with a `locale` column to support internationalization:

| Locale | Meals | Content |
|--------|-------|---------|
| `en` | 70 | English names, descriptions, instructions |
| `ja` | 70 | Japanese names, descriptions, instructions (日本語) |

The matching algorithm automatically filters meals by user's locale setting.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEAL PLAN GENERATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Profile          Meal Plan Settings        Pre-built DB   │
│  ┌──────────────┐     ┌──────────────────┐     ┌─────────────┐  │
│  │ dietary_pref │     │ cuisine_type     │     │ 140 meals   │  │
│  │ allergies    │ ──► │ meals_per_day    │ ──► │ 70 EN + 70  │  │
│  │ goal         │     │ include_snacks   │     │ JA with     │  │
│  │ skill_level  │     │ variety_level    │     │ full nutri- │  │
│  │ time_avail   │     │ prep_time_max    │     │ tion data   │  │
│  │ calorie_tgt  │     └──────────────────┘     └─────────────┘  │
│  │ macro_tgts   │                                    │          │
│  │ locale (!)   │ ─────────────────────────────────► │          │
│  └──────────────┘                                    ▼          │
│                                              ┌─────────────┐    │
│                                              │  Matching   │    │
│                                              │  Algorithm  │    │
│                                              │  + locale   │    │
│                                              │  filter     │    │
│                                              └─────────────┘    │
│                                                    │            │
│                                                    ▼            │
│                                              ┌─────────────┐    │
│                                              │ Meal Plan   │    │
│                                              │ (instant)   │    │
│                                              └─────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Existing `meals` Table (No Changes Required)

The current schema already supports all needed fields:

```sql
meals (
  id UUID PRIMARY KEY,
  user_id UUID,                    -- NULL for seed meals (system-owned)
  name TEXT,
  description TEXT,
  ingredients JSONB,
  instructions TEXT[],
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  calories_per_serving INTEGER,
  protein_per_serving INTEGER,
  carbs_per_serving INTEGER,
  fats_per_serving INTEGER,
  tags TEXT[],
  cuisine_type TEXT,
  meal_type TEXT,                  -- 'breakfast' | 'lunch' | 'dinner' | 'snack'
  difficulty_level TEXT,           -- 'easy' | 'medium' | 'hard'
  is_public BOOLEAN,
  is_ai_generated BOOLEAN,
  ...
)
```

### New: Migration for Seed Meal Fields

```sql
-- Migration: add_seed_meal_fields
ALTER TABLE meals ADD COLUMN IF NOT EXISTS is_seed_meal BOOLEAN DEFAULT FALSE;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS dietary_tags TEXT[] DEFAULT '{}';
ALTER TABLE meals ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';

-- Indexes for fast filtering (Supabase best practice: always add explicit filters)
CREATE INDEX IF NOT EXISTS idx_meals_seed ON meals(is_seed_meal) WHERE is_seed_meal = TRUE;
CREATE INDEX IF NOT EXISTS idx_meals_locale ON meals(locale);
CREATE INDEX IF NOT EXISTS idx_meals_cuisine ON meals(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_meals_type ON meals(meal_type);
CREATE INDEX IF NOT EXISTS idx_meals_dietary_tags ON meals USING GIN(dietary_tags);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_meals_seed_locale ON meals(is_seed_meal, locale) WHERE is_seed_meal = TRUE;

COMMENT ON COLUMN meals.dietary_tags IS 'Array of dietary flags: vegetarian, vegan, gluten_free, dairy_free, halal, low_carb, high_protein, nut_free, egg_free, shellfish_free';
COMMENT ON COLUMN meals.locale IS 'ISO language code: en (English), ja (Japanese)';
```

---

## Meal Distribution (140 Meals: 70 EN + 70 JA)

Each locale has its own complete set of meals with native names, descriptions, and instructions.

### Per Locale (70 Meals Each)

| Meal Type | Count | Breakdown |
|-----------|-------|-----------|
| Breakfast | 15 | 5 quick (<15min), 5 standard, 5 meal-prep friendly |
| Lunch | 20 | Variety of proteins, cuisines, prep times |
| Dinner | 20 | Mix of quick weeknight + elaborate weekend |
| Snack | 15 | Protein-focused, low-cal, balanced options |
| **Total** | **70** | |

### Total Database

| Locale | Meals | Notes |
|--------|-------|-------|
| `en` | 70 | English content (names, descriptions, instructions) |
| `ja` | 70 | Japanese content (日本語の名前、説明、手順) |
| **Total** | **140** | |

### Cuisine Distribution

| Cuisine | Meals | Notes |
|---------|-------|-------|
| Japanese | 14 | Traditional + modern fusion |
| Korean | 10 | Banchan-style, fermented foods |
| Mediterranean | 12 | Heart-healthy, olive oil based |
| Western | 18 | American, European classics |
| Halal | 10 | Halal-certified ingredients |
| Mixed/Fusion | 6 | Cross-cultural combinations |

### Dietary Coverage

Each meal tagged with applicable dietary flags:

| Tag | Description |
|-----|-------------|
| `vegetarian` | No meat |
| `vegan` | No animal products |
| `gluten_free` | No gluten-containing ingredients |
| `dairy_free` | No dairy |
| `halal` | Halal compliant |
| `low_carb` | < 30g carbs per serving |
| `high_protein` | > 30g protein per serving |
| `nut_free` | No tree nuts or peanuts |
| `egg_free` | No eggs |
| `shellfish_free` | No shellfish |

---

## Zod Validation Schemas

Following Zod best practices for TypeScript-first validation with static type inference:

```typescript
// features/meal-plans/schemas/meal-plan-settings.ts
import { z } from 'zod'

export const mealPlanSettingsSchema = z.object({
  // Cuisine selection
  cuisineType: z.enum([
    'japanese', 'korean', 'mediterranean', 'western', 'halal', 'any'
  ]).default('any'),

  // Meals per day (affects snack inclusion)
  mealsPerDay: z.union([
    z.literal(3),  // breakfast, lunch, dinner
    z.literal(4),  // + afternoon snack
    z.literal(5),  // + morning & afternoon snacks
  ]).default(3),

  // Variety level
  varietyLevel: z.enum(['low', 'medium', 'high']).default('medium'),

  // Max prep + cook time per meal (minutes)
  prepTimeMax: z.number().min(10).max(120).optional(),
})

export type MealPlanSettings = z.infer<typeof mealPlanSettingsSchema>

// Dietary preference validation
export const dietaryPreferenceSchema = z.enum([
  'omnivore', 'vegetarian', 'vegan', 'pescatarian', 'halal'
])

// Allergy validation
export const allergySchema = z.enum([
  'dairy', 'gluten', 'nuts', 'eggs', 'shellfish', 'soy', 'fish'
])

export const allergiesSchema = z.array(allergySchema).default([])

// Goal validation
export const goalSchema = z.enum([
  'weight_loss', 'maintain', 'muscle_gain', 'balanced'
])
```

---

## Meal Matching Algorithm

### Input Parameters

```typescript
interface MealMatcherInput {
  // From User Profile (user_profiles table)
  dietaryPreference: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'halal'
  allergies: string[]
  goal: 'weight_loss' | 'maintain' | 'muscle_gain' | 'balanced'
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced'
  dailyCalorieTarget: number
  targetProtein: number
  targetCarbs: number
  targetFats: number
  locale: 'en' | 'ja'  // User's preferred language

  // From Meal Plan Settings (user input at generation time)
  cuisineType: 'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal' | 'any'
  mealsPerDay: 3 | 4 | 5
  varietyLevel: 'low' | 'medium' | 'high'
  prepTimeMax?: number
}
```

### Meal Structure by Goal

| Goal | Meals/Day | Structure | Macro Focus |
|------|-----------|-----------|-------------|
| Weight Loss | 4 | B, L, D, Snack | High protein, low carb |
| Maintain | 3-4 | B, L, D, (Snack) | Balanced |
| Muscle Gain | 5 | B, Snack, L, Snack, D | High protein, high cal |
| Balanced | 3 | B, L, D | Even macros |

### Implementation (Supabase Best Practices)

```typescript
// features/meal-plans/utils/meal-matcher.ts
import { createClient } from '@/lib/supabase/server'
import type { Meal, UserProfile } from '@/types'
import type { MealPlanSettings } from '../schemas/meal-plan-settings'

interface MealMatcherInput {
  profile: UserProfile
  settings: MealPlanSettings
}

export async function matchMeals({ profile, settings }: MealMatcherInput) {
  const supabase = await createClient()

  // Best Practice: Always use explicit filters for better query performance
  // Even with RLS, explicit .eq() allows PostgreSQL to construct efficient query plans
  let query = supabase
    .from('meals')
    .select('*')
    .eq('is_seed_meal', true)  // Explicit filter on indexed column
    .eq('locale', profile.locale || 'en')  // Filter by user's locale for i18n

  // Apply cuisine filter at database level for performance
  if (settings.cuisineType !== 'any') {
    query = query.eq('cuisine_type', settings.cuisineType)
  }

  // Apply time constraint at database level
  if (settings.prepTimeMax) {
    query = query.lte('prep_time', settings.prepTimeMax)
  }

  // Apply skill level filter
  const skillLevels = getSkillLevels(profile.cooking_skill_level)
  query = query.in('difficulty_level', skillLevels)

  const { data: meals, error } = await query

  if (error || !meals) {
    throw new Error('Failed to fetch meals')
  }

  // Filter by dietary preference and allergies (in-memory for complex logic)
  const eligibleMeals = filterByDietaryNeeds(meals, profile)

  // Group by meal type
  const grouped = groupByMealType(eligibleMeals)

  // Select meals for 7 days
  return selectMealsForWeek(grouped, profile, settings)
}

function getSkillLevels(skill: string | null): string[] {
  switch (skill) {
    case 'beginner': return ['easy']
    case 'intermediate': return ['easy', 'medium']
    case 'advanced': return ['easy', 'medium', 'hard']
    default: return ['easy', 'medium']
  }
}

export function filterByDietaryNeeds(meals: Meal[], profile: UserProfile): Meal[] {
  return meals.filter(meal => {
    const tags = meal.dietary_tags || []

    // Check dietary preference
    if (profile.dietary_preference === 'vegetarian' && !tags.includes('vegetarian')) {
      return false
    }
    if (profile.dietary_preference === 'vegan' && !tags.includes('vegan')) {
      return false
    }
    if (profile.dietary_preference === 'halal' && !tags.includes('halal')) {
      return false
    }

    // Check allergies - meal must have corresponding "_free" tag
    const allergies = profile.allergies || []
    for (const allergy of allergies) {
      const allergyFreeTag = `${allergy}_free`
      if (!tags.includes(allergyFreeTag)) {
        return false
      }
    }

    return true
  })
}

function groupByMealType(meals: Meal[]): Record<string, Meal[]> {
  return meals.reduce((acc, meal) => {
    const type = meal.meal_type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(meal)
    return acc
  }, {} as Record<string, Meal[]>)
}

function selectMealsForWeek(
  grouped: Record<string, Meal[]>,
  profile: UserProfile,
  settings: MealPlanSettings
): Array<{ day: number; meals: Meal[] }> {
  const weekPlan: Array<{ day: number; meals: Meal[] }> = []
  const usedMealIds = new Set<string>()

  for (let day = 0; day < 7; day++) {
    const dayMeals: Meal[] = []

    // Always add breakfast, lunch, dinner
    dayMeals.push(selectBestMeal(grouped.breakfast || [], profile, usedMealIds, settings.varietyLevel))
    dayMeals.push(selectBestMeal(grouped.lunch || [], profile, usedMealIds, settings.varietyLevel))
    dayMeals.push(selectBestMeal(grouped.dinner || [], profile, usedMealIds, settings.varietyLevel))

    // Add snacks based on mealsPerDay
    if (settings.mealsPerDay >= 4) {
      dayMeals.push(selectBestMeal(grouped.snack || [], profile, usedMealIds, settings.varietyLevel))
    }
    if (settings.mealsPerDay >= 5) {
      dayMeals.push(selectBestMeal(grouped.snack || [], profile, usedMealIds, settings.varietyLevel))
    }

    weekPlan.push({ day, meals: dayMeals.filter(Boolean) })
  }

  return weekPlan
}

function selectBestMeal(
  pool: Meal[],
  profile: UserProfile,
  usedIds: Set<string>,
  varietyLevel: 'low' | 'medium' | 'high'
): Meal {
  if (pool.length === 0) {
    throw new Error('No meals available in pool')
  }

  // Score each meal
  const scored = pool.map(meal => ({
    meal,
    score: calculateMealScore(meal, profile, usedIds),
  }))

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Select based on variety level
  let selectedIndex = 0
  if (varietyLevel === 'high') {
    selectedIndex = Math.floor(Math.random() * Math.min(5, scored.length))
  } else if (varietyLevel === 'medium') {
    selectedIndex = Math.floor(Math.random() * Math.min(3, scored.length))
  }

  const selected = scored[selectedIndex].meal
  usedIds.add(selected.id)
  return selected
}

export function calculateMealScore(
  meal: Meal,
  profile: UserProfile,
  usedIds: Set<string>
): number {
  let score = 100

  // Penalize if already used this week
  if (usedIds.has(meal.id)) {
    score -= 50
  }

  // Score based on calorie alignment
  const targetCals = (profile.daily_calorie_target || 2000) / 3
  const calDiff = Math.abs((meal.calories_per_serving || 0) - targetCals)
  score -= calDiff / 10

  // Bonus for high protein if muscle gain goal
  if (profile.goal === 'muscle_gain' && (meal.protein_per_serving || 0) > 30) {
    score += 20
  }

  // Bonus for low carb if weight loss goal
  if (profile.goal === 'weight_loss' && (meal.carbs_per_serving || 0) < 30) {
    score += 15
  }

  return score
}
```

---

## GPT API Integration

GPT is used for **on-demand features**, not core generation:

### 1. Meal Swap (Existing)

When user clicks "Swap Meal" on a meal plan item:

- GPT generates a replacement meal matching user preferences
- Takes 10-30 seconds (acceptable for single meal)
- Located: `features/meal-plans/actions.ts` → `swapMeal()`

### 2. Recipe Analyzer (Existing)

When user pastes a recipe URL or text:

- GPT extracts ingredients, nutrition, and creates structured recipe
- Located: `features/recipes/actions.ts` → `analyzeRecipe()`

### 3. Seed Data Generation (One-time)

Use GPT to generate the initial 140 meals (70 per locale):

```bash
# Generate English meals
pnpm seed:meals --locale=en

# Generate Japanese meals
pnpm seed:meals --locale=ja
```

- Run offline/locally
- Generate meals in batches (10 at a time)
- Japanese meals have native names, descriptions, and instructions (日本語)
- Review and curate before inserting to production
- Ensure nutrition data consistency across locales

---

## UI/UX Changes

### Meal Plan Generation Page

```
┌─────────────────────────────────────────────────────────────┐
│  Generate Meal Plan                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Cuisine Type: [Any ▼] [Japanese] [Korean] [Mediterranean]  │
│                [Western] [Halal]                             │
│                                                              │
│  Meals per Day:                                              │
│  ○ 3 meals (breakfast, lunch, dinner)                       │
│  ● 4 meals (+ afternoon snack)                              │
│  ○ 5 meals (+ morning & afternoon snacks)                   │
│                                                              │
│  Variety Level:                                              │
│  ○ Low - Same meals can repeat (meal prep friendly)         │
│  ● Medium - Some variety                                     │
│  ○ High - All unique meals                                  │
│                                                              │
│  Max Prep Time: [Any ▼] [15 min] [30 min] [60 min]          │
│                                                              │
│  [Generate Meal Plan]  ← INSTANT (~1 sec)                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Meal Plan View (with Snacks)

```
Monday
├── Breakfast: Japanese Omelette (476 cal, 22g protein)
├── Morning Snack: Greek Yogurt with Berries (180 cal)     ← if 5 meals
├── Lunch: Teriyaki Chicken Bowl (862 cal, 46g protein)
├── Afternoon Snack: Protein Energy Balls (150 cal)        ← if 4+ meals
└── Dinner: Grilled Salmon (1174 cal, 58g protein)

Tuesday
├── Breakfast: ...
```

---

## Testing Strategy

### Unit Tests (Vitest)

Following Vitest best practices: use `vi.mock()` for module mocking, MSW for API requests, and proper test fixtures.

```typescript
// tests/unit/meal-matcher.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { filterByDietaryNeeds, calculateMealScore } from '@/features/meal-plans/utils/meal-matcher'
import type { Meal, UserProfile } from '@/types'

// Mock Supabase client using vi.mock with factory
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          lte: vi.fn(() => ({
            in: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }))
}))

// Test fixtures
const createMockMeal = (overrides: Partial<Meal> = {}): Meal => ({
  id: '1',
  name: 'Test Meal',
  meal_type: 'lunch',
  cuisine_type: 'western',
  dietary_tags: [],
  calories_per_serving: 500,
  protein_per_serving: 25,
  carbs_per_serving: 50,
  fats_per_serving: 20,
  difficulty_level: 'easy',
  prep_time: 15,
  ...overrides,
} as Meal)

const createMockProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  dietary_preference: 'omnivore',
  allergies: [],
  goal: 'maintain',
  cooking_skill_level: 'intermediate',
  daily_calorie_target: 2000,
  target_protein: 150,
  target_carbs: 200,
  target_fats: 70,
  ...overrides,
} as UserProfile)

describe('Meal Matcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('filterByDietaryNeeds', () => {
    it('should filter out non-vegetarian meals for vegetarian users', () => {
      const meals = [
        createMockMeal({ id: '1', dietary_tags: ['vegetarian'] }),
        createMockMeal({ id: '2', dietary_tags: [] }),
      ]
      const profile = createMockProfile({ dietary_preference: 'vegetarian' })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter out meals containing allergens', () => {
      const meals = [
        createMockMeal({ id: '1', dietary_tags: ['dairy_free'] }),
        createMockMeal({ id: '2', dietary_tags: [] }),
      ]
      const profile = createMockProfile({ allergies: ['dairy'] })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(1)
      expect(result[0].dietary_tags).toContain('dairy_free')
    })

    it('should return all meals for omnivore with no allergies', () => {
      const meals = [
        createMockMeal({ id: '1' }),
        createMockMeal({ id: '2' }),
      ]
      const profile = createMockProfile()

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(2)
    })

    it('should handle multiple allergies', () => {
      const meals = [
        createMockMeal({ id: '1', dietary_tags: ['dairy_free', 'gluten_free'] }),
        createMockMeal({ id: '2', dietary_tags: ['dairy_free'] }),
        createMockMeal({ id: '3', dietary_tags: [] }),
      ]
      const profile = createMockProfile({ allergies: ['dairy', 'gluten'] })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })
  })

  describe('calculateMealScore', () => {
    it('should give higher score for unused meals', () => {
      const meal = createMockMeal()
      const profile = createMockProfile()

      const scoreUnused = calculateMealScore(meal, profile, new Set())
      const scoreUsed = calculateMealScore(meal, profile, new Set([meal.id]))

      expect(scoreUnused).toBeGreaterThan(scoreUsed)
      expect(scoreUnused - scoreUsed).toBe(50)
    })

    it('should give bonus for high protein meals when goal is muscle_gain', () => {
      const highProtein = createMockMeal({ protein_per_serving: 40 })
      const lowProtein = createMockMeal({ protein_per_serving: 15 })
      const profile = createMockProfile({ goal: 'muscle_gain' })

      const highScore = calculateMealScore(highProtein, profile, new Set())
      const lowScore = calculateMealScore(lowProtein, profile, new Set())

      expect(highScore).toBeGreaterThan(lowScore)
    })

    it('should give bonus for low carb meals when goal is weight_loss', () => {
      const lowCarb = createMockMeal({ carbs_per_serving: 20 })
      const highCarb = createMockMeal({ carbs_per_serving: 80 })
      const profile = createMockProfile({ goal: 'weight_loss' })

      const lowScore = calculateMealScore(lowCarb, profile, new Set())
      const highScore = calculateMealScore(highCarb, profile, new Set())

      expect(lowScore).toBeGreaterThan(highScore)
    })

    it('should penalize meals far from calorie target', () => {
      const onTarget = createMockMeal({ calories_per_serving: 667 }) // 2000/3
      const offTarget = createMockMeal({ calories_per_serving: 1000 })
      const profile = createMockProfile({ daily_calorie_target: 2000 })

      const onScore = calculateMealScore(onTarget, profile, new Set())
      const offScore = calculateMealScore(offTarget, profile, new Set())

      expect(onScore).toBeGreaterThan(offScore)
    })
  })
})

describe('Zod Schemas', () => {
  describe('mealPlanSettingsSchema', () => {
    it('should validate correct settings', () => {
      const validSettings = {
        cuisineType: 'japanese',
        mealsPerDay: 4,
        varietyLevel: 'high',
        prepTimeMax: 30,
      }

      const result = mealPlanSettingsSchema.safeParse(validSettings)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.cuisineType).toBe('japanese')
      }
    })

    it('should reject invalid mealsPerDay', () => {
      const invalidSettings = {
        cuisineType: 'japanese',
        mealsPerDay: 6,
        varietyLevel: 'high',
      }

      const result = mealPlanSettingsSchema.safeParse(invalidSettings)

      expect(result.success).toBe(false)
    })

    it('should apply defaults for missing fields', () => {
      const result = mealPlanSettingsSchema.parse({})

      expect(result.cuisineType).toBe('any')
      expect(result.mealsPerDay).toBe(3)
      expect(result.varietyLevel).toBe('medium')
    })

    it('should reject prepTimeMax below minimum', () => {
      const result = mealPlanSettingsSchema.safeParse({ prepTimeMax: 5 })

      expect(result.success).toBe(false)
    })
  })
})
```

### E2E Tests (Playwright)

Following Playwright best practices: Page Object Model, role-based locators, web-first assertions.

```typescript
// tests/e2e/page-objects/MealPlanGeneratorPage.ts
import { expect, type Locator, type Page } from '@playwright/test'

export class MealPlanGeneratorPage {
  readonly page: Page
  readonly cuisineButtons: Locator
  readonly generateButton: Locator
  readonly loadingSpinner: Locator
  readonly mealPlanContainer: Locator

  constructor(page: Page) {
    this.page = page
    // Best Practice: Use role-based locators for resilience
    this.cuisineButtons = page.getByRole('button').filter({
      hasText: /Japanese|Korean|Mediterranean|Western|Halal/
    })
    this.generateButton = page.getByRole('button', { name: /generate meal plan/i })
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]')
    this.mealPlanContainer = page.locator('[data-testid="meal-plan"]')
  }

  async goto() {
    await this.page.goto('/meal-plans/generate')
  }

  async selectCuisine(cuisine: string) {
    await this.page.getByRole('button', { name: new RegExp(cuisine, 'i') }).click()
  }

  async selectMealsPerDay(count: 3 | 4 | 5) {
    const labels = { 3: '3 meals', 4: '4 meals', 5: '5 meals' }
    await this.page.getByRole('radio', { name: new RegExp(labels[count], 'i') }).click()
  }

  async selectVarietyLevel(level: 'low' | 'medium' | 'high') {
    await this.page.getByRole('radio', { name: new RegExp(level, 'i') }).click()
  }

  async generate() {
    await this.generateButton.click()
  }

  async waitForGeneration() {
    // Best Practice: Use web-first assertions that auto-wait
    await expect(this.mealPlanContainer).toBeVisible({ timeout: 5000 })
  }
}
```

```typescript
// tests/e2e/page-objects/MealPlanPage.ts
import { expect, type Locator, type Page } from '@playwright/test'

export class MealPlanPage {
  readonly page: Page
  readonly title: Locator
  readonly dayCards: Locator
  readonly mealItems: Locator
  readonly swapButtons: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByRole('heading', { level: 1 })
    this.dayCards = page.locator('[data-testid="day-card"]')
    this.mealItems = page.locator('[data-testid="meal-item"]')
    // Best Practice: Chain and filter locators for precision
    this.swapButtons = page.getByRole('button', { name: /swap meal/i })
  }

  async getMealCountForDay(dayIndex: number) {
    const dayCard = this.dayCards.nth(dayIndex)
    return await dayCard.locator('[data-testid="meal-item"]').count()
  }

  async swapMeal(mealIndex: number) {
    await this.swapButtons.nth(mealIndex).click()
  }
}
```

```typescript
// tests/e2e/meal-plan-generation.spec.ts
import { test, expect } from '@playwright/test'
import { MealPlanGeneratorPage } from './page-objects/MealPlanGeneratorPage'
import { MealPlanPage } from './page-objects/MealPlanPage'

test.describe('Meal Plan Generation', () => {
  let generatorPage: MealPlanGeneratorPage

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByRole('textbox', { name: /email/i }).fill('test@example.com')
    await page.getByRole('textbox', { name: /password/i }).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Best Practice: Use web-first assertions
    await expect(page).toHaveURL(/dashboard/)

    generatorPage = new MealPlanGeneratorPage(page)
  })

  test('should generate meal plan instantly with database approach', async ({ page }) => {
    await generatorPage.goto()
    await generatorPage.selectCuisine('Japanese')
    await generatorPage.selectMealsPerDay(4)

    const startTime = Date.now()
    await generatorPage.generate()
    await generatorPage.waitForGeneration()
    const duration = Date.now() - startTime

    // Target: < 3 seconds (database approach should be ~1 sec)
    expect(duration).toBeLessThan(3000)
  })

  test('should display 7 days with correct meal count', async ({ page }) => {
    const mealPlanPage = new MealPlanPage(page)

    await generatorPage.goto()
    await generatorPage.selectMealsPerDay(4)
    await generatorPage.generate()
    await generatorPage.waitForGeneration()

    await expect(mealPlanPage.dayCards).toHaveCount(7)

    const mealCount = await mealPlanPage.getMealCountForDay(0)
    expect(mealCount).toBe(4) // 3 meals + 1 snack
  })

  test('should include snacks when mealsPerDay is 5', async ({ page }) => {
    const mealPlanPage = new MealPlanPage(page)

    await generatorPage.goto()
    await generatorPage.selectMealsPerDay(5)
    await generatorPage.generate()
    await generatorPage.waitForGeneration()

    const mealCount = await mealPlanPage.getMealCountForDay(0)
    expect(mealCount).toBe(5)

    // Best Practice: Use toBeVisible() instead of manual checks
    await expect(page.getByText(/snack/i).first()).toBeVisible()
  })

  test('should filter by cuisine type', async ({ page }) => {
    await generatorPage.goto()
    await generatorPage.selectCuisine('Japanese')
    await generatorPage.generate()
    await generatorPage.waitForGeneration()

    // Verify Japanese meals are shown (check for Japanese characters or dish names)
    const mealNames = await page.locator('[data-testid="meal-name"]').allTextContents()
    expect(mealNames.length).toBeGreaterThan(0)
  })

  test('should allow meal swap with GPT', async ({ page }) => {
    const mealPlanPage = new MealPlanPage(page)

    await generatorPage.goto()
    await generatorPage.generate()
    await generatorPage.waitForGeneration()

    const initialMealName = await page.locator('[data-testid="meal-name"]').first().textContent()

    await mealPlanPage.swapMeal(0)

    // Wait for GPT response (longer timeout for AI)
    await page.waitForResponse(
      response => response.url().includes('/api/') && response.status() === 200,
      { timeout: 60000 }
    )

    const newMealName = await page.locator('[data-testid="meal-name"]').first().textContent()
    expect(newMealName).not.toBe(initialMealName)
  })
})

test.describe('Dietary Preferences', () => {
  test('should respect vegetarian preference', async ({ page }) => {
    // Set profile to vegetarian first
    await page.goto('/settings')
    await page.getByRole('combobox', { name: /dietary/i }).selectOption('vegetarian')
    await page.getByRole('button', { name: /save/i }).click()

    const generatorPage = new MealPlanGeneratorPage(page)
    await generatorPage.goto()
    await generatorPage.generate()
    await generatorPage.waitForGeneration()

    // All meals should be vegetarian (no meat-based meals)
    // Implementation depends on how meals are tagged in UI
  })

  test('muscle gain goal should favor high-protein meals', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('combobox', { name: /goal/i }).selectOption('muscle_gain')
    await page.getByRole('button', { name: /save/i }).click()

    const generatorPage = new MealPlanGeneratorPage(page)
    await generatorPage.goto()

    // Muscle gain should suggest 5 meals
    await expect(page.getByRole('radio', { name: /5 meals/i })).toBeChecked()
  })
})
```

---

## Performance Comparison

| Metric | Current (GPT) | New (Database) |
|--------|---------------|----------------|
| Generation Time | ~100 sec | < 1 sec |
| API Costs | ~$0.01/plan | $0 |
| Reliability | API dependent | Always works |
| Personalization | High | Medium-High |
| Variety | Unlimited | 70 meals |

---

## File Structure

```
features/meal-plans/
├── actions.ts                    # Updated: database query instead of GPT
├── utils/
│   └── meal-matcher.ts           # NEW: matching algorithm
├── schemas/
│   └── meal-plan-settings.ts     # NEW: Zod validation schemas
└── components/
    └── meal-plan-settings-form.tsx  # NEW: Settings form component

scripts/
└── seed-meals.ts                 # NEW: One-time GPT seed generation

supabase/migrations/
└── YYYYMMDD_add_seed_meal_fields.sql  # NEW: Schema changes

tests/
├── unit/
│   └── meal-matcher.test.ts      # Unit tests
└── e2e/
    ├── page-objects/
    │   ├── MealPlanGeneratorPage.ts
    │   └── MealPlanPage.ts
    └── meal-plan-generation.spec.ts
```

---

## Implementation Steps

### Phase 1: Database Setup
- [ ] Create migration for `is_seed_meal`, `dietary_tags`, and `locale` columns
- [ ] Add database indexes for performance (including composite index for seed + locale)
- [ ] Update TypeScript types with `pnpm supabase:types`

### Phase 2: Zod Schemas
- [ ] Create `features/meal-plans/schemas/meal-plan-settings.ts`
- [ ] Add validation for all settings inputs
- [ ] Add locale validation schema

### Phase 3: Seed Data Generation
- [ ] Create `scripts/seed-meals.ts` using GPT API with locale support
- [ ] Generate 70 English meals (15 breakfast, 20 lunch, 20 dinner, 15 snacks)
- [ ] Generate 70 Japanese meals (native content: 日本語の名前、説明、手順)
- [ ] Ensure coverage across all cuisines and dietary tags per locale
- [ ] Review and validate nutrition data (consistent across locales)
- [ ] Insert 140 total seed meals to production database

### Phase 4: Matching Algorithm
- [ ] Create `features/meal-plans/utils/meal-matcher.ts`
- [ ] Implement locale filtering (filter meals by user's locale setting)
- [ ] Implement filtering by dietary needs
- [ ] Implement scoring algorithm
- [ ] Implement variety handling
- [ ] Write unit tests

### Phase 5: Update Generation Flow
- [ ] Update `generateMealPlan` Server Action
- [ ] Replace GPT API call with database query
- [ ] Pass user's locale to matching algorithm
- [ ] Update `saveMealPlan` for new structure
- [ ] Add meal plan settings form component

### Phase 6: UI Updates
- [ ] Add cuisine type selector
- [ ] Add meals_per_day radio buttons
- [ ] Add variety_level radio buttons
- [ ] Add prep_time_max filter
- [ ] Update meal plan view to show snacks
- [ ] Add data-testid attributes for E2E tests

### Phase 7: Testing
- [ ] Write unit tests for meal-matcher (including locale filtering)
- [ ] Write unit tests for Zod schemas
- [ ] Write E2E tests with Page Object Model
- [ ] Test all dietary preference combinations
- [ ] Test allergy filtering
- [ ] Test locale switching (en ↔ ja) returns correct language meals
- [ ] Performance testing (target: < 1 sec)

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Generation** | GPT API (~100 sec) | Database query (< 1 sec) |
| **GPT Usage** | Core generation | Meal swap, recipe analysis |
| **Meal Count** | Unlimited | 140 pre-built meals (70 EN + 70 JA) |
| **Languages** | English only | English + Japanese (日本語) |
| **Snacks** | Not included | 15 snack options per locale |
| **Personalization** | AI-generated | Algorithm-matched |
| **Cost** | ~$0.01/plan | $0 |
| **Reliability** | API dependent | Always works |

---

## Example Meals by Locale

### English (locale: `en`)

| Meal Type | Example |
|-----------|---------|
| Breakfast | Greek Yogurt Parfait with Granola and Berries |
| Lunch | Grilled Chicken Caesar Salad |
| Dinner | Pan-Seared Salmon with Roasted Vegetables |
| Snack | Protein Energy Balls |

### Japanese (locale: `ja`)

| Meal Type | Example |
|-----------|---------|
| Breakfast | 和風オムレツと味噌汁セット |
| Lunch | 鶏照り焼き丼 |
| Dinner | サーモンの西京焼き定食 |
| Snack | 高たんぱくエナジーボール |
