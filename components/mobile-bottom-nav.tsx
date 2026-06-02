'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, Package, User, MapPin, LogOut, Phone, Star } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useCart } from '@/contexts/cart-context'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const navItems = [
  { href: '/', label: 'Menu', icon: Home, match: (p: string) => p === '/' },
  { href: '/orders', label: 'Orders', icon: Package, match: (p: string) => p.startsWith('/orders') },
  { href: '/cart', label: 'Cart', icon: ShoppingCart, match: (p: string) => p.startsWith('/cart') },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount } = useCart()
  const { user, logout } = useAuth()
  const [accountOpen, setAccountOpen] = useState(false)

  const handleAccountClick = () => {
    if (user) {
      setAccountOpen(true)
    } else {
      router.push('/login')
    }
  }

  const handleLogout = async () => {
    await logout()
    setAccountOpen(false)
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const accountActive = !user && pathname.startsWith('/login')

  return (
    <>
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

            <button
              onClick={handleAccountClick}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 relative transition-colors',
                accountActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {accountActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full bg-primary" />
              )}
              <span className="flex h-6 items-center justify-center">
                <User className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-medium leading-none">Account</span>
            </button>
          </div>
        </div>
      </nav>

      <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto pb-8">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-left">My Account</SheetTitle>
          </SheetHeader>

          {user && (
            <div className="space-y-5 px-4 pb-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-base truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <Badge variant="secondary" className="mt-1 text-xs capitalize">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Addresses */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Saved Addresses</h3>
                </div>

                {user.addresses && user.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {user.addresses.map((address, idx) => (
                      <div
                        key={address._id || idx}
                        className="rounded-xl border border-border/60 p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm capitalize">{address.label}</span>
                          {address.isDefault && (
                            <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                              <Star className="h-3 w-3 fill-primary" />
                              Default
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug">{address.fullAddress}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {address.mobile}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">No saved addresses yet.</p>
                )}
              </div>

              <Separator />

              {/* Logout */}
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
