'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, Package, User } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useCart } from '@/contexts/cart-context'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Menu', icon: Home, match: (p: string) => p === '/' },
  { href: '/orders', label: 'Orders', icon: Package, match: (p: string) => p.startsWith('/orders') },
  { href: '/cart', label: 'Cart', icon: ShoppingCart, match: (p: string) => p.startsWith('/cart') },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const { user } = useAuth()

  const accountHref = user ? '/' : '/login'
  const accountActive = user ? false : pathname.startsWith('/login')

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/60 bg-card/95 backdrop-blur-xl safe-bottom"
      aria-label="Main navigation"
    >
      <div className="app-shell">
        <div className="grid grid-cols-4 h-16 items-stretch">
          {navItems.map((item) => {
            const isActive = item.match(pathname)
            const Icon = item.icon
            const showBadge = item.href === '/cart' && itemCount > 0

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 relative transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full bg-primary" />
                )}
                <span className="relative flex h-6 items-center justify-center">
                  <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                  {showBadge && (
                    <span className="absolute -right-2.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-primary-foreground">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </span>
                <span className={cn('text-[10px] font-medium leading-none', isActive && 'font-semibold')}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          <Link
            href={accountHref}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 relative transition-colors',
              accountActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <span className="flex h-6 items-center justify-center">
              <User className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-medium leading-none">Account</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
