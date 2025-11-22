/**
 * Format utilities for PrepGenie
 */

/**
 * Format a number as calories (e.g., 1234 -> "1,234 kcal")
 */
export function formatCalories(calories: number): string {
  return `${calories.toLocaleString()} kcal`;
}

/**
 * Format a number as grams (e.g., 150 -> "150g")
 */
export function formatGrams(grams: number): string {
  return `${Math.round(grams)}g`;
}

/**
 * Format a number as macros (e.g., 150 -> "150g")
 * Alias for formatGrams for clarity in nutrition context
 */
export const formatMacros = formatGrams;

/**
 * Format time in minutes to human-readable string
 * @example formatMinutes(45) -> "45 mins"
 * @example formatMinutes(90) -> "1h 30m"
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Format a decimal number to a fixed number of decimal places
 */
export function formatDecimal(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

/**
 * Format a number as percentage
 * @example formatPercentage(0.75) -> "75%"
 * @example formatPercentage(0.333) -> "33.3%"
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format weight (in kg) with appropriate unit
 * @example formatWeight(75.5) -> "75.5 kg"
 * @example formatWeight(75.5, 'lbs') -> "166.4 lbs"
 */
export function formatWeight(weightKg: number, unit: 'kg' | 'lbs' = 'kg'): string {
  if (unit === 'lbs') {
    return `${(weightKg * 2.20462).toFixed(1)} lbs`;
  }
  return `${weightKg.toFixed(1)} kg`;
}

/**
 * Format height (in cm) with appropriate unit
 * @example formatHeight(175) -> "175 cm"
 * @example formatHeight(175, 'ft') -> "5'9\""
 */
export function formatHeight(heightCm: number, unit: 'cm' | 'ft' = 'cm'): string {
  if (unit === 'ft') {
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }
  return `${heightCm} cm`;
}

/**
 * Capitalize first letter of string
 * @example capitalize('hello world') -> "Hello world"
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert snake_case to Title Case
 * @example toTitleCase('weight_loss') -> "Weight Loss"
 */
export function toTitleCase(str: string): string {
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Truncate text with ellipsis
 * @example truncate('Long text here', 10) -> "Long text..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
