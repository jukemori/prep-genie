/**
 * TDEE (Total Daily Energy Expenditure) Calculator
 * Uses Mifflin-St Jeor Equation for BMR + Activity Level Multiplier
 */

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Little to no exercise
  light: 1.375, // Light exercise 1-3 days/week
  moderate: 1.55, // Moderate exercise 3-5 days/week
  active: 1.725, // Heavy exercise 6-7 days/week
  very_active: 1.9, // Very heavy exercise, physical job
};

interface TDEEInput {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: Gender;
  activityLevel: ActivityLevel;
}

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 *
 * Men: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 * Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
 * Other: Use average of both calculations
 */
function calculateBMR(input: Omit<TDEEInput, 'activityLevel'>): number {
  const { age, weight, height, gender } = input;

  const baseBMR = 10 * weight + 6.25 * height - 5 * age;

  switch (gender) {
    case 'male':
      return baseBMR + 5;
    case 'female':
      return baseBMR - 161;
    case 'other':
      // Use average of male and female calculations
      return (baseBMR + 5 + baseBMR - 161) / 2;
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * TDEE = BMR * Activity Multiplier
 */
export function calculateTDEE(input: TDEEInput): number {
  const bmr = calculateBMR(input);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[input.activityLevel];
  return Math.round(bmr * activityMultiplier);
}

/**
 * Convert pounds to kilograms
 */
export function lbsToKg(lbs: number): number {
  return Number((lbs * 0.453592).toFixed(2));
}

/**
 * Convert kilograms to pounds
 */
export function kgToLbs(kg: number): number {
  return Number((kg * 2.20462).toFixed(2));
}

/**
 * Convert inches to centimeters
 */
export function inchesToCm(inches: number): number {
  return Number((inches * 2.54).toFixed(2));
}

/**
 * Convert centimeters to inches
 */
export function cmToInches(cm: number): number {
  return Number((cm / 2.54).toFixed(2));
}
