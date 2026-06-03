# MedChem — Inventory & Order Management System

A full-stack inventory and quotation management platform for medical/chemical supply businesses. Built with **Next.js 16 App Router**, **Neon PostgreSQL**, **Tailwind CSS**, and **JWT authentication**.

---

## Features

- 🔐 **JWT Auth** — HTTP-only cookies, 7-day expiry, HS256 signed
- 👤 **Two roles** — Admin (manage everything) & Seller (browse + order)
- 📦 **Product catalog** — with categories, dimensions, base units
- 🧮 **Exact arithmetic** — `NUMERIC(20,6)` for all prices & quantities
- ⚖️ **Smart unit conversion** — g↔kg, mL↔L, server-side before saving
- 🛒 **Cart drawer** — live totals, unit selector, conversion display
- 📄 **Quotation management** — full audit trail with ordered & base quantities
- 📊 **Admin dashboard** — stat cards, revenue tracking, recent orders
- 🗃️ **Auto-init DB** — schema + seed data created on first login, no migration step

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router (TypeScript) |
| Database | Neon PostgreSQL (`@neondatabase/serverless`) |
| Styling | Tailwind CSS v4 |
| Auth | `jose` (JWT HS256) + `bcryptjs` (password hashing) |
| Deployment | Vercel |

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | VARCHAR(255) | bcrypt, 12 rounds |
| name | VARCHAR(255) | |
| role | VARCHAR(10) | `admin` or `seller` |
| created_at | TIMESTAMPTZ | |

### `categories`
| Column | Type |
|---|---|
| id | SERIAL PK |
| name | VARCHAR(255) UNIQUE |
| description | TEXT |

### `products`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(255) | |
| sku | VARCHAR(100) UNIQUE | |
| category_id | INTEGER FK | → categories |
| dimension | VARCHAR(20) | `weight`, `volume`, `count` |
| base_unit | VARCHAR(10) | `g`, `kg`, `mL`, `L`, `unit` |
| price_per_base_unit | **NUMERIC(20,6)** | INR per one base unit |
| stock_in_base_unit | **NUMERIC(20,6)** | Always stored in base unit |
| min_order_qty | **NUMERIC(20,6)** | |
| is_active | BOOLEAN | Soft delete flag |

### `quotations`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| seller_id | INTEGER FK | → users |
| status | VARCHAR(20) | `pending`, `approved`, `rejected`, `fulfilled` |
| notes | TEXT | |
| total_amount | **NUMERIC(20,6)** | Sum of all line totals |

### `quotation_items`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| quotation_id | INTEGER FK | → quotations |
| product_id | INTEGER FK | → products |
| ordered_unit | VARCHAR(10) | Unit the seller chose (e.g. `kg`) |
| quantity_in_ordered_unit | **NUMERIC(20,6)** | What the seller typed (e.g. 2) |
| quantity_in_base_unit | **NUMERIC(20,6)** | Converted value (e.g. 2000 for 2kg→g) |
| price_per_base_unit | **NUMERIC(20,6)** | Price snapshot at order time |
| line_total | **NUMERIC(20,6)** | `quantity_in_base_unit × price_per_base_unit` |

---

## Unit Storage Strategy

All stock and prices are **always stored in base units**:

| Dimension | Base Unit | Compatible Units |
|---|---|---|
| weight | **g** | g, kg |
| volume | **mL** | mL, L |
| count | **unit** | unit |

**Conversion factors** (`src/lib/units.ts`):
```ts
UNIT_TO_BASE = { g: 1, kg: 1000, mL: 1, L: 1000, unit: 1 }
```

### Conversion Logic

When a seller adds "2 kg" of a product whose base unit is `g`:
1. `convertToBase(2, 'kg')` → `2 × 1000 = 2000`
2. Stored as `quantity_in_base_unit = 2000`
3. Line total = `2000 × price_per_g`
4. Displayed back as "2 kg" (smart display: ≥1000g shown as kg)

---

## Local Setup

### 1. Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)

### 2. Clone & install
```bash
git clone <your-repo-url>
cd aasamedcam
npm install
```

### 3. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL=postgres://user:password@host.neon.tech/dbname?sslmode=require
JWT_SECRET=your_random_secret_at_least_32_characters
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**The database schema and seed data are created automatically on first login — no migration step needed.**

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@medchem.com | admin123 |
| Seller | seller@medchem.com | seller123 |

Use the **Quick Access** buttons on the login page to auto-fill these credentials.

---

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login + set cookie |
| POST | `/api/auth/logout` | Any | Clear cookie |
| GET | `/api/auth/me` | Any | Current session |
| GET | `/api/categories` | Auth | All categories |
| GET | `/api/products` | Auth | Products with filters |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/[id]` | Admin | Update product |
| DELETE | `/api/products/[id]` | Admin | Soft delete |
| GET | `/api/quotations` | Auth | Admin=all, Seller=own |
| POST | `/api/quotations` | Seller | Submit quotation |
| PATCH | `/api/quotations/[id]` | Admin | Update status |
| GET | `/api/stats` | Admin | Dashboard stats |

---

## Vercel Deployment

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — random secret (min 32 chars)
4. Deploy — the DB auto-initializes on first login

> **Note:** Do NOT commit `.env.local` — it's in `.gitignore`

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/login, logout, me
│   │   ├── products/[id]
│   │   ├── quotations/[id]
│   │   ├── categories
│   │   └── stats
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Dashboard
│   │   ├── products/         # CRUD table
│   │   └── quotations/       # Status management
│   ├── seller/
│   │   ├── layout.tsx
│   │   ├── products/         # Grid + cart
│   │   └── quotations/       # History
│   └── login/
├── components/
│   ├── Navbar.tsx
│   ├── StatusBadge.tsx
│   ├── StatCard.tsx
│   └── CartDrawer.tsx
├── lib/
│   ├── db.ts                 # Neon client
│   ├── auth.ts               # JWT helpers
│   ├── schema.ts             # CREATE TABLE + seed
│   └── units.ts              # Conversion utilities
├── types/
│   └── index.ts              # Shared TS interfaces
└── middleware.ts             # Route protection
```
