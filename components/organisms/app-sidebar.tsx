'use client';

import {
  CalendarDays,
  ChefHat,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Meals', href: '/meals', icon: UtensilsCrossed },
  { name: 'Meal Plans', href: '/meal-plans', icon: CalendarDays },
  { name: 'Grocery Lists', href: '/grocery-lists', icon: ShoppingCart },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'AI Assistant', href: '/chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r bg-card lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">PrepGenie</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
