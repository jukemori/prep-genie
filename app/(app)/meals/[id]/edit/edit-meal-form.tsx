'use client'

import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { Checkbox } from '@/components/atoms/ui/checkbox'
import { Input } from '@/components/atoms/ui/input'
import { Label } from '@/components/atoms/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select'
import { Textarea } from '@/components/atoms/ui/textarea'
import { updateMeal } from '@/features/meals/actions'
import type { Meal } from '@/types'

interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
}

interface Instruction {
  id: string
  text: string
}

interface EditMealFormProps {
  meal: Meal
}

export function EditMealForm({ meal }: EditMealFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Convert meal ingredients to form format
  const initialIngredients: Ingredient[] = Array.isArray(meal.ingredients)
    ? (
        meal.ingredients as Array<{
          name: string
          quantity: number
          unit: string
          category?: string
        }>
      ).map((ing) => ({
        id: crypto.randomUUID(),
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category || 'other',
      }))
    : [{ id: crypto.randomUUID(), name: '', quantity: 0, unit: '', category: 'other' }]

  // Convert meal instructions to form format
  const initialInstructions: Instruction[] =
    meal.instructions && meal.instructions.length > 0
      ? meal.instructions.map((text: string) => ({
          id: crypto.randomUUID(),
          text,
        }))
      : [{ id: crypto.randomUUID(), text: '' }]

  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients)
  const [instructions, setInstructions] = useState<Instruction[]>(initialInstructions)

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: crypto.randomUUID(), name: '', quantity: 0, unit: '', category: 'other' },
    ])
  }

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id))
  }

  const updateIngredient = (
    id: string,
    field: keyof Omit<Ingredient, 'id'>,
    value: string | number
  ) => {
    setIngredients(ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)))
  }

  const addInstruction = () => {
    setInstructions([...instructions, { id: crypto.randomUUID(), text: '' }])
  }

  const removeInstruction = (id: string) => {
    setInstructions(instructions.filter((inst) => inst.id !== id))
  }

  const updateInstruction = (id: string, value: string) => {
    setInstructions(instructions.map((inst) => (inst.id === id ? { ...inst, text: value } : inst)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    // Remove IDs before submitting
    const ingredientsData = ingredients.filter((i) => i.name).map(({ id, ...rest }) => rest)
    const instructionsData = instructions.filter((i) => i.text).map((i) => i.text)
    formData.set('ingredients', JSON.stringify(ingredientsData))
    formData.set('instructions', JSON.stringify(instructionsData))

    const result = await updateMeal(meal.id, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.data) {
      router.push(`/meals/${result.data.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href={`/meals/${meal.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Meal
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Edit Meal</h1>
        <p className="text-muted-foreground">Update your meal details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Meal Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Grilled Chicken Salad"
                defaultValue={meal.name}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the meal"
                defaultValue={meal.description || ''}
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mealType">Meal Type</Label>
                <Select
                  name="mealType"
                  defaultValue={meal.meal_type || undefined}
                  disabled={loading}
                >
                  <SelectTrigger id="mealType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisineType">Cuisine Type</Label>
                <Input
                  id="cuisineType"
                  name="cuisineType"
                  placeholder="e.g., Italian, Asian"
                  defaultValue={meal.cuisine_type || ''}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Difficulty</Label>
                <Select
                  name="difficultyLevel"
                  defaultValue={meal.difficulty_level || undefined}
                  disabled={loading}
                >
                  <SelectTrigger id="difficultyLevel">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">Servings *</Label>
                <Input
                  id="servings"
                  name="servings"
                  type="number"
                  min="1"
                  defaultValue={meal.servings || 1}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  name="prepTime"
                  type="number"
                  min="0"
                  defaultValue={meal.prep_time || ''}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookTime">Cook Time (min)</Label>
                <Input
                  id="cookTime"
                  name="cookTime"
                  type="number"
                  min="0"
                  defaultValue={meal.cook_time || ''}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                name="isPublic"
                defaultChecked={meal.is_public ?? false}
                disabled={loading}
              />
              <Label htmlFor="isPublic" className="cursor-pointer font-normal">
                Make this meal public (visible to all users)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition */}
        <Card>
          <CardHeader>
            <CardTitle>Nutrition per Serving</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="caloriesPerServing">Calories</Label>
              <Input
                id="caloriesPerServing"
                name="caloriesPerServing"
                type="number"
                min="0"
                defaultValue={meal.calories_per_serving || ''}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proteinPerServing">Protein (g)</Label>
              <Input
                id="proteinPerServing"
                name="proteinPerServing"
                type="number"
                min="0"
                defaultValue={meal.protein_per_serving || ''}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbsPerServing">Carbs (g)</Label>
              <Input
                id="carbsPerServing"
                name="carbsPerServing"
                type="number"
                min="0"
                defaultValue={meal.carbs_per_serving || ''}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatsPerServing">Fats (g)</Label>
              <Input
                id="fatsPerServing"
                name="fatsPerServing"
                type="number"
                min="0"
                defaultValue={meal.fats_per_serving || ''}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ingredients</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex gap-2">
                <Input
                  placeholder="Name"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={ingredient.quantity || ''}
                  onChange={(e) =>
                    updateIngredient(ingredient.id, 'quantity', Number(e.target.value))
                  }
                  className="w-24"
                />
                <Input
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                  className="w-24"
                />
                <Select
                  value={ingredient.category}
                  onValueChange={(value) => updateIngredient(ingredient.id, 'category', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produce">Produce</SelectItem>
                    <SelectItem value="protein">Protein</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="grains">Grains</SelectItem>
                    <SelectItem value="pantry">Pantry</SelectItem>
                    <SelectItem value="spices">Spices</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(ingredient.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Instructions</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {instructions.map((instruction, index) => (
              <div key={instruction.id} className="flex gap-2">
                <span className="flex h-10 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium">
                  {index + 1}
                </span>
                <Textarea
                  placeholder="Describe this step..."
                  value={instruction.text}
                  onChange={(e) => updateInstruction(instruction.id, e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                {instructions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInstruction(instruction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild disabled={loading}>
            <Link href={`/meals/${meal.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
