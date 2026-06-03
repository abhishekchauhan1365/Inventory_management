// src/app/api/products/[id]/route.ts
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return Response.json({ error: 'Forbidden: admin only' }, { status: 403 })

  try {
    const { id } = await params
    const productId = parseInt(id)
    if (isNaN(productId)) return Response.json({ error: 'Invalid product ID' }, { status: 400 })

    const body = await request.json()
    const {
      name, sku, description, category_id, dimension, base_unit,
      price_per_base_unit, stock_in_base_unit, min_order_qty, is_active
    } = body

    if (!name || !sku || !dimension || !base_unit || price_per_base_unit == null) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await sql`
      UPDATE products SET
        name = ${name},
        sku = ${sku},
        description = ${description || null},
        category_id = ${category_id || null},
        dimension = ${dimension},
        base_unit = ${base_unit},
        price_per_base_unit = ${price_per_base_unit},
        stock_in_base_unit = ${stock_in_base_unit || 0},
        min_order_qty = ${min_order_qty || 1},
        is_active = ${is_active !== undefined ? is_active : true}
      WHERE id = ${productId}
      RETURNING id
    `

    if (result.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error: unknown) {
    console.error('Products PUT error:', error)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return Response.json({ error: 'SKU already exists' }, { status: 409 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return Response.json({ error: 'Forbidden: admin only' }, { status: 403 })

  try {
    const { id } = await params
    const productId = parseInt(id)
    if (isNaN(productId)) return Response.json({ error: 'Invalid product ID' }, { status: 400 })

    // Soft delete — set is_active = false
    const result = await sql`
      UPDATE products SET is_active = FALSE WHERE id = ${productId} RETURNING id
    `

    if (result.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Products DELETE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
