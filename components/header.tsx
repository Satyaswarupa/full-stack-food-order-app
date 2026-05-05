'use client'

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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">OrderFlow</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === 'user' && (
                <>
                  <Link href="/orders">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Package className="h-4 w-4" />
                      <span className="hidden sm:inline">My Orders</span>
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="ghost" size="sm" className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {itemCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {itemCount > 9 ? '9+' : itemCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                </>
              )}
              
              {user.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin Panel</span>
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 ml-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-24 truncate">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-primary font-medium mt-1 capitalize">{user.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="font-semibold">Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
