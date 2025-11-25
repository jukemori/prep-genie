# Test Architecture Documentation

## Overview

This document outlines the testing strategy, architecture, and best practices for the PrepGenie application using Vitest 4.0.7.

---

## Testing Strategy

### Test Pyramid

We follow the testing pyramid approach:

```
       /\
      /  \     E2E (Future - Playwright)
     /____\
    /      \   Integration Tests
   /________\
  /          \ Unit Tests (Primary Focus)
 /____________\
```

**Distribution:**
- **70%** Unit Tests - Fast, isolated, focused
- **20%** Integration Tests - Server Actions, API routes, database interactions
- **10%** E2E Tests - Critical user flows (Future implementation)

---

## Test Organization

### Directory Structure

```
tests/
├── setup.ts                    # Global test setup
├── helpers/                    # Test utilities & helpers
│   ├── test-utils.tsx         # React Testing Library wrapper
│   ├── mock-data.ts           # Shared mock data
│   └── supabase-mock.ts       # Supabase client mocks
├── unit/                       # Unit tests
│   ├── lib/                   # Lib utilities tests
│   │   ├── utils.test.ts
│   │   └── i18n/
│   │       ├── units.test.ts
│   │       └── use-locale-format.test.ts
│   ├── features/              # Feature utilities tests
│   │   ├── nutrition/
│   │   │   ├── tdee.test.ts
│   │   │   └── macros.test.ts
│   │   ├── meals/
│   │   │   └── schemas.test.ts
│   │   └── meal-plans/
│   │       └── schemas.test.ts
│   ├── components/            # Component tests
│   │   ├── molecules/
│   │   │   ├── meal-card.test.tsx
│   │   │   ├── macro-display.test.tsx
│   │   │   └── language-switcher.test.tsx
│   │   └── organisms/
│   │       └── nutrition-dashboard.test.tsx
│   └── stores/                # Store tests
│       ├── ui-store.test.ts
│       └── meal-store.test.ts
├── integration/               # Integration tests
│   ├── features/
│   │   ├── meals/
│   │   │   └── actions.test.ts
│   │   ├── meal-plans/
│   │   │   └── actions.test.ts
│   │   └── auth/
│   │       └── actions.test.ts
│   └── api/
│       └── webhooks/
│           └── route.test.ts
└── mocks/                     # MSW handlers & mocks
    ├── handlers.ts            # MSW request handlers
    ├── supabase.ts            # Supabase mock responses
    └── openai.ts              # OpenAI mock responses
```

---

## Test Types & Patterns

### 1. Unit Tests - Utility Functions

**Purpose:** Test pure functions in isolation

**Example Pattern:**
```typescript
// tests/unit/features/nutrition/tdee.test.ts
import { describe, it, expect } from 'vitest'
import { calculateTDEE, calculateBMR } from '@/features/nutrition/utils/tdee'

describe('calculateBMR', () => {
  it('calculates BMR for male using Mifflin-St Jeor equation', () => {
    const input = {
      weight: 80, // kg
      height: 180, // cm
      age: 30,
      gender: 'male' as const
    }

    const bmr = calculateBMR(input)

    // BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
    // BMR = (10 × 80) + (6.25 × 180) - (5 × 30) + 5
    // BMR = 800 + 1125 - 150 + 5 = 1780
    expect(bmr).toBe(1780)
  })

  it('calculates BMR for female using Mifflin-St Jeor equation', () => {
    const input = {
      weight: 65,
      height: 165,
      age: 25,
      gender: 'female' as const
    }

    const bmr = calculateBMR(input)

    // BMR = (10 × 65) + (6.25 × 165) - (5 × 25) - 161
    // BMR = 650 + 1031.25 - 125 - 161 = 1395.25
    expect(bmr).toBeCloseTo(1395.25, 1)
  })
})

describe('calculateTDEE', () => {
  it('multiplies BMR by activity level multiplier', () => {
    const input = {
      weight: 80,
      height: 180,
      age: 30,
      gender: 'male' as const,
      activityLevel: 'moderate' as const
    }

    const tdee = calculateTDEE(input)
    const bmr = calculateBMR(input)

    // Moderate activity multiplier = 1.55
    expect(tdee).toBe(Math.round(bmr * 1.55))
  })
})
```

**Coverage:**
- ✅ Edge cases (zero, negative, extreme values)
- ✅ Different input combinations
- ✅ Expected mathematical formulas
- ✅ Type safety

---

### 2. Unit Tests - Zod Schema Validation

**Purpose:** Validate input schemas catch invalid data

**Example Pattern:**
```typescript
// tests/unit/features/meals/schemas.test.ts
import { describe, it, expect } from 'vitest'
import { mealSchema } from '@/features/meals/schemas/meal.schema'

describe('mealSchema', () => {
  it('validates correct meal data', () => {
    const validMeal = {
      name: 'Grilled Chicken Breast',
      description: 'High-protein meal',
      ingredients: [
        { name: 'Chicken breast', quantity: 200, unit: 'g' }
      ],
      instructions: ['Grill chicken', 'Season to taste'],
      prep_time: 10,
      cook_time: 20,
      servings: 1,
      calories_per_serving: 300,
      protein_per_serving: 50,
      carbs_per_serving: 0,
      fats_per_serving: 5
    }

    const result = mealSchema.safeParse(validMeal)

    expect(result.success).toBe(true)
  })

  it('rejects meal with missing required fields', () => {
    const invalidMeal = {
      name: 'Incomplete Meal'
      // missing ingredients, instructions, etc.
    }

    const result = mealSchema.safeParse(invalidMeal)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toHaveLength(7) // 7 required fields missing
    }
  })

  it('rejects negative macro values', () => {
    const invalidMeal = {
      name: 'Bad Macros',
      ingredients: [],
      instructions: [],
      calories_per_serving: -100, // negative
      protein_per_serving: 20,
      carbs_per_serving: 30,
      fats_per_serving: 10
    }

    const result = mealSchema.safeParse(invalidMeal)

    expect(result.success).toBe(false)
  })
})
```

**Coverage:**
- ✅ Valid data passes
- ✅ Missing required fields rejected
- ✅ Invalid types rejected
- ✅ Business rule violations (e.g., negative macros)

---

### 3. Unit Tests - React Components

**Purpose:** Test component rendering, user interactions, props

**Example Pattern:**
```typescript
// tests/unit/components/molecules/meal-card.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/tests/helpers/test-utils'
import userEvent from '@testing-library/user-event'
import { MealCard } from '@/components/molecules/meal-card'
import type { Meal } from '@/types'

describe('MealCard', () => {
  const mockMeal: Meal = {
    id: '123',
    name: 'Grilled Chicken',
    description: 'High-protein meal',
    calories_per_serving: 300,
    protein_per_serving: 50,
    carbs_per_serving: 10,
    fats_per_serving: 5,
    prep_time: 10,
    cook_time: 20,
    servings: 1,
    ingredients: [],
    instructions: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  it('renders meal information correctly', () => {
    render(<MealCard meal={mockMeal} onSave={vi.fn()} />)

    expect(screen.getByText('Grilled Chicken')).toBeInTheDocument()
    expect(screen.getByText('High-protein meal')).toBeInTheDocument()
    expect(screen.getByText('300 kcal')).toBeInTheDocument()
    expect(screen.getByText('50g protein')).toBeInTheDocument()
  })

  it('calculates and displays total time', () => {
    render(<MealCard meal={mockMeal} onSave={vi.fn()} />)

    // prep_time (10) + cook_time (20) = 30 min
    expect(screen.getByText('30 min')).toBeInTheDocument()
  })

  it('calls onSave when save button is clicked', async () => {
    const handleSave = vi.fn()
    const user = userEvent.setup()

    render(<MealCard meal={mockMeal} onSave={handleSave} />)

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(handleSave).toHaveBeenCalledWith(mockMeal.id)
    expect(handleSave).toHaveBeenCalledTimes(1)
  })

  it('handles missing prep/cook time gracefully', () => {
    const mealWithoutTimes = { ...mockMeal, prep_time: null, cook_time: null }

    render(<MealCard meal={mealWithoutTimes} onSave={vi.fn()} />)

    expect(screen.getByText('0 min')).toBeInTheDocument()
  })
})
```

**Coverage:**
- ✅ Renders with correct props
- ✅ User interactions (clicks, typing, etc.)
- ✅ Conditional rendering
- ✅ Edge cases (null, undefined, empty arrays)

---

### 4. Unit Tests - Zustand Stores

**Purpose:** Test state management logic

**Example Pattern:**
```typescript
// tests/unit/stores/ui-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '@/stores/ui-store'
import { renderHook, act } from '@testing-library/react'

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({ sidebarOpen: true })
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useUIStore())

    expect(result.current.sidebarOpen).toBe(true)
  })

  it('toggles sidebar state', () => {
    const { result } = renderHook(() => useUIStore())

    expect(result.current.sidebarOpen).toBe(true)

    act(() => {
      result.current.toggleSidebar()
    })

    expect(result.current.sidebarOpen).toBe(false)

    act(() => {
      result.current.toggleSidebar()
    })

    expect(result.current.sidebarOpen).toBe(true)
  })

  it('persists state (if using persist middleware)', () => {
    const { result: result1 } = renderHook(() => useUIStore())

    act(() => {
      result1.current.toggleSidebar()
    })

    // Simulate new hook instance (e.g., page reload)
    const { result: result2 } = renderHook(() => useUIStore())

    expect(result2.current.sidebarOpen).toBe(result1.current.sidebarOpen)
  })
})
```

**Coverage:**
- ✅ Initial state
- ✅ State updates
- ✅ Multiple actions in sequence
- ✅ Persistence (if applicable)

---

### 5. Integration Tests - Server Actions

**Purpose:** Test server-side functions with database mocks

**Example Pattern:**
```typescript
// tests/integration/features/meals/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMeal, updateMeal, deleteMeal } from '@/features/meals/actions'
import { mockSupabaseClient } from '@/tests/mocks/supabase'
import type { TablesInsert } from '@/types/database'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}))

describe('Meal Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createMeal', () => {
    it('creates a new meal successfully', async () => {
      const newMeal: TablesInsert<'meals'> = {
        name: 'Test Meal',
        description: 'Test description',
        ingredients: [{ name: 'Chicken', quantity: 200, unit: 'g' }],
        instructions: ['Cook it'],
        calories_per_serving: 300,
        protein_per_serving: 50,
        carbs_per_serving: 10,
        fats_per_serving: 5
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: '123', ...newMeal },
              error: null
            })
          })
        })
      })

      const result = await createMeal(newMeal)

      expect(result).toEqual({ id: '123', ...newMeal })
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('meals')
    })

    it('throws error when creation fails', async () => {
      const newMeal: TablesInsert<'meals'> = {
        name: 'Invalid Meal',
        ingredients: [],
        instructions: []
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      })

      await expect(createMeal(newMeal)).rejects.toThrow('Database error')
    })
  })
})
```

**Coverage:**
- ✅ Successful operations
- ✅ Error handling
- ✅ Database interactions
- ✅ Authorization checks (RLS policies)

---

## Test Configuration

### vitest.config.mts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: 'happy-dom',
    globals: true,

    // Setup
    setupFiles: ['./tests/setup.ts'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'lib/**/*.{ts,tsx}',
        'features/**/*.{ts,tsx}',
        'components/**/*.{tsx}',
        'stores/**/*.ts'
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        '.next/',
        'types/database.ts', // Auto-generated
        '**/*.d.ts',
        '**/index.ts', // Re-exports
        'app/**/*', // Pages/layouts (E2E test coverage)
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    },

    // Execution
    pool: 'forks',
    fileParallelism: true,
    testTimeout: 10000,
    hookTimeout: 10000,

    // Mocking
    clearMocks: true,
    restoreMocks: true,

    // Reporters
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-results/index.html'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

---

## Test Utilities & Helpers

### tests/setup.ts

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.OPENAI_API_KEY = 'test-openai-key'

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))
```

### tests/helpers/test-utils.tsx

```typescript
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

interface AllTheProvidersProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const testQueryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
```

### tests/helpers/mock-data.ts

```typescript
import type { Meal, UserProfile, MealPlan } from '@/types'

export const mockUserProfile: UserProfile = {
  id: 'user-123',
  age: 30,
  weight: 80,
  height: 180,
  gender: 'male',
  activity_level: 'moderate',
  goal: 'muscle_gain',
  dietary_preference: 'omnivore',
  allergies: [],
  budget_level: 'medium',
  cooking_skill_level: 'intermediate',
  time_available: 60,
  tdee: 2400,
  daily_calorie_target: 2600,
  target_protein: 180,
  target_carbs: 280,
  target_fats: 70,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const mockMeal: Meal = {
  id: 'meal-123',
  user_id: 'user-123',
  name: 'Grilled Chicken Breast',
  description: 'High-protein meal',
  ingredients: [
    { name: 'Chicken breast', quantity: 200, unit: 'g' },
    { name: 'Olive oil', quantity: 1, unit: 'tbsp' }
  ],
  instructions: [
    'Season chicken with salt and pepper',
    'Grill for 6-7 minutes per side',
    'Let rest for 5 minutes before serving'
  ],
  prep_time: 5,
  cook_time: 15,
  servings: 1,
  calories_per_serving: 300,
  protein_per_serving: 50,
  carbs_per_serving: 0,
  fats_per_serving: 10,
  tags: ['high-protein', 'low-carb'],
  cuisine_type: 'Western',
  meal_type: 'lunch',
  difficulty_level: 'easy',
  is_public: false,
  is_ai_generated: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const mockMealPlan: MealPlan = {
  id: 'plan-123',
  user_id: 'user-123',
  name: 'Weekly Meal Plan',
  start_date: '2025-11-25',
  end_date: '2025-12-01',
  type: 'weekly',
  total_calories: 2600,
  total_protein: 180,
  total_carbs: 280,
  total_fats: 70,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}
```

### tests/mocks/supabase.ts

```typescript
import { vi } from 'vitest'

export const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  storage: {
    from: vi.fn(),
  },
}

export const createMockSupabaseResponse = <T>(data: T, error = null) => ({
  data,
  error,
})
```

---

## Best Practices

### ✅ DO

1. **Follow AAA Pattern** (Arrange, Act, Assert)
```typescript
it('calculates TDEE correctly', () => {
  // Arrange
  const input = { weight: 80, height: 180, age: 30, gender: 'male', activityLevel: 'moderate' }

  // Act
  const result = calculateTDEE(input)

  // Assert
  expect(result).toBe(2759)
})
```

2. **Use descriptive test names**
```typescript
// ✅ Good
it('rejects meal with negative calorie values')

// ❌ Bad
it('test calories')
```

3. **Test one thing per test**
```typescript
// ✅ Good - Separate tests
it('renders meal name')
it('renders meal description')

// ❌ Bad - Testing multiple things
it('renders meal card correctly')
```

4. **Mock external dependencies**
```typescript
vi.mock('@/lib/supabase/server')
vi.mock('openai')
```

5. **Use type-safe mocks**
```typescript
const mockMeal: Meal = { ... } // ✅ Type-checked
const mockMeal: any = { ... }  // ❌ Avoid any
```

### ❌ DON'T

1. **Don't test implementation details**
```typescript
// ❌ Bad - Testing internal state
expect(component.state.isLoading).toBe(false)

// ✅ Good - Testing user-visible behavior
expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
```

2. **Don't use hardcoded IDs in integration tests**
```typescript
// ❌ Bad
const meal = await supabase.from('meals').select().eq('id', '123')

// ✅ Good
const meal = await supabase.from('meals').select().eq('user_id', auth.uid())
```

3. **Don't test third-party libraries**
```typescript
// ❌ Don't test if Zustand works
it('zustand updates state')

// ✅ Test your store logic
it('toggleSidebar changes sidebarOpen state')
```

4. **Don't write fragile selectors**
```typescript
// ❌ Bad - Fragile
screen.getByTestId('meal-card-123')

// ✅ Good - Semantic
screen.getByRole('article', { name: /grilled chicken/i })
```

---

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui

# Run specific test file
pnpm test tests/unit/features/nutrition/tdee.test.ts

# Run tests matching pattern
pnpm test --grep "TDEE"

# Type check before testing
pnpm type-check && pnpm test
```

---

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Lines | 80% | TBD |
| Functions | 80% | TBD |
| Branches | 75% | TBD |
| Statements | 80% | TBD |

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - run: pnpm type-check

      - run: pnpm lint

      - run: pnpm test:coverage

      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
```

---

## Next Steps

1. ✅ Create test architecture documentation
2. ⬜ Implement unit tests for nutrition utilities
3. ⬜ Implement unit tests for i18n utilities
4. ⬜ Implement unit tests for Zod schemas
5. ⬜ Implement unit tests for React components
6. ⬜ Implement unit tests for Zustand stores
7. ⬜ Implement integration tests for Server Actions
8. ⬜ Set up GitHub Actions CI workflow
9. ⬜ Add E2E tests with Playwright (Future)

---

**Last Updated:** 2025-11-25
**Version:** 1.0.0
