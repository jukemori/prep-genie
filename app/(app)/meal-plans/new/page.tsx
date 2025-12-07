'use client'

import { ArrowLeft, Construction, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent } from '@/components/atoms/ui/card'

export default function NewMealPlanPage() {
  const t = useTranslations('meal_plans_new')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/meal-plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back_to_meal_plans')}
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold">{t('coming_soon')}</h2>
          <p className="mb-8 max-w-md text-center text-muted-foreground">
            {t('coming_soon_description')}
          </p>
          <Button asChild>
            <Link href="/meal-plans/generate">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('try_quick_generate')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
