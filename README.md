# PartFlow

A cloud-based spare parts shop management system built with Next.js and Supabase. PartFlow replaces spreadsheets and manual record-keeping with a centralized platform for tracking sales, managing inventory, monitoring employee activity, and generating business reports.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Styling:** Tailwind CSS 4 + shadcn/ui v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Package Manager:** pnpm

## Features

- **Authentication** — Email/password login via Supabase Auth with automatic role detection
- **Role-Based Access** — Admin and Employee roles enforced via Row Level Security
- **Dashboard** — Live KPIs, revenue trends, payment status breakdown, recent sales
- **Sales** — Create sales transactions with line items, automatic inventory deduction
- **Products** — Full CRUD with category and brand filtering
- **Inventory** — Stock tracking, low-stock alerts, manual adjustments
- **Customers** — Customer profiles with purchase history and outstanding balances
- **Suppliers** — Supplier management with contact details
- **Purchase Orders** — Create POs, receive stock, automatic inventory updates
- **Employees** — Admin creates accounts with credentials, toggle active/inactive
- **Reports** — Top performers, customer spending, weekly trends, payment method breakdown
- **Audit Logs** — Admin-only activity log (when database triggers are configured)
- **Collapsible Sidebar** — Grouped navigation with collapse/expand toggle

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/your-username/partflow.git
cd partflow
pnpm install
```

### 2. Configure Supabase

Copy the environment template and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values from Supabase Dashboard > Settings > API:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Set up the database

Run these SQL files in your Supabase SQL Editor in order:

1. **`supabase/schema.sql`** — Creates all tables, triggers, indexes
2. **`supabase/fix-rls.sql`** — Sets up Row Level Security policies
3. **`supabase/seed.sql`** — Populates categories, brands, products, inventory, customers, suppliers

### 4. Create your first admin account

In the Supabase Dashboard, go to Authentication > Users > Add User:

- Enter an email and password
- The `handle_new_user` trigger will auto-create a profile

Then in the SQL Editor, promote that user to admin:

```sql
update public.profiles set role = 'admin' where email = 'your-email@example.com';
```

### 5. Seed sample orders (optional)

After creating your admin account, run `supabase/seed-orders.sql` in the SQL Editor to generate 50 sample orders for the dashboard and reports.

### 6. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## Project Structure

```
app/
  (auth)/login/          — Login page (no sidebar)
  (dashboard)/           — All authenticated pages
    page.tsx             — Dashboard
    sales/               — Sales transactions
    products/            — Product catalog
    inventory/           — Stock management
    customers/           — Customer profiles
    suppliers/           — Supplier management
    purchase-orders/     — Purchase order workflow
    employees/           — Employee management (admin)
    reports/             — Analytics and charts
    settings/            — User profile settings
    audit-logs/          — Activity log (admin)

components/              — Shared UI components
lib/
  supabase/              — Supabase client factories
  queries/               — Data access functions
  auth/                  — Permission helpers
  types/                 — TypeScript database types

supabase/
  schema.sql             — Database schema
  fix-rls.sql            — RLS policies
  seed.sql               — Seed data
  seed-orders.sql        — Sample orders
```

## User Roles

| Permission | Admin | Employee |
|---|---|---|
| Dashboard, Reports | Yes | Yes |
| Products, Inventory | Full CRUD | View only |
| Sales | Full access | Create + view |
| Customers | Full CRUD | Create + edit |
| Suppliers, Purchase Orders | Full CRUD | View only |
| Employees | Create, edit, toggle | No access |
| Settings | Full | Own profile |
| Audit Logs | View | No access |

## License

MIT
