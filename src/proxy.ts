// src/proxy.ts
// Route protection proxy (replaces middleware.ts in Next.js 16+).
// Redirects unauthenticated users to /login.
// Redirects authenticated users away from /login to their role dashboard.

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const COOKIE_NAME = 'medchem_session'

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/api/auth/login', '/api/auth/signup']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // If already logged in and hitting /login, redirect to dashboard
    if (pathname === '/login') {
      const token = request.cookies.get(COOKIE_NAME)?.value
      if (token) {
        const session = await verifyToken(token)
        if (session) {
          const redirectTo = session.role === 'admin' ? '/admin' : '/seller/products'
          return NextResponse.redirect(new URL(redirectTo, request.url))
        }
      }
    }
    return NextResponse.next()
  }

  // Check for API routes — return 401 JSON (not redirect)
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Protected page routes
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const session = await verifyToken(token)
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access control
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/seller/products', request.url))
  }

  if (pathname.startsWith('/seller') && session.role !== 'seller') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
