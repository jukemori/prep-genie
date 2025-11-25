'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/atoms/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/atoms/ui/form'
import { Input } from '@/components/atoms/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select'
import type { Tables } from '@/types/database'
import { updateProfile } from '../actions'

const profileSchema = z.object({
  age: z.coerce.number().min(13).max(120),
  weight: z.coerce.number().min(30).max(300),
  height: z.coerce.number().min(100).max(250),
  gender: z.enum(['male', 'female', 'other']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['weight_loss', 'maintain', 'muscle_gain', 'balanced']),
  dietary_preference: z.enum(['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'halal']),
  cooking_skill_level: z.enum(['beginner', 'intermediate', 'advanced']),
  time_available: z.coerce.number().min(10).max(300),
  budget_level: z.enum(['low', 'medium', 'high']),
  allergies: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileSettingsProps {
  profile: Tables<'user_profiles'>
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('settings')

  // Get unit system from profile (default to 'metric' if not set)
  const unitSystem = (profile.unit_system as 'metric' | 'imperial') || 'metric'
  const isImperial = unitSystem === 'imperial'

  // Dynamic labels based on unit system
  const weightLabel = isImperial ? t('weight_lb') : t('weight_kg')
  const heightLabel = isImperial ? t('height_ft_in') : t('height_cm')

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: profile.age || 0,
      weight: profile.weight ? Number(profile.weight) : 0,
      height: profile.height ? Number(profile.height) : 0,
      gender: (profile.gender as 'male' | 'female' | 'other' | undefined) || 'other',
      activity_level:
        (profile.activity_level as
          | 'sedentary'
          | 'light'
          | 'moderate'
          | 'active'
          | 'very_active'
          | undefined) || 'moderate',
      goal:
        (profile.goal as 'weight_loss' | 'maintain' | 'muscle_gain' | 'balanced' | undefined) ||
        'maintain',
      dietary_preference:
        (profile.dietary_preference as
          | 'omnivore'
          | 'vegetarian'
          | 'vegan'
          | 'pescatarian'
          | 'halal'
          | undefined) || 'omnivore',
      cooking_skill_level:
        (profile.cooking_skill_level as 'beginner' | 'intermediate' | 'advanced' | undefined) ||
        'intermediate',
      time_available: profile.time_available || 60,
      budget_level: (profile.budget_level as 'low' | 'medium' | 'high' | undefined) || 'medium',
      allergies: profile.allergies?.join(', ') || '',
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    try {
      const allergiesArray = data.allergies
        ? data.allergies
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean)
        : []

      const result = await updateProfile({
        ...data,
        allergies: allergiesArray,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Profile updated successfully!')
      }
    } catch (_error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('age')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value as number}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    disabled={field.disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('gender')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('gender')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">{t('male')}</SelectItem>
                    <SelectItem value="female">{t('female')}</SelectItem>
                    <SelectItem value="other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{weightLabel}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    value={field.value as number}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    disabled={field.disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{heightLabel}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value as number}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    disabled={field.disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="activity_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('activity_level')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('activity_level')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sedentary">{t('sedentary')}</SelectItem>
                  <SelectItem value="light">{t('light')}</SelectItem>
                  <SelectItem value="moderate">{t('moderate')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="very_active">{t('very_active')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fitness_goal')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('fitness_goal')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="weight_loss">{t('weight_loss')}</SelectItem>
                  <SelectItem value="maintain">{t('maintain')}</SelectItem>
                  <SelectItem value="muscle_gain">{t('muscle_gain')}</SelectItem>
                  <SelectItem value="balanced">{t('balanced')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dietary_preference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('dietary_preference')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('dietary_preference')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="omnivore">{t('omnivore')}</SelectItem>
                  <SelectItem value="vegetarian">{t('vegetarian')}</SelectItem>
                  <SelectItem value="vegan">{t('vegan')}</SelectItem>
                  <SelectItem value="pescatarian">{t('pescatarian')}</SelectItem>
                  <SelectItem value="halal">{t('halal')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('allergies')}</FormLabel>
              <FormControl>
                <Input placeholder={t('allergies_placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('allergies_description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cooking_skill_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('cooking_skill')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('cooking_skill')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">{t('beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('advanced')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time_available"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('time_available')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value as number}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    disabled={field.disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="budget_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('budget_level')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('budget_level')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">{t('low')}</SelectItem>
                  <SelectItem value="medium">{t('medium')}</SelectItem>
                  <SelectItem value="high">{t('high')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? t('saving') : t('save_changes')}
        </Button>
      </form>
    </Form>
  )
}
