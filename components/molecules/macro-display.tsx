import { Progress } from '@/components/atoms/ui/progress'
import { Card, CardContent } from '@/components/atoms/ui/card'

interface MacroDisplayProps {
  protein: number
  carbs: number
  fats: number
  targetProtein?: number
  targetCarbs?: number
  targetFats?: number
  showProgress?: boolean
}

export function MacroDisplay({
  protein,
  carbs,
  fats,
  targetProtein,
  targetCarbs,
  targetFats,
  showProgress = false,
}: MacroDisplayProps) {
  const proteinPercent = targetProtein ? (protein / targetProtein) * 100 : 0
  const carbsPercent = targetCarbs ? (carbs / targetCarbs) * 100 : 0
  const fatsPercent = targetFats ? (fats / targetFats) * 100 : 0

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {/* Protein */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Protein</span>
            <span className="text-sm text-muted-foreground">
              {protein}g {targetProtein && `/ ${targetProtein}g`}
            </span>
          </div>
          {showProgress && targetProtein && (
            <Progress value={proteinPercent} className="h-2" />
          )}
        </div>

        {/* Carbs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Carbs</span>
            <span className="text-sm text-muted-foreground">
              {carbs}g {targetCarbs && `/ ${targetCarbs}g`}
            </span>
          </div>
          {showProgress && targetCarbs && (
            <Progress value={carbsPercent} className="h-2" />
          )}
        </div>

        {/* Fats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Fats</span>
            <span className="text-sm text-muted-foreground">
              {fats}g {targetFats && `/ ${targetFats}g`}
            </span>
          </div>
          {showProgress && targetFats && (
            <Progress value={fatsPercent} className="h-2" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
