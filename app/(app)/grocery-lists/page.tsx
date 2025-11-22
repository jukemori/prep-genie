import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { Badge } from '@/components/atoms/ui/badge'
import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default async function GroceryListsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: groceryLists } = await supabase
    .from('grocery_lists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grocery Lists</h1>
          <p className="text-muted-foreground">
            Manage your shopping lists
          </p>
        </div>
        <Button asChild>
          <Link href="/grocery-lists/new">
            <Plus className="mr-2 h-4 w-4" />
            New List
          </Link>
        </Button>
      </div>

      {groceryLists && groceryLists.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groceryLists.map((list) => {
            const items = Array.isArray(list.items) ? list.items : []
            const purchasedCount = items.filter((item: any) => item.is_purchased).length
            const totalItems = items.length

            return (
              <Card key={list.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{list.name}</CardTitle>
                  <CardDescription>
                    {new Date(list.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <Badge variant={purchasedCount === totalItems ? 'default' : 'secondary'}>
                      {purchasedCount}/{totalItems} items
                    </Badge>
                  </div>
                  {list.estimated_cost && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Cost</span>
                      <span className="font-medium">${list.estimated_cost}</span>
                    </div>
                  )}
                  <Button asChild className="w-full">
                    <Link href={`/grocery-lists/${list.id}`}>View List</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No grocery lists yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create a grocery list from a meal plan or manually
            </p>
            <Button asChild>
              <Link href="/grocery-lists/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First List
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
