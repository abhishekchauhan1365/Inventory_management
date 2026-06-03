// src/app/api/auth/logout/route.ts
import { buildLogoutCookieHeader } from '@/lib/auth'

export async function POST() {
  return Response.json(
    { success: true },
    {
      status: 200,
      headers: { 'Set-Cookie': buildLogoutCookieHeader() },
    }
  )
}
