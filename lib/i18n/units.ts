export type WeightUnit = 'kg' | 'lb'
export type HeightUnit = 'cm' | 'ft_in'
export type VolumeUnit = 'ml' | 'cups_us' | 'cups_jp'
export type Currency = 'USD' | 'JPY'

export const JAPANESE_CUP_ML = 200
export const US_CUP_ML = 240

/**
 * Convert weight between kg and lb
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value
  if (from === 'kg' && to === 'lb') return value * 2.20462
  if (from === 'lb' && to === 'kg') return value / 2.20462
  return value
}

/**
 * Convert height between cm and ft/in
 * For ft_in, value is stored as decimal (e.g., 5.11 = 5ft 11in)
 */
export function convertHeight(value: number, from: HeightUnit, to: HeightUnit): number {
  if (from === to) return value

  if (from === 'cm' && to === 'ft_in') {
    const totalInches = value / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return feet + inches / 100 // Store as decimal (e.g., 5.11 = 5ft 11in)
  }

  if (from === 'ft_in' && to === 'cm') {
    const feet = Math.floor(value)
    const inches = Math.round((value - feet) * 100)
    return (feet * 12 + inches) * 2.54
  }

  return value
}

/**
 * Convert volume between mL and cups (US/JP)
 */
export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): number {
  if (from === to) return value

  // Convert to mL first
  let ml = value
  if (from === 'cups_us') ml = value * US_CUP_ML
  if (from === 'cups_jp') ml = value * JAPANESE_CUP_ML

  // Convert from mL to target
  if (to === 'ml') return ml
  if (to === 'cups_us') return ml / US_CUP_ML
  if (to === 'cups_jp') return ml / JAPANESE_CUP_ML

  return value
}

/**
 * Format currency based on locale and currency type
 */
export function formatCurrency(amount: number, currency: Currency, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Get cup size in mL based on locale
 */
export function getCupSize(locale: 'en' | 'ja'): number {
  return locale === 'ja' ? JAPANESE_CUP_ML : US_CUP_ML
}
