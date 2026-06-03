// src/app/api/stats/route.ts
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return Response.json({ error: 'Forbidden: admin only' }, { status: 403 })

  try {
    const [productCount, quotationStats, sellerCount, recentQuotations] = await Promise.all([
      sql`SELECT COUNT(*) AS count FROM products WHERE is_active = TRUE`,
      sql`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending,
          COALESCE(SUM(total_amount) FILTER (WHERE status IN ('approved', 'fulfilled')), 0) AS revenue
        FROM quotations
      `,
      sql`SELECT COUNT(*) AS count FROM users WHERE role = 'seller'`,
      sql`
        SELECT
          q.id, q.seller_id, u.name AS seller_name,
          q.status, q.total_amount, q.created_at
        FROM quotations q
        JOIN users u ON q.seller_id = u.id
        ORDER BY q.created_at DESC
        LIMIT 5
      `,
    ])

    return Response.json({
      stats: {
        totalProducts: parseInt(productCount[0].count),
        totalQuotations: parseInt(quotationStats[0].total),
        pendingQuotations: parseInt(quotationStats[0].pending),
        totalRevenue: quotationStats[0].revenue,
        totalSellers: parseInt(sellerCount[0].count),
        recentQuotations,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
