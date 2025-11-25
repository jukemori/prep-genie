import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/ui/tabs'
import { AccountSettings } from '@/features/settings/components/account-settings'
import { AppPreferencesSettings } from '@/features/settings/components/app-preferences-settings'
import { LanguageUnitsSettings } from '@/features/settings/components/language-units-settings'
import { NutritionTargetsSettings } from '@/features/settings/components/nutrition-targets-settings'
import { ProfileSettings } from '@/features/settings/components/profile-settings'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const t = await getTranslations('settings')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('settings')}</h1>
        <p className="text-muted-foreground mt-2">{t('manage_settings')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="language">{t('language')}</TabsTrigger>
          <TabsTrigger value="nutrition">{t('nutrition')}</TabsTrigger>
          <TabsTrigger value="account">{t('account')}</TabsTrigger>
          <TabsTrigger value="preferences">{t('preferences')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile_settings')}</CardTitle>
              <CardDescription>{t('profile_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettings profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{t('language_units')}</CardTitle>
              <CardDescription>{t('language_units_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageUnitsSettings profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition">
          <Card>
            <CardHeader>
              <CardTitle>{t('nutrition_targets')}</CardTitle>
              <CardDescription>{t('nutrition_targets_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <NutritionTargetsSettings profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t('account_management')}</CardTitle>
              <CardDescription>{t('account_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettings user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>{t('app_preferences')}</CardTitle>
              <CardDescription>{t('app_preferences_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <AppPreferencesSettings profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
