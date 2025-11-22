'use client'

import { useEffect, useState } from 'react'
import { getGroceryList, updateGroceryListItems } from '@/features/grocery-lists/api/actions'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { Checkbox } from '@/components/atoms/ui/checkbox'
import { Badge } from '@/components/atoms/ui/badge'
import { ArrowLeft, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function GroceryListDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const [list, setList] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
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
    return <div>Loading...</div>
  }

  if (!list) {
    return <div>Grocery list not found</div>
  }

  const purchasedCount = items.filter(item => item.is_purchased).length
  const totalItems = items.length

  // Group by category
  const categories = ['produce', 'protein', 'dairy', 'grains', 'pantry', 'spices', 'other']
  const groupedItems = categories.reduce((acc: any, category) => {
    acc[category] = items.filter(item => item.category === category)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/grocery-lists">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lists
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{list.name}</h1>
        <p className="text-muted-foreground">
          Created on {new Date(list.created_at).toLocaleDateString()}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Shopping Progress</span>
            <Badge variant={purchasedCount === totalItems ? 'default' : 'secondary'}>
              {purchasedCount}/{totalItems} items purchased
            </Badge>
          </div>
        </CardContent>
      </Card>

      {categories.map(category => {
        const categoryItems = groupedItems[category]
        if (!categoryItems || categoryItems.length === 0) return null

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoryItems.map((item: any, index: number) => {
                const globalIndex = items.indexOf(item)
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Checkbox
                      checked={item.is_purchased}
                      onCheckedChange={() => handleToggleItem(globalIndex)}
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${item.is_purchased ? 'line-through text-muted-foreground' : ''}`}>
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
