// src/types/index.ts
// Shared TypeScript interfaces for the MedChem application

export type UserRole = 'admin' | 'seller'
export type Dimension = 'weight' | 'volume' | 'count'
export type BaseUnit = 'g' | 'kg' | 'mL' | 'L' | 'unit'
export type QuotationStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  created_at: string
}

export interface Category {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface Product {
  id: number
  name: string
  sku: string
  description: string | null
  category_id: number | null
  category_name?: string
  dimension: Dimension
  base_unit: BaseUnit
  price_per_base_unit: string // NUMERIC comes back as string from pg
  stock_in_base_unit: string
  min_order_qty: string
  is_active: boolean
  created_at: string
}

export interface QuotationItem {
  id: number
  quotation_id: number
  product_id: number
  product_name?: string
  product_sku?: string
  ordered_unit: BaseUnit
  quantity_in_ordered_unit: string
  quantity_in_base_unit: string
  price_per_base_unit: string
  line_total: string
}

export interface Quotation {
  id: number
  seller_id: number
  seller_name?: string
  seller_email?: string
  status: QuotationStatus
  notes: string | null
  total_amount: string
  created_at: string
  updated_at: string
  items?: QuotationItem[]
}

export interface CartItem {
  product: Product
  orderedUnit: BaseUnit
  quantity: number
}

export interface Session {
  userId: number
  email: string
  name: string
  role: UserRole
}

export interface Stats {
  totalProducts: number
  totalQuotations: number
  pendingQuotations: number
  totalRevenue: string
  totalSellers: number
  recentQuotations: Quotation[]
}
