import { Card, CardContent, CardFooter, CardHeader } from '@/components/atoms/ui/card'
import { Badge } from '@/components/atoms/ui/badge'
import { Button } from '@/components/atoms/ui/button'
import { Clock, Users, Flame } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Meal } from '@/types'

interface MealCardProps {
  meal: Meal
  showActions?: boolean
}

export function MealCard({ meal, showActions = true }: MealCardProps) {
  const totalTime = (meal.prep_time || 0) + (meal.cook_time || 0)

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      {meal.image_url && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={meal.image_url}
            alt={meal.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-semibold">{meal.name}</h3>
          {meal.difficulty_level && (
            <Badge variant="outline" className="capitalize">
              {meal.difficulty_level}
            </Badge>
          )}
        </div>
        {meal.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{meal.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Nutrition Info */}
        <div className="grid grid-cols-4 gap-2 rounded-lg bg-muted/50 p-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-medium">{meal.calories_per_serving || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">cal</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium">{meal.protein_per_serving || 0}g</p>
            <p className="text-xs text-muted-foreground">protein</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium">{meal.carbs_per_serving || 0}g</p>
            <p className="text-xs text-muted-foreground">carbs</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium">{meal.fats_per_serving || 0}g</p>
            <p className="text-xs text-muted-foreground">fats</p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          {meal.servings && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{meal.servings} servings</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {meal.tags && meal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meal.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {meal.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{meal.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/meals/${meal.id}`}>View Recipe</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
