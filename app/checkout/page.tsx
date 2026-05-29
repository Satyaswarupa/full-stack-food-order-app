import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { UserLayout } from '@/components/user-layout'
import { CheckoutView } from '@/components/checkout-view'

export default async function CheckoutPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  }

  return (
    <UserLayout>
      <CheckoutView />
    </UserLayout>
  )
}
