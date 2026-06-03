'use client'

// src/app/seller/quotations/page.tsx
// Seller's quotation history with expandable line-item detail.

import { useState, useEffect } from 'react'
import type { Quotation } from '@/types'
import type { BaseUnit } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { formatINR, displayQty } from '@/lib/units'

export default function SellerQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/quotations')
        const data = await res.json()
        setQuotations(data.quotations || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">My Quotations</h1>
        <p className="mt-1 text-slate-400">Track all your submitted quotation requests</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <svg className="mr-3 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading your quotations…
        </div>
      ) : quotations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/60 py-24 text-slate-500">
          <svg className="mb-4 h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">No quotations yet</p>
          <p className="mt-1 text-sm">Browse products and place your first order</p>
          <a
            href="/seller/products"
            className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            Browse Products →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {quotations.map(q => {
            const isOpen = expanded.has(q.id)

            return (
              <div key={q.id} className="rounded-2xl border border-slate-700/60 bg-slate-800/60 shadow-lg overflow-hidden">
                {/* Summary row */}
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

                  <div className="flex-1 text-sm text-slate-400">
                    {new Date(q.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {(q.items || []).length} item{(q.items || []).length !== 1 ? 's' : ''}
                  </div>

                  <div className="font-bold text-white">{formatINR(q.total_amount)}</div>
                  <StatusBadge status={q.status} />
                </button>

                {/* Expanded view */}
                {isOpen && (
                  <div className="border-t border-slate-700/50 px-6 pb-5 pt-4">
                    {q.notes && (
                      <div className="mb-4 rounded-xl border border-slate-700/50 bg-slate-700/30 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-300">{q.notes}</p>
                      </div>
                    )}

                    <div className="overflow-x-auto rounded-xl border border-slate-700/40">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700/40 bg-slate-800/50">
                            {['Product', 'SKU', 'Ordered', 'Base Qty', 'Rate', 'Line Total'].map(h => (
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
                              <td className="px-4 py-3 text-sm">
                                <span className="font-semibold text-white">{parseFloat(item.quantity_in_ordered_unit).toFixed(2)}</span>
                                <span className="ml-1 font-mono text-xs text-slate-500">{item.ordered_unit}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-blue-400 text-xs">
                                {displayQty(item.quantity_in_base_unit, item.ordered_unit as BaseUnit)}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-300">{formatINR(item.price_per_base_unit)}</td>
                              <td className="px-4 py-3 text-sm font-bold text-emerald-400">{formatINR(item.line_total)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-700/40 bg-slate-800/30">
                            <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-slate-400">Total</td>
                            <td className="px-4 py-3 text-sm font-bold text-white">{formatINR(q.total_amount)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Status info */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last updated: {new Date(q.updated_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
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
