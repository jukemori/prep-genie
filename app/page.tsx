'use client'

import {
  ArrowRight,
  CalendarDays,
  ChefHat,
  Clock,
  Coffee,
  Flame,
  Globe2,
  RefreshCw,
  Salad,
  ShoppingCart,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/atoms/ui/badge'
import { Button } from '@/components/atoms/ui/button'
import { Card } from '@/components/atoms/ui/card'
import { LanguageSwitcher } from '@/components/molecules/language-switcher'

const mockMeals = [
  { name: 'Grilled Salmon Bowl', calories: 520, time: 25, type: 'dinner', icon: UtensilsCrossed },
  { name: 'Greek Yogurt Parfait', calories: 340, time: 10, type: 'breakfast', icon: Coffee },
  { name: 'Chicken Stir Fry', calories: 480, time: 20, type: 'lunch', icon: Salad },
]

const cuisines = ['Japanese', 'Korean', 'Mediterranean', 'Western', 'Halal']

export default function LandingPage() {
  const t = useTranslations('landing')
  const tCommon = useTranslations('common')

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ChefHat className="size-7 text-primary" />
            <span className="text-xl font-bold">{tCommon('app_name')}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link href="/login">{t('sign_in')}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t('get_started')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Copy */}
          <div className="space-y-6">
            <Badge variant="secondary" className="gap-2 px-3 py-1.5">
              <Utensils className="size-3.5" />
              {t('hero_badge')}
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t('hero_title_line1')}
              <span className="block text-primary">{t('hero_title_line2')}</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">{t('hero_subtitle')}</p>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  {t('get_started')}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">{t('sign_in')}</Link>
              </Button>
            </div>
            {/* Cuisines */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <span className="text-sm text-muted-foreground">{t('cuisines_available')}</span>
              {cuisines.map((c) => (
                <span key={c} className="text-sm text-muted-foreground">
                  {c}
                  {c !== 'Halal' && ' ·'}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Visual Preview */}
          <div className="relative">
            <Card className="border p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-5 text-muted-foreground" />
                  <span className="font-semibold">{t('preview_title')}</span>
                </div>
                <Badge variant="outline">{t('preview_badge')}</Badge>
              </div>
              <div className="space-y-3">
                {mockMeals.map((meal) => (
                  <div
                    key={meal.name}
                    className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <meal.icon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{meal.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Flame className="size-3" />
                          {meal.calories} cal
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {meal.time} min
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {meal.type}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
                <span className="text-sm font-medium">{t('preview_daily_total')}</span>
                <span className="font-semibold">1,340 cal</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t('features_title')}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">{t('features_subtitle')}</p>
          </div>

          {/* Bento Grid */}
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Large Card - Meal Planning */}
            <Card className="p-6 md:col-span-2">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="space-y-3">
                  <div className="inline-flex rounded-lg bg-muted p-2.5">
                    <CalendarDays className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{t('feature_meal_plans_title')}</h3>
                  <p className="max-w-md text-muted-foreground">
                    {t('feature_meal_plans_description')}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {[
                    { day: 'M', id: 'mon' },
                    { day: 'T', id: 'tue' },
                    { day: 'W', id: 'wed' },
                    { day: 'T', id: 'thu' },
                    { day: 'F', id: 'fri' },
                    { day: 'S', id: 'sat' },
                    { day: 'S', id: 'sun' },
                  ].map((item, i) => (
                    <div
                      key={item.id}
                      className={`flex size-9 items-center justify-center rounded-md text-xs font-medium ${
                        i < 3
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.day}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Nutrition Card */}
            <Card className="p-6">
              <div className="mb-4 inline-flex rounded-lg bg-muted p-2.5">
                <Utensils className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold">{t('feature_nutrition_title')}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {t('feature_nutrition_description')}
              </p>
              <div className="space-y-2">
                <MacroBar label="Protein" value={120} max={150} />
                <MacroBar label="Carbs" value={200} max={250} />
                <MacroBar label="Fats" value={55} max={70} />
              </div>
            </Card>

            {/* Grocery List Card */}
            <Card className="p-6">
              <div className="mb-4 inline-flex rounded-lg bg-muted p-2.5">
                <ShoppingCart className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold">{t('feature_grocery_title')}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {t('feature_grocery_description')}
              </p>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div>Spinach</div>
                <div>Chicken breast</div>
                <div>Brown rice</div>
                <div className="text-xs">+12 more items...</div>
              </div>
            </Card>

            {/* Swap Card */}
            <Card className="p-6">
              <div className="mb-4 inline-flex rounded-lg bg-muted p-2.5">
                <RefreshCw className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold">{t('feature_swap_title')}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{t('feature_swap_description')}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Budget</Badge>
                <Badge variant="outline">Quick</Badge>
                <Badge variant="outline">Dietary</Badge>
              </div>
            </Card>

            {/* Cuisines Card - Wide */}
            <Card className="p-6 md:col-span-2">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex rounded-lg bg-muted p-2.5">
                    <Globe2 className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{t('feature_cuisine_title')}</h3>
                  <p className="max-w-md text-muted-foreground">
                    {t('feature_cuisine_description')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cuisines.map((c) => (
                    <div key={c} className="rounded-full border px-4 py-2 text-sm">
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t px-4 py-16">
        <div className="container mx-auto">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            <div>
              <div className="text-4xl font-bold">500+</div>
              <p className="mt-1 text-muted-foreground">{t('stat_recipes')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold">5</div>
              <p className="mt-1 text-muted-foreground">{t('stat_cuisines')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold">7</div>
              <p className="mt-1 text-muted-foreground">{t('stat_days')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{t('cta_title')}</h2>
            <p className="mb-8 text-lg text-muted-foreground">{t('cta_subtitle')}</p>
            <Button size="lg" asChild>
              <Link href="/register">
                {t('cta_button')}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {tCommon('app_name')}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function MacroBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {value}g / {max}g
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground/20" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
