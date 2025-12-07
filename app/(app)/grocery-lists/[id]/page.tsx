'use client'

import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { use, useEffect, useState } from 'react'
import { Badge } from '@/components/atoms/ui/badge'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { Checkbox } from '@/components/atoms/ui/checkbox'
import { getGroceryList, updateGroceryListItems } from '@/features/grocery-lists/actions'
import type { GroceryList } from '@/types'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface GroceryItem {
  name: string
  quantity: number
  unit: string
  category: string
  is_purchased: boolean
}

export default function GroceryListDetailPage({ params }: PageProps) {
  const t = useTranslations('grocery_list_detail_page')
  const { id } = use(params)
  const [list, setList] = useState<GroceryList | null>(null)
  const [items, setItems] = useState<GroceryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadList() {
      const result = await getGroceryList(id)
      if (result.data) {
        setList(result.data)
        setItems(Array.isArray(result.data.items) ? result.data.items : [])
      }
      setLoading(false)
    }
    loadList()
  }, [id])

  const handleToggleItem = (index: number) => {
    const updated = [...items]
    updated[index] = {
      ...updated[index],
      is_purchased: !updated[index].is_purchased,
    }
    setItems(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    await updateGroceryListItems(id, items)
    setSaving(false)
  }

  if (loading) {
    return <div>{t('loading')}</div>
  }

  if (!list) {
    return <div>{t('list_not_found')}</div>
  }

  const purchasedCount = items.filter((item) => item.is_purchased).length
  const totalItems = items.length

  // Group by category
  const categories = ['produce', 'protein', 'dairy', 'grains', 'pantry', 'spices', 'other']
  const groupedItems = categories.reduce(
    (acc: Record<string, GroceryItem[]>, category) => {
      acc[category] = items.filter((item) => item.category === category)
      return acc
    },
    {} as Record<string, GroceryItem[]>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/grocery-lists">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back_to_lists')}
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? t('saving') : t('save')}
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{list.name}</h1>
        <p className="text-muted-foreground">
          {t('created_on', {
            date: list.created_at ? new Date(list.created_at).toLocaleDateString() : t('unknown'),
          })}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('shopping_progress')}</span>
            <Badge variant={purchasedCount === totalItems ? 'default' : 'secondary'}>
              {t('items_purchased', { purchased: purchasedCount, total: totalItems })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {categories.map((category) => {
        const categoryItems = groupedItems[category]
        if (!categoryItems || categoryItems.length === 0) return null

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{t(`category_${category}`)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoryItems.map((item) => {
                const globalIndex = items.indexOf(item)
                return (
                  <div key={globalIndex} className="flex items-center gap-3 rounded-lg border p-3">
                    <Checkbox
                      checked={item.is_purchased}
                      onCheckedChange={() => handleToggleItem(globalIndex)}
                    />
                    <div className="flex-1">
                      <p
                        className={`font-medium ${item.is_purchased ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
