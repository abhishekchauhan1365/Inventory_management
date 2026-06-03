// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { ensureDatabase } from '@/lib/schema'
import { signToken, buildCookieHeader } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Initialize schema and seed data on first run (idempotent)
    await ensureDatabase()

    const users = await sql`
      SELECT id, email, password_hash, name, role
      FROM users
      WHERE LOWER(email) = ${email.toLowerCase().trim()}
      LIMIT 1
    `

    if (users.length === 0) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = users[0]
    const passwordValid = await bcrypt.compare(password, user.password_hash)

    if (!passwordValid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'seller',
    }

    const token = await signToken(session)
    const cookieHeader = buildCookieHeader(token)

    return Response.json(
      { success: true, user: session },
      {
        status: 200,
        headers: { 'Set-Cookie': cookieHeader },
      }
    )
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
