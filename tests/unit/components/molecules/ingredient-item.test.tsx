import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { IngredientItem } from '@/components/molecules/ingredient-item'
import { render, screen } from '@/tests/helpers/test-utils'

describe('IngredientItem Component', () => {
  const mockIngredient = {
    name: 'Chicken breast',
    quantity: 500,
    unit: 'g',
    category: 'protein',
  }

  describe('Rendering', () => {
    it('renders ingredient name', () => {
      render(<IngredientItem ingredient={mockIngredient} />)

      expect(screen.getByText('Chicken breast')).toBeInTheDocument()
    })

    it('renders quantity with unit', () => {
      render(<IngredientItem ingredient={mockIngredient} />)

      expect(screen.getByText('500 g')).toBeInTheDocument()
    })

    it('renders category badge when showCategory is true', () => {
      render(<IngredientItem ingredient={mockIngredient} showCategory />)

      expect(screen.getByText('protein')).toBeInTheDocument()
    })

    it('does not render category badge when showCategory is false', () => {
      render(<IngredientItem ingredient={mockIngredient} showCategory={false} />)

      expect(screen.queryByText('protein')).not.toBeInTheDocument()
    })

    it('handles ingredient without category', () => {
      const ingredientWithoutCategory = {
        name: 'Salt',
        quantity: 1,
        unit: 'tsp',
      }

      render(<IngredientItem ingredient={ingredientWithoutCategory} showCategory />)

      expect(screen.getByText('Salt')).toBeInTheDocument()
      expect(screen.getByText('1 tsp')).toBeInTheDocument()
    })

    it('handles fractional quantities', () => {
      const fractionalIngredient = {
        name: 'Sugar',
        quantity: 0.5,
        unit: 'cup',
      }

      render(<IngredientItem ingredient={fractionalIngredient} />)

      expect(screen.getByText('0.5 cup')).toBeInTheDocument()
    })

    it('handles very small quantities', () => {
      const smallIngredient = {
        name: 'Vanilla extract',
        quantity: 0.25,
        unit: 'tsp',
      }

      render(<IngredientItem ingredient={smallIngredient} />)

      expect(screen.getByText('0.25 tsp')).toBeInTheDocument()
    })
  })

  describe('Checkbox Interactions', () => {
    it('renders checkbox when showCheckbox is true', () => {
      const onCheckedChange = vi.fn()

      render(
        <IngredientItem
          ingredient={mockIngredient}
          showCheckbox
          onCheckedChange={onCheckedChange}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('does not render checkbox when showCheckbox is false', () => {
      render(<IngredientItem ingredient={mockIngredient} showCheckbox={false} />)

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('checkbox is unchecked by default', () => {
      const onCheckedChange = vi.fn()

      render(
        <IngredientItem
          ingredient={mockIngredient}
          showCheckbox
          onCheckedChange={onCheckedChange}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('checkbox reflects checked state', () => {
      const onCheckedChange = vi.fn()

      render(
        <IngredientItem
          ingredient={mockIngredient}
          showCheckbox
          checked
          onCheckedChange={onCheckedChange}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('calls onCheckedChange when checkbox is clicked', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()

      render(
        <IngredientItem
          ingredient={mockIngredient}
          showCheckbox
          onCheckedChange={onCheckedChange}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(onCheckedChange).toHaveBeenCalledWith(true)
      expect(onCheckedChange).toHaveBeenCalledTimes(1)
    })

    it('calls onCheckedChange with false when unchecking', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()

      render(
        <IngredientItem
          ingredient={mockIngredient}
          showCheckbox
          checked
          onCheckedChange={onCheckedChange}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(onCheckedChange).toHaveBeenCalledWith(false)
    })

    it('does not render checkbox without onCheckedChange handler', () => {
      render(<IngredientItem ingredient={mockIngredient} showCheckbox />)

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles zero quantity', () => {
      const zeroIngredient = {
        name: 'Optional ingredient',
        quantity: 0,
        unit: 'g',
      }

      render(<IngredientItem ingredient={zeroIngredient} />)

      expect(screen.getByText('Optional ingredient')).toBeInTheDocument()
      expect(screen.getByText('0 g')).toBeInTheDocument()
    })

    it('handles very long ingredient names', () => {
      const longNameIngredient = {
        name: 'Extra virgin cold-pressed organic olive oil from Greece',
        quantity: 2,
        unit: 'tbsp',
      }

      render(<IngredientItem ingredient={longNameIngredient} />)

      expect(
        screen.getByText('Extra virgin cold-pressed organic olive oil from Greece')
      ).toBeInTheDocument()
    })

    it('handles empty unit string', () => {
      const noUnitIngredient = {
        name: 'Eggs',
        quantity: 3,
        unit: '',
      }

      render(<IngredientItem ingredient={noUnitIngredient} />)

      expect(screen.getByText('Eggs')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('capitalizes category badge text', () => {
      render(<IngredientItem ingredient={mockIngredient} showCategory />)

      const badge = screen.getByText('protein')
      expect(badge).toHaveClass('capitalize')
    })
  })
})
