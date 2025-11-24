'use client'

import { Heart } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Button } from '@/components/atoms/ui/button'
import { saveMealToFavorites, removeMealFromFavorites } from '@/features/meals/actions'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  mealId: string
  initialIsSaved: boolean
}

export function FavoriteButton({ mealId, initialIsSaved }: FavoriteButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      if (isSaved) {
        const result = await removeMealFromFavorites(mealId)
        if (result.error) {
          toast.error(result.error)
        } else {
          setIsSaved(false)
          toast.success('Removed from favorites')
        }
      } else {
        const result = await saveMealToFavorites(mealId)
        if (result.error) {
          toast.error(result.error)
        } else {
          setIsSaved(true)
          toast.success('Saved to favorites')
        }
      }
    })
  }

  return (
    <Button
      variant={isSaved ? 'default' : 'outline'}
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
    </Button>
  )
}
