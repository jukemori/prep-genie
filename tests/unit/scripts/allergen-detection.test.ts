import { describe, expect, it } from 'vitest'
import {
  detectAllergens,
  getAllergenFreeTags,
  isAllergenFree,
} from '../../../scripts/allergen-detection'

const createIngredient = (name: string) => ({
  name,
  quantity: 1,
  unit: 'cup',
  category: 'misc',
})

describe('Allergen Detection', () => {
  describe('detectAllergens', () => {
    it('should detect dairy allergens', () => {
      const ingredients = [
        createIngredient('milk'),
        createIngredient('butter'),
        createIngredient('cheese'),
      ]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toContain('contains_dairy')
    })

    it('should detect gluten allergens', () => {
      const ingredients = [
        createIngredient('all-purpose flour'),
        createIngredient('bread crumbs'),
        createIngredient('pasta'),
      ]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toContain('contains_gluten')
    })

    it('should detect nut allergens', () => {
      const ingredients = [
        createIngredient('almond butter'),
        createIngredient('cashew cream'),
        createIngredient('walnut pieces'),
      ]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toContain('contains_nuts')
    })

    it('should detect egg allergens', () => {
      const ingredients = [createIngredient('eggs'), createIngredient('mayonnaise')]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toContain('contains_eggs')
    })

    it('should detect soy allergens', () => {
      const ingredients = [
        createIngredient('tofu'),
        createIngredient('soy sauce'),
        createIngredient('edamame'),
      ]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toContain('contains_soy')
    })

    it('should detect fish allergens', () => {
      const ingredients = [
        createIngredient('salmon fillet'),
        createIngredient('tuna steak'),
        createIngredient('fish sauce'),
      ]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toContain('contains_fish')
    })

    it('should detect shellfish allergens', () => {
      const ingredients = [
        createIngredient('shrimp'),
        createIngredient('crab meat'),
        createIngredient('lobster tail'),
      ]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toContain('contains_shellfish')
    })

    it('should detect sesame allergens', () => {
      const ingredients = [
        createIngredient('sesame oil'),
        createIngredient('tahini'),
        createIngredient('sesame seeds'),
      ]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toContain('contains_sesame')
    })

    it('should detect multiple allergens in one meal', () => {
      const ingredients = [
        createIngredient('milk'),
        createIngredient('flour'),
        createIngredient('eggs'),
        createIngredient('butter'),
      ]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toContain('contains_dairy')
      expect(allergens).toContain('contains_gluten')
      expect(allergens).toContain('contains_eggs')
    })

    it('should return empty array for allergen-free ingredients', () => {
      const ingredients = [
        createIngredient('rice'),
        createIngredient('chicken'),
        createIngredient('broccoli'),
        createIngredient('olive oil'),
      ]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toHaveLength(0)
    })

    it('should handle Japanese ingredient names', () => {
      const ingredients = [
        createIngredient('牛乳'), // milk
        createIngredient('豆腐'), // tofu
        createIngredient('ごま'), // sesame
      ]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toContain('contains_dairy')
      expect(allergens).toContain('contains_soy')
      expect(allergens).toContain('contains_sesame')
    })

    it('should handle case-insensitive matching', () => {
      const ingredients = [
        createIngredient('MILK'),
        createIngredient('Cheese'),
        createIngredient('BUTTER'),
      ]

      const allergens = detectAllergens(ingredients)

      expect(allergens).toContain('contains_dairy')
    })

    it('should not duplicate allergen tags', () => {
      const ingredients = [
        createIngredient('milk'),
        createIngredient('cheese'),
        createIngredient('cream'),
        createIngredient('butter'),
      ]

      const allergens = detectAllergens(ingredients)

      // Should only have one contains_dairy, not multiple
      const dairyCount = allergens.filter((a) => a === 'contains_dairy').length
      expect(dairyCount).toBe(1)
    })
  })

  describe('isAllergenFree', () => {
    it('should return true for allergen-free ingredients', () => {
      const ingredients = [
        createIngredient('rice'),
        createIngredient('chicken'),
        createIngredient('olive oil'),
      ]

      expect(isAllergenFree(ingredients, 'dairy')).toBe(true)
      expect(isAllergenFree(ingredients, 'gluten')).toBe(true)
      expect(isAllergenFree(ingredients, 'nuts')).toBe(true)
    })

    it('should return false when allergen is present', () => {
      const ingredients = [
        createIngredient('rice'),
        createIngredient('cheese'),
        createIngredient('chicken'),
      ]

      expect(isAllergenFree(ingredients, 'dairy')).toBe(false)
    })

    it('should check specific allergens only', () => {
      const ingredients = [createIngredient('cheese'), createIngredient('bread')]

      expect(isAllergenFree(ingredients, 'nuts')).toBe(true)
      expect(isAllergenFree(ingredients, 'shellfish')).toBe(true)
    })
  })

  describe('getAllergenFreeTags', () => {
    it('should return all free tags for allergen-free meal', () => {
      const ingredients = [
        createIngredient('rice'),
        createIngredient('chicken'),
        createIngredient('olive oil'),
      ]

      const freeTags = getAllergenFreeTags(ingredients)

      expect(freeTags).toContain('dairy_free')
      expect(freeTags).toContain('gluten_free')
      expect(freeTags).toContain('nuts_free')
      expect(freeTags).toContain('eggs_free')
      expect(freeTags).toContain('soy_free')
      expect(freeTags).toContain('fish_free')
      expect(freeTags).toContain('shellfish_free')
      expect(freeTags).toContain('sesame_free')
    })

    it('should exclude tags for present allergens', () => {
      const ingredients = [
        createIngredient('rice'),
        createIngredient('milk'),
        createIngredient('flour'),
      ]

      const freeTags = getAllergenFreeTags(ingredients)

      expect(freeTags).not.toContain('dairy_free')
      expect(freeTags).not.toContain('gluten_free')
      expect(freeTags).toContain('nuts_free')
      expect(freeTags).toContain('eggs_free')
    })

    it('should handle meal with multiple allergens', () => {
      const ingredients = [
        createIngredient('eggs'),
        createIngredient('milk'),
        createIngredient('flour'),
        createIngredient('peanut butter'),
        createIngredient('soy sauce'),
      ]

      const freeTags = getAllergenFreeTags(ingredients)

      expect(freeTags).not.toContain('dairy_free')
      expect(freeTags).not.toContain('gluten_free')
      expect(freeTags).not.toContain('eggs_free')
      expect(freeTags).not.toContain('nuts_free')
      expect(freeTags).not.toContain('soy_free')
      // Should still be free of these
      expect(freeTags).toContain('fish_free')
      expect(freeTags).toContain('shellfish_free')
      expect(freeTags).toContain('sesame_free')
    })
  })
})
