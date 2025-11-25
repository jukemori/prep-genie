import { beforeEach, describe, expect, it, vi } from 'vitest'
import { analyzeRecipe, saveAnalyzedRecipe } from '@/features/recipes/actions'

// Mock next/cache
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}))

// Mock OpenAI
const mockCreate = vi.fn()
vi.mock('@/lib/ai/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: (...args: unknown[]) => mockCreate(...args),
      },
    },
  },
  MODELS: {
    GPT5_NANO: 'gpt-5-nano',
  },
}))

// Mock Supabase client
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

const mockAnalyzedRecipe = {
  name: 'Healthy Breakfast Bowl',
  description: 'A nutritious breakfast with oats and berries',
  ingredients: [
    { name: 'Oats', quantity: 1, unit: 'cup', category: 'grains' },
    { name: 'Berries', quantity: 0.5, unit: 'cup', category: 'produce' },
  ],
  instructions: ['Cook oats', 'Add berries', 'Serve'],
  servings: 2,
  prep_time: 5,
  cook_time: 10,
  nutrition: {
    calories: 300,
    protein: 10,
    carbs: 50,
    fats: 5,
  },
  improvements: {
    budget: {
      name: 'Budget-Friendly Breakfast Bowl',
      savings: '30%',
    },
    high_protein: {
      name: 'High-Protein Breakfast Bowl',
      protein_boost: '15g',
    },
    lower_calorie: {
      name: 'Lower-Calorie Breakfast Bowl',
      calorie_reduction: '50 calories',
    },
  },
}

describe('Recipe Analyzer Actions Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default user mock
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
  })

  describe('analyzeRecipe', () => {
    it('analyzes recipe from text input', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockAnalyzedRecipe),
            },
          },
        ],
      })

      const result = await analyzeRecipe({
        input: 'Oatmeal with berries recipe...',
        inputType: 'text',
        locale: 'en',
      })

      expect(result.data).toEqual(mockAnalyzedRecipe)
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-5-nano',
          response_format: { type: 'json_object' },
        })
      )
    })

    it('analyzes recipe from URL input', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockAnalyzedRecipe),
            },
          },
        ],
      })

      const result = await analyzeRecipe({
        input: 'https://example.com/recipe',
        inputType: 'url',
        locale: 'en',
      })

      expect(result.data).toEqual(mockAnalyzedRecipe)
    })

    it('handles Japanese locale', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                ...mockAnalyzedRecipe,
                name: '健康的な朝食ボウル',
              }),
            },
          },
        ],
      })

      const result = await analyzeRecipe({
        input: 'オートミールとベリーのレシピ...',
        inputType: 'text',
        locale: 'ja',
      })

      expect(result.data).toBeDefined()
      expect(result.data?.name).toBe('健康的な朝食ボウル')
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await analyzeRecipe({
        input: 'Recipe text',
        inputType: 'text',
        locale: 'en',
      })

      expect(result).toEqual({ error: 'Unauthorized' })
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('returns error when AI response is empty', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      })

      const result = await analyzeRecipe({
        input: 'Recipe text',
        inputType: 'text',
        locale: 'en',
      })

      expect(result).toEqual({ error: 'Failed to analyze recipe' })
    })

    it('handles invalid JSON response from AI', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'invalid json',
            },
          },
        ],
      })

      const result = await analyzeRecipe({
        input: 'Recipe text',
        inputType: 'text',
        locale: 'en',
      })

      expect(result).toEqual({ error: 'Failed to analyze recipe' })
    })

    it('handles OpenAI API errors', async () => {
      mockCreate.mockRejectedValue(new Error('API rate limit exceeded'))

      const result = await analyzeRecipe({
        input: 'Recipe text',
        inputType: 'text',
        locale: 'en',
      })

      expect(result).toEqual({ error: 'Failed to analyze recipe' })
    })
  })

  describe('saveAnalyzedRecipe', () => {
    const recipeInput = {
      name: 'Healthy Breakfast Bowl',
      description: 'A nutritious breakfast',
      ingredients: [
        { name: 'Oats', quantity: 1, unit: 'cup', category: 'grains' },
      ],
      instructions: ['Cook oats', 'Serve'],
      servings: 2,
      prep_time: 5,
      cook_time: 10,
      nutrition: {
        calories: 300,
        protein: 10,
        carbs: 50,
        fats: 5,
      },
    }

    it('saves original recipe version', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'meal-123',
                user_id: 'user-123',
                ...recipeInput,
                tags: [],
                is_ai_generated: true,
              },
              error: null,
            }),
          }),
        }),
      })

      const result = await saveAnalyzedRecipe({
        recipe: recipeInput,
        version: 'original',
      })

      expect(result.data).toBeDefined()
      expect(result.data?.id).toBe('meal-123')
      expect(result.data?.tags).toEqual([])
      expect(mockRevalidatePath).toHaveBeenCalledWith('/meals')
    })

    it('saves budget version with tag', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'meal-123',
                user_id: 'user-123',
                ...recipeInput,
                tags: ['budget'],
                is_ai_generated: true,
              },
              error: null,
            }),
          }),
        }),
      })

      const result = await saveAnalyzedRecipe({
        recipe: recipeInput,
        version: 'budget',
      })

      expect(result.data?.tags).toEqual(['budget'])
    })

    it('saves high_protein version with tag', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'meal-123',
                user_id: 'user-123',
                ...recipeInput,
                tags: ['high_protein'],
                is_ai_generated: true,
              },
              error: null,
            }),
          }),
        }),
      })

      const result = await saveAnalyzedRecipe({
        recipe: recipeInput,
        version: 'high_protein',
      })

      expect(result.data?.tags).toEqual(['high_protein'])
    })

    it('saves lower_calorie version with tag', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'meal-123',
                user_id: 'user-123',
                ...recipeInput,
                tags: ['lower_calorie'],
                is_ai_generated: true,
              },
              error: null,
            }),
          }),
        }),
      })

      const result = await saveAnalyzedRecipe({
        recipe: recipeInput,
        version: 'lower_calorie',
      })

      expect(result.data?.tags).toEqual(['lower_calorie'])
    })

    it('defaults to original version when not specified', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'meal-123',
                user_id: 'user-123',
                ...recipeInput,
                tags: [],
                is_ai_generated: true,
              },
              error: null,
            }),
          }),
        }),
      })

      const result = await saveAnalyzedRecipe({
        recipe: recipeInput,
        // No version specified
      })

      expect(result.data?.tags).toEqual([])
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await saveAnalyzedRecipe({
        recipe: recipeInput,
      })

      expect(result).toEqual({ error: 'Unauthorized' })
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('handles database insert errors', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      })

      const result = await saveAnalyzedRecipe({
        recipe: recipeInput,
      })

      expect(result).toEqual({ error: 'Insert failed' })
    })

    it('handles unexpected errors during save', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected database error')
      })

      const result = await saveAnalyzedRecipe({
        recipe: recipeInput,
      })

      expect(result).toEqual({ error: 'Failed to save recipe' })
    })
  })
})
