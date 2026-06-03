// src/app/admin/page.tsx
// Admin dashboard with stat cards and recent quotations table.
import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { formatINR } from '@/lib/units'
import type { Quotation } from '@/types'

export const metadata: Metadata = { title: 'Dashboard' }

async function getStats() {
  const [productCount, quotationStats, sellerCount, recentQuotations] = await Promise.all([
    sql`SELECT COUNT(*) AS count FROM products WHERE is_active = TRUE`,
    sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COALESCE(SUM(total_amount) FILTER (WHERE status IN ('approved', 'fulfilled')), 0) AS revenue
      FROM quotations
    `,
    sql`SELECT COUNT(*) AS count FROM users WHERE role = 'seller'`,
    sql`
      SELECT q.id, q.seller_id, u.name AS seller_name, q.status, q.total_amount, q.created_at
      FROM quotations q
      JOIN users u ON q.seller_id = u.id
      ORDER BY q.created_at DESC
      LIMIT 8
    `,
  ])

  return {
    totalProducts: parseInt(productCount[0].count),
    totalQuotations: parseInt(quotationStats[0].total),
    pendingQuotations: parseInt(quotationStats[0].pending),
    totalRevenue: quotationStats[0].revenue as string,
    totalSellers: parseInt(sellerCount[0].count),
    recentQuotations: recentQuotations as Quotation[],
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-slate-400">Overview of your MedChem inventory system</p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Active Products"
          value={stats.totalProducts}
          color="blue"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          title="Total Quotations"
          value={stats.totalQuotations}
          color="purple"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingQuotations}
          color="amber"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Revenue"
          value={formatINR(stats.totalRevenue)}
          color="emerald"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Sellers"
          value={stats.totalSellers}
          color="rose"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent quotations */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-700/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Recent Quotations</h2>
          <a
            href="/admin/quotations"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/40">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentQuotations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No quotations yet
                  </td>
                </tr>
              ) : (
                stats.recentQuotations.map((q, i) => (
                  <tr
                    key={q.id}
                    className={`${i !== stats.recentQuotations.length - 1 ? 'border-b border-slate-700/30' : ''} transition-colors hover:bg-slate-700/30`}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">#{q.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white">{q.seller_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(q.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      {formatINR(q.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={q.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
