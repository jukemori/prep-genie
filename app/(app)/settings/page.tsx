import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { ProfileSettings } from '@/features/settings/components/profile-settings'
import { LanguageUnitsSettings } from '@/features/settings/components/language-units-settings'
import { NutritionTargetsSettings } from '@/features/settings/components/nutrition-targets-settings'
import { AccountSettings } from '@/features/settings/components/account-settings'
import { AppPreferencesSettings } from '@/features/settings/components/app-preferences-settings'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()

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
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information and fitness goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettings profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>Language & Units</CardTitle>
              <CardDescription>
                Change your language and measurement preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageUnitsSettings profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Targets</CardTitle>
              <CardDescription>
                View and customize your daily calorie and macro targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NutritionTargetsSettings profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>
                Manage your account security and data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettings user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>
                Customize your PrepGenie experience
              </CardDescription>
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
