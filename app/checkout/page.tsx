import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Header } from '@/components/header'
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
    <div className="min-h-screen bg-background">
      <Header />
      <CheckoutView />
    </div>
  )
}
