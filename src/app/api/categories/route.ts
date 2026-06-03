// src/app/api/categories/route.ts
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const categories = await sql`
      SELECT id, name, description, created_at
      FROM categories
      ORDER BY name ASC
    `
    return Response.json({ categories })
  } catch (error) {
    console.error('Categories error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
