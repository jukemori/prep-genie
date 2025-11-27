import { describe, expect, it, vi } from 'vitest'
import { MealCard } from '@/components/molecules/meal-card'
import { render, screen } from '@/tests/helpers/test-utils'
import type { Meal } from '@/types'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'difficulty.easy': 'Easy',
      'difficulty.medium': 'Medium',
      'difficulty.hard': 'Hard',
      'nutrition.cal': 'cal',
      'nutrition.protein': 'Protein',
      'nutrition.carbs': 'Carbs',
      'nutrition.fats': 'Fats',
      'time.min': 'min',
      'units.servings': 'servings',
      'meals.view_recipe': 'View Recipe',
    }
    return translations[key] || key
  },
}))

// Mock Next.js Image and Link
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // biome-ignore lint/performance/noImgElement: Mock component for testing
    <img src={src} alt={alt} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('MealCard Component', () => {
  const mockMeal: Meal = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Grilled Chicken Salad',
    description: 'A healthy and delicious grilled chicken salad with mixed greens',
    ingredients: [
      { name: 'Chicken breast', quantity: 200, unit: 'g' },
      { name: 'Mixed greens', quantity: 100, unit: 'g' },
    ],
    instructions: ['Grill chicken', 'Toss with greens'],
    prep_time: 15,
    cook_time: 20,
    servings: 2,
    calories_per_serving: 350,
    protein_per_serving: 40,
    carbs_per_serving: 20,
    fats_per_serving: 12,
    tags: ['healthy', 'high-protein', 'low-carb', 'quick'],
    cuisine_type: 'Mediterranean',
    meal_type: 'lunch',
    difficulty_level: 'easy',
    is_public: false,
    is_ai_generated: false,
    rating: null,
    image_url: 'https://example.com/chicken-salad.jpg',
    meal_prep_friendly: false,
    storage_instructions: null,
    reheating_instructions: null,
    storage_duration_days: null,
    container_type: null,
    batch_cooking_multiplier: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  describe('Basic Rendering', () => {
    it('renders meal name correctly', () => {
      render(<MealCard meal={mockMeal} />)

      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
    })

    it('renders meal description correctly', () => {
      render(<MealCard meal={mockMeal} />)

      expect(
        screen.getByText('A healthy and delicious grilled chicken salad with mixed greens')
      ).toBeInTheDocument()
    })

    it('handles missing description gracefully', () => {
      const mealWithoutDescription = { ...mockMeal, description: null }

      render(<MealCard meal={mealWithoutDescription} />)

      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      // Description should not be rendered
    })

    it('renders difficulty level badge', () => {
      render(<MealCard meal={mockMeal} />)

      expect(screen.getByText('Easy')).toBeInTheDocument()
    })

    it('handles missing difficulty level', () => {
      const mealWithoutDifficulty = { ...mockMeal, difficulty_level: null }

      render(<MealCard meal={mealWithoutDifficulty} />)

      expect(screen.queryByText('Easy')).not.toBeInTheDocument()
    })
  })

  describe('Nutrition Display', () => {
    it('renders calories per serving', () => {
      render(<MealCard meal={mockMeal} />)

      expect(screen.getByText('350')).toBeInTheDocument()
      expect(screen.getByText('cal')).toBeInTheDocument()
    })

    it('renders protein per serving with unit', () => {
      render(<MealCard meal={mockMeal} />)

      expect(screen.getByText('40g')).toBeInTheDocument()
      expect(screen.getByText('Protein')).toBeInTheDocument()
    })

    it('renders carbs per serving with unit', () => {
      render(<MealCard meal={mockMeal} />)

      expect(screen.getByText('20g')).toBeInTheDocument()
      expect(screen.getByText('Carbs')).toBeInTheDocument()
    })

    it('renders fats per serving with unit', () => {
      render(<MealCard meal={mockMeal} />)

      expect(screen.getByText('12g')).toBeInTheDocument()
      expect(screen.getByText('Fats')).toBeInTheDocument()
    })

    it('handles zero calories', () => {
      const mealWithZeroCalories = { ...mockMeal, calories_per_serving: 0 }

      render(<MealCard meal={mealWithZeroCalories} />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles null nutrition values', () => {
      const mealWithNullNutrition = {
        ...mockMeal,
        calories_per_serving: null,
        protein_per_serving: null,
        carbs_per_serving: null,
        fats_per_serving: null,
      }

      render(<MealCard meal={mealWithNullNutrition} />)

      // Should default to 0
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThan(0)
    })
  })

  describe('Time Calculation', () => {
    it('calculates and displays total time (prep + cook)', () => {
      render(<MealCard meal={mockMeal} />)

      // 15 + 20 = 35 minutes - look for the specific format
      expect(screen.getByText('35 min')).toBeInTheDocument()
    })

    it('handles missing prep_time (defaults to 0)', () => {
      const mealWithoutPrepTime = { ...mockMeal, prep_time: null }

      render(<MealCard meal={mealWithoutPrepTime} />)

      // Only cook time: 20 minutes
      expect(screen.getByText('20 min')).toBeInTheDocument()
    })

    it('handles missing cook_time (defaults to 0)', () => {
      const mealWithoutCookTime = { ...mockMeal, cook_time: null }

      render(<MealCard meal={mealWithoutCookTime} />)

      // Only prep time: 15 minutes
      expect(screen.getByText('15 min')).toBeInTheDocument()
    })

    it('does not display time if both prep and cook are 0', () => {
      const mealWithNoTime = { ...mockMeal, prep_time: 0, cook_time: 0 }

      render(<MealCard meal={mealWithNoTime} />)

      expect(screen.queryByText(/min/)).not.toBeInTheDocument()
    })

    it('does not display time if both prep and cook are null', () => {
      const mealWithNullTime = { ...mockMeal, prep_time: null, cook_time: null }

      render(<MealCard meal={mealWithNullTime} />)

      expect(screen.queryByText(/min/)).not.toBeInTheDocument()
    })
  })

  describe('Servings Display', () => {
    it('displays servings count', () => {
      render(<MealCard meal={mockMeal} />)

      expect(screen.getByText('2 servings')).toBeInTheDocument()
    })

    it('handles missing servings', () => {
      const mealWithoutServings = { ...mockMeal, servings: null }

      render(<MealCard meal={mealWithoutServings} />)

      expect(screen.queryByText(/servings/)).not.toBeInTheDocument()
    })

    it('handles single serving', () => {
      const mealWithOneServing = { ...mockMeal, servings: 1 }

      render(<MealCard meal={mealWithOneServing} />)

      expect(screen.getByText('1 servings')).toBeInTheDocument()
    })
  })

  describe('Tags Display', () => {
    it('displays tags as badges', () => {
      render(<MealCard meal={mockMeal} />)

      expect(screen.getByText('healthy')).toBeInTheDocument()
      expect(screen.getByText('high-protein')).toBeInTheDocument()
      expect(screen.getByText('low-carb')).toBeInTheDocument()
    })

    it('displays only first 3 tags', () => {
      render(<MealCard meal={mockMeal} />)

      // Should show first 3 tags
      expect(screen.getByText('healthy')).toBeInTheDocument()
      expect(screen.getByText('high-protein')).toBeInTheDocument()
      expect(screen.getByText('low-carb')).toBeInTheDocument()

      // 4th tag should not be visible
      expect(screen.queryByText('quick')).not.toBeInTheDocument()
    })

    it('shows +N indicator when more than 3 tags', () => {
      render(<MealCard meal={mockMeal} />)

      // 4 tags total, showing 3, so should show +1
      expect(screen.getByText('+1')).toBeInTheDocument()
    })

    it('does not show +N indicator with 3 or fewer tags', () => {
      const mealWithThreeTags = {
        ...mockMeal,
        tags: ['healthy', 'high-protein', 'low-carb'],
      }

      render(<MealCard meal={mealWithThreeTags} />)

      expect(screen.queryByText(/\+/)).not.toBeInTheDocument()
    })

    it('handles empty tags array', () => {
      const mealWithoutTags = { ...mockMeal, tags: [] }

      render(<MealCard meal={mealWithoutTags} />)

      expect(screen.queryByText('healthy')).not.toBeInTheDocument()
    })

    it('handles null tags', () => {
      const mealWithNullTags = { ...mockMeal, tags: null }

      render(<MealCard meal={mealWithNullTags} />)

      // Should not crash
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
    })

    it('creates tag links with proper href', () => {
      render(<MealCard meal={mockMeal} />)

      const healthyTag = screen.getByText('healthy')
      const link = healthyTag.closest('a')

      expect(link).toHaveAttribute('href', '/meals?tag=healthy')
    })
  })

  describe('Image Handling', () => {
    it('renders image if image_url provided', () => {
      render(<MealCard meal={mockMeal} />)

      const image = screen.getByAltText('Grilled Chicken Salad')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/chicken-salad.jpg')
    })

    it('does not render image if no image_url', () => {
      const mealWithoutImage = { ...mockMeal, image_url: null }

      render(<MealCard meal={mealWithoutImage} />)

      const image = screen.queryByAltText('Grilled Chicken Salad')
      expect(image).not.toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('renders view recipe button by default', () => {
      render(<MealCard meal={mockMeal} />)

      expect(screen.getByText('View Recipe')).toBeInTheDocument()
    })

    it('view recipe button links to meal detail page', () => {
      render(<MealCard meal={mockMeal} />)

      const button = screen.getByText('View Recipe')
      const link = button.closest('a')

      expect(link).toHaveAttribute('href', `/meals/${mockMeal.id}`)
    })

    it('hides actions when showActions is false', () => {
      render(<MealCard meal={mockMeal} showActions={false} />)

      expect(screen.queryByText('View Recipe')).not.toBeInTheDocument()
    })

    it('shows actions when showActions is true', () => {
      render(<MealCard meal={mockMeal} showActions />)

      expect(screen.getByText('View Recipe')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('renders as a card component', () => {
      const { container } = render(<MealCard meal={mockMeal} />)

      // Card should have specific classes
      const card = container.querySelector('[class*="border"]')
      expect(card).toBeInTheDocument()
    })

    it('has hover effect class', () => {
      const { container } = render(<MealCard meal={mockMeal} />)

      const card = container.querySelector('[class*="hover:shadow"]')
      expect(card).toBeInTheDocument()
    })

    it('truncates long meal names with line-clamp', () => {
      const mealWithLongName = {
        ...mockMeal,
        name: 'This is a very long meal name that should be truncated with an ellipsis',
      }

      const { container } = render(<MealCard meal={mealWithLongName} />)

      const nameElement = container.querySelector('.line-clamp-1')
      expect(nameElement).toBeInTheDocument()
    })

    it('truncates long descriptions with line-clamp-2', () => {
      const { container } = render(<MealCard meal={mockMeal} />)

      const descriptionElement = container.querySelector('.line-clamp-2')
      expect(descriptionElement).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles minimal meal data without crashing', () => {
      const minimalMeal: Meal = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Simple Meal',
        description: null,
        ingredients: [],
        instructions: [],
        prep_time: null,
        cook_time: null,
        servings: null,
        calories_per_serving: null,
        protein_per_serving: null,
        carbs_per_serving: null,
        fats_per_serving: null,
        tags: null,
        cuisine_type: null,
        meal_type: null,
        difficulty_level: null,
        is_public: false,
        is_ai_generated: false,
        rating: null,
        image_url: null,
        meal_prep_friendly: null,
        storage_instructions: null,
        reheating_instructions: null,
        storage_duration_days: null,
        container_type: null,
        batch_cooking_multiplier: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      render(<MealCard meal={minimalMeal} />)

      expect(screen.getByText('Simple Meal')).toBeInTheDocument()
    })

    it('handles very large nutrition values', () => {
      const mealWithLargeValues = {
        ...mockMeal,
        calories_per_serving: 9999,
        protein_per_serving: 999,
        carbs_per_serving: 888,
        fats_per_serving: 777,
      }

      render(<MealCard meal={mealWithLargeValues} />)

      expect(screen.getByText('9999')).toBeInTheDocument()
      expect(screen.getByText('999g')).toBeInTheDocument()
      expect(screen.getByText('888g')).toBeInTheDocument()
      expect(screen.getByText('777g')).toBeInTheDocument()
    })
  })
})
