// src/app/api/quotations/[id]/route.ts
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'fulfilled'] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return Response.json({ error: 'Forbidden: admin only' }, { status: 403 })

  try {
    const { id } = await params
    const quotationId = parseInt(id)
    if (isNaN(quotationId)) return Response.json({ error: 'Invalid quotation ID' }, { status: 400 })

    const body = await request.json()
    const { status } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return Response.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE quotations
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${quotationId}
      RETURNING id
    `

    if (result.length === 0) {
      return Response.json({ error: 'Quotation not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Quotations PATCH error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
