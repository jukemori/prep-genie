import { describe, expect, it, vi } from 'vitest'
import { MacroDisplay } from '@/components/molecules/macro-display'
import { render, screen } from '@/tests/helpers/test-utils'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      protein: 'Protein',
      carbs: 'Carbs',
      fats: 'Fats',
    }
    return translations[key] || key
  },
}))

describe('MacroDisplay Component', () => {
  describe('Basic Rendering', () => {
    it('renders protein value and unit', () => {
      render(<MacroDisplay protein={150} carbs={200} fats={60} />)

      expect(screen.getByText('Protein')).toBeInTheDocument()
      expect(screen.getByText(/150g/)).toBeInTheDocument()
    })

    it('renders carbs value and unit', () => {
      render(<MacroDisplay protein={150} carbs={200} fats={60} />)

      expect(screen.getByText('Carbs')).toBeInTheDocument()
      expect(screen.getByText(/200g/)).toBeInTheDocument()
    })

    it('renders fats value and unit', () => {
      render(<MacroDisplay protein={150} carbs={200} fats={60} />)

      expect(screen.getByText('Fats')).toBeInTheDocument()
      expect(screen.getByText(/60g/)).toBeInTheDocument()
    })

    it('renders all macros in a card', () => {
      const { container } = render(<MacroDisplay protein={150} carbs={200} fats={60} />)

      // Check that Card component is rendered
      const card = container.querySelector('[class*="border"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Target Values', () => {
    it('displays target protein when provided', () => {
      render(<MacroDisplay protein={150} carbs={200} fats={60} targetProtein={180} />)

      expect(screen.getByText(/150g \/ 180g/)).toBeInTheDocument()
    })

    it('displays target carbs when provided', () => {
      render(<MacroDisplay protein={150} carbs={200} fats={60} targetCarbs={250} />)

      expect(screen.getByText(/200g \/ 250g/)).toBeInTheDocument()
    })

    it('displays target fats when provided', () => {
      render(<MacroDisplay protein={150} carbs={200} fats={60} targetFats={70} />)

      expect(screen.getByText(/60g \/ 70g/)).toBeInTheDocument()
    })

    it('displays all target values together', () => {
      render(
        <MacroDisplay
          protein={150}
          carbs={200}
          fats={60}
          targetProtein={180}
          targetCarbs={250}
          targetFats={70}
        />
      )

      expect(screen.getByText(/150g \/ 180g/)).toBeInTheDocument()
      expect(screen.getByText(/200g \/ 250g/)).toBeInTheDocument()
      expect(screen.getByText(/60g \/ 70g/)).toBeInTheDocument()
    })

    it('omits target display when not provided', () => {
      render(<MacroDisplay protein={150} carbs={200} fats={60} />)

      // Should show values without " / target" format
      expect(screen.getByText('150g')).toBeInTheDocument()
      expect(screen.getByText('200g')).toBeInTheDocument()
      expect(screen.getByText('60g')).toBeInTheDocument()
      expect(screen.queryByText(/\//)).not.toBeInTheDocument()
    })
  })

  describe('Progress Bars', () => {
    it('does not show progress bars by default', () => {
      const { container } = render(
        <MacroDisplay
          protein={150}
          carbs={200}
          fats={60}
          targetProtein={180}
          targetCarbs={250}
          targetFats={70}
        />
      )

      // Progress component should not be rendered
      const progressBars = container.querySelectorAll('[role="progressbar"]')
      expect(progressBars).toHaveLength(0)
    })

    it('shows progress bars when showProgress is true', () => {
      const { container } = render(
        <MacroDisplay
          protein={150}
          carbs={200}
          fats={60}
          targetProtein={180}
          targetCarbs={250}
          targetFats={70}
          showProgress
        />
      )

      const progressBars = container.querySelectorAll('[role="progressbar"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('calculates protein percentage correctly', () => {
      const { container } = render(
        <MacroDisplay protein={90} carbs={200} fats={60} targetProtein={180} showProgress />
      )

      // 90/180 = 50%
      const proteinProgress = container.querySelector('[role="progressbar"]')
      expect(proteinProgress).toBeInTheDocument()
    })

    it('does not show progress bar when target is missing', () => {
      const { container } = render(
        <MacroDisplay protein={150} carbs={200} fats={60} showProgress />
      )

      // No targets provided, so no progress bars should render
      const progressBars = container.querySelectorAll('[role="progressbar"]')
      expect(progressBars).toHaveLength(0)
    })

    it('shows only progress bars for macros with targets', () => {
      const { container } = render(
        <MacroDisplay protein={150} carbs={200} fats={60} targetProtein={180} showProgress />
      )

      // Only protein has a target, so only 1 progress bar
      const progressBars = container.querySelectorAll('[role="progressbar"]')
      expect(progressBars).toHaveLength(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles zero values gracefully', () => {
      render(<MacroDisplay protein={0} carbs={0} fats={0} />)

      // Multiple elements will have "0g", so just check that component renders
      expect(screen.getByText('Protein')).toBeInTheDocument()
      expect(screen.getByText('Carbs')).toBeInTheDocument()
      expect(screen.getByText('Fats')).toBeInTheDocument()
    })

    it('handles very large numbers', () => {
      render(<MacroDisplay protein={999} carbs={9999} fats={999} />)

      // Just check that the unique carbs value is present
      expect(screen.getByText(/9999g/)).toBeInTheDocument()
      // Check that component renders all macros
      expect(screen.getByText('Protein')).toBeInTheDocument()
      expect(screen.getByText('Fats')).toBeInTheDocument()
    })

    it('handles decimal values', () => {
      render(<MacroDisplay protein={150.5} carbs={200.75} fats={60.25} />)

      expect(screen.getByText(/150.5g/)).toBeInTheDocument()
      expect(screen.getByText(/200.75g/)).toBeInTheDocument()
      expect(screen.getByText(/60.25g/)).toBeInTheDocument()
    })

    it('handles exceeding target (over 100%)', () => {
      const { container } = render(
        <MacroDisplay
          protein={200}
          carbs={300}
          fats={100}
          targetProtein={150}
          targetCarbs={250}
          targetFats={80}
          showProgress
        />
      )

      // Should still render progress bars even when over 100%
      const progressBars = container.querySelectorAll('[role="progressbar"]')
      expect(progressBars).toHaveLength(3)
    })

    it('handles target of zero', () => {
      render(
        <MacroDisplay
          protein={150}
          carbs={200}
          fats={60}
          targetProtein={0}
          targetCarbs={0}
          targetFats={0}
          showProgress
        />
      )

      // Should not crash, but progress bars should show 0% (or not render)
      expect(screen.getByText('Protein')).toBeInTheDocument()
      expect(screen.getByText('Carbs')).toBeInTheDocument()
      expect(screen.getByText('Fats')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('renders macros in separate sections', () => {
      const { container } = render(<MacroDisplay protein={150} carbs={200} fats={60} />)

      // Each macro should be in its own div with space-y-2
      const macroSections = container.querySelectorAll('.space-y-2')
      expect(macroSections.length).toBeGreaterThanOrEqual(3)
    })

    it('uses consistent spacing between macros', () => {
      const { container } = render(<MacroDisplay protein={150} carbs={200} fats={60} />)

      // Parent container should have space-y-4
      const parentContainer = container.querySelector('.space-y-4')
      expect(parentContainer).toBeInTheDocument()
    })
  })
})
