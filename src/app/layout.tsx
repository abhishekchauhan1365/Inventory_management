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
      <body className="antialiased">{children}</body>
    </html>
  )
}
