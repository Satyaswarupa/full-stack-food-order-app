'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

const HIDE_NAV_PATHS = ['/login', '/admin']

export function MobileShell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const pathname = usePathname()
  const { user } = useAuth()

  const hideNav =
    HIDE_NAV_PATHS.some((p) => pathname.startsWith(p)) ||
    user?.role === 'admin' ||
    !user

  return (
    <div
      className={`min-h-screen bg-background ${hideNav ? '' : 'pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0'} ${className}`}
    >
      {children}
      {!hideNav && user?.role === 'user' && <MobileBottomNav />}
    </div>
  )
}
