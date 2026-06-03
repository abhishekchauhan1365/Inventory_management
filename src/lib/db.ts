// src/lib/db.ts
// Neon PostgreSQL serverless client singleton.
// Uses the @neondatabase/serverless driver for edge-compatible raw SQL.

import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create a tagged template literal SQL client
export const sql = neon(process.env.DATABASE_URL)
