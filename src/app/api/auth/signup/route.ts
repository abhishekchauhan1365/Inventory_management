// src/app/api/auth/signup/route.ts
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { name, email, password } = body

    if (!name || !email || !password) {
      return Response.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }
    
    email = email.toLowerCase().trim()

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    if (existing.length > 0) {
      return Response.json({ error: 'Email is already registered' }, { status: 400 })
    }

    // Hash password and insert
    const hash = await bcrypt.hash(password, 12)
    
    const requestedRole = body.role === 'admin' ? 'admin' : 'seller'

    await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${hash}, ${requestedRole})
    `

    return Response.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
