import { describe, it, expect } from 'vitest'
import {
  calculateMacros,
  calculateMacroPercentages,
  validateMacros,
  type Goal,
  type MacroTargets,
} from '@/features/nutrition/utils/macros'

describe('Macro Calculations', () => {
  describe('calculateMacros', () => {
    it('calculates macros for weight_loss goal', () => {
      const input = {
        tdee: 2400,
        goal: 'weight_loss' as Goal,
        weight: 80, // kg
      }

      const macros = calculateMacros(input)

      // Target calories: 2400 - 500 = 1900
      // Protein: 80 * 2.2 = 176g (176 * 4 = 704 cal)
      // Fats: 1900 * 0.30 = 570 cal (570 / 9 = 63g)
      // Carbs: (1900 - 704 - 570) / 4 = 626 / 4 = 156.5 ≈ 157g
      expect(macros.calories).toBe(1900)
      expect(macros.protein).toBe(176)
      expect(macros.fats).toBe(63)
      expect(macros.carbs).toBe(157)
    })

    it('calculates macros for muscle_gain goal', () => {
      const input = {
        tdee: 2400,
        goal: 'muscle_gain' as Goal,
        weight: 80,
      }

      const macros = calculateMacros(input)

      // Target calories: 2400 + 300 = 2700
      // Protein: 80 * 2.0 = 160g (160 * 4 = 640 cal)
      // Fats: 2700 * 0.25 = 675 cal (675 / 9 = 75g)
      // Carbs: (2700 - 640 - 675) / 4 = 1385 / 4 = 346.25 ≈ 346g
      expect(macros.calories).toBe(2700)
      expect(macros.protein).toBe(160)
      expect(macros.fats).toBe(75)
      expect(macros.carbs).toBe(346)
    })

    it('calculates macros for maintain goal', () => {
      const input = {
        tdee: 2400,
        goal: 'maintain' as Goal,
        weight: 80,
      }

      const macros = calculateMacros(input)

      // Target calories: 2400 + 0 = 2400
      // Protein: 80 * 1.8 = 144g (144 * 4 = 576 cal)
      // Fats: 2400 * 0.30 = 720 cal (720 / 9 = 80g)
      // Carbs: (2400 - 576 - 720) / 4 = 1104 / 4 = 276g
      expect(macros.calories).toBe(2400)
      expect(macros.protein).toBe(144)
      expect(macros.fats).toBe(80)
      expect(macros.carbs).toBe(276)
    })

    it('calculates macros for balanced goal', () => {
      const input = {
        tdee: 2400,
        goal: 'balanced' as Goal,
        weight: 80,
      }

      const macros = calculateMacros(input)

      // Same as maintain (0 calorie adjustment)
      expect(macros.calories).toBe(2400)
      expect(macros.protein).toBe(144)
      expect(macros.fats).toBe(80)
      expect(macros.carbs).toBe(276)
    })

    it('rounds all macro values to integers', () => {
      const input = {
        tdee: 2350,
        goal: 'weight_loss' as Goal,
        weight: 75.5,
      }

      const macros = calculateMacros(input)

      expect(Number.isInteger(macros.calories)).toBe(true)
      expect(Number.isInteger(macros.protein)).toBe(true)
      expect(Number.isInteger(macros.carbs)).toBe(true)
      expect(Number.isInteger(macros.fats)).toBe(true)
    })

    it('handles low body weight', () => {
      const input = {
        tdee: 1800,
        goal: 'maintain' as Goal,
        weight: 50, // 50kg
      }

      const macros = calculateMacros(input)

      // Protein: 50 * 1.8 = 90g
      expect(macros.protein).toBe(90)
      expect(macros.calories).toBe(1800)
    })

    it('handles high body weight', () => {
      const input = {
        tdee: 3200,
        goal: 'weight_loss' as Goal,
        weight: 120, // 120kg
      }

      const macros = calculateMacros(input)

      // Protein: 120 * 2.2 = 264g
      // Target calories: 3200 - 500 = 2700
      expect(macros.protein).toBe(264)
      expect(macros.calories).toBe(2700)
    })

    it('ensures total calories from macros approximately match target', () => {
      const input = {
        tdee: 2400,
        goal: 'muscle_gain' as Goal,
        weight: 80,
      }

      const macros = calculateMacros(input)

      // Calculate calories from macros
      const totalFromMacros = macros.protein * 4 + macros.carbs * 4 + macros.fats * 9

      // Should be within ±50 calories due to rounding
      expect(Math.abs(totalFromMacros - macros.calories)).toBeLessThanOrEqual(50)
    })

    it('handles zero TDEE', () => {
      const input = {
        tdee: 0,
        goal: 'maintain' as Goal,
        weight: 70,
      }

      const macros = calculateMacros(input)

      // Protein: 70 * 1.8 = 126g (504 cal)
      // Target calories: 0
      // This will result in negative carbs due to protein calories
      expect(macros.calories).toBe(0)
      expect(macros.protein).toBe(126)
    })

    it('muscle_gain uses 25% fats, others use 30%', () => {
      const inputMuscleGain = {
        tdee: 2400,
        goal: 'muscle_gain' as Goal,
        weight: 80,
      }

      const inputWeightLoss = {
        tdee: 2400,
        goal: 'weight_loss' as Goal,
        weight: 80,
      }

      const macrosMuscleGain = calculateMacros(inputMuscleGain)
      const macrosWeightLoss = calculateMacros(inputWeightLoss)

      // Muscle gain: 2700 * 0.25 = 675 cal / 9 = 75g
      expect(macrosMuscleGain.fats).toBe(75)

      // Weight loss: 1900 * 0.30 = 570 cal / 9 = 63g
      expect(macrosWeightLoss.fats).toBe(63)
    })
  })

  describe('calculateMacroPercentages', () => {
    it('calculates percentages correctly', () => {
      const macros: MacroTargets = {
        calories: 2400,
        protein: 150, // 150 * 4 = 600 cal = 25%
        carbs: 300, // 300 * 4 = 1200 cal = 50%
        fats: 67, // 67 * 9 = 603 cal = 25%
      }

      const percentages = calculateMacroPercentages(macros)

      expect(percentages.protein).toBe(25)
      expect(percentages.carbs).toBe(50)
      expect(percentages.fats).toBe(25)
    })

    it('rounds percentages to integers', () => {
      const macros: MacroTargets = {
        calories: 2350,
        protein: 145,
        carbs: 285,
        fats: 70,
      }

      const percentages = calculateMacroPercentages(macros)

      expect(Number.isInteger(percentages.protein)).toBe(true)
      expect(Number.isInteger(percentages.carbs)).toBe(true)
      expect(Number.isInteger(percentages.fats)).toBe(true)
    })

    it('percentages sum to approximately 100%', () => {
      const macros: MacroTargets = {
        calories: 2400,
        protein: 150,
        carbs: 300,
        fats: 67,
      }

      const percentages = calculateMacroPercentages(macros)
      const sum = percentages.protein + percentages.carbs + percentages.fats

      // Should be close to 100% (±5% tolerance due to rounding)
      expect(Math.abs(sum - 100)).toBeLessThanOrEqual(5)
    })
  })

  describe('validateMacros', () => {
    it('validates healthy macro distribution', () => {
      const macros: MacroTargets = {
        calories: 2400,
        protein: 150, // 25%
        carbs: 300, // 50%
        fats: 67, // 25%
      }

      const validation = validateMacros(macros)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toHaveLength(0)
    })

    it('warns when protein is too low (<15%)', () => {
      const macros: MacroTargets = {
        calories: 2400,
        protein: 60, // 60 * 4 = 240 cal = 10%
        carbs: 400,
        fats: 80,
      }

      const validation = validateMacros(macros)

      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toContain('Protein is below recommended minimum (15%)')
    })

    it('warns when protein is too high (>35%)', () => {
      const macros: MacroTargets = {
        calories: 2400,
        protein: 240, // 240 * 4 = 960 cal = 40%
        carbs: 200,
        fats: 60,
      }

      const validation = validateMacros(macros)

      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toContain('Protein exceeds recommended maximum (35%)')
    })

    it('warns when fats are too low (<20%)', () => {
      const macros: MacroTargets = {
        calories: 2400,
        protein: 150,
        carbs: 350,
        fats: 40, // 40 * 9 = 360 cal = 15%
      }

      const validation = validateMacros(macros)

      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toContain('Fat is below recommended minimum (20%)')
    })

    it('warns when fats are too high (>35%)', () => {
      const macros: MacroTargets = {
        calories: 2400,
        protein: 120,
        carbs: 180,
        fats: 107, // 107 * 9 = 963 cal = 40%
      }

      const validation = validateMacros(macros)

      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toContain('Fat exceeds recommended maximum (35%)')
    })

    it('warns when carbs are too low (<45%)', () => {
      const macros: MacroTargets = {
        calories: 2400,
        protein: 180,
        carbs: 200, // 200 * 4 = 800 cal = 33%
        fats: 80,
      }

      const validation = validateMacros(macros)

      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toContain('Carbs are below recommended minimum (45%)')
    })

    it('warns when carbs are too high (>65%)', () => {
      const macros: MacroTargets = {
        calories: 2400,
        protein: 100,
        carbs: 450, // 450 * 4 = 1800 cal = 75%
        fats: 45,
      }

      const validation = validateMacros(macros)

      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toContain('Carbs exceed recommended maximum (65%)')
    })

    it('can have multiple warnings simultaneously', () => {
      const macros: MacroTargets = {
        calories: 2400,
        protein: 50, // Too low
        carbs: 500, // Too high
        fats: 40, // Too low
      }

      const validation = validateMacros(macros)

      expect(validation.isValid).toBe(false)
      expect(validation.warnings.length).toBeGreaterThan(1)
    })
  })
})
