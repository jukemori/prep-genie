'use client'

import { useEffect, useState } from 'react'
import { getProgressLogs, logProgress } from '@/features/progress/api/actions'
import { Button } from '@/components/atoms/ui/button'
import { Input } from '@/components/atoms/ui/input'
import { Label } from '@/components/atoms/ui/label'
import { Textarea } from '@/components/atoms/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { Badge } from '@/components/atoms/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/ui/tabs'
import { Calendar, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ProgressPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Get last 30 days of logs
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const result = await getProgressLogs(thirtyDaysAgo)
      if (result.data) {
        setLogs(result.data)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await logProgress(formData)

    if (result.error) {
      setError(result.error)
    } else {
      // Reload logs
      const logsResult = await getProgressLogs()
      if (logsResult.data) {
        setLogs(logsResult.data)
      }
      // Reset form
      e.currentTarget.reset()
    }

    setSubmitting(false)
  }

  const todayLog = logs.find(log => log.log_date === today)
  const latestWeight = logs.find(log => log.weight)?.weight
  const startWeight = logs.length > 0 ? logs[logs.length - 1]?.weight : null
  const weightChange = latestWeight && startWeight ? latestWeight - startWeight : null

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progress Tracking</h1>
        <p className="text-muted-foreground">
          Log and monitor your nutrition and fitness progress
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestWeight ? `${latestWeight} kg` : 'Not logged'}
            </div>
            {weightChange !== null && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {weightChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-red-500" />
                ) : weightChange < 0 ? (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                <span>
                  {weightChange > 0 ? '+' : ''}
                  {weightChange.toFixed(1)} kg
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayLog?.calories_consumed || 0}/{profile?.daily_calorie_target || 0}
            </div>
            <p className="text-xs text-muted-foreground">kcal consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logs This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">entries recorded</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="log" className="space-y-4">
        <TabsList>
          <TabsTrigger value="log">Log Today</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="logDate" value={today} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.1"
                      placeholder={latestWeight?.toString() || ''}
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caloriesConsumed">Calories Consumed</Label>
                    <Input
                      id="caloriesConsumed"
                      name="caloriesConsumed"
                      type="number"
                      placeholder="2000"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proteinConsumed">Protein (g)</Label>
                    <Input
                      id="proteinConsumed"
                      name="proteinConsumed"
                      type="number"
                      placeholder={profile?.target_protein?.toString() || ''}
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carbsConsumed">Carbs (g)</Label>
                    <Input
                      id="carbsConsumed"
                      name="carbsConsumed"
                      type="number"
                      placeholder={profile?.target_carbs?.toString() || ''}
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fatsConsumed">Fats (g)</Label>
                    <Input
                      id="fatsConsumed"
                      name="fatsConsumed"
                      type="number"
                      placeholder={profile?.target_fats?.toString() || ''}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="How are you feeling? Any observations?"
                    rows={3}
                    disabled={submitting}
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Log Progress'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {logs.length > 0 ? (
            logs.map((log) => (
              <Card key={log.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">
                      {new Date(log.log_date).toLocaleDateString()}
                    </CardTitle>
                  </div>
                  {log.log_date === today && (
                    <Badge variant="default">Today</Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
                    {log.weight && (
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-medium">{log.weight} kg</p>
                      </div>
                    )}
                    {log.calories_consumed && (
                      <div>
                        <p className="text-muted-foreground">Calories</p>
                        <p className="font-medium">{log.calories_consumed}</p>
                      </div>
                    )}
                    {log.protein_consumed && (
                      <div>
                        <p className="text-muted-foreground">Protein</p>
                        <p className="font-medium">{log.protein_consumed}g</p>
                      </div>
                    )}
                    {log.carbs_consumed && (
                      <div>
                        <p className="text-muted-foreground">Carbs</p>
                        <p className="font-medium">{log.carbs_consumed}g</p>
                      </div>
                    )}
                    {log.fats_consumed && (
                      <div>
                        <p className="text-muted-foreground">Fats</p>
                        <p className="font-medium">{log.fats_consumed}g</p>
                      </div>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No progress logs yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start logging your daily progress to track your journey
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
