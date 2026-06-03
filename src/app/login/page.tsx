'use client'

// src/app/login/page.tsx
// Redesigned: Awwwards-style glassmorphic bento login
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e?: FormEvent) {
    if (e) e.preventDefault()
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

  async function handleDemoLogin(demoEmail: string, demoPass: string) {
    setEmail(demoEmail)
    setPassword(demoPass)
    
    // Bypass state and use values directly
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Glass Form */}
        <div className="relative rounded-[2.5rem] bg-white/70 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white backdrop-blur-2xl">
          <div className="mb-10">
            <Link href="/" className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 shadow-lg shadow-zinc-900/20 hover:scale-105 transition-transform">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Welcome Back.</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">Sign in to manage your inventory and orders.</p>
          </div>

          <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">
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
                className="w-full rounded-2xl border border-zinc-200/60 bg-white/50 px-5 py-4 text-sm font-bold text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">
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
                className="w-full rounded-2xl border border-zinc-200/60 bg-white/50 px-5 py-4 text-sm font-bold text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/20"
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
              className="mt-4 w-full rounded-2xl bg-zinc-900 py-4.5 text-sm font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:bg-zinc-800 hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In securely →'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-zinc-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-zinc-900 font-bold hover:text-zinc-700 hover:underline">
              Create one
            </Link>
          </div>
        </div>

        {/* Right: Info Bento */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 rounded-[2.5rem] bg-zinc-900 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-800 flex flex-col justify-end relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-white mb-6 border border-zinc-700">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-3xl font-extrabold text-white tracking-tight mb-3">Enterprise Security.</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                Your data is protected by industry-leading encryption and role-based access control.
              </p>
            </div>
          </div>
          
          <div className="rounded-[2.5rem] bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white backdrop-blur-xl">
             <p className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Demo Access (One-click)
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@medchem.com', 'admin123')}
                className="flex-1 rounded-2xl border border-zinc-200/60 bg-white/50 py-3 text-sm font-bold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-white"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('seller@medchem.com', 'seller123')}
                className="flex-1 rounded-2xl border border-zinc-200/60 bg-white/50 py-3 text-sm font-bold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-white"
              >
                Seller
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
