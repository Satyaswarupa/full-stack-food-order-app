import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { UserLayout } from '@/components/user-layout'
import { CartView } from '@/components/cart-view'

export default async function CartPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  }

  return (
    <UserLayout>
      <CartView />
    </UserLayout>
  )
}
