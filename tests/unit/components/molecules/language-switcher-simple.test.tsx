import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/tests/helpers/test-utils'
import { LanguageSwitcher } from '@/components/molecules/language-switcher'

// Create mock for useLocale that can be controlled
const mockUseLocale = vi.fn(() => 'en')

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'settings.language': 'Language',
    }
    return translations[key] || key
  },
  useLocale: () => mockUseLocale(),
}))

describe('LanguageSwitcher Component', () => {
  describe('Rendering', () => {
    it('renders language selector', () => {
      render(<LanguageSwitcher />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('displays current locale (English)', () => {
      mockUseLocale.mockReturnValue('en')

      render(<LanguageSwitcher />)

      // Radix UI Select shows the current value in the trigger
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('displays current locale (Japanese)', () => {
      mockUseLocale.mockReturnValue('ja')

      render(<LanguageSwitcher />)

      expect(screen.getByText('日本語')).toBeInTheDocument()
    })

    it('has proper ARIA role for combobox', () => {
      render(<LanguageSwitcher />)

      const combobox = screen.getByRole('combobox')
      expect(combobox).toBeInTheDocument()
      expect(combobox).toHaveAttribute('aria-autocomplete', 'none')
    })

    it('is not disabled by default', () => {
      render(<LanguageSwitcher />)

      const combobox = screen.getByRole('combobox')
      expect(combobox).not.toBeDisabled()
    })

    it('has correct width styling', () => {
      render(<LanguageSwitcher />)

      const combobox = screen.getByRole('combobox')
      expect(combobox).toHaveClass('w-[180px]')
    })
  })
})
