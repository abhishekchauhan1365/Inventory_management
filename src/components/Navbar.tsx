'use client'

// src/components/Navbar.tsx
// Redesigned: Awwwards-style minimal white navbar
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import type { Session } from '@/types'

export default function Navbar({ session }: { session: Session }) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const isAdmin = session.role === 'admin'
  const links = isAdmin
    ? [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/products', label: 'Products' },
        { href: '/admin/quotations', label: 'Quotations' },
      ]
    : [
        { href: '/seller/products', label: 'Catalog' },
        { href: '/seller/quotations', label: 'My Quotations' },
      ]

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href={isAdmin ? '/admin' : '/seller/products'} className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white transition-transform group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900">MedChem</span>
            </Link>

            {/* Links */}
            <div className="hidden md:flex items-center gap-6">
              {links.map(l => {
                const active = pathname === l.href
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`text-sm font-medium transition-all ${
                      active
                        ? 'text-zinc-900'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {l.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-zinc-900 leading-none mb-1">{session.name}</span>
              <span className="text-xs font-medium text-zinc-400 leading-none capitalize">{session.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
