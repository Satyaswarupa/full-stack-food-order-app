'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ShoppingCart, User, LogOut, Settings, ShoppingBag, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

function IconAction({
  href,
  onClick,
  children,
  className,
  label,
}: {
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  label: string
}) {
  const classes = cn(
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-secondary/80 text-foreground transition-all hover:bg-secondary hover:border-primary/30 hover:scale-105 active:scale-95',
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={label}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes} aria-label={label}>
      {children}
    </button>
  )
}

export function Header() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full safe-top border-b border-border/60 bg-card/90 backdrop-blur-xl">
      <div className="app-shell flex h-14 md:h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex min-w-0 flex-col justify-center leading-tight">
            <span className="text-base font-bold text-foreground tracking-tight truncate">
              OrderFlow
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Food delivery
            </span>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-2">
          {user ? (
            <>
              {user.role === 'user' && (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/orders">
                    <Button variant="ghost" size="sm" className="gap-2 h-10 rounded-xl">
                      <Package className="h-4 w-4" />
                      Orders
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
                      <ShoppingCart className="h-5 w-5" />
                      {itemCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                          {itemCount > 9 ? '9+' : itemCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <IconAction href="/admin" label="Admin panel">
                    <Settings className="h-[18px] w-[18px] text-primary" />
                  </IconAction>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-secondary/80 transition-all hover:bg-secondary hover:border-primary/30 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        user.role === 'admin' && 'ring-1 ring-primary/40'
                      )}
                      aria-label="Profile menu"
                    >
                      <User className="h-[18px] w-[18px] text-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 glass-panel">
                    <div className="px-2 py-2">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <span className="label-chip mt-2 bg-primary/15 text-primary capitalize">
                        {user.role}
                      </span>
                    </div>
                    <DropdownMenuSeparator />
                    {user.role === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            Admin panel
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button
                size="sm"
                className="h-10 rounded-xl px-4 font-semibold shadow-lg shadow-primary/20"
              >
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
