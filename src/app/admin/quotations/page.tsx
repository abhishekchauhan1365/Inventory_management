'use client'

// src/app/admin/quotations/page.tsx
// Redesigned: Awwwards-style admin quotation management

import { useEffect, useState } from 'react'
import type { Quotation, QuotationStatus } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { formatINR } from '@/lib/units'

const STATUSES: QuotationStatus[] = ['pending', 'approved', 'rejected', 'fulfilled']

export default function AdminQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  async function fetchQuotations() {
    const res = await fetch('/api/quotations')
    const data = await res.json()
    setQuotations(data.quotations || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchQuotations()
  }, [])

  async function updateStatus(id: number, status: QuotationStatus) {
    await fetch(`/api/quotations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    fetchQuotations()
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <svg className="h-8 w-8 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Quotation Management</h1>
        <p className="mt-2 text-sm font-medium text-zinc-500">Review and approve incoming seller quotations</p>
      </div>

      {quotations.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-zinc-200 border-dashed bg-white/50 text-zinc-500">
          <svg className="h-12 w-12 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-medium">No quotations exist yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map(q => {
            const isOpen = expandedId === q.id
            return (
              <div 
                key={q.id} 
                className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                  isOpen ? 'border-zinc-300 shadow-[0_12px_40px_rgb(0,0,0,0.06)] scale-[1.01]' : 'border-zinc-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-zinc-300'
                }`}
              >
                {/* Header row (clickable) */}
                <div 
                  onClick={() => setExpandedId(isOpen ? null : q.id)}
                  className="flex cursor-pointer items-center justify-between p-6"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-900 border border-zinc-100">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 flex items-center gap-3">
                        Quotation #{q.id}
                        <span className="text-sm font-medium text-zinc-500">by {q.seller_name}</span>
                      </h3>
                      <p className="text-xs font-medium text-zinc-400 mt-1">
                        {new Date(q.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="text-lg font-extrabold text-zinc-900">{formatINR(parseFloat(q.total_amount))}</p>
                    </div>
                    <StatusBadge status={q.status} />
                    <svg
                      className={`h-5 w-5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-zinc-900' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-zinc-100 bg-zinc-50/50 px-6 pb-6 pt-5">
                    {/* Status update buttons */}
                    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 border border-zinc-200 shadow-sm">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 mr-2 ml-2">
                        Update Status:
                      </span>
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          id={`status-${s}-${q.id}`}
                          onClick={() => updateStatus(q.id, s)}
                          className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                            q.status === s 
                              ? 'bg-zinc-900 text-white shadow-md' 
                              : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    {q.notes && (
                      <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900/60 mb-1">Order Notes</h4>
                        <p className="text-sm font-medium text-amber-900">{q.notes}</p>
                      </div>
                    )}
                    
                    <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Line Items ({q.items?.length || 0})</h4>
                    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-zinc-200 text-zinc-400 font-semibold tracking-wide bg-zinc-50/50">
                            <th className="py-3 px-4 font-semibold uppercase text-xs">Product</th>
                            <th className="py-3 px-4 font-semibold uppercase text-xs">Ordered Qty</th>
                            <th className="py-3 px-4 font-semibold uppercase text-xs">Base Qty</th>
                            <th className="py-3 px-4 font-semibold uppercase text-xs text-right">Price Rate</th>
                            <th className="py-3 px-4 font-semibold uppercase text-xs text-right">Line Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {q.items?.map(item => (
                            <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                              <td className="py-4 px-4">
                                <p className="font-bold text-zinc-900">{item.product_name}</p>
                                <p className="text-xs font-medium text-zinc-500 mt-0.5">{item.product_sku}</p>
                              </td>
                              <td className="py-4 px-4 font-medium text-zinc-700">
                                {item.quantity_in_ordered_unit} {item.ordered_unit}
                              </td>
                              <td className="py-4 px-4 font-medium text-blue-600">
                                {item.quantity_in_base_unit}
                              </td>
                              <td className="py-4 px-4 text-right font-medium text-zinc-500">
                                {formatINR(parseFloat(item.price_per_base_unit))}
                              </td>
                              <td className="py-4 px-4 text-right font-bold text-zinc-900">
                                {formatINR(parseFloat(item.line_total))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-zinc-200 bg-zinc-50/50">
                            <td colSpan={4} className="py-4 pr-4 text-right text-sm font-bold text-zinc-500 uppercase tracking-wider">
                              Grand Total
                            </td>
                            <td className="py-4 px-4 text-right text-lg font-extrabold text-zinc-900">
                              {formatINR(parseFloat(q.total_amount))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
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
