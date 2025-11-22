'use client'

import { useState } from 'react'
import { createMeal } from '@/features/meals/api/actions'
import { Button } from '@/components/atoms/ui/button'
import { Input } from '@/components/atoms/ui/input'
import { Label } from '@/components/atoms/ui/label'
import { Textarea } from '@/components/atoms/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/ui/select'
import { Checkbox } from '@/components/atoms/ui/checkbox'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Ingredient {
  name: string
  quantity: number
  unit: string
  category: string
}

export default function NewMealPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: 0, unit: '', category: 'other' },
  ])
  const [instructions, setInstructions] = useState<string[]>([''])

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0, unit: '', category: 'other' }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  const addInstruction = () => {
    setInstructions([...instructions, ''])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions]
    updated[index] = value
    setInstructions(updated)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('ingredients', JSON.stringify(ingredients.filter(i => i.name)))
    formData.set('instructions', JSON.stringify(instructions.filter(i => i)))

    const result = await createMeal(formData)

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
          <Link href="/meals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Meals
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Create New Meal</h1>
        <p className="text-muted-foreground">
          Add a new recipe to your meal library
        </p>
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
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mealType">Meal Type</Label>
                <Select name="mealType" disabled={loading}>
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
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Difficulty</Label>
                <Select name="difficultyLevel" disabled={loading}>
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
                  defaultValue="1"
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
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="isPublic" name="isPublic" disabled={loading} />
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
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Name"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={ingredient.quantity || ''}
                  onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                  className="w-24"
                />
                <Input
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-24"
                />
                <Select
                  value={ingredient.category}
                  onValueChange={(value) => updateIngredient(index, 'category', value)}
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
                    onClick={() => removeIngredient(index)}
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
              <div key={index} className="flex gap-2">
                <span className="flex h-10 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium">
                  {index + 1}
                </span>
                <Textarea
                  placeholder="Describe this step..."
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                {instructions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInstruction(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild disabled={loading}>
            <Link href="/meals">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Meal'}
          </Button>
        </div>
      </form>
    </div>
  )
}
