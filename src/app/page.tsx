import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-zinc-900 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-md">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-zinc-900">MedChem</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:bg-zinc-800 hover:-translate-y-0.5 transition-all">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
              Precision Inventory for Modern Labs.
            </h1>
            <p className="mt-6 text-lg text-zinc-500 leading-relaxed max-w-xl">
              A high-precision, B2B quotation and inventory management system designed specifically for medical and chemical supply chains. Exact conversions, seamless ordering.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/signup" className="rounded-xl bg-zinc-900 px-8 py-4 text-base font-bold text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:bg-zinc-800 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] transition-all">
                Get Started
              </Link>
              <Link href="/login" className="rounded-xl bg-white border border-zinc-200 px-8 py-4 text-base font-bold text-zinc-900 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 transition-all">
                View Catalog
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-sm font-medium text-zinc-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Exact Arithmetic
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Smart Conversions
              </div>
            </div>
          </div>
          
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.1)] border border-zinc-200/50">
            <Image
              src="/medchem_hero.png"
              alt="Pristine Modern Laboratory"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </main>
    </div>
  )
}
