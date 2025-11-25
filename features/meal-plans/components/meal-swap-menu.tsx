'use client'

import { Clock, DollarSign, Leaf, Loader2, RefreshCw, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/atoms/ui/alert-dialog'
import { Button } from '@/components/atoms/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/atoms/ui/dropdown-menu'
import { swapMeal } from '../actions'

interface MealSwapMenuProps {
  mealPlanId: string
  mealPlanItemId: string
  mealName: string
  onSwapComplete?: () => void
}

export function MealSwapMenu({
  mealPlanId,
  mealPlanItemId,
  mealName,
  onSwapComplete,
}: MealSwapMenuProps) {
  const t = useTranslations('meal_plan_detail_page')
  const [isSwapping, setIsSwapping] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingSwap, setPendingSwap] = useState<{
    type: string
    description: string
    params: {
      swapType: 'budget' | 'speed' | 'dietary' | 'macro'
      dietaryRestriction?: 'dairy_free' | 'gluten_free' | 'vegan' | 'low_fodmap'
      macroGoal?: 'high_protein' | 'low_carb' | 'low_fat'
    }
  } | null>(null)

  async function handleSwap(
    swapType: 'budget' | 'speed' | 'dietary' | 'macro',
    dietaryRestriction?: 'dairy_free' | 'gluten_free' | 'vegan' | 'low_fodmap',
    macroGoal?: 'high_protein' | 'low_carb' | 'low_fat'
  ) {
    setIsSwapping(true)
    try {
      const result = await swapMeal({
        mealPlanId,
        mealPlanItemId,
        swapType,
        dietaryRestriction,
        macroGoal,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(t('meal_swapped_success'))
        onSwapComplete?.()
      }
    } catch (_error) {
      toast.error(t('meal_swap_failed'))
    } finally {
      setIsSwapping(false)
      setShowConfirmDialog(false)
      setPendingSwap(null)
    }
  }

  function initiateSwap(
    type: string,
    description: string,
    params: {
      swapType: 'budget' | 'speed' | 'dietary' | 'macro'
      dietaryRestriction?: 'dairy_free' | 'gluten_free' | 'vegan' | 'low_fodmap'
      macroGoal?: 'high_protein' | 'low_carb' | 'low_fat'
    }
  ) {
    setPendingSwap({ type, description, params })
    setShowConfirmDialog(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isSwapping}>
            {isSwapping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('swapping')}
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('swap_meal')}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{t('swap_options')}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => initiateSwap(t('budget_swap'), t('budget_swap_description'), { swapType: 'budget' })}>
            <DollarSign className="mr-2 h-4 w-4" />
            {t('budget_swap')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => initiateSwap(t('speed_swap'), t('speed_swap_description'), { swapType: 'speed' })}
          >
            <Clock className="mr-2 h-4 w-4" />
            {t('speed_swap')}
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Leaf className="mr-2 h-4 w-4" />
              {t('dietary_swap')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => initiateSwap(t('dairy_free_swap'), t('dairy_free_description'), { swapType: 'dietary', dietaryRestriction: 'dairy_free' })}>
                {t('dairy_free')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => initiateSwap(t('gluten_free_swap'), t('gluten_free_description'), { swapType: 'dietary', dietaryRestriction: 'gluten_free' })}>
                {t('gluten_free')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => initiateSwap(t('vegan_swap'), t('vegan_description'), { swapType: 'dietary', dietaryRestriction: 'vegan' })}>
                {t('vegan')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => initiateSwap(t('low_fodmap_swap'), t('low_fodmap_description'), { swapType: 'dietary', dietaryRestriction: 'low_fodmap' })}>
                {t('low_fodmap')}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <TrendingUp className="mr-2 h-4 w-4" />
              {t('macro_swap')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => initiateSwap(t('high_protein_swap'), t('high_protein_description'), { swapType: 'macro', macroGoal: 'high_protein' })}>
                {t('high_protein')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => initiateSwap(t('low_carb_swap'), t('low_carb_description'), { swapType: 'macro', macroGoal: 'low_carb' })}>
                {t('low_carb')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => initiateSwap(t('low_fat_swap'), t('low_fat_description'), { swapType: 'macro', macroGoal: 'low_fat' })}>
                {t('low_fat')}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingSwap?.type}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingSwap?.description}
              <br />
              <br />
              {t('current_meal')} <strong>{mealName}</strong>
              <br />
              <br />
              {t('swap_confirmation_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingSwap) {
                  handleSwap(
                    pendingSwap.params.swapType,
                    pendingSwap.params.dietaryRestriction,
                    pendingSwap.params.macroGoal
                  )
                }
              }}
            >
              {isSwapping ? t('swapping') : t('confirm_swap')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
