'use client'

// src/app/admin/page.tsx
// Redesigned: Minimalist light-theme dashboard

import { useEffect, useState } from 'react'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { formatINR } from '@/lib/units'
import type { DashboardStats, Quotation } from '@/types'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recent, setRecent] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/quotations').then(r => r.json())
    ]).then(([statsData, quotesData]) => {
      setStats(statsData)
      setRecent((quotesData.quotations || []).slice(0, 5))
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <svg className="h-8 w-8 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Dashboard Overview</h1>
        <p className="mt-2 text-sm font-medium text-zinc-500">Monitor your inventory and order metrics</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          title="Total Quotations"
          value={stats?.totalQuotations || 0}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Pending Approval"
          value={stats?.pendingQuotations || 0}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Revenue"
          value={formatINR(stats?.totalRevenue || 0)}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Active Sellers"
          value={stats?.activeSellers || 0}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent quotations table */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <h2 className="text-lg font-bold text-zinc-900">Recent Quotations</h2>
          <Link
            href="/admin/quotations"
            className="text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors"
          >
            View all →
          </Link>
        </div>
        
        {recent.length === 0 ? (
          <div className="p-8 text-center text-sm font-medium text-zinc-500">No quotations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">ID</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Seller</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Date</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Total</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recent.map(q => (
                  <tr key={q.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900">#{q.id}</td>
                    <td className="px-6 py-4 font-medium text-zinc-600">{q.seller_name}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{formatINR(parseFloat(q.total_amount))}</td>
                    <td className="px-6 py-4"><StatusBadge status={q.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
