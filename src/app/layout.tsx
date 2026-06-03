// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MedChem — Inventory & Order Management',
    template: '%s | MedChem',
  },
  description:
    'Professional inventory and quotation management system for medical and chemical supply businesses.',
  keywords: ['inventory', 'order management', 'medical supplies', 'chemical reagents', 'quotations'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.variable} font-sans min-h-screen bg-[#fafafa] selection:bg-zinc-900 selection:text-white`}>
        {/* Global Atmospheric Background */}
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden z-[-2]">
          <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-100/50 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-100/40 blur-[100px]" />
          <div className="absolute top-[30%] right-[20%] h-[400px] w-[400px] rounded-full bg-emerald-50/60 blur-[80px]" />
        </div>

        {/* Global Dynamic Grid Overlay */}
        <div className="pointer-events-none fixed inset-0 z-[-1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* App Content */}
        <div className="relative z-0">
          {children}
        </div>
      </body>
    </html>
  )
}
