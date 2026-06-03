// src/lib/auth.ts
// JWT authentication helpers using the jose library.
// Tokens are signed with HS256, stored in HTTP-only cookies, 7-day expiry.

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { Session } from '@/types'

const COOKIE_NAME = 'medchem_session'
const JWT_EXPIRY = '7d'

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(secret)
}

/** Sign a JWT and return the token string */
export async function signToken(payload: Session): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret())
}

/** Verify a JWT token and return the decoded payload */
export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Session['role'],
    }
  } catch {
    return null
  }
}

/** Get the current session from the HTTP-only cookie (server-side only) */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

/**
 * Get the session from a Request object (for API routes / middleware).
 * Reads the cookie header directly from the request.
 */
export async function getSessionFromRequest(request: Request): Promise<Session | null> {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  return verifyToken(decodeURIComponent(match[1]))
}

/** Set the session cookie on the response headers */
export function buildCookieHeader(token: string): string {
  const maxAge = 60 * 60 * 24 * 7 // 7 days in seconds
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

/** Build a cookie header that expires the session immediately */
export function buildLogoutCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
}
