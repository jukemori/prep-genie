'use client'

import { Clock, DollarSign, Leaf, Loader2, RefreshCw, TrendingUp } from 'lucide-react'
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
        toast.success('Meal swapped successfully!')
        onSwapComplete?.()
      }
    } catch (_error) {
      toast.error('Failed to swap meal')
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
                Swapping...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Swap Meal
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Swap Options</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() =>
              initiateSwap('Budget Swap', 'Replace with cheaper ingredients', {
                swapType: 'budget',
              })
            }
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Budget Swap
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => initiateSwap('Speed Swap', 'Faster cooking time', { swapType: 'speed' })}
          >
            <Clock className="mr-2 h-4 w-4" />
            Speed Swap
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Leaf className="mr-2 h-4 w-4" />
              Dietary Swap
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() =>
                  initiateSwap('Dairy-Free Swap', 'Remove all dairy products', {
                    swapType: 'dietary',
                    dietaryRestriction: 'dairy_free',
                  })
                }
              >
                Dairy-Free
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  initiateSwap('Gluten-Free Swap', 'Remove all gluten', {
                    swapType: 'dietary',
                    dietaryRestriction: 'gluten_free',
                  })
                }
              >
                Gluten-Free
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  initiateSwap('Vegan Swap', 'Plant-based only', {
                    swapType: 'dietary',
                    dietaryRestriction: 'vegan',
                  })
                }
              >
                Vegan
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  initiateSwap('Low-FODMAP Swap', 'Low-FODMAP ingredients', {
                    swapType: 'dietary',
                    dietaryRestriction: 'low_fodmap',
                  })
                }
              >
                Low-FODMAP
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <TrendingUp className="mr-2 h-4 w-4" />
              Macro Swap
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() =>
                  initiateSwap('High-Protein Swap', 'Boost protein content', {
                    swapType: 'macro',
                    macroGoal: 'high_protein',
                  })
                }
              >
                High-Protein
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  initiateSwap('Low-Carb Swap', 'Reduce carbohydrates', {
                    swapType: 'macro',
                    macroGoal: 'low_carb',
                  })
                }
              >
                Low-Carb
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  initiateSwap('Low-Fat Swap', 'Reduce fat content', {
                    swapType: 'macro',
                    macroGoal: 'low_fat',
                  })
                }
              >
                Low-Fat
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
              Current meal: <strong>{mealName}</strong>
              <br />
              <br />
              This will replace the current meal with an AI-generated alternative that matches your
              criteria while maintaining your dietary preferences and nutrition goals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
              {isSwapping ? 'Swapping...' : 'Confirm Swap'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
