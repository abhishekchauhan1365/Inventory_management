// src/app/api/quotations/route.ts
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'
import { convertToBase, calculateLineTotal } from '@/lib/units'
import type { BaseUnit } from '@/types'

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Admin sees all quotations; seller sees only their own
    const quotations = session.role === 'admin'
      ? await sql`
          SELECT
            q.id, q.seller_id, u.name AS seller_name, u.email AS seller_email,
            q.status, q.notes, q.total_amount, q.created_at, q.updated_at,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', qi.id,
                  'product_id', qi.product_id,
                  'product_name', p.name,
                  'product_sku', p.sku,
                  'ordered_unit', qi.ordered_unit,
                  'quantity_in_ordered_unit', qi.quantity_in_ordered_unit,
                  'quantity_in_base_unit', qi.quantity_in_base_unit,
                  'price_per_base_unit', qi.price_per_base_unit,
                  'line_total', qi.line_total
                ) ORDER BY qi.id
              ) FILTER (WHERE qi.id IS NOT NULL),
              '[]'
            ) AS items
          FROM quotations q
          JOIN users u ON q.seller_id = u.id
          LEFT JOIN quotation_items qi ON qi.quotation_id = q.id
          LEFT JOIN products p ON qi.product_id = p.id
          GROUP BY q.id, u.name, u.email
          ORDER BY q.created_at DESC
        `
      : await sql`
          SELECT
            q.id, q.seller_id, ${session.name} AS seller_name, ${session.email} AS seller_email,
            q.status, q.notes, q.total_amount, q.created_at, q.updated_at,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', qi.id,
                  'product_id', qi.product_id,
                  'product_name', p.name,
                  'product_sku', p.sku,
                  'ordered_unit', qi.ordered_unit,
                  'quantity_in_ordered_unit', qi.quantity_in_ordered_unit,
                  'quantity_in_base_unit', qi.quantity_in_base_unit,
                  'price_per_base_unit', qi.price_per_base_unit,
                  'line_total', qi.line_total
                ) ORDER BY qi.id
              ) FILTER (WHERE qi.id IS NOT NULL),
              '[]'
            ) AS items
          FROM quotations q
          LEFT JOIN quotation_items qi ON qi.quotation_id = q.id
          LEFT JOIN products p ON qi.product_id = p.id
          WHERE q.seller_id = ${session.userId}
          GROUP BY q.id
          ORDER BY q.created_at DESC
        `

    return Response.json({ quotations })
  } catch (error) {
    console.error('Quotations GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { items, notes } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'At least one item is required' }, { status: 400 })
    }

    // Validate each item and compute conversion + totals
    let totalAmount = 0
    const processedItems: Array<{
      product_id: number
      ordered_unit: BaseUnit
      quantity_in_ordered_unit: number
      quantity_in_base_unit: number
      price_per_base_unit: number
      line_total: number
    }> = []

    for (const item of items) {
      const { product_id, ordered_unit, quantity } = item

      if (!product_id || !ordered_unit || !quantity || quantity <= 0) {
        return Response.json({ error: 'Invalid item data' }, { status: 400 })
      }

      // Fetch current product price snapshot
      const products = await sql`
        SELECT id, price_per_base_unit, is_active, dimension
        FROM products
        WHERE id = ${product_id} AND is_active = TRUE
        LIMIT 1
      `

      if (products.length === 0) {
        return Response.json(
          { error: `Product ${product_id} not found or inactive` },
          { status: 400 }
        )
      }

      const product = products[0]
      const pricePerBase = parseFloat(product.price_per_base_unit)
      const qtyInBase = convertToBase(parseFloat(quantity), ordered_unit as BaseUnit)
      const lineTotal = calculateLineTotal(
        parseFloat(quantity),
        ordered_unit as BaseUnit,
        pricePerBase
      )

      totalAmount += lineTotal
      processedItems.push({
        product_id,
        ordered_unit,
        quantity_in_ordered_unit: parseFloat(quantity),
        quantity_in_base_unit: qtyInBase,
        price_per_base_unit: pricePerBase,
        line_total: lineTotal,
      })
    }

    // Insert quotation
    const quotationResult = await sql`
      INSERT INTO quotations (seller_id, notes, total_amount)
      VALUES (${session.userId}, ${notes || null}, ${totalAmount})
      RETURNING id
    `
    const quotationId = quotationResult[0].id

    // Insert all items
    for (const item of processedItems) {
      await sql`
        INSERT INTO quotation_items (
          quotation_id, product_id, ordered_unit,
          quantity_in_ordered_unit, quantity_in_base_unit,
          price_per_base_unit, line_total
        ) VALUES (
          ${quotationId}, ${item.product_id}, ${item.ordered_unit},
          ${item.quantity_in_ordered_unit}, ${item.quantity_in_base_unit},
          ${item.price_per_base_unit}, ${item.line_total}
        )
      `
    }

    return Response.json({ success: true, id: quotationId }, { status: 201 })
  } catch (error) {
    console.error('Quotations POST error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
