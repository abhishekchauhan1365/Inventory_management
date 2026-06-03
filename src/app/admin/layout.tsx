// src/app/admin/layout.tsx
// Admin layout: server component that fetches session and renders navbar.
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <Navbar session={session} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
