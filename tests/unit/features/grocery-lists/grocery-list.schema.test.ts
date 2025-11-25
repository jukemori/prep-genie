import { describe, expect, it } from 'vitest'
import {
  editGroceryItemSchema,
  groceryItemSchema,
  groceryListSchema,
} from '@/features/grocery-lists/schemas/grocery-list.schema'

describe('Grocery List Schema Validation', () => {
  describe('groceryItemSchema', () => {
    it('validates valid grocery item', () => {
      const item = {
        name: 'Chicken breast',
        quantity: 500,
        unit: 'g',
        category: 'protein' as const,
        isPurchased: false,
        estimatedCost: 8.99,
      }

      const result = groceryItemSchema.safeParse(item)

      expect(result.success).toBe(true)
    })

    it('validates minimal grocery item without optional fields', () => {
      const item = {
        name: 'Chicken breast',
        quantity: 500,
        unit: 'g',
        category: 'protein' as const,
      }

      const result = groceryItemSchema.safeParse(item)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPurchased).toBe(false) // default
      }
    })

    it('rejects empty name', () => {
      const item = {
        name: '',
        quantity: 500,
        unit: 'g',
        category: 'protein' as const,
      }

      const result = groceryItemSchema.safeParse(item)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Item name is required')
      }
    })

    it('rejects negative quantity', () => {
      const item = {
        name: 'Chicken breast',
        quantity: -500,
        unit: 'g',
        category: 'protein' as const,
      }

      const result = groceryItemSchema.safeParse(item)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Quantity must be positive')
      }
    })

    it('rejects zero quantity', () => {
      const item = {
        name: 'Chicken breast',
        quantity: 0,
        unit: 'g',
        category: 'protein' as const,
      }

      const result = groceryItemSchema.safeParse(item)

      expect(result.success).toBe(false)
    })

    it('rejects empty unit', () => {
      const item = {
        name: 'Chicken breast',
        quantity: 500,
        unit: '',
        category: 'protein' as const,
      }

      const result = groceryItemSchema.safeParse(item)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Unit is required')
      }
    })

    it('accepts all valid categories', () => {
      const categories = [
        'produce',
        'protein',
        'dairy',
        'grains',
        'pantry',
        'spices',
        'frozen',
        'beverages',
        'snacks',
        'other',
      ] as const

      for (const category of categories) {
        const item = {
          name: 'Test Item',
          quantity: 100,
          unit: 'g',
          category,
        }

        const result = groceryItemSchema.safeParse(item)
        expect(result.success).toBe(true)
      }
    })

    it('rejects invalid category', () => {
      const item = {
        name: 'Test Item',
        quantity: 100,
        unit: 'g',
        category: 'invalid_category',
      }

      const result = groceryItemSchema.safeParse(item)

      expect(result.success).toBe(false)
    })

    it('sets default isPurchased to false', () => {
      const item = {
        name: 'Chicken breast',
        quantity: 500,
        unit: 'g',
        category: 'protein' as const,
      }

      const result = groceryItemSchema.safeParse(item)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPurchased).toBe(false)
      }
    })

    it('accepts optional estimatedCost', () => {
      const item = {
        name: 'Chicken breast',
        quantity: 500,
        unit: 'g',
        category: 'protein' as const,
        estimatedCost: 8.99,
      }

      const result = groceryItemSchema.safeParse(item)

      expect(result.success).toBe(true)
    })

    it('rejects negative estimatedCost', () => {
      const item = {
        name: 'Chicken breast',
        quantity: 500,
        unit: 'g',
        category: 'protein' as const,
        estimatedCost: -8.99,
      }

      const result = groceryItemSchema.safeParse(item)

      expect(result.success).toBe(false)
    })

    it('rejects zero estimatedCost', () => {
      const item = {
        name: 'Chicken breast',
        quantity: 500,
        unit: 'g',
        category: 'protein' as const,
        estimatedCost: 0,
      }

      const result = groceryItemSchema.safeParse(item)

      expect(result.success).toBe(false)
    })
  })

  describe('groceryListSchema', () => {
    const validItem = {
      name: 'Chicken breast',
      quantity: 500,
      unit: 'g',
      category: 'protein' as const,
    }

    it('validates valid grocery list', () => {
      const list = {
        name: 'Weekly Shopping',
        mealPlanId: '123e4567-e89b-12d3-a456-426614174000',
        items: [validItem],
        estimatedCost: 50.0,
      }

      const result = groceryListSchema.safeParse(list)

      expect(result.success).toBe(true)
    })

    it('validates minimal grocery list', () => {
      const list = {
        name: 'Quick List',
        items: [validItem],
      }

      const result = groceryListSchema.safeParse(list)

      expect(result.success).toBe(true)
    })

    it('rejects empty name', () => {
      const list = {
        name: '',
        items: [validItem],
      }

      const result = groceryListSchema.safeParse(list)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('List name is required')
      }
    })

    it('rejects name over 100 characters', () => {
      const list = {
        name: 'a'.repeat(101),
        items: [validItem],
      }

      const result = groceryListSchema.safeParse(list)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Name too long')
      }
    })

    it('rejects empty items array', () => {
      const list = {
        name: 'Empty List',
        items: [],
      }

      const result = groceryListSchema.safeParse(list)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one item is required')
      }
    })

    it('accepts multiple items', () => {
      const list = {
        name: 'Shopping List',
        items: [
          validItem,
          {
            name: 'Rice',
            quantity: 1,
            unit: 'kg',
            category: 'grains' as const,
          },
          {
            name: 'Broccoli',
            quantity: 500,
            unit: 'g',
            category: 'produce' as const,
          },
        ],
      }

      const result = groceryListSchema.safeParse(list)

      expect(result.success).toBe(true)
    })

    it('accepts optional mealPlanId with valid UUID', () => {
      const list = {
        name: 'Weekly Shopping',
        mealPlanId: '123e4567-e89b-12d3-a456-426614174000',
        items: [validItem],
      }

      const result = groceryListSchema.safeParse(list)

      expect(result.success).toBe(true)
    })

    it('rejects invalid UUID for mealPlanId', () => {
      const list = {
        name: 'Weekly Shopping',
        mealPlanId: 'invalid-uuid',
        items: [validItem],
      }

      const result = groceryListSchema.safeParse(list)

      expect(result.success).toBe(false)
    })

    it('accepts optional estimatedCost', () => {
      const list = {
        name: 'Weekly Shopping',
        items: [validItem],
        estimatedCost: 75.5,
      }

      const result = groceryListSchema.safeParse(list)

      expect(result.success).toBe(true)
    })

    it('rejects negative estimatedCost', () => {
      const list = {
        name: 'Weekly Shopping',
        items: [validItem],
        estimatedCost: -50.0,
      }

      const result = groceryListSchema.safeParse(list)

      expect(result.success).toBe(false)
    })
  })

  describe('editGroceryItemSchema', () => {
    it('validates edit item with all fields including id', () => {
      const item = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Chicken breast',
        quantity: 500,
        unit: 'g',
        category: 'protein' as const,
        isPurchased: true,
        estimatedCost: 8.99,
      }

      const result = editGroceryItemSchema.safeParse(item)

      expect(result.success).toBe(true)
    })

    it('validates edit item without id', () => {
      const item = {
        name: 'Chicken breast',
        quantity: 500,
        unit: 'g',
        category: 'protein' as const,
      }

      const result = editGroceryItemSchema.safeParse(item)

      expect(result.success).toBe(true)
    })

    it('rejects invalid UUID for id', () => {
      const item = {
        id: 'invalid-uuid',
        name: 'Chicken breast',
        quantity: 500,
        unit: 'g',
        category: 'protein' as const,
      }

      const result = editGroceryItemSchema.safeParse(item)

      expect(result.success).toBe(false)
    })
  })
})
