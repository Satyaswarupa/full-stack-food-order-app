import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { UserLayout } from '@/components/user-layout'
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
    <UserLayout>
      <OrdersView />
    </UserLayout>
  )
}
