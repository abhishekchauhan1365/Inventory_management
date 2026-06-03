'use client'

// src/app/admin/quotations/page.tsx
// Admin quotations: expandable list with line-item detail and status update buttons.

import { useState, useEffect } from 'react'
import type { Quotation, QuotationStatus } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { formatINR, displayQty } from '@/lib/units'
import type { BaseUnit } from '@/types'

const STATUSES: QuotationStatus[] = ['pending', 'approved', 'rejected', 'fulfilled']

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [updating, setUpdating] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { fetchQuotations() }, [])

  async function fetchQuotations() {
    setLoading(true)
    try {
      const res = await fetch('/api/quotations')
      const data = await res.json()
      setQuotations(data.quotations || [])
    } finally {
      setLoading(false)
    }
  }

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function updateStatus(id: number, status: QuotationStatus) {
    setUpdating(id)
    try {
      await fetch(`/api/quotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await fetchQuotations()
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filterStatus
    ? quotations.filter(q => q.status === filterStatus)
    : quotations

  const statusColors: Record<QuotationStatus, string> = {
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
    approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
    rejected: 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20',
    fulfilled: 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quotations</h1>
          <p className="mt-1 text-slate-400">Review and manage seller quotation requests</p>
        </div>
        <select
          id="quotation-filter-status"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <svg className="mr-3 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading quotations…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/60 py-24 text-slate-500">
          <svg className="mb-3 h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          No quotations found
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => {
            const isOpen = expanded.has(q.id)
            const isUpdating = updating === q.id

            return (
              <div key={q.id} className="rounded-2xl border border-slate-700/60 bg-slate-800/60 shadow-lg overflow-hidden">
                {/* Header row */}
                <button
                  id={`quotation-row-${q.id}`}
                  onClick={() => toggleExpand(q.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-slate-700/30 transition-colors"
                >
                  <svg
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>

                  <span className="font-mono text-sm text-slate-400 w-14">#{q.id}</span>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{q.seller_name}</p>
                    <p className="text-xs text-slate-500">{q.seller_email}</p>
                  </div>

                  <div className="hidden sm:block text-sm text-slate-400">
                    {new Date(q.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </div>

                  <div className="font-semibold text-white">{formatINR(q.total_amount)}</div>
                  <StatusBadge status={q.status} />
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-slate-700/50 px-6 pb-5 pt-4">
                    {/* Notes */}
                    {q.notes && (
                      <div className="mb-4 rounded-xl border border-slate-700/50 bg-slate-700/30 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-300">{q.notes}</p>
                      </div>
                    )}

                    {/* Line items table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-700/40">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700/40 bg-slate-800/50">
                            {['Product', 'SKU', 'Ordered Qty', 'Base Qty', 'Rate / Base', 'Line Total'].map(h => (
                              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(q.items || []).map((item, idx) => (
                            <tr key={item.id} className={idx !== (q.items?.length ?? 0) - 1 ? 'border-b border-slate-700/30' : ''}>
                              <td className="px-4 py-3 text-sm font-medium text-white">{item.product_name}</td>
                              <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.product_sku}</td>
                              <td className="px-4 py-3 text-sm text-slate-300">
                                <span className="font-semibold">{parseFloat(item.quantity_in_ordered_unit).toFixed(2)}</span>
                                <span className="ml-1 text-xs text-slate-500 font-mono">{item.ordered_unit}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-400">
                                <span className="text-xs">
                                  {displayQty(item.quantity_in_base_unit, item.ordered_unit as BaseUnit)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-300">{formatINR(item.price_per_base_unit)}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-emerald-400">{formatINR(item.line_total)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-700/40 bg-slate-800/30">
                            <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-slate-400">
                              Total
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-white">
                              {formatINR(q.total_amount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Status update buttons */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
                        Update Status:
                      </span>
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          id={`status-${s}-${q.id}`}
                          onClick={() => updateStatus(q.id, s)}
                          disabled={isUpdating || q.status === s}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                            q.status === s
                              ? statusColors[s] + ' ring-1 ring-current/30'
                              : 'border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          {isUpdating ? '…' : s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
