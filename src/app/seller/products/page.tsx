'use client'

// src/app/seller/products/page.tsx
// Seller product browsing with search/filter, product cards grid, and cart drawer.

import { useState, useEffect } from 'react'
import type { Product, Category, CartItem, Dimension } from '@/types'
import type { BaseUnit } from '@/types'
import { formatINR, displayQty, COMPATIBLE_UNITS, convertToBase, calculateLineTotal } from '@/lib/units'
import CartDrawer from '@/components/CartDrawer'

const DIMENSIONS: { value: Dimension | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'weight', label: 'Weight' },
  { value: 'volume', label: 'Volume' },
  { value: 'count', label: 'Count' },
]

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterDim, setFilterDim] = useState<Dimension | ''>('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [addedId, setAddedId] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [pr, cr] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ])
      const pd = await pr.json()
      const cd = await cr.json()
      setProducts(pd.products || [])
      setCategories(cd.categories || [])
      setLoading(false)
    }
    load()
  }, [])

  function addToCart(product: Product) {
    const defaultUnit = COMPATIBLE_UNITS[product.dimension][0]
    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id)
      if (exists) {
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { product, orderedUnit: defaultUnit, quantity: 1 }]
    })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  const filtered = products.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const mc = !filterCat || p.category_id?.toString() === filterCat
    const md = !filterDim || p.dimension === filterDim
    return ms && mc && md
  })

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Product Catalog</h1>
          <p className="mt-1 text-slate-400">Browse and add products to your quotation</p>
        </div>
        <button
          id="open-cart-btn"
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-2.5 text-sm font-semibold text-blue-400 hover:bg-blue-500/20 transition-all"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Cart
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          id="product-search"
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <select
          id="filter-category"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-2">
          {DIMENSIONS.map(d => (
            <button
              key={d.value}
              id={`filter-dim-${d.value || 'all'}`}
              onClick={() => setFilterDim(d.value)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                filterDim === d.value
                  ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <svg className="mr-3 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading products…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/60 py-24 text-slate-500">
          <svg className="mb-3 h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(p => {
            const inCart = cart.find(i => i.product.id === p.id)
            const justAdded = addedId === p.id

            const dimColors: Record<Dimension, string> = {
              weight: 'bg-amber-500/15 text-amber-400',
              volume: 'bg-blue-500/15 text-blue-400',
              count: 'bg-purple-500/15 text-purple-400',
            }

            return (
              <div key={p.id} className="group flex flex-col rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-600 hover:shadow-xl">
                {/* Top badges */}
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                  {p.category_name && (
                    <span className="rounded-full bg-slate-700/80 px-2.5 py-1 text-xs font-medium text-slate-300">
                      {p.category_name}
                    </span>
                  )}
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${dimColors[p.dimension]} capitalize`}>
                    {p.dimension}
                  </span>
                </div>

                {/* Product info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-white leading-tight">{p.name}</h3>
                  <p className="mt-0.5 font-mono text-xs text-slate-500">{p.sku}</p>
                  {p.description && (
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">{p.description}</p>
                  )}
                </div>

                {/* Price & stock */}
                <div className="mt-4 border-t border-slate-700/50 pt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Price</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {formatINR(p.price_per_base_unit)}
                      <span className="text-xs font-normal text-slate-500 ml-1">/ {p.base_unit}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Stock</span>
                    <span className="text-xs font-medium text-slate-300">
                      {displayQty(p.stock_in_base_unit, p.base_unit)}
                    </span>
                  </div>
                </div>

                {/* Add to cart */}
                <button
                  id={`add-to-cart-${p.id}`}
                  onClick={() => addToCart(p)}
                  className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                    justAdded
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : inCart
                      ? 'border border-blue-500/40 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500'
                  }`}
                >
                  {justAdded ? '✓ Added!' : inCart ? `In Cart (×${inCart.quantity})` : 'Add to Cart'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        setCart={setCart}
      />
    </div>
  )
}
