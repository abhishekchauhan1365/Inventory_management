'use client'

// src/app/signup/page.tsx
// Redesigned: Awwwards-style glassmorphic bento signup
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 shadow-[0_0_40px_rgba(52,211,153,0.3)]">
            <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">Account Created!</h2>
          <p className="text-zinc-500 font-bold text-lg">Redirecting you to login…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Info Bento */}
        <div className="hidden md:flex flex-col gap-6">
          <div className="flex-1 rounded-[2.5rem] bg-white/70 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white backdrop-blur-xl flex flex-col justify-end">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6 border border-blue-100/50">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-3">Lightning Fast.</h3>
            <p className="text-zinc-500 font-medium leading-relaxed">
              Place quotations instantly. Everything is automatically calculated with zero-error arithmetic, making B2B transactions seamless.
            </p>
          </div>
          <div className="rounded-[2.5rem] bg-zinc-900 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-800">
             <div className="flex items-center gap-4 text-zinc-400 font-medium">
               <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
               </svg>
               Choose your role flexibly
             </div>
             <div className="flex items-center gap-4 text-zinc-400 font-medium mt-4">
               <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
               </svg>
               Free to register
             </div>
          </div>
        </div>

        {/* Right: Glass Form */}
        <div className="relative rounded-[2.5rem] bg-white/70 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white backdrop-blur-2xl">
          <div className="mb-10">
            <Link href="/" className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 shadow-lg shadow-zinc-900/20 hover:scale-105 transition-transform">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Create Account.</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">Join MedChem to manage your inventory and orders.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all ${
                    role === 'seller'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                      : 'border-zinc-200/60 bg-white/50 text-zinc-500 hover:border-zinc-300 hover:bg-white hover:text-zinc-900'
                  }`}
                >
                  Seller
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all ${
                    role === 'admin'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                      : 'border-zinc-200/60 bg-white/50 text-zinc-500 hover:border-zinc-300 hover:bg-white hover:text-zinc-900'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-2xl border border-zinc-200/60 bg-white/50 px-5 py-4 text-sm font-bold text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-zinc-200/60 bg-white/50 px-5 py-4 text-sm font-bold text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full rounded-2xl border border-zinc-200/60 bg-white/50 px-5 py-4 text-sm font-bold text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/20"
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
              className="mt-4 w-full rounded-2xl bg-zinc-900 py-4.5 text-sm font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:bg-zinc-800 hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up securely →'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="text-zinc-900 font-bold hover:text-zinc-700 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
