'use client'

// src/app/signup/page.tsx
// Redesigned: Awwwards-style split layout signup
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [role, setRole] = useState<'seller' | 'admin'>('seller')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 selection:bg-zinc-900 selection:text-white">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-2">Account Created</h2>
          <p className="text-zinc-500 font-medium">Redirecting you to login…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white selection:bg-zinc-900 selection:text-white">
      
      {/* Left side: Image */}
      <div className="relative hidden w-0 flex-1 lg:block bg-zinc-50">
        <Image
          src="/medchem_hero.png"
          alt="Modern MedChem Laboratory"
          fill
          className="object-cover object-center scale-x-[-1]" 
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 to-transparent" />
      </div>

      {/* Right side: Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-[45%] lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Link href="/" className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 shadow-lg shadow-zinc-900/20 hover:scale-105 transition-transform">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Create Account</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">Join MedChem to manage your inventory and orders.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-900 mb-2 uppercase tracking-wide">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                    role === 'seller'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'
                  }`}
                >
                  Seller
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                    role === 'admin'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-900 mb-2 uppercase tracking-wide">
                Full Name
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-900 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-900 mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-zinc-900 py-4 text-sm font-bold text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 border-t border-zinc-100 pt-8 text-center text-sm font-medium text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="text-zinc-900 underline underline-offset-4 hover:text-zinc-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
