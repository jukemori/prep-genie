import { Checkbox } from '@/components/atoms/ui/checkbox'
import { Badge } from '@/components/atoms/ui/badge'

interface Ingredient {
  name: string
  quantity: number
  unit: string
  category?: string
}

interface IngredientItemProps {
  ingredient: Ingredient
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  showCheckbox?: boolean
  showCategory?: boolean
}

export function IngredientItem({
  ingredient,
  checked = false,
  onCheckedChange,
  showCheckbox = false,
  showCategory = false,
}: IngredientItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      {showCheckbox && onCheckedChange && (
        <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{ingredient.name}</p>
          {showCategory && ingredient.category && (
            <Badge variant="outline" className="text-xs capitalize">
              {ingredient.category}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {ingredient.quantity} {ingredient.unit}
        </p>
      </div>
    </div>
  )
}
