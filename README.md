# MedChem — Inventory & Order Management System

A full-stack inventory and quotation management platform for medical/chemical supply businesses. Built for the AasaMedChem Hackathon assignment.

---

## 🚀 Project Overview & Features

MedChem is a B2B quotation and inventory management platform that handles complex unit conversions (weight, volume, count) and high-precision pricing.

**Key Features:**
- 🔐 **JWT Auth** — HTTP-only cookies, 7-day expiry, role-based routing (`proxy.ts`).
- 👤 **Two roles** — Admin (manage inventory & approve orders) & Seller (browse catalog & place quotes).
- ⚖️ **Smart Unit Engine** — g↔kg, mL↔L conversions done server-side before saving to the DB.
- 🛒 **Cart Drawer** — Live line totals, flexible unit selectors, and instant conversion displays (e.g., `2 kg = 2000 g`).
- 📄 **Quotation Workflow** — Full audit trail showing exactly what the user typed (`quantity_in_ordered_unit`) vs what was calculated for storage (`quantity_in_base_unit`).
- 🗃️ **Idempotent Auto-Init DB** — Schema and demo seed data are created automatically on the very first login. No manual migration scripts needed.

---

## 🏗️ High-Level System Design

The application follows a standard modern Next.js architecture:

1. **Frontend (Client Components)**: Built with React and Tailwind CSS. State management (like the Cart Drawer) uses `useState`. No `localStorage` is used; all sensitive data lives on the server.
2. **Backend (API Routes)**: Next.js Route Handlers (`/api/...`) handle business logic, JWT verification, and unit conversions.
3. **Database (Neon PostgreSQL)**: Connected via `@neondatabase/serverless` using raw SQL (no ORM). 
4. **Security Layer**: `src/proxy.ts` (Next.js 16's replacement for Middleware) intercepts every request to protect protected routes and enforce role boundaries before the request ever hits a React component.

---

## 🗄️ Database Schema & Data Types

The database uses raw PostgreSQL. **We explicitly chose `NUMERIC(20,6)`** for all financial and physical measurements. 

**Why `NUMERIC(20,6)` instead of `FLOAT` or `DECIMAL`?**
Floating-point types (`REAL`, `DOUBLE PRECISION`) are susceptible to rounding errors (e.g., `0.1 + 0.2 = 0.30000000000000004`). In a B2B system handling bulk chemicals, exact arithmetic is critical. `NUMERIC(20,6)` allows up to 14 digits before the decimal and exactly 6 digits after, ensuring massive wholesale orders and microscopic chemical measurements are both perfectly accurate.

### Key Tables

#### `products`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| sku | VARCHAR(100) UNIQUE | |
| dimension | VARCHAR(20) | `weight`, `volume`, `count` |
| base_unit | VARCHAR(10) | `g`, `mL`, `unit` |
| price_per_base_unit | **NUMERIC(20,6)** | Exact INR price per 1 base unit |
| stock_in_base_unit | **NUMERIC(20,6)** | Inventory is strictly tracked in base units |

#### `quotation_items` (The Audit Trail)
| Column | Type | Description |
|---|---|---|
| ordered_unit | VARCHAR(10) | The unit the user selected in UI (e.g. `kg`) |
| quantity_in_ordered_unit | **NUMERIC(20,6)** | Exactly what they typed (e.g. `2`) |
| quantity_in_base_unit | **NUMERIC(20,6)** | The converted value (e.g. `2000`) |
| price_per_base_unit | **NUMERIC(20,6)** | Price snapshot at the time of the order |
| line_total | **NUMERIC(20,6)** | `quantity_in_base_unit × price_per_base_unit` |

---

## ⚖️ Unit Storage and Conversion Strategy

To prevent rounding issues and fragmented logic, **all inventory and pricing is standardized to a "Base Unit" at the database level.**

| Dimension | Base Unit (DB) | Allowed UI Units | Conversion Factor |
|---|---|---|---|
| weight | **g** | g, kg | 1 kg = 1000 g |
| volume | **mL** | mL, L | 1 L = 1000 mL |
| count | **unit** | unit | 1 unit = 1 unit |

### How conversions are applied:
1. **Creation (Admin)**: The admin sets a price per *Base Unit* (e.g., ₹0.05 per `g`).
2. **Ordering (Seller UI)**: The seller selects `kg` and enters `2`. 
3. **Submission (API)**: The API receives `{ ordered_unit: 'kg', quantity: 2 }`.
4. **Server-Side Conversion (`src/lib/units.ts`)**:
   - `convertToBase(2, 'kg')` → returns `2000` (quantity_in_base_unit).
   - `calculateLineTotal(2, 'kg', 0.05)` → returns `2000 * 0.05 = ₹100.00`.
5. **Storage**: Both the raw input (`2`, `kg`) and the converted data (`2000`, `100.00`) are saved to PostgreSQL.
6. **Display Rules**: When rendering prices, no rounding happens in the DB. The UI uses `.toFixed(2)` only at the final display step via the `formatINR()` helper.

---

## 💻 Setup Instructions (Local & Vercel)

### 1. Prerequisites
- Node.js 18+
- A free [Neon PostgreSQL](https://neon.tech) database.

### 2. Local Installation
```bash
git clone <repo-url>
cd aasamedcam
npm install
```

### 3. Environment Variables
Copy the template file:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Neon Connection String and a random JWT secret:
```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
JWT_SECRET=any_random_string_at_least_32_characters_long
```

### 4. Start the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). 
**Note:** There are no migration scripts to run. Simply log in for the first time, and the system will automatically run `CREATE TABLE IF NOT EXISTS` and seed the demo accounts.

---

## 🚀 Vercel Deployment

1. Push this repository to GitHub.
2. Go to your [Vercel Dashboard](https://vercel.com) and click **Add New → Project**.
3. Import the repository.
4. Under **Environment Variables**, add:
   - `DATABASE_URL` (Your Neon connection string)
   - `JWT_SECRET` (A strong, random password)
5. Click **Deploy**. The Next.js build process handles everything.
6. Visit your deployed URL and log in. The DB initializes automatically!

---

## 🔐 How to use the app (Demo Flow)

1. **Log in as Admin**
   - Click the "Admin" quick-fill button on the login screen, or use `admin@medchem.com` / `admin123`.
   - Go to **Products** and add a new item (e.g., "Industrial Salt", Weight, Base Unit `g`, Price `0.05`).
2. **Log in as Seller**
   - Use the "Seller" quick-fill button, or `seller@medchem.com` / `seller123`.
   - Go to the Product Catalog. Find the Salt. Click **Add to Cart**.
   - Open the **Cart** (top right button). 
   - Change the unit from `g` to `kg`. Type in `5`. Watch the line total update live.
   - Click **Place Quotation**.
3. **Approve the Order**
   - Log back in as Admin. Go to **Quotations**.
   - Expand the new quotation to see the exact breakdown (5 kg ordered = 5000 g base).
   - Click the **Approved** status button to finalize the workflow.
