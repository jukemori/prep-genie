import { describe, expect, it } from 'vitest'
import {
  type Currency,
  convertHeight,
  convertVolume,
  convertWeight,
  formatCurrency,
  getCupSize,
  type HeightUnit,
  JAPANESE_CUP_ML,
  US_CUP_ML,
  type VolumeUnit,
  type WeightUnit,
} from '@/lib/i18n/units'

describe('i18n Unit Conversions', () => {
  describe('convertWeight', () => {
    it('converts kg to lb', () => {
      const result = convertWeight(80, 'kg', 'lb')
      expect(result).toBeCloseTo(176.37, 1)
    })

    it('converts lb to kg', () => {
      const result = convertWeight(176, 'lb', 'kg')
      expect(result).toBeCloseTo(79.83, 1)
    })

    it('returns same value when converting kg to kg', () => {
      const result = convertWeight(80, 'kg', 'kg')
      expect(result).toBe(80)
    })

    it('returns same value when converting lb to lb', () => {
      const result = convertWeight(176, 'lb', 'lb')
      expect(result).toBe(176)
    })

    it('handles zero weight', () => {
      const result = convertWeight(0, 'kg', 'lb')
      expect(result).toBe(0)
    })

    it('handles decimal kg values', () => {
      const result = convertWeight(75.5, 'kg', 'lb')
      expect(result).toBeCloseTo(166.45, 1)
    })

    it('handles decimal lb values', () => {
      const result = convertWeight(165.5, 'lb', 'kg')
      expect(result).toBeCloseTo(75.07, 1)
    })

    it('handles very large weights', () => {
      const result = convertWeight(500, 'kg', 'lb')
      expect(result).toBeCloseTo(1102.31, 1)
    })
  })

  describe('convertHeight', () => {
    it('converts cm to ft_in format (180cm to 5ft 11in)', () => {
      const result = convertHeight(180, 'cm', 'ft_in')
      // 180cm = 70.87 inches = 5ft 10.87in ≈ 5.11 (5ft 11in)
      expect(result).toBeCloseTo(5.11, 2)
    })

    it('converts ft_in to cm (5ft 11in to cm)', () => {
      const result = convertHeight(5.11, 'ft_in', 'cm')
      // 5ft 11in = 71 inches = 180.34cm
      expect(result).toBeCloseTo(180.34, 1)
    })

    it('returns same value when converting cm to cm', () => {
      const result = convertHeight(180, 'cm', 'cm')
      expect(result).toBe(180)
    })

    it('returns same value when converting ft_in to ft_in', () => {
      const result = convertHeight(5.11, 'ft_in', 'ft_in')
      expect(result).toBe(5.11)
    })

    it('handles zero height', () => {
      const result = convertHeight(0, 'cm', 'ft_in')
      expect(result).toBe(0)
    })

    it('handles exactly 6ft (6.00)', () => {
      const result = convertHeight(6.0, 'ft_in', 'cm')
      // 6ft 0in = 72 inches = 182.88cm
      expect(result).toBeCloseTo(182.88, 1)
    })

    it('converts 165cm to ft_in', () => {
      const result = convertHeight(165, 'cm', 'ft_in')
      // 165cm = 64.96 inches = 5ft 4.96in ≈ 5.05 (5ft 5in)
      expect(result).toBeCloseTo(5.05, 2)
    })

    it('converts 6.02 ft_in (6ft 2in) to cm', () => {
      const result = convertHeight(6.02, 'ft_in', 'cm')
      // 6ft 2in = 74 inches = 187.96cm
      expect(result).toBeCloseTo(187.96, 1)
    })
  })

  describe('convertVolume', () => {
    it('converts mL to US cups (240mL to 1 cup)', () => {
      const result = convertVolume(240, 'ml', 'cups_us')
      expect(result).toBe(1)
    })

    it('converts mL to Japanese cups (200mL to 1 cup)', () => {
      const result = convertVolume(200, 'ml', 'cups_jp')
      expect(result).toBe(1)
    })

    it('converts US cups to mL (1 cup to 240mL)', () => {
      const result = convertVolume(1, 'cups_us', 'ml')
      expect(result).toBe(240)
    })

    it('converts Japanese cups to mL (1 cup to 200mL)', () => {
      const result = convertVolume(1, 'cups_jp', 'ml')
      expect(result).toBe(200)
    })

    it('converts US cups to Japanese cups', () => {
      const result = convertVolume(1, 'cups_us', 'cups_jp')
      // 1 US cup = 240mL = 240/200 = 1.2 JP cups
      expect(result).toBe(1.2)
    })

    it('converts Japanese cups to US cups', () => {
      const result = convertVolume(1, 'cups_jp', 'cups_us')
      // 1 JP cup = 200mL = 200/240 = 0.833... US cups
      expect(result).toBeCloseTo(0.833, 3)
    })

    it('returns same value when converting mL to mL', () => {
      const result = convertVolume(500, 'ml', 'ml')
      expect(result).toBe(500)
    })

    it('returns same value when converting cups_us to cups_us', () => {
      const result = convertVolume(2, 'cups_us', 'cups_us')
      expect(result).toBe(2)
    })

    it('handles decimal cup values', () => {
      const result = convertVolume(0.5, 'cups_us', 'ml')
      expect(result).toBe(120)
    })

    it('handles zero volume', () => {
      const result = convertVolume(0, 'ml', 'cups_us')
      expect(result).toBe(0)
    })

    it('handles large volumes', () => {
      const result = convertVolume(1000, 'ml', 'cups_us')
      // 1000mL = 1000/240 = 4.166... cups
      expect(result).toBeCloseTo(4.167, 3)
    })
  })

  describe('formatCurrency', () => {
    it('formats USD with en locale', () => {
      const result = formatCurrency(1234.56, 'USD', 'en-US')
      expect(result).toBe('$1,234.56')
    })

    it('formats JPY with ja locale', () => {
      const result = formatCurrency(1235, 'JPY', 'ja-JP')
      expect(result).toBe('￥1,235')
    })

    it('formats JPY with en locale (no decimals)', () => {
      const result = formatCurrency(1235, 'JPY', 'en-US')
      // JPY doesn't use decimal places
      expect(result).toBe('¥1,235')
    })

    it('formats USD with ja locale', () => {
      const result = formatCurrency(1234.56, 'USD', 'ja-JP')
      expect(result).toBe('$1,234.56')
    })

    it('handles zero amount', () => {
      const result = formatCurrency(0, 'USD', 'en-US')
      expect(result).toBe('$0.00')
    })

    it('handles negative amounts', () => {
      const result = formatCurrency(-50.25, 'USD', 'en-US')
      expect(result).toBe('-$50.25')
    })

    it('handles large amounts with thousand separators', () => {
      const result = formatCurrency(1234567.89, 'USD', 'en-US')
      expect(result).toBe('$1,234,567.89')
    })

    it('handles small decimal amounts', () => {
      const result = formatCurrency(0.99, 'USD', 'en-US')
      expect(result).toBe('$0.99')
    })
  })

  describe('getCupSize', () => {
    it('returns Japanese cup size (200mL) for ja locale', () => {
      const result = getCupSize('ja')
      expect(result).toBe(JAPANESE_CUP_ML)
      expect(result).toBe(200)
    })

    it('returns US cup size (240mL) for en locale', () => {
      const result = getCupSize('en')
      expect(result).toBe(US_CUP_ML)
      expect(result).toBe(240)
    })
  })

  describe('Constants', () => {
    it('JAPANESE_CUP_ML is 200', () => {
      expect(JAPANESE_CUP_ML).toBe(200)
    })

    it('US_CUP_ML is 240', () => {
      expect(US_CUP_ML).toBe(240)
    })
  })
})
