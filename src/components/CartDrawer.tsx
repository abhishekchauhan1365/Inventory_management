'use client'

// src/components/CartDrawer.tsx
// Right-side cart drawer for the seller.
// Allows unit selection, quantity adjustment, live line totals, notes, and quotation submission.

import { useState, useEffect } from 'react'
import type { CartItem, BaseUnit } from '@/types'
import { formatINR, COMPATIBLE_UNITS, calculateLineTotal, convertToBase, displayQty } from '@/lib/units'
import { useRouter } from 'next/navigation'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
}

export default function CartDrawer({ open, onClose, cart, setCart }: CartDrawerProps) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Prevent background scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function updateUnit(productId: number, unit: BaseUnit) {
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, orderedUnit: unit } : i))
  }

  function updateQty(productId: number, delta: number) {
    setCart(prev => prev.map(i => {
      if (i.product.id !== productId) return i
      const next = Math.max(0.001, i.quantity + delta)
      return { ...i, quantity: next }
    }))
  }

  function setQtyDirect(productId: number, val: string) {
    const n = parseFloat(val)
    if (isNaN(n) || n <= 0) return
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: n } : i))
  }

  function removeItem(productId: number) {
    setCart(prev => prev.filter(i => i.product.id !== productId))
  }

  const grandTotal = cart.reduce((sum, item) => {
    return sum + calculateLineTotal(
      item.quantity,
      item.orderedUnit,
      parseFloat(item.product.price_per_base_unit)
    )
  }, 0)

  async function handleSubmit() {
    if (cart.length === 0) return
    setSubmitting(true)
    setError('')
    try {
      const items = cart.map(i => ({
        product_id: i.product.id,
        ordered_unit: i.orderedUnit,
        quantity: i.quantity,
      }))

      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, notes }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit quotation')
        return
      }

      setSuccess(true)
      setCart([])
      setNotes('')
      setTimeout(() => {
        setSuccess(false)
        onClose()
        router.push('/seller/quotations')
        router.refresh()
      }, 1800)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-700/60 bg-slate-900 shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-white">Your Cart</h2>
            {cart.length > 0 && (
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
                {cart.length} item{cart.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button id="close-cart-btn" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">Quotation Submitted!</p>
            <p className="text-sm text-slate-400">Redirecting to your orders…</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-500">
            <svg className="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm">Add products from the catalog</p>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.map(item => {
                const units = COMPATIBLE_UNITS[item.product.dimension]
                const lineTotal = calculateLineTotal(
                  item.quantity,
                  item.orderedUnit,
                  parseFloat(item.product.price_per_base_unit)
                )
                const baseQty = convertToBase(item.quantity, item.orderedUnit)

                return (
                  <div key={item.product.id} className="rounded-xl border border-slate-700/50 bg-slate-800/70 p-4">
                    {/* Product name & remove */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{item.product.name}</p>
                        <p className="text-xs font-mono text-slate-500">{item.product.sku}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="ml-2 shrink-0 rounded-lg p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Unit selector */}
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 mb-1.5">Unit</p>
                      <div className="flex gap-1.5">
                        {units.map(u => (
                          <button
                            key={u}
                            onClick={() => updateUnit(item.product.id, u)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                              item.orderedUnit === u
                                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                : 'border-slate-600 bg-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity stepper */}
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 mb-1.5">Quantity</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.product.id, -1)}
                          className="h-8 w-8 rounded-lg border border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors flex items-center justify-center text-sm font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          value={item.quantity}
                          onChange={e => setQtyDirect(item.product.id, e.target.value)}
                          className="w-20 rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-center text-sm text-white outline-none focus:border-blue-500"
                        />
                        <span className="text-xs font-mono text-slate-400">{item.orderedUnit}</span>
                        <button
                          onClick={() => updateQty(item.product.id, 1)}
                          className="h-8 w-8 rounded-lg border border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors flex items-center justify-center text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Conversion display */}
                    <div className="rounded-lg bg-slate-700/40 px-3 py-2 text-xs text-slate-400 mb-3">
                      <span className="font-medium text-slate-300">{item.quantity} {item.orderedUnit}</span>
                      {' = '}
                      <span className="font-medium text-blue-400">{displayQty(baseQty, item.product.base_unit)}</span>
                      <span className="text-slate-500"> (base unit)</span>
                    </div>

                    {/* Line total */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {formatINR(item.product.price_per_base_unit)} / {item.product.base_unit}
                      </span>
                      <span className="font-bold text-emerald-400">{formatINR(lineTotal)}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700/60 px-5 py-4 space-y-4">
              {/* Notes */}
              <div>
                <label htmlFor="cart-notes" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  id="cart-notes"
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special requirements or delivery notes…"
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Grand total */}
              <div className="flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3">
                <span className="text-sm font-semibold text-slate-300">Grand Total</span>
                <span className="text-xl font-bold text-white">{formatINR(grandTotal)}</span>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                id="place-quotation-btn"
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Placing Quotation…
                  </span>
                ) : (
                  `Place Quotation — ${formatINR(grandTotal)}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
