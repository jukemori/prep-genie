/**
 * Macro Nutrient Calculator
 * Calculates protein, carbs, and fats based on goals and TDEE
 */

export type Goal = 'weight_loss' | 'maintain' | 'muscle_gain' | 'balanced';

interface MacroInput {
  tdee: number;
  goal: Goal;
  weight: number; // in kg
}

export interface MacroTargets {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
}

// Calorie adjustments based on goal
const CALORIE_ADJUSTMENTS: Record<Goal, number> = {
  weight_loss: -500, // 500 cal deficit
  maintain: 0, // No adjustment
  muscle_gain: 300, // 300 cal surplus
  balanced: 0, // Maintenance
};

/**
 * Calculate macro targets based on TDEE and goal
 *
 * Protein:
 * - Weight loss: 2.2g/kg (preserve muscle)
 * - Muscle gain: 2.0g/kg (build muscle)
 * - Maintain/Balanced: 1.8g/kg
 *
 * Fats: 25-30% of total calories
 * Carbs: Remaining calories
 */
export function calculateMacros(input: MacroInput): MacroTargets {
  const { tdee, goal, weight } = input;

  // Calculate target calories
  const targetCalories = tdee + CALORIE_ADJUSTMENTS[goal];

  // Calculate protein (g/kg bodyweight)
  let proteinPerKg: number;
  switch (goal) {
    case 'weight_loss':
      proteinPerKg = 2.2; // Higher protein to preserve muscle
      break;
    case 'muscle_gain':
      proteinPerKg = 2.0; // High protein for muscle building
      break;
    default:
      proteinPerKg = 1.8; // Moderate protein
  }

  const proteinGrams = Math.round(weight * proteinPerKg);
  const proteinCalories = proteinGrams * 4; // 4 cal/g protein

  // Calculate fats (25-30% of total calories)
  const fatPercentage = goal === 'muscle_gain' ? 0.25 : 0.3;
  const fatCalories = Math.round(targetCalories * fatPercentage);
  const fatGrams = Math.round(fatCalories / 9); // 9 cal/g fat

  // Calculate carbs (remaining calories)
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const carbGrams = Math.round(remainingCalories / 4); // 4 cal/g carbs

  return {
    calories: targetCalories,
    protein: proteinGrams,
    carbs: carbGrams,
    fats: fatGrams,
  };
}

/**
 * Calculate macro percentages
 */
export function calculateMacroPercentages(macros: MacroTargets): {
  protein: number;
  carbs: number;
  fats: number;
} {
  const totalCalories = macros.calories;

  return {
    protein: Math.round(((macros.protein * 4) / totalCalories) * 100),
    carbs: Math.round(((macros.carbs * 4) / totalCalories) * 100),
    fats: Math.round(((macros.fats * 9) / totalCalories) * 100),
  };
}

/**
 * Validate if macros are within healthy ranges
 */
export function validateMacros(macros: MacroTargets): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const percentages = calculateMacroPercentages(macros);

  // Protein should be 15-35% of calories
  if (percentages.protein < 15) {
    warnings.push('Protein is below recommended minimum (15%)');
  }
  if (percentages.protein > 35) {
    warnings.push('Protein exceeds recommended maximum (35%)');
  }

  // Fats should be 20-35% of calories
  if (percentages.fats < 20) {
    warnings.push('Fat is below recommended minimum (20%)');
  }
  if (percentages.fats > 35) {
    warnings.push('Fat exceeds recommended maximum (35%)');
  }

  // Carbs should be 45-65% of calories
  if (percentages.carbs < 45) {
    warnings.push('Carbs are below recommended minimum (45%)');
  }
  if (percentages.carbs > 65) {
    warnings.push('Carbs exceed recommended maximum (65%)');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
