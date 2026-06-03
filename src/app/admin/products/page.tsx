'use client'

// src/app/admin/products/page.tsx
// Redesigned: Awwwards-style minimal product management

import { useEffect, useState } from 'react'
import type { Product, BaseUnit } from '@/types'
import { formatINR } from '@/lib/units'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  // Form state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [categoryId, setCategoryId] = useState(1)
  const [dimension, setDimension] = useState<'weight' | 'volume' | 'count'>('weight')
  const [baseUnit, setBaseUnit] = useState<BaseUnit>('g')
  const [pricePerBase, setPricePerBase] = useState('0')

  async function fetchProducts() {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data.products || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  function openNew() {
    setEditingId(null)
    setName('')
    setSku('')
    setCategoryId(1)
    setDimension('weight')
    setBaseUnit('g')
    setPricePerBase('0')
    setError('')
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditingId(p.id)
    setName(p.name)
    setSku(p.sku)
    setCategoryId(p.category_id || 1)
    setDimension(p.dimension as any)
    setBaseUnit(p.base_unit)
    setPricePerBase(p.price_per_base_unit)
    setError('')
    setModalOpen(true)
  }

  async function saveProduct() {
    const payload = { name, sku, category_id: categoryId, dimension, base_unit: baseUnit, price_per_base_unit: pricePerBase }
    const url = editingId ? `/api/products/${editingId}` : '/api/products'
    const method = editingId ? 'PUT' : 'POST'
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to save')
      return
    }
    
    setModalOpen(false)
    fetchProducts()
  }

  async function deleteProduct(id: number) {
    if (!confirm('Are you sure you want to deactivate this product?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  // Handle cascading dimension -> baseUnit changes
  useEffect(() => {
    if (dimension === 'weight' && baseUnit !== 'g' && baseUnit !== 'kg') setBaseUnit('g')
    if (dimension === 'volume' && baseUnit !== 'mL' && baseUnit !== 'L') setBaseUnit('mL')
    if (dimension === 'count') setBaseUnit('unit')
  }, [dimension, baseUnit])

  return (
    <div>
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Products</h1>
          <p className="mt-2 text-sm font-medium text-zinc-500">Manage your inventory catalog</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/30"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <svg className="h-8 w-8 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-zinc-500">
            <p className="font-medium">No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Product Details</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Dimension</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Base Price</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map(p => (
                  <tr key={p.id} className={`transition-colors hover:bg-zinc-50/50 ${!p.is_active ? 'opacity-50 grayscale' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-900">{p.name}</p>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-1">{p.sku}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600 uppercase tracking-wider">
                        {p.dimension}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-900">{formatINR(parseFloat(p.price_per_base_unit))}</p>
                      <p className="text-xs font-medium text-zinc-500">per {p.base_unit}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.is_active ? (
                        <div className="flex justify-end gap-3">
                          <button onClick={() => openEdit(p)} className="text-zinc-400 hover:text-blue-600 transition-colors font-semibold">Edit</button>
                          <button onClick={() => deleteProduct(p.id)} className="text-zinc-400 hover:text-red-500 transition-colors font-semibold">Delete</button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider bg-red-50 px-2 py-1 rounded">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8">
            <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-zinc-900">
              {editingId ? 'Edit Product' : 'Add Product'}
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-900 mb-2 uppercase tracking-wide">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
                  placeholder="e.g. Paracetamol 500mg"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-zinc-900 mb-2 uppercase tracking-wide">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
                  placeholder="PARA-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 mb-2 uppercase tracking-wide">Dimension</label>
                  <select
                    value={dimension}
                    onChange={e => setDimension(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="weight">Weight</option>
                    <option value="volume">Volume</option>
                    <option value="count">Count (Items)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 mb-2 uppercase tracking-wide">Base Unit</label>
                  <select
                    value={baseUnit}
                    onChange={e => setBaseUnit(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
                  >
                    {dimension === 'weight' && <><option value="g">Grams (g)</option><option value="kg">Kilograms (kg)</option></>}
                    {dimension === 'volume' && <><option value="mL">Milliliters (mL)</option><option value="L">Liters (L)</option></>}
                    {dimension === 'count' && <option value="unit">Unit</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 mb-2 uppercase tracking-wide">
                  Price per Base Unit (₹)
                </label>
                <div className="flex items-center">
                  <span className="rounded-l-xl border border-r-0 border-zinc-200 bg-zinc-100 px-4 py-3.5 text-zinc-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={pricePerBase}
                    onChange={e => setPricePerBase(e.target.value)}
                    className="w-full rounded-r-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3.5 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500 font-medium">This is the exact price stored in the database for 1 {baseUnit}.</p>
              </div>
            </div>

            {error && <p className="mt-4 text-sm font-semibold text-red-500">{error}</p>}
            
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl px-5 py-3 text-sm font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/30"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
