'use client'

// src/app/seller/products/page.tsx
// Redesigned: Awwwards-style light theme catalog

import { useEffect, useState } from 'react'
import type { Product, CartItem, BaseUnit } from '@/types'
import { formatINR, COMPATIBLE_UNITS } from '@/lib/units'
import CartDrawer from '@/components/CartDrawer'

export default function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{id:number, name:string}[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [dimFilter, setDimFilter] = useState('all')

  // Cart state
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json())
    ]).then(([pData, cData]) => {
      setProducts(pData.products || [])
      setCategories(cData.categories || [])
      setLoading(false)
    })
  }, [])

  function addToCart(p: Product) {
    setCart(prev => {
      const exists = prev.find(i => i.product.id === p.id)
      if (exists) {
        return prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, {
        product: p,
        orderedUnit: p.dimension === 'weight' ? 'kg' : p.dimension === 'volume' ? 'L' : 'unit',
        quantity: 1
      }]
    })
  }

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter !== 'all' && p.category_id !== parseInt(catFilter)) return false
    if (dimFilter !== 'all' && p.dimension !== dimFilter) return false
    return true
  })

  return (
    <>
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Product Catalog</h1>
          <p className="mt-2 text-sm font-medium text-zinc-500">Browse and add products to your quotation</p>
        </div>
        <button
          id="open-cart-btn"
          onClick={() => setCartOpen(true)}
          className="group relative flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(0,0,0,0.06)]"
        >
          <svg className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Cart
          {cart.length > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs text-white">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 shadow-[0_2px_10px_rgb(0,0,0,0.02)] outline-none transition-all focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-[0_2px_10px_rgb(0,0,0,0.02)] outline-none transition-all focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={dimFilter}
          onChange={e => setDimFilter(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-[0_2px_10px_rgb(0,0,0,0.02)] outline-none transition-all focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
        >
          <option value="all">All Dimensions</option>
          <option value="weight">Weight</option>
          <option value="volume">Volume</option>
          <option value="count">Count</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <svg className="h-8 w-8 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-zinc-200 border-dashed bg-white/50 text-zinc-500">
          <svg className="h-12 w-12 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="font-medium">No products found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(p => {
            const inCart = cart.some(i => i.product.id === p.id)
            return (
              <div key={p.id} className="group relative flex flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-zinc-900 leading-tight">{p.name}</h3>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600 uppercase tracking-wider">
                      {p.dimension}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">{p.sku}</p>
                </div>
                
                <div className="mb-6 flex-1">
                  <p className="text-xs font-medium text-zinc-500 mb-1">Base Price</p>
                  <p className="text-xl font-extrabold tracking-tight text-zinc-900">
                    {formatINR(parseFloat(p.price_per_base_unit))}
                    <span className="text-sm font-semibold text-zinc-400"> / {p.base_unit}</span>
                  </p>
                </div>

                <button
                  onClick={() => addToCart(p)}
                  className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
                    inCart
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10 hover:bg-zinc-800 hover:-translate-y-0.5 hover:shadow-lg'
                  }`}
                >
                  {inCart ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        setCart={setCart}
      />
    </>
  )
}
