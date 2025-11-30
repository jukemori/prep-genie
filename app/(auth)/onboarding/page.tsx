'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { Button } from '@/components/atoms/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card'
import { Checkbox } from '@/components/atoms/ui/checkbox'
import { Input } from '@/components/atoms/ui/input'
import { Label } from '@/components/atoms/ui/label'
import { Progress } from '@/components/atoms/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select'
import { createUserProfile } from '@/features/user-profile/actions'

type Step = 0 | 1 | 2 | 3 | 4 | 5

const TOTAL_STEPS = 5

const ALLERGIES = ['dairy', 'eggs', 'nuts', 'shellfish', 'soy', 'gluten'] as const

export default function OnboardingPage() {
  const t = useTranslations('onboarding')
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState<Step>(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: '',
    goal: '',
    dietaryPreference: '',
    allergies: [] as string[],
    budgetLevel: '',
    cookingSkillLevel: '',
    timeAvailable: '',
  })

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const progress = (step / TOTAL_STEPS) * 100

  function handleLanguageChange(newLocale: string) {
    startTransition(async () => {
      try {
        const response = await fetch('/api/locale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: newLocale }),
        })

        if (response.ok) {
          window.location.reload()
        }
      } catch {
        // Silently fail
      }
    })
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const submitFormData = new FormData()
    submitFormData.append('age', formData.age)
    submitFormData.append('weight', formData.weight)
    submitFormData.append('height', formData.height)
    submitFormData.append('gender', formData.gender)
    submitFormData.append('activityLevel', formData.activityLevel)
    submitFormData.append('goal', formData.goal)
    submitFormData.append('dietaryPreference', formData.dietaryPreference)
    submitFormData.append('allergies', formData.allergies.join(','))
    submitFormData.append('budgetLevel', formData.budgetLevel)
    submitFormData.append('cookingSkillLevel', formData.cookingSkillLevel)
    submitFormData.append('timeAvailable', formData.timeAvailable)

    const result = await createUserProfile(submitFormData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((step + 1) as Step)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((step - 1) as Step)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 0:
        return true // Language selection - always can proceed
      case 1:
        return formData.age && formData.weight && formData.height && formData.gender
      case 2:
        return formData.activityLevel && formData.goal
      case 3:
        return formData.dietaryPreference
      case 4:
        return true // Optional step
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('welcome')}</CardTitle>
          <CardDescription>
            {t('lets_personalize')} - {t('step_of', { step: step + 1, total: TOTAL_STEPS + 1 })}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 0: Language Selection */}
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('select_language')}</h3>
                <p className="text-sm text-muted-foreground">{t('select_language_description')}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Button
                    variant={locale === 'en' ? 'default' : 'outline'}
                    className="h-20 text-lg"
                    onClick={() => locale !== 'en' && handleLanguageChange('en')}
                    disabled={isPending}
                  >
                    🇺🇸 English
                  </Button>
                  <Button
                    variant={locale === 'ja' ? 'default' : 'outline'}
                    className="h-20 text-lg"
                    onClick={() => locale !== 'ja' && handleLanguageChange('ja')}
                    disabled={isPending}
                  >
                    🇯🇵 日本語
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('basic_info')}</h3>
                <p className="text-sm text-muted-foreground">{t('basic_info_description')}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age">{t('age')}</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => updateField('age', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('gender')}</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => updateField('gender', value)}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder={t('select_gender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('male')}</SelectItem>
                        <SelectItem value="female">{t('female')}</SelectItem>
                        <SelectItem value="other">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">{t('weight')}</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => updateField('weight', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">{t('height')}</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={formData.height}
                      onChange={(e) => updateField('height', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Fitness & Goals */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('fitness_goals')}</h3>
                <p className="text-sm text-muted-foreground">{t('fitness_goals_description')}</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">{t('activity_level')}</Label>
                    <Select
                      value={formData.activityLevel}
                      onValueChange={(value) => updateField('activityLevel', value)}
                    >
                      <SelectTrigger id="activityLevel">
                        <SelectValue placeholder={t('select_activity_level')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">{t('sedentary')}</SelectItem>
                        <SelectItem value="light">{t('light')}</SelectItem>
                        <SelectItem value="moderate">{t('moderate')}</SelectItem>
                        <SelectItem value="active">{t('active')}</SelectItem>
                        <SelectItem value="very_active">{t('very_active')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">{t('primary_goal')}</Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(value) => updateField('goal', value)}
                    >
                      <SelectTrigger id="goal">
                        <SelectValue placeholder={t('select_goal')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">{t('weight_loss')}</SelectItem>
                        <SelectItem value="maintain">{t('maintain')}</SelectItem>
                        <SelectItem value="muscle_gain">{t('muscle_gain')}</SelectItem>
                        <SelectItem value="balanced">{t('balanced')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Dietary Preferences */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('dietary_preferences')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('dietary_preferences_description')}
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dietaryPreference">{t('diet_type')}</Label>
                    <Select
                      value={formData.dietaryPreference}
                      onValueChange={(value) => updateField('dietaryPreference', value)}
                    >
                      <SelectTrigger id="dietaryPreference">
                        <SelectValue placeholder={t('select_diet_type')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="omnivore">{t('omnivore')}</SelectItem>
                        <SelectItem value="vegetarian">{t('vegetarian')}</SelectItem>
                        <SelectItem value="vegan">{t('vegan')}</SelectItem>
                        <SelectItem value="pescatarian">{t('pescatarian')}</SelectItem>
                        <SelectItem value="halal">{t('halal')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('allergies')}</Label>
                    <p className="text-sm text-muted-foreground">{t('allergies_description')}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {ALLERGIES.map((allergen) => (
                        <div key={allergen} className="flex items-center space-x-2">
                          <Checkbox
                            id={allergen}
                            checked={formData.allergies.includes(allergen)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateField('allergies', [...formData.allergies, allergen])
                              } else {
                                updateField(
                                  'allergies',
                                  formData.allergies.filter((a) => a !== allergen)
                                )
                              }
                            }}
                          />
                          <Label htmlFor={allergen} className="cursor-pointer font-normal">
                            {t(allergen)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Cooking Preferences */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('cooking_preferences')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('cooking_preferences_description')}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cookingSkillLevel">{t('cooking_skill')}</Label>
                    <Select
                      value={formData.cookingSkillLevel}
                      onValueChange={(value) => updateField('cookingSkillLevel', value)}
                    >
                      <SelectTrigger id="cookingSkillLevel">
                        <SelectValue placeholder={t('select_skill_level')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">{t('beginner')}</SelectItem>
                        <SelectItem value="intermediate">{t('intermediate')}</SelectItem>
                        <SelectItem value="advanced">{t('advanced')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetLevel">{t('budget_level')}</Label>
                    <Select
                      value={formData.budgetLevel}
                      onValueChange={(value) => updateField('budgetLevel', value)}
                    >
                      <SelectTrigger id="budgetLevel">
                        <SelectValue placeholder={t('select_budget')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('low_budget')}</SelectItem>
                        <SelectItem value="medium">{t('medium_budget')}</SelectItem>
                        <SelectItem value="high">{t('high_budget')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="timeAvailable">
                      {t('time_available')} ({t('minutes_per_day')})
                    </Label>
                    <Input
                      id="timeAvailable"
                      type="number"
                      placeholder="60"
                      value={formData.timeAvailable}
                      onChange={(e) => updateField('timeAvailable', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 0 || loading || isPending}
              >
                {t('back')}
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed() || loading || isPending}
              >
                {step === TOTAL_STEPS - 1
                  ? loading
                    ? t('creating_profile')
                    : t('complete')
                  : t('next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
