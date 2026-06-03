// src/app/seller/layout.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'seller') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar session={session} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
