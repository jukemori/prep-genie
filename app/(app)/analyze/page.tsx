import { redirect } from 'next/navigation'
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
        <h1 className="text-3xl font-bold">Recipe Nutrition Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Analyze any recipe to get complete nutrition information and AI-powered improvement
          suggestions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Recipe</CardTitle>
          <CardDescription>
            Paste a recipe URL or enter the recipe text to get detailed nutrition analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeAnalyzer locale={locale} />
        </CardContent>
      </Card>
    </div>
  )
}
