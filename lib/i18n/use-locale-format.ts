'use client'

import { useFormatter, useLocale } from 'next-intl'
import { getCupSize } from './units'

export function useLocaleFormat() {
  const format = useFormatter()
  const locale = useLocale() as 'en' | 'ja'

  const isJapanese = locale === 'ja'

  return {
    locale,
    isJapanese,

    /**
     * Format numbers with locale-specific formatting
     */
    number: (value: number, options?: Intl.NumberFormatOptions) => format.number(value, options),

    /**
     * Format dates with locale-specific formatting
     */
    date: (date: Date) => format.dateTime(date),

    /**
     * Format weight with appropriate unit
     * Japanese: always kg
     * English: kg by default (user preference can be added later)
     */
    weight: (value: number) => {
      if (isJapanese) {
        return `${format.number(value, { maximumFractionDigits: 1 })} kg`
      }
      // For English, use kg as default (can be extended with user preference)
      return `${format.number(value, { maximumFractionDigits: 1 })} kg`
    },

    /**
     * Format height with appropriate unit
     * Japanese: always cm
     * English: cm by default (user preference can be added later)
     */
    height: (value: number) => {
      if (isJapanese) {
        return `${format.number(value, { maximumFractionDigits: 0 })} cm`
      }
      return `${format.number(value, { maximumFractionDigits: 0 })} cm`
    },

    /**
     * Format volume for cooking measurements
     * Japanese: 200mL cups
     * English: 240mL cups
     */
    volume: (value: number, unit: 'ml' | 'cups') => {
      if (unit === 'cups') {
        const cupSize = getCupSize(locale)
        return isJapanese
          ? `${format.number(value)} カップ (${cupSize}mL)`
          : `${format.number(value)} cups (${cupSize}mL)`
      }
      return `${format.number(value)} mL`
    },

    /**
     * Format currency
     * Japanese: ¥ (JPY)
     * English: $ (USD)
     */
    currency: (value: number) => {
      const currency = isJapanese ? 'JPY' : 'USD'
      return format.number(value, {
        style: 'currency',
        currency,
      })
    },

    /**
     * Format macronutrients (protein, carbs, fats) in grams
     */
    macros: (value: number) => {
      return `${format.number(value, { maximumFractionDigits: 0 })}g`
    },

    /**
     * Format calories
     */
    calories: (value: number) => {
      return format.number(value, { maximumFractionDigits: 0 })
    },
  }
}
