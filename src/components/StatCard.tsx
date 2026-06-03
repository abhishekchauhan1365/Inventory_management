// src/components/StatCard.tsx
// Minimalist Stat Card

import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="group flex flex-col rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-500">{title}</h3>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-extrabold tracking-tight text-zinc-900">
        {value}
      </p>
    </div>
  )
}
