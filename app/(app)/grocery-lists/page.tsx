import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/atoms/ui/badge'
import { Button } from '@/components/atoms/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function GroceryListsPage() {
  const supabase = await createClient()
  const t = await getTranslations('grocery_lists_page')

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
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button asChild>
          <Link href="/grocery-lists/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('create_list')}
          </Link>
        </Button>
      </div>

      {groceryLists && groceryLists.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groceryLists.map((list) => {
            const items = Array.isArray(list.items) ? list.items : []
            const purchasedCount = items.filter(
              (item: { is_purchased?: boolean }) => item.is_purchased
            ).length
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
                    <span className="text-muted-foreground">{t('progress')}</span>
                    <Badge variant={purchasedCount === totalItems ? 'default' : 'secondary'}>
                      {purchasedCount}/{totalItems} {t('items')}
                    </Badge>
                  </div>
                  {list.estimated_cost && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('estimated_cost')}</span>
                      <span className="font-medium">${list.estimated_cost}</span>
                    </div>
                  )}
                  <Button asChild className="w-full">
                    <Link href={`/grocery-lists/${list.id}`}>{t('view_list')}</Link>
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
            <h3 className="mb-2 text-lg font-semibold">{t('no_lists_found')}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{t('create_first_list')}</p>
            <Button asChild>
              <Link href="/grocery-lists/new">
                <Plus className="mr-2 h-4 w-4" />
                {t('create_list')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
