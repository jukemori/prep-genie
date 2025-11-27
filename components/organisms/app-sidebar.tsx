'use client'

import {
  CalendarDays,
  ChefHat,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const navigationConfig = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'meals', href: '/meals', icon: UtensilsCrossed },
  { key: 'meal_plans', href: '/meal-plans', icon: CalendarDays },
  { key: 'grocery_lists', href: '/grocery-lists', icon: ShoppingCart },
  { key: 'progress', href: '/progress', icon: TrendingUp },
  { key: 'analyze', href: '/analyze', icon: ChefHat },
  { key: 'settings', href: '/settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const t = useTranslations('navigation')

  return (
    <aside className="hidden w-64 border-r bg-card lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">PrepGenie</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigationConfig.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {t(item.key)}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
