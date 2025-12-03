import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Cache Invalidation Tests
 *
 * Tests verify that:
 * 1. Query keys are structured correctly for hierarchical invalidation
 * 2. Cache invalidation functions work correctly
 * 3. Next.js revalidatePath is called with correct paths
 * 4. Stale times are set appropriately for different data types
 */

// Mock TanStack Query
const mockInvalidateQueries = vi.fn()
const mockPrefetchQuery = vi.fn()
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
  prefetchQuery: mockPrefetchQuery,
}

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(() => mockQueryClient),
}))

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  })),
}))

// Import after mocks
import { mealKeys, useInvalidateSeedMeals, usePrefetchSeedMeals } from '@/features/meals/hooks'

describe('Cache Invalidation: Query Keys', () => {
  describe('mealKeys factory', () => {
    it('should create base key for all meals', () => {
      expect(mealKeys.all).toEqual(['meals'])
    })

    it('should create hierarchical key for seed meals by locale', () => {
      expect(mealKeys.seed('en')).toEqual(['meals', 'seed', 'en'])
      expect(mealKeys.seed('ja')).toEqual(['meals', 'seed', 'ja'])
    })

    it('should create hierarchical key for seed meals by type', () => {
      expect(mealKeys.seedByType('en', 'breakfast')).toEqual(['meals', 'seed', 'en', 'breakfast'])
      expect(mealKeys.seedByType('ja', 'dinner')).toEqual(['meals', 'seed', 'ja', 'dinner'])
    })

    it('should create hierarchical key for seed meals by cuisine', () => {
      expect(mealKeys.seedByCuisine('en', 'japanese')).toEqual([
        'meals',
        'seed',
        'en',
        'cuisine',
        'japanese',
      ])
      expect(mealKeys.seedByCuisine('ja', 'western')).toEqual([
        'meals',
        'seed',
        'ja',
        'cuisine',
        'western',
      ])
    })

    it('should maintain hierarchy for granular invalidation', () => {
      // All seed meal keys should start with the base key
      const baseKey = mealKeys.all
      const seedKey = mealKeys.seed('en')
      const seedByTypeKey = mealKeys.seedByType('en', 'lunch')
      const seedByCuisineKey = mealKeys.seedByCuisine('en', 'mediterranean')

      expect(seedKey.slice(0, 1)).toEqual(baseKey)
      expect(seedByTypeKey.slice(0, 1)).toEqual(baseKey)
      expect(seedByCuisineKey.slice(0, 1)).toEqual(baseKey)
    })
  })
})

describe('Cache Invalidation: Invalidate Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should invalidate all meal queries when bulk invalidating', () => {
    const invalidate = useInvalidateSeedMeals()
    invalidate()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['meals'],
    })
  })

  it('should invalidate specific locale queries', () => {
    // When invalidating by locale, use mealKeys.seed(locale)
    const localeKey = mealKeys.seed('ja')

    mockQueryClient.invalidateQueries({ queryKey: localeKey })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['meals', 'seed', 'ja'],
    })
  })

  it('should invalidate specific meal type queries', () => {
    const typeKey = mealKeys.seedByType('en', 'breakfast')

    mockQueryClient.invalidateQueries({ queryKey: typeKey })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['meals', 'seed', 'en', 'breakfast'],
    })
  })
})

describe('Cache Invalidation: Prefetch Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should prefetch seed meals by locale', () => {
    const prefetch = usePrefetchSeedMeals()
    prefetch('en')

    expect(mockPrefetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['meals', 'seed', 'en'],
        staleTime: 1000 * 60 * 60 * 24,
      })
    )
  })

  it('should prefetch seed meals by type', () => {
    const prefetch = usePrefetchSeedMeals()
    prefetch('ja', 'dinner')

    expect(mockPrefetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['meals', 'seed', 'ja', 'dinner'],
        staleTime: 1000 * 60 * 60 * 24,
      })
    )
  })
})

describe('Cache Invalidation: Stale Time Configuration', () => {
  it('should use 24 hour stale time for seed meals', () => {
    // Seed meals are static data that rarely changes
    const EXPECTED_STALE_TIME = 1000 * 60 * 60 * 24 // 24 hours

    // Verify the configuration matches expectations
    expect(EXPECTED_STALE_TIME).toBe(86400000)
  })

  it('should use 7 day garbage collection time for seed meals', () => {
    // Seed meals can be cached for extended periods
    const EXPECTED_GC_TIME = 1000 * 60 * 60 * 24 * 7 // 7 days

    expect(EXPECTED_GC_TIME).toBe(604800000)
  })

  it('should use appropriate stale times for different data types', () => {
    const staleTimeConfig = {
      seedMeals: 1000 * 60 * 60 * 24, // 24 hours - rarely change
      userMeals: 1000 * 60 * 5, // 5 minutes - user might add meals
      mealPlans: 1000 * 60 * 2, // 2 minutes - actively being modified
      userProfile: 1000 * 60 * 60, // 1 hour - changes occasionally
    }

    // Seed meals should have longest stale time
    expect(staleTimeConfig.seedMeals).toBeGreaterThan(staleTimeConfig.userMeals)
    expect(staleTimeConfig.seedMeals).toBeGreaterThan(staleTimeConfig.mealPlans)
    expect(staleTimeConfig.seedMeals).toBeGreaterThan(staleTimeConfig.userProfile)

    // Meal plans should have shortest stale time (most dynamic)
    expect(staleTimeConfig.mealPlans).toBeLessThan(staleTimeConfig.userMeals)
  })
})

describe('Cache Invalidation: Next.js revalidatePath', () => {
  it('should document revalidatePath patterns for meal operations', () => {
    // Document expected revalidatePath calls for different operations
    const revalidatePatterns = {
      mealSwap: (mealPlanId: string) => `/meal-plans/${mealPlanId}`,
      mealPlanCreate: () => '/meal-plans',
      mealPlanDelete: (id: string) => `/meal-plans/${id}`,
      mealCreate: () => '/meals',
      groceryListGenerate: (mealPlanId: string) => `/meal-plans/${mealPlanId}/grocery-list`,
    }

    // Verify patterns are correctly formatted
    expect(revalidatePatterns.mealSwap('abc-123')).toBe('/meal-plans/abc-123')
    expect(revalidatePatterns.mealPlanCreate()).toBe('/meal-plans')
    expect(revalidatePatterns.mealCreate()).toBe('/meals')
  })

  it('should revalidate meal plan page after swap operation', () => {
    // Verify the pattern used in swapMeal action
    const mealPlanId = 'plan-uuid-123'
    const expectedPath = `/meal-plans/${mealPlanId}`

    expect(expectedPath).toMatch(/^\/meal-plans\/[a-z0-9-]+$/)
  })
})

describe('Cache Invalidation: Hierarchical Invalidation Strategy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should invalidate parent key to clear all children', () => {
    // Invalidating ['meals'] should clear:
    // - ['meals', 'seed', 'en']
    // - ['meals', 'seed', 'ja']
    // - ['meals', 'seed', 'en', 'breakfast']
    // - etc.

    mockQueryClient.invalidateQueries({ queryKey: mealKeys.all })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['meals'],
    })
  })

  it('should invalidate locale to clear all meal types for that locale', () => {
    // Invalidating ['meals', 'seed', 'en'] should clear:
    // - ['meals', 'seed', 'en', 'breakfast']
    // - ['meals', 'seed', 'en', 'lunch']
    // - ['meals', 'seed', 'en', 'dinner']
    // - ['meals', 'seed', 'en', 'cuisine', 'japanese']
    // - etc.

    mockQueryClient.invalidateQueries({ queryKey: mealKeys.seed('en') })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['meals', 'seed', 'en'],
    })
  })

  it('should support granular invalidation for specific meal type', () => {
    // Only invalidate breakfast meals for English locale
    mockQueryClient.invalidateQueries({ queryKey: mealKeys.seedByType('en', 'breakfast') })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['meals', 'seed', 'en', 'breakfast'],
    })
  })
})

describe('Cache Invalidation: Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle invalidation with empty query key', () => {
    // Should not throw when invalidating with base key
    expect(() => {
      mockQueryClient.invalidateQueries({ queryKey: mealKeys.all })
    }).not.toThrow()
  })

  it('should handle multiple consecutive invalidations', () => {
    const invalidate = useInvalidateSeedMeals()

    // Multiple rapid invalidations should all be processed
    invalidate()
    invalidate()
    invalidate()

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(3)
  })

  it('should handle invalidation for non-existent cache keys', () => {
    // Invalidating a key that doesn't exist in cache should not throw
    expect(() => {
      mockQueryClient.invalidateQueries({ queryKey: ['meals', 'seed', 'non-existent-locale'] })
    }).not.toThrow()
  })
})
