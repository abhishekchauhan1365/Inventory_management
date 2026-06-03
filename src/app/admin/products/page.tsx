'use client'

// src/app/admin/products/page.tsx
// Admin products page: full CRUD table with modal form.

import { useState, useEffect, FormEvent } from 'react'
import type { Product, Category, Dimension, BaseUnit } from '@/types'
import { formatINR, displayQty, COMPATIBLE_UNITS } from '@/lib/units'

const DIMENSIONS: Dimension[] = ['weight', 'volume', 'count']

interface ProductForm {
  name: string
  sku: string
  description: string
  category_id: string
  dimension: Dimension
  base_unit: BaseUnit
  price_per_base_unit: string
  stock_in_base_unit: string
  min_order_qty: string
}

const defaultForm: ProductForm = {
  name: '',
  sku: '',
  description: '',
  category_id: '',
  dimension: 'weight',
  base_unit: 'g',
  price_per_base_unit: '',
  stock_in_base_unit: '',
  min_order_qty: '1',
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterDim, setFilterDim] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [pr, cr] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ])
      const pd = await pr.json()
      const cd = await cr.json()
      setProducts(pd.products || [])
      setCategories(cd.categories || [])
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditProduct(null)
    setForm(defaultForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditProduct(p)
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      category_id: p.category_id?.toString() || '',
      dimension: p.dimension,
      base_unit: p.base_unit,
      price_per_base_unit: p.price_per_base_unit,
      stock_in_base_unit: p.stock_in_base_unit,
      min_order_qty: p.min_order_qty,
    })
    setError('')
    setModalOpen(true)
  }

  function handleDimChange(dim: Dimension) {
    const units = COMPATIBLE_UNITS[dim]
    setForm(f => ({ ...f, dimension: dim, base_unit: units[0] }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        price_per_base_unit: parseFloat(form.price_per_base_unit),
        stock_in_base_unit: parseFloat(form.stock_in_base_unit || '0'),
        min_order_qty: parseFloat(form.min_order_qty || '1'),
      }

      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'
      const method = editProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save')
        return
      }

      setModalOpen(false)
      fetchAll()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      fetchAll()
    } catch {
      /* noop */
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchDim = !filterDim || p.dimension === filterDim
    return matchSearch && matchDim
  })

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="mt-1 text-slate-400">Manage your product catalog</p>
        </div>
        <button
          id="add-product-btn"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          id="product-search"
          type="text"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <select
          id="product-filter-dim"
          value={filterDim}
          onChange={e => setFilterDim(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
        >
          <option value="">All Dimensions</option>
          {DIMENSIONS.map(d => (
            <option key={d} value={d} className="capitalize">{d}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 shadow-xl backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <svg className="mr-3 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading products…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/60">
                  {['SKU', 'Name', 'Category', 'Dimension', 'Base Unit', 'Price / Base', 'Stock', 'Min Qty', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr key={p.id} className={`${i !== filtered.length - 1 ? 'border-b border-slate-700/30' : ''} hover:bg-slate-700/20 transition-colors`}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.sku}</td>
                      <td className="px-4 py-3 text-sm font-medium text-white">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{p.category_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 capitalize">
                          {p.dimension}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-300">{p.base_unit}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-400">
                        {formatINR(p.price_per_base_unit)}/{p.base_unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {displayQty(p.stock_in_base_unit, p.base_unit)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {displayQty(p.min_order_qty, p.base_unit)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            id={`edit-product-${p.id}`}
                            onClick={() => openEdit(p)}
                            className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            Edit
                          </button>
                          {deleteConfirm === p.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="rounded-lg border border-red-500/40 bg-red-500/15 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`delete-product-${p.id}`}
                              onClick={() => setDeleteConfirm(p.id)}
                              className="rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/15 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/60 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form id="product-form" onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Product Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">SKU *</label>
                  <input required value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                  <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="">No category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 resize-none" />
                </div>

                {/* Dimension */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Dimension *</label>
                  <div className="flex gap-2">
                    {DIMENSIONS.map(d => (
                      <button key={d} type="button" onClick={() => handleDimChange(d)}
                        className={`flex-1 rounded-xl border py-2.5 text-sm font-medium capitalize transition-all ${
                          form.dimension === d
                            ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                        }`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Base unit */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Base Unit *</label>
                  <div className="flex gap-2">
                    {COMPATIBLE_UNITS[form.dimension].map(u => (
                      <button key={u} type="button" onClick={() => setForm(f => ({ ...f, base_unit: u }))}
                        className={`rounded-xl border px-6 py-2.5 text-sm font-mono font-medium transition-all ${
                          form.base_unit === u
                            ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                        }`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Price per {form.base_unit} (₹) *
                  </label>
                  <input required type="number" step="0.000001" min="0" value={form.price_per_base_unit}
                    onChange={e => setForm(f => ({ ...f, price_per_base_unit: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Stock (in {form.base_unit})
                  </label>
                  <input type="number" step="0.000001" min="0" value={form.stock_in_base_unit}
                    onChange={e => setForm(f => ({ ...f, stock_in_base_unit: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>

                {/* Min order qty */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Min Order Qty (in {form.base_unit})
                  </label>
                  <input type="number" step="0.000001" min="0" value={form.min_order_qty}
                    onChange={e => setForm(f => ({ ...f, min_order_qty: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-end">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button id="product-save-btn" type="submit" disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 transition-all">
                  {saving ? 'Saving…' : editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
