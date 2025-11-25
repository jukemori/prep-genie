import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deleteAccount,
  resetNutritionTargets,
  updateLocalePreferences,
  updateNutritionTargets,
  updateProfile,
} from '@/features/settings/actions'

// Mock next/cache
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}))

// Mock next/navigation
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}))

// Mock nutrition utilities
vi.mock('@/features/nutrition/utils/tdee', () => ({
  calculateTDEE: vi.fn(() => 2000),
}))

vi.mock('@/features/nutrition/utils/macros', () => ({
  calculateMacros: vi.fn(() => ({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65,
  })),
}))

// Mock Supabase client
const mockGetUser = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockDeleteUser = vi.fn()
const mockSignOut = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
      admin: {
        deleteUser: mockDeleteUser,
      },
      signOut: mockSignOut,
    },
    from: mockFrom,
  })),
}))

describe('Settings Actions Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default user mock
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
  })

  describe('updateProfile', () => {
    it('updates user profile fields', async () => {
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      })

      const profileData = {
        age: 30,
        weight: 70,
        height: 175,
        gender: 'male' as const,
        activity_level: 'moderate' as const,
        goal: 'maintain' as const,
        dietary_preference: 'omnivore' as const,
        cooking_skill_level: 'intermediate' as const,
        time_available: 60,
        budget_level: 'medium' as const,
        allergies: ['nuts'],
      }

      const result = await updateProfile(profileData)

      expect(result).toEqual({ success: true })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/settings')
    })

    it('recalculates TDEE when profile data changes', async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      })

      mockFrom.mockReturnValue({
        update: updateSpy,
      })

      const profileData = {
        age: 30,
        weight: 80,
        height: 180,
        gender: 'male' as const,
        activity_level: 'active' as const,
        goal: 'muscle_gain' as const,
        dietary_preference: 'omnivore' as const,
        cooking_skill_level: 'advanced' as const,
        time_available: 90,
        budget_level: 'high' as const,
        allergies: [],
      }

      await updateProfile(profileData)

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          tdee: 2000,
          daily_calorie_target: 2000,
          target_protein: 150,
          target_carbs: 200,
          target_fats: 65,
        })
      )
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const profileData = {
        age: 30,
        weight: 70,
        height: 175,
        gender: 'male' as const,
        activity_level: 'moderate' as const,
        goal: 'maintain' as const,
        dietary_preference: 'omnivore' as const,
        cooking_skill_level: 'intermediate' as const,
        time_available: 60,
        budget_level: 'medium' as const,
        allergies: [],
      }

      const result = await updateProfile(profileData)

      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('handles database errors', async () => {
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Update failed' },
          }),
        }),
      })

      const profileData = {
        age: 30,
        weight: 70,
        height: 175,
        gender: 'male' as const,
        activity_level: 'moderate' as const,
        goal: 'maintain' as const,
        dietary_preference: 'omnivore' as const,
        cooking_skill_level: 'intermediate' as const,
        time_available: 60,
        budget_level: 'medium' as const,
        allergies: [],
      }

      const result = await updateProfile(profileData)

      expect(result).toEqual({ error: 'Update failed' })
    })
  })

  describe('updateLocalePreferences', () => {
    it('updates locale, unit_system, and currency', async () => {
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      })

      const localeData = {
        locale: 'ja' as const,
        unit_system: 'metric' as const,
        currency: 'JPY' as const,
      }

      const result = await updateLocalePreferences(localeData)

      expect(result).toEqual({ success: true })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/settings')
    })

    it('updates without locale if not provided', async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      })

      mockFrom.mockReturnValue({
        update: updateSpy,
      })

      const localeData = {
        unit_system: 'imperial' as const,
        currency: 'USD' as const,
      }

      await updateLocalePreferences(localeData)

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          unit_system: 'imperial',
          currency: 'USD',
        })
      )
      expect(updateSpy).toHaveBeenCalledWith(
        expect.not.objectContaining({
          locale: expect.anything(),
        })
      )
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const localeData = {
        unit_system: 'metric' as const,
        currency: 'USD' as const,
      }

      const result = await updateLocalePreferences(localeData)

      expect(result).toEqual({ error: 'Unauthorized' })
    })
  })

  describe('updateNutritionTargets', () => {
    it('allows manual override of nutrition targets', async () => {
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      })

      const targetsData = {
        daily_calorie_target: 2200,
        target_protein: 180,
        target_carbs: 220,
        target_fats: 70,
      }

      const result = await updateNutritionTargets(targetsData)

      expect(result).toEqual({ success: true })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/settings')
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const targetsData = {
        daily_calorie_target: 2200,
        target_protein: 180,
        target_carbs: 220,
        target_fats: 70,
      }

      const result = await updateNutritionTargets(targetsData)

      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('handles database errors', async () => {
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Update failed' },
          }),
        }),
      })

      const targetsData = {
        daily_calorie_target: 2200,
        target_protein: 180,
        target_carbs: 220,
        target_fats: 70,
      }

      const result = await updateNutritionTargets(targetsData)

      expect(result).toEqual({ error: 'Update failed' })
    })
  })

  describe('resetNutritionTargets', () => {
    it('recalculates targets from current profile', async () => {
      // Mock profile fetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                weight: 70,
                height: 175,
                age: 30,
                gender: 'male',
                activity_level: 'moderate',
                goal: 'maintain',
              },
              error: null,
            }),
          }),
        }),
      })

      // Mock update
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      })

      const result = await resetNutritionTargets()

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        daily_calorie_target: 2000,
        target_protein: 150,
        target_carbs: 200,
        target_fats: 65,
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/settings')
    })

    it('returns error when profile not found', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      const result = await resetNutritionTargets()

      expect(result).toEqual({ error: 'Profile not found' })
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await resetNutritionTargets()

      expect(result).toEqual({ error: 'Unauthorized' })
    })
  })

  describe('deleteAccount', () => {
    it('deletes user profile and auth user successfully', async () => {
      // Mock profile deletion
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      })

      // Mock auth deletion
      mockDeleteUser.mockResolvedValue({
        data: {},
        error: null,
      })

      // Mock sign out
      mockSignOut.mockResolvedValue({
        error: null,
      })

      await deleteAccount()

      expect(mockFrom).toHaveBeenCalledWith('user_profiles')
      expect(mockDeleteUser).toHaveBeenCalledWith('user-123')
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('returns error when profile deletion fails', async () => {
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Profile deletion failed' },
          }),
        }),
      })

      const result = await deleteAccount()

      expect(result).toEqual({ error: 'Profile deletion failed' })
      expect(mockDeleteUser).not.toHaveBeenCalled()
    })

    it('returns error when auth deletion fails', async () => {
      // Mock profile deletion success
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      })

      // Mock auth deletion failure
      mockDeleteUser.mockResolvedValue({
        data: null,
        error: { message: 'Auth deletion failed' },
      })

      const result = await deleteAccount()

      expect(result).toEqual({ error: 'Auth deletion failed' })
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await deleteAccount()

      expect(result).toEqual({ error: 'Unauthorized' })
      expect(mockFrom).not.toHaveBeenCalled()
    })
  })
})
