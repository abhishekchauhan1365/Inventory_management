import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] selection:bg-zinc-900 selection:text-white">
      {/* Atmospheric Background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-100/40 blur-[100px]" />
        <div className="absolute top-[30%] right-[20%] h-[400px] w-[400px] rounded-full bg-emerald-50/60 blur-[80px]" />
      </div>

      {/* Dynamic Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Navbar */}
      <nav className="relative z-50 w-full">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-24 items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-zinc-900">MedChem</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-zinc-900 shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-zinc-100 hover:shadow-[0_4px_25px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pt-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-zinc-200/60 backdrop-blur-md mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">MedChem Inventory System v2.0</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter text-zinc-900 leading-[1.05] mb-8">
            Precision Inventory <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900">
              For Modern Labs.
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-zinc-500 font-medium leading-relaxed mb-12">
            A high-precision, B2B quotation and inventory management system designed specifically for medical and chemical supply chains. Exact conversions, zero errors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto rounded-2xl bg-zinc-900 px-10 py-5 text-base font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-zinc-800 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] transition-all">
              Start Free Trial
            </Link>
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-5 text-base font-bold text-zinc-900 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-zinc-100 hover:bg-zinc-50 hover:-translate-y-1 transition-all">
              <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Live Demo
            </Link>
          </div>
        </div>

        {/* Bento Grid Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="mb-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6 border border-blue-100/50">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-4">Flawless Conversions.</h3>
                <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-md">
                  Seamlessly convert between Grams, Kilograms, Milliliters, Liters, and Units using standard NUMERIC(20,6) precision arithmetic.
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-1 group relative overflow-hidden rounded-[2.5rem] bg-zinc-900 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-800 hover:-translate-y-1 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-white mb-6 border border-zinc-700">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight mb-4">Role Based Security</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">
                  Enterprise-grade authentication with distinct Admin and Seller portals out of the box.
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 flex flex-col md:flex-row items-center justify-between hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-6 border border-emerald-100/50">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-4">Lightning Fast Quotations</h3>
              <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-md">
                Generate highly accurate B2B quotations instantly. Approve or reject orders through a beautiful, streamlined admin interface.
              </p>
            </div>
            <div className="w-full md:w-5/12 bg-zinc-50 rounded-3xl p-6 border border-zinc-100/80 shadow-inner">
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-zinc-100/50">
                     <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                         <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       </div>
                       <div>
                         <div className="h-2 w-24 bg-zinc-200 rounded-full mb-2"></div>
                         <div className="h-2 w-16 bg-zinc-100 rounded-full"></div>
                       </div>
                     </div>
                     <div className="h-6 w-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                       <div className="h-1.5 w-8 bg-emerald-400 rounded-full"></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
