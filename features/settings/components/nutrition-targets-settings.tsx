'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/atoms/ui/alert-dialog'
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
import type { Tables } from '@/types/database'
import { resetNutritionTargets, updateNutritionTargets } from '../actions'

const nutritionSchema = z.object({
  daily_calorie_target: z.coerce.number().min(1000).max(5000),
  target_protein: z.coerce.number().min(30).max(500),
  target_carbs: z.coerce.number().min(50).max(800),
  target_fats: z.coerce.number().min(20).max(300),
})

type NutritionFormValues = z.infer<typeof nutritionSchema>

interface NutritionTargetsSettingsProps {
  profile: Tables<'user_profiles'>
}

export function NutritionTargetsSettings({ profile }: NutritionTargetsSettingsProps) {
  const t = useTranslations('settings')
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const form = useForm({
    resolver: zodResolver(nutritionSchema),
    defaultValues: {
      daily_calorie_target: profile.daily_calorie_target || 2000,
      target_protein: profile.target_protein || 150,
      target_carbs: profile.target_carbs || 200,
      target_fats: profile.target_fats || 65,
    },
  })

  async function onSubmit(data: NutritionFormValues) {
    setIsLoading(true)
    try {
      const result = await updateNutritionTargets(data)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(t('nutrition_updated_success'))
      }
    } catch (_error) {
      toast.error(t('nutrition_update_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleReset() {
    setIsResetting(true)
    try {
      const result = await resetNutritionTargets()

      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        // Update form with recalculated values
        form.setValue('daily_calorie_target', result.data.daily_calorie_target)
        form.setValue('target_protein', result.data.target_protein)
        form.setValue('target_carbs', result.data.target_carbs)
        form.setValue('target_fats', result.data.target_fats)
        toast.success(t('nutrition_reset_success'))
      }
    } catch (_error) {
      toast.error(t('nutrition_reset_failed'))
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-2">{t('current_tdee')}</h3>
        <p className="text-2xl font-bold">
          {profile.tdee} {t('kcal_per_day')}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{t('tdee_description')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="daily_calorie_target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('daily_calorie_target')}</FormLabel>
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
                <FormDescription>{t('customize_calorie_goal')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="target_protein"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('protein_g')}</FormLabel>
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
              name="target_carbs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('carbs_g')}</FormLabel>
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
              name="target_fats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fats_g')}</FormLabel>
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

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('saving') : t('save_changes')}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" disabled={isResetting}>
                  {t('reset_to_ai')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('reset_nutrition_title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('reset_nutrition_description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    {isResetting ? t('resetting') : t('reset')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </Form>
    </div>
  )
}
