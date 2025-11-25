'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent } from '@/components/atoms/ui/card'
import { generateGroceryListFromMealPlan } from '@/features/grocery-lists/actions'

export default function GenerateGroceryListPage() {
  const t = useTranslations('generate_grocery_list_page')
  const router = useRouter()
  const searchParams = useSearchParams()
  const mealPlanId = searchParams.get('mealPlanId')

  const [_generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mealPlanId) {
      router.push('/meal-plans')
      return
    }

    async function generate() {
      setGenerating(true)
      setError(null)

      const result = await generateGroceryListFromMealPlan(mealPlanId || '')

      if (result.error) {
        setError(result.error)
        setGenerating(false)
      } else if (result.data) {
        router.push(`/grocery-lists/${result.data.id}`)
      }
    }

    generate()
  }, [mealPlanId, router])

  if (error) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/grocery-lists">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back_to_lists')}
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="mb-2 text-lg font-semibold">{t('generation_failed')}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{error}</p>
            <Button asChild>
              <Link href="/grocery-lists">{t('back_to_lists')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
          <h3 className="mb-2 text-lg font-semibold">{t('generating_title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('generating_description')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
