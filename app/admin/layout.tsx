import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="md:pl-64">
        <div className="container mx-auto p-4 md:p-6 pt-20 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}
