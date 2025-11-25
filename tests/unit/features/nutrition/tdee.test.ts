import { describe, it, expect } from 'vitest'
import {
  calculateTDEE,
  lbsToKg,
  kgToLbs,
  inchesToCm,
  cmToInches,
} from '@/features/nutrition/utils/tdee'
import type { Gender, ActivityLevel } from '@/features/nutrition/utils/tdee'

describe('TDEE Calculations', () => {
  describe('calculateTDEE', () => {
    it('calculates TDEE for male with sedentary activity', () => {
      const input = {
        age: 30,
        weight: 80, // kg
        height: 180, // cm
        gender: 'male' as Gender,
        activityLevel: 'sedentary' as ActivityLevel,
      }

      const tdee = calculateTDEE(input)

      // BMR = (10 × 80) + (6.25 × 180) - (5 × 30) + 5 = 1780
      // TDEE = 1780 * 1.2 = 2136
      expect(tdee).toBe(2136)
    })

    it('calculates TDEE for male with moderate activity', () => {
      const input = {
        age: 30,
        weight: 80,
        height: 180,
        gender: 'male' as Gender,
        activityLevel: 'moderate' as ActivityLevel,
      }

      const tdee = calculateTDEE(input)

      // BMR = 1780
      // TDEE = 1780 * 1.55 = 2759
      expect(tdee).toBe(2759)
    })

    it('calculates TDEE for female with moderate activity', () => {
      const input = {
        age: 25,
        weight: 65,
        height: 165,
        gender: 'female' as Gender,
        activityLevel: 'moderate' as ActivityLevel,
      }

      const tdee = calculateTDEE(input)

      // BMR = (10 × 65) + (6.25 × 165) - (5 × 25) - 161 = 1395.25
      // TDEE = 1395.25 * 1.55 = 2162.6375 ≈ 2163
      expect(tdee).toBe(2163)
    })

    it('calculates TDEE for gender "other" (average of male and female)', () => {
      const input = {
        age: 30,
        weight: 70,
        height: 170,
        gender: 'other' as Gender,
        activityLevel: 'moderate' as ActivityLevel,
      }

      const tdee = calculateTDEE(input)

      // base = (10 × 70) + (6.25 × 170) - (5 × 30) = 1612.5
      // male: 1612.5 + 5 = 1617.5
      // female: 1612.5 - 161 = 1451.5
      // other: (1617.5 + 1451.5) / 2 = 1534.5
      // TDEE = 1534.5 * 1.55 = 2378.475 ≈ 2378
      expect(tdee).toBe(2378)
    })

    it('calculates TDEE with light activity level', () => {
      const input = {
        age: 40,
        weight: 90,
        height: 185,
        gender: 'male' as Gender,
        activityLevel: 'light' as ActivityLevel,
      }

      const tdee = calculateTDEE(input)

      // BMR = (10 × 90) + (6.25 × 185) - (5 × 40) + 5 = 1861.25
      // TDEE = 1861.25 * 1.375 = 2559.21875 ≈ 2559
      expect(tdee).toBe(2559)
    })

    it('calculates TDEE with active activity level', () => {
      const input = {
        age: 25,
        weight: 75,
        height: 175,
        gender: 'male' as Gender,
        activityLevel: 'active' as ActivityLevel,
      }

      const tdee = calculateTDEE(input)

      // BMR = (10 × 75) + (6.25 × 175) - (5 × 25) + 5 = 750 + 1093.75 - 125 + 5 = 1723.75
      // TDEE = 1723.75 * 1.725 = 2973.46875 ≈ 2973
      expect(tdee).toBe(2973)
    })

    it('calculates TDEE with very_active activity level', () => {
      const input = {
        age: 28,
        weight: 85,
        height: 182,
        gender: 'male' as Gender,
        activityLevel: 'very_active' as ActivityLevel,
      }

      const tdee = calculateTDEE(input)

      // BMR = (10 × 85) + (6.25 × 182) - (5 × 28) + 5 = 1852.5
      // TDEE = 1852.5 * 1.9 = 3519.75 ≈ 3520
      expect(tdee).toBe(3520)
    })

    it('rounds TDEE to nearest integer', () => {
      const input = {
        age: 30,
        weight: 75.5,
        height: 178.5,
        gender: 'male' as Gender,
        activityLevel: 'moderate' as ActivityLevel,
      }

      const tdee = calculateTDEE(input)

      // Should be an integer, not a decimal
      expect(Number.isInteger(tdee)).toBe(true)
    })

    it('handles zero age', () => {
      const input = {
        age: 0,
        weight: 80,
        height: 180,
        gender: 'male' as Gender,
        activityLevel: 'moderate' as ActivityLevel,
      }

      const tdee = calculateTDEE(input)

      // BMR = (10 × 80) + (6.25 × 180) - (5 × 0) + 5 = 1930
      // TDEE = 1930 * 1.55 = 2991.5 ≈ 2992
      expect(tdee).toBe(2992)
    })

    it('handles very high weight (obesity case)', () => {
      const input = {
        age: 35,
        weight: 150, // 150kg
        height: 180,
        gender: 'male' as Gender,
        activityLevel: 'sedentary' as ActivityLevel,
      }

      const tdee = calculateTDEE(input)

      // BMR = (10 × 150) + (6.25 × 180) - (5 × 35) + 5 = 1500 + 1125 - 175 + 5 = 2455
      // TDEE = 2455 * 1.2 = 2946
      expect(tdee).toBe(2946)
    })

    it('handles very high age', () => {
      const input = {
        age: 80,
        weight: 70,
        height: 170,
        gender: 'female' as Gender,
        activityLevel: 'sedentary' as ActivityLevel,
      }

      const tdee = calculateTDEE(input)

      // BMR = (10 × 70) + (6.25 × 170) - (5 × 80) - 161 = 700 + 1062.5 - 400 - 161 = 1201.5
      // TDEE = 1201.5 * 1.2 = 1441.8 ≈ 1442
      expect(tdee).toBe(1442)
    })
  })

  describe('lbsToKg', () => {
    it('converts pounds to kilograms', () => {
      expect(lbsToKg(176)).toBe(79.83)
    })

    it('converts 0 pounds to 0 kg', () => {
      expect(lbsToKg(0)).toBe(0)
    })

    it('handles decimal pounds', () => {
      expect(lbsToKg(154.32)).toBe(70.0)
    })

    it('rounds to 2 decimal places', () => {
      expect(lbsToKg(100)).toBe(45.36)
    })
  })

  describe('kgToLbs', () => {
    it('converts kilograms to pounds', () => {
      expect(kgToLbs(80)).toBe(176.37)
    })

    it('converts 0 kg to 0 pounds', () => {
      expect(kgToLbs(0)).toBe(0)
    })

    it('handles decimal kg', () => {
      expect(kgToLbs(70.5)).toBe(155.43)
    })

    it('rounds to 2 decimal places', () => {
      expect(kgToLbs(45.36)).toBe(100.0)
    })
  })

  describe('inchesToCm', () => {
    it('converts inches to centimeters', () => {
      expect(inchesToCm(70)).toBe(177.8)
    })

    it('converts 0 inches to 0 cm', () => {
      expect(inchesToCm(0)).toBe(0)
    })

    it('handles decimal inches', () => {
      expect(inchesToCm(65.5)).toBe(166.37)
    })

    it('rounds to 2 decimal places', () => {
      expect(inchesToCm(72)).toBe(182.88)
    })
  })

  describe('cmToInches', () => {
    it('converts centimeters to inches', () => {
      expect(cmToInches(180)).toBe(70.87)
    })

    it('converts 0 cm to 0 inches', () => {
      expect(cmToInches(0)).toBe(0)
    })

    it('handles decimal cm', () => {
      expect(cmToInches(165.5)).toBe(65.16)
    })

    it('rounds to 2 decimal places', () => {
      expect(cmToInches(177.8)).toBe(70.0)
    })
  })
})
