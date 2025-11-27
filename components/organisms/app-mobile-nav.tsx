'use client'

import {
  CalendarDays,
  ChefHat,
  LayoutDashboard,
  Menu,
  Settings,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/atoms/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/atoms/ui/sheet'
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

export function AppMobileNav() {
  const pathname = usePathname()
  const t = useTranslations('navigation')
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">PrepGenie</span>
            </SheetTitle>
          </div>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {navigationConfig.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  )
}
