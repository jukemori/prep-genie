'use client'

import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
import { createMeal } from '@/features/meals/actions'

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

export default function NewMealPage() {
  const router = useRouter()
  const t = useTranslations('meals_new')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: crypto.randomUUID(), name: '', quantity: 0, unit: '', category: 'other' },
  ])
  const [instructions, setInstructions] = useState<Instruction[]>([
    { id: crypto.randomUUID(), text: '' },
  ])

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
            {t('back_to_meals')}
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basic_info')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('meal_name')} *</Label>
              <Input
                id="name"
                name="name"
                placeholder={t('meal_name_placeholder')}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t('description_placeholder')}
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mealType">{t('meal_type')}</Label>
                <Select name="mealType" disabled={loading}>
                  <SelectTrigger id="mealType">
                    <SelectValue placeholder={t('select_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">{t('breakfast')}</SelectItem>
                    <SelectItem value="lunch">{t('lunch')}</SelectItem>
                    <SelectItem value="dinner">{t('dinner')}</SelectItem>
                    <SelectItem value="snack">{t('snack')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisineType">{t('cuisine_type')}</Label>
                <Input
                  id="cuisineType"
                  name="cuisineType"
                  placeholder={t('cuisine_placeholder')}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">{t('difficulty')}</Label>
                <Select name="difficultyLevel" disabled={loading}>
                  <SelectTrigger id="difficultyLevel">
                    <SelectValue placeholder={t('select_difficulty')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">{t('easy')}</SelectItem>
                    <SelectItem value="medium">{t('medium')}</SelectItem>
                    <SelectItem value="hard">{t('hard')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">{t('servings')} *</Label>
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
                <Label htmlFor="prepTime">{t('prep_time')}</Label>
                <Input id="prepTime" name="prepTime" type="number" min="0" disabled={loading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookTime">{t('cook_time')}</Label>
                <Input id="cookTime" name="cookTime" type="number" min="0" disabled={loading} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="isPublic" name="isPublic" disabled={loading} />
              <Label htmlFor="isPublic" className="cursor-pointer font-normal">
                {t('make_public')}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition */}
        <Card>
          <CardHeader>
            <CardTitle>{t('nutrition_title')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="caloriesPerServing">{t('calories')}</Label>
              <Input
                id="caloriesPerServing"
                name="caloriesPerServing"
                type="number"
                min="0"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proteinPerServing">{t('protein')}</Label>
              <Input
                id="proteinPerServing"
                name="proteinPerServing"
                type="number"
                min="0"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbsPerServing">{t('carbs')}</Label>
              <Input
                id="carbsPerServing"
                name="carbsPerServing"
                type="number"
                min="0"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatsPerServing">{t('fats')}</Label>
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
            <CardTitle>{t('ingredients_title')}</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="mr-2 h-4 w-4" />
              {t('add_ingredient')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex gap-2">
                <Input
                  placeholder={t('ingredient_name')}
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder={t('ingredient_qty')}
                  value={ingredient.quantity || ''}
                  onChange={(e) =>
                    updateIngredient(ingredient.id, 'quantity', Number(e.target.value))
                  }
                  className="w-24"
                />
                <Input
                  placeholder={t('ingredient_unit')}
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
                    <SelectItem value="produce">{t('category_produce')}</SelectItem>
                    <SelectItem value="protein">{t('category_protein')}</SelectItem>
                    <SelectItem value="dairy">{t('category_dairy')}</SelectItem>
                    <SelectItem value="grains">{t('category_grains')}</SelectItem>
                    <SelectItem value="pantry">{t('category_pantry')}</SelectItem>
                    <SelectItem value="spices">{t('category_spices')}</SelectItem>
                    <SelectItem value="other">{t('category_other')}</SelectItem>
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
            <CardTitle>{t('instructions_title')}</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
              <Plus className="mr-2 h-4 w-4" />
              {t('add_step')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {instructions.map((instruction, index) => (
              <div key={instruction.id} className="flex gap-2">
                <span className="flex h-10 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium">
                  {index + 1}
                </span>
                <Textarea
                  placeholder={t('step_placeholder')}
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
            <Link href="/meals">{t('cancel')}</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t('creating') : t('create_meal')}
          </Button>
        </div>
      </form>
    </div>
  )
}
