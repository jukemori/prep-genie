import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card'
import { RecipeAnalyzer } from '@/features/recipes/components/recipe-analyzer'
import { createClient } from '@/lib/supabase/server'

export default async function AnalyzePage() {
  const supabase = await createClient()
  const t = await getTranslations('analyze_page')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile for locale
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('locale')
    .eq('id', user.id)
    .single()

  const locale = (profile?.locale || 'en') as 'en' | 'ja'

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('analyze')}</CardTitle>
          <CardDescription>{t('analyze_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeAnalyzer locale={locale} />
        </CardContent>
      </Card>
    </div>
  )
}
