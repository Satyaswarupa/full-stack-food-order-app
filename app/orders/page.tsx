import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Header } from '@/components/header'
import { OrdersView } from '@/components/orders-view'

export default async function OrdersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin/orders')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OrdersView />
    </div>
  )
}
