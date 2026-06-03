// src/app/api/products/route.ts
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('category') || ''
    const dimension = searchParams.get('dimension') || ''

    const products = await sql`
      SELECT
        p.id, p.name, p.sku, p.description,
        p.category_id, c.name AS category_name,
        p.dimension, p.base_unit,
        p.price_per_base_unit, p.stock_in_base_unit, p.min_order_qty,
        p.is_active, p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
        AND (${search} = '' OR p.name ILIKE ${'%' + search + '%'} OR p.sku ILIKE ${'%' + search + '%'})
        AND (${categoryId} = '' OR p.category_id = ${categoryId === '' ? null : parseInt(categoryId)})
        AND (${dimension} = '' OR p.dimension = ${dimension})
      ORDER BY p.created_at DESC
    `

    return Response.json({ products })
  } catch (error) {
    console.error('Products GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.role !== 'admin') {
    return Response.json({ error: 'Forbidden: admin only' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      name, sku, description, category_id, dimension, base_unit,
      price_per_base_unit, stock_in_base_unit, min_order_qty
    } = body

    if (!name || !sku || !dimension || !base_unit || price_per_base_unit == null) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO products (
        name, sku, description, category_id, dimension, base_unit,
        price_per_base_unit, stock_in_base_unit, min_order_qty
      ) VALUES (
        ${name}, ${sku}, ${description || null},
        ${category_id || null}, ${dimension}, ${base_unit},
        ${price_per_base_unit}, ${stock_in_base_unit || 0}, ${min_order_qty || 1}
      )
      RETURNING id
    `

    return Response.json({ success: true, id: result[0].id }, { status: 201 })
  } catch (error: unknown) {
    console.error('Products POST error:', error)
    if (
      error instanceof Error &&
      error.message.includes('duplicate key')
    ) {
      return Response.json({ error: 'SKU already exists' }, { status: 409 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
