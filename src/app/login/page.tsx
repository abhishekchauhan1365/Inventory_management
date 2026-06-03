'use client'

// src/app/login/page.tsx
// Redesigned: Awwwards-style clean login page
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }
      
      const redirectTo = data.role === 'admin' ? '/admin' : '/seller/products'
      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 selection:bg-zinc-900 selection:text-white">
      {/* Soft aesthetic background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden flex items-center justify-center">
        <div className="absolute h-[600px] w-[600px] rounded-full bg-blue-50/50 blur-3xl translate-x-1/3 -translate-y-1/4" />
        <div className="absolute h-[500px] w-[500px] rounded-full bg-indigo-50/50 blur-3xl -translate-x-1/3 translate-y-1/4" />
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="rounded-3xl border border-white/50 bg-white/70 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 shadow-lg shadow-zinc-900/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">MedChem</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">Sign in to your account</p>
          </div>

          <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-900 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-900 mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-zinc-900 py-4 text-sm font-bold text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Access (Demo) */}
          <div className="mt-8 border-t border-zinc-100 pt-8">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Demo Access
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setEmail('admin@medchem.com'); setPassword('admin123') }}
                className="rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail('seller@medchem.com'); setPassword('seller123') }}
                className="rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
              >
                Seller
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm font-medium text-zinc-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-zinc-900 underline underline-offset-4 hover:text-zinc-700">
              Sign up
            </Link>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs font-semibold tracking-wide text-zinc-400">
          MEDCHEM INVENTORY SYSTEM
        </p>
      </div>
    </div>
  )
}
