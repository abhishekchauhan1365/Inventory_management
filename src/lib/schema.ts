// src/lib/schema.ts
// Database schema initialization and seed data.
// Called automatically on first login — no separate migration step needed.
// All price/quantity fields use NUMERIC(20,6) for exact arithmetic.

import { sql } from './db'
import bcrypt from 'bcryptjs'

export async function initializeSchema(): Promise<void> {
  // Users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'seller')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Categories table
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Products table
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      dimension VARCHAR(20) NOT NULL CHECK (dimension IN ('weight', 'volume', 'count')),
      base_unit VARCHAR(10) NOT NULL CHECK (base_unit IN ('g', 'kg', 'mL', 'L', 'unit')),
      price_per_base_unit NUMERIC(20,6) NOT NULL DEFAULT 0,
      stock_in_base_unit NUMERIC(20,6) NOT NULL DEFAULT 0,
      min_order_qty NUMERIC(20,6) NOT NULL DEFAULT 1,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Quotations table
  await sql`
    CREATE TABLE IF NOT EXISTS quotations (
      id SERIAL PRIMARY KEY,
      seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
      notes TEXT,
      total_amount NUMERIC(20,6) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Quotation items table
  await sql`
    CREATE TABLE IF NOT EXISTS quotation_items (
      id SERIAL PRIMARY KEY,
      quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      ordered_unit VARCHAR(10) NOT NULL,
      quantity_in_ordered_unit NUMERIC(20,6) NOT NULL,
      quantity_in_base_unit NUMERIC(20,6) NOT NULL,
      price_per_base_unit NUMERIC(20,6) NOT NULL,
      line_total NUMERIC(20,6) NOT NULL
    )
  `
}

export async function seedData(): Promise<void> {
  // Check if any users exist already
  const existing = await sql`SELECT COUNT(*) as count FROM users`
  if (parseInt(existing[0].count) > 0) return

  // Seed default admin and seller accounts
  const adminHash = await bcrypt.hash('admin123', 12)
  const sellerHash = await bcrypt.hash('seller123', 12)

  await sql`
    INSERT INTO users (email, password_hash, name, role) VALUES
    ('admin@medchem.com', ${adminHash}, 'Admin User', 'admin'),
    ('seller@medchem.com', ${sellerHash}, 'Demo Seller', 'seller')
  `

  // Seed default categories
  await sql`
    INSERT INTO categories (name, description) VALUES
    ('Reagents', 'Chemical reagents and analytical grade compounds'),
    ('Solvents', 'Organic and inorganic solvents'),
    ('Pharmaceuticals', 'Active pharmaceutical ingredients and excipients'),
    ('Lab Supplies', 'General laboratory consumables and equipment'),
    ('Buffers & Media', 'Cell culture media, buffers, and biological reagents')
    ON CONFLICT (name) DO NOTHING
  `

  // Seed sample products
  const categories = await sql`SELECT id, name FROM categories ORDER BY id`
  const catMap: Record<string, number> = {}
  for (const c of categories) catMap[c.name] = c.id

  await sql`
    INSERT INTO products (name, sku, description, category_id, dimension, base_unit, price_per_base_unit, stock_in_base_unit, min_order_qty) VALUES
    ('Sodium Chloride', 'MC-NaCl-001', 'Analytical grade NaCl, purity ≥99.5%', ${catMap['Reagents']}, 'weight', 'g', 0.025000, 50000.000000, 100.000000),
    ('Ethanol 99.9%', 'MC-EtOH-001', 'Denatured ethanol, HPLC grade', ${catMap['Solvents']}, 'volume', 'mL', 0.085000, 200000.000000, 500.000000),
    ('Acetone', 'MC-Ace-001', 'Laboratory grade acetone, purity ≥99.5%', ${catMap['Solvents']}, 'volume', 'mL', 0.065000, 100000.000000, 1000.000000),
    ('Glucose Powder', 'MC-Glc-001', 'D-(+)-Glucose, anhydrous, BP grade', ${catMap['Pharmaceuticals']}, 'weight', 'g', 0.045000, 25000.000000, 500.000000),
    ('Hydrochloric Acid 37%', 'MC-HCl-001', 'Concentrated HCl, analytical grade', ${catMap['Reagents']}, 'volume', 'mL', 0.035000, 75000.000000, 200.000000),
    ('Sterile Petri Dishes', 'MC-PD-001', 'Polystyrene petri dishes 90mm, sterile', ${catMap['Lab Supplies']}, 'count', 'unit', 12.500000, 5000.000000, 10.000000),
    ('PBS Buffer 10x', 'MC-PBS-001', 'Phosphate buffered saline, 10x concentrate', ${catMap['Buffers & Media']}, 'volume', 'mL', 0.120000, 50000.000000, 100.000000),
    ('Methanol HPLC', 'MC-MeOH-001', 'Methanol, HPLC grade ≥99.9%', ${catMap['Solvents']}, 'volume', 'mL', 0.075000, 150000.000000, 1000.000000)
    ON CONFLICT (sku) DO NOTHING
  `
}

/**
 * Main entry point: initialize schema + seed if needed.
 * Idempotent — safe to call on every login attempt.
 */
export async function ensureDatabase(): Promise<void> {
  await initializeSchema()
  await seedData()
}
