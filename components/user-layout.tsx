import { Header } from '@/components/header'
import { MobileShell } from '@/components/mobile-shell'

export function UserLayout({
  children,
  showHeader = true,
}: {
  children: React.ReactNode
  showHeader?: boolean
}) {
  return (
    <MobileShell>
      {showHeader && <Header />}
      {children}
    </MobileShell>
  )
}
