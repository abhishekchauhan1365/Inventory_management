'use client'

// src/components/CartDrawer.tsx
// Redesigned: Awwwards-style light cart drawer

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
        className={`fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-[0_0_40px_rgb(0,0,0,0.08)] transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">Quotation Cart</h2>
            {cart.length > 0 && (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600">
                {cart.length} item{cart.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button id="close-cart-btn" onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-bold text-zinc-900">Quotation Placed!</p>
            <p className="text-sm text-zinc-500">Redirecting to your orders…</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-zinc-400">
            <svg className="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="font-medium text-zinc-500">Your cart is completely empty.</p>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[#fafafa]">
              {cart.map(item => {
                const units = COMPATIBLE_UNITS[item.product.dimension]
                const lineTotal = calculateLineTotal(
                  item.quantity,
                  item.orderedUnit,
                  parseFloat(item.product.price_per_base_unit)
                )
                const baseQty = convertToBase(item.quantity, item.orderedUnit)

                return (
                  <div key={item.product.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                    {/* Product name & remove */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-bold text-zinc-900 truncate">{item.product.name}</h3>
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{item.product.sku}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="shrink-0 text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Unit selector */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">Select Unit</p>
                      <div className="flex gap-2">
                        {units.map(u => (
                          <button
                            key={u}
                            onClick={() => updateUnit(item.product.id, u)}
                            className={`rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                              item.orderedUnit === u
                                ? 'border-zinc-900 bg-zinc-900 text-white shadow-md shadow-zinc-900/10'
                                : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity stepper */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">Quantity</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.product.id, -1)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          value={item.quantity}
                          onChange={e => setQtyDirect(item.product.id, e.target.value)}
                          className="h-10 w-24 rounded-xl border border-zinc-200 bg-white px-3 text-center text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                        />
                        <button
                          onClick={() => updateQty(item.product.id, 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Conversion display */}
                    <div className="mb-4 rounded-xl bg-blue-50/50 px-4 py-3 text-sm text-blue-900/70 border border-blue-100/50">
                      <span className="font-bold text-blue-900">{item.quantity} {item.orderedUnit}</span>
                      {' equals '}
                      <span className="font-bold text-blue-900">{displayQty(baseQty, item.product.base_unit)}</span>
                      <span> (base unit)</span>
                    </div>

                    {/* Line total */}
                    <div className="flex items-end justify-between border-t border-zinc-100 pt-4 mt-2">
                      <div className="text-xs font-medium text-zinc-500">
                        {formatINR(item.product.price_per_base_unit)} / {item.product.base_unit}
                      </div>
                      <div className="text-lg font-extrabold text-zinc-900">
                        {formatINR(lineTotal)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 bg-white px-6 py-6 space-y-5">
              {/* Notes */}
              <div>
                <label htmlFor="cart-notes" className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">
                  Order Notes (Optional)
                </label>
                <textarea
                  id="cart-notes"
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Special instructions..."
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {/* Grand total */}
              <div className="flex items-end justify-between py-2">
                <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Grand Total</span>
                <span className="text-2xl font-extrabold tracking-tight text-zinc-900">{formatINR(grandTotal)}</span>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                id="place-quotation-btn"
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="w-full rounded-xl bg-zinc-900 py-4 text-sm font-bold text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] disabled:pointer-events-none disabled:opacity-50"
              >
                {submitting ? 'Placing Quotation...' : 'Place Quotation'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
