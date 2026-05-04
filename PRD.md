# Product Requirements Document (PRD)

## Jaani Constructions — Funds Management System

**Version:** 1.0  
**Date:** May 2026  
**Prepared for:** Harsh Jani, Owner — Jaani Constructions  
**Tech Stack:** React (Next.js) · Node.js · Python · Supabase · Vercel  
**Author:** Freelance Developer

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Personas](#2-user-personas)
3. [Core Modules & Features](#3-core-modules--features)
4. [Database Schema](#4-database-schema)
5. [API Architecture](#5-api-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Step-by-Step Project Setup](#7-step-by-step-project-setup)
8. [Data Flow](#8-data-flow)
9. [MVP Feature Priority](#9-mvp-feature-priority)
10. [Success Metrics](#10-success-metrics)
11. [Future Enhancements](#11-future-enhancements)

---

## 1. Executive Summary

A robust, mobile-first funds tracking and project profitability dashboard for a construction consultancy agency. The system enables real-time tracking of client receivables, project-wise expenses across three major categories (Vendors, Raw Material, Labour/Broker), and net working capital position across all active projects.

### Business Context
Construction agencies in India operate on negative cash flow cycles: labour is paid weekly, vendors on delivery, but clients pay 30–90 days after billing. The app must make this tension visible instantly. Harsh Jani manages 3–8 simultaneous projects and needs to know at a glance whether he can commit to a new vendor order or must chase a client payment first.

---

## 2. User Personas

### Primary: Harsh Jani (Owner / Operator)

| Attribute | Detail |
|-----------|--------|
| **Role** | Business owner managing 3–8 simultaneous construction projects |
| **Location** | Gujarat, India |
| **Tech Comfort** | Moderate — uses smartphones, UPI apps, WhatsApp Business |
| **Goals** | Know instantly which client owes money and for how long; track per-project profitability before it's too late to course-correct; pay labour and vendors on time without overextending cash reserves |
| **Pain Points** | Mixing up client payments across projects; losing track of small raw material purchases; not knowing true project profit until after handover |

### Secondary: Site Supervisor / Accountant (Future)

| Attribute | Detail |
|-----------|--------|
| **Role** | Data entry for daily labour attendance and vendor bills |
| **Needs** | Simple mobile interface for quick entries |

---

## 3. Core Modules & Features

### 3.1 Module A: Authentication & Workspace

| Feature | Requirement |
|---------|-------------|
| Auth Method | Supabase Auth (Email + Password, Google OAuth) |
| Roles | `owner` (full access), `accountant` (entry only), `viewer` (read-only) |
| Multi-tenancy | Single workspace per business — no client login needed |

### 3.2 Module B: Main Dashboard (Executive View)

**Layout:** Single-screen mobile-first dashboard with desktop expansion.

#### KPI Cards (Top Row)

1. **Total Receivables** — Sum of all client payments due (billed + unbilled)
2. **Total Payables** — Sum of all unpaid expenses across projects
3. **Net Position** — Receivables − Payables (working capital snapshot)
4. **Overdue Count** — Number of payments past due date

#### Project Profitability Grid

Card per active project showing:
- Project name + client name
- Contract value vs. received
- Total expenses + category breakdown (mini bar chart)
- Current profit margin % (color-coded: green >15%, yellow 5-15%, red <5%)

#### Alert Feed (Sidebar/Bottom Sheet)

- "Client X — ₹2,50,000 overdue by 12 days"
- "Project Y — Labour expenses exceeded estimate by 18%"
- "Vendor Z — 3 unpaid bills totaling ₹87,000"

### 3.3 Module C: Client & Income Management

| Feature | Details |
|---------|---------|
| Client Master | Name, contact, address, GSTIN (optional), project history |
| Project Linking | Each client can have multiple projects; income tagged to both |
| Milestone Structure | Pre-defined: Advance (10%), Plinth (20%), Slab-wise (30%), Finishing (30%), Handover (10%) — customizable per project |
| Payment Entry | Date, amount, mode (Bank/UPI/Cash/Cheque), reference number, milestone tag |
| Aging Report | Auto-generated: 0-30, 31-60, 61-90, 90+ days overdue |

### 3.4 Module D: Project & Expense Tracking

#### Expense Categories (Fixed)

| Category | Typical Sub-Categories | Payment Pattern |
|----------|----------------------|-----------------|
| **Vendors** | Electrical contractor, plumbing, flooring, carpenter, painting, false ceiling, equipment rental, transport | Invoice-based, 7–30 days credit |
| **Raw Material** | Cement, steel (TMT), sand, aggregate, bricks/blocks, tiles, sanitary ware, paint, hardware, electrical fittings | Cash on delivery or advance; bulk orders |
| **Labour / Broker** | Mason wages, helper wages, carpenter wages, supervisor salary, broker commission | Weekly/bi-weekly; mostly cash or UPI |

#### Per-Expense Entry Fields

- Project (dropdown)
- Category + Sub-category
- Vendor/Labour name (linked to master)
- Amount
- Date
- Payment status (Paid / Unpaid / Partial)
- Payment mode
- Bill/Invoice reference (optional photo upload)
- Notes

#### Project P&L View

```
Project: Patel Residence, Surat
Client:  Rakesh Patel
Contract: ₹ 32,00,000

INCOME
├── Advance Received:     ₹  3,20,000  (10%)
├── Plinth Complete:      ₹  6,40,000  (20%)
├── Slab 1 Complete:      ₹  9,60,000  (30%)
└── Total Received:       ₹ 19,20,000  |  Pending: ₹ 12,80,000

EXPENSES
├── Vendors:
│   ├── Electrical:       ₹  2,10,000
│   ├── Plumbing:         ₹  1,45,000
│   └── Flooring:         ₹  3,20,000
│   Subtotal Vendors:     ₹  6,75,000
├── Raw Material:
│   ├── Cement:           ₹  1,80,000
│   ├── Steel TMT:        ₹  2,40,000
│   └── Sand + Aggregate: ₹    95,000
│   Subtotal Material:    ₹  5,15,000
├── Labour/Broker:
│   ├── Mason Wages:      ₹  1,20,000
│   ├── Helper Wages:     ₹    80,000
│   └── Broker Commission:₹    45,000
│   Subtotal Labour:      ₹  2,45,000
└── TOTAL EXPENSES:       ₹ 14,35,000

PROJECT PROFIT: ₹ 17,65,000 (55% of contract)
REALIZED PROFIT: ₹  4,85,000 (received − paid expenses)
```

### 3.5 Module E: Vendor & Labour Ledger

- **Vendor Statement:** Opening balance → All bills → All payments → Closing balance
- **Labour Register:** Name, daily wage rate, attendance log (Phase 2), weekly wage calculation, advance tracking
- **Broker Commission:** Auto-calculated as % of labour cost or flat fee per placement

### 3.6 Module F: Reports & Exports (Phase 1 MVP)

| Report | Format |
|--------|--------|
| Client Statement | PDF — all projects, payments, pending |
| Project P&L | PDF + CSV |
| Vendor Ledger | PDF |
| Expense Summary | CSV (date range filter) |

### 3.7 Module G: Alerts & Notifications

- Overdue client payment (configurable: 3 days before, on due date, every 7 days after)
- Budget threshold breach (e.g., labour > 80% of estimate)
- Weekly summary email to Harsh (optional)

---

## 4. Database Schema

### 4.1 Tables

```sql
-- Users (managed by Supabase Auth, extended profile)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  role text check (role in ('owner', 'accountant', 'viewer')),
  phone text,
  created_at timestamptz default now()
);

-- Clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  gstin text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  name text not null,
  location text,
  contract_value decimal(12,2) not null,
  start_date date,
  expected_end_date date,
  status text check (status in ('active', 'completed', 'on_hold', 'cancelled')) default 'active',
  created_at timestamptz default now()
);

-- Milestones (per project)
create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  name text not null,
  percentage decimal(5,2),
  amount decimal(12,2),
  due_date date,
  status text check (status in ('pending', 'billed', 'paid')) default 'pending'
);

-- Income / Client Payments
create table income (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  client_id uuid references clients(id),
  milestone_id uuid references milestones(id),
  amount decimal(12,2) not null,
  payment_date date not null,
  payment_mode text check (payment_mode in ('cash', 'upi', 'bank_transfer', 'cheque')),
  reference_number text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Expense Categories (seeded)
create table expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int
);

-- Expense Sub-Categories (seeded + custom)
create table expense_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references expense_categories(id),
  name text not null,
  is_default boolean default false
);

-- Vendors / Labour Masters
create table vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('vendor', 'labour', 'broker')),
  phone text,
  category_id uuid references expense_categories(id),
  subcategory_id uuid references expense_subcategories(id),
  created_by uuid references profiles(id)
);

-- Expenses
create table expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  category_id uuid references expense_categories(id),
  subcategory_id uuid references expense_subcategories(id),
  vendor_id uuid references vendors(id),
  amount decimal(12,2) not null,
  expense_date date not null,
  payment_status text check (payment_status in ('paid', 'unpaid', 'partial')) default 'unpaid',
  amount_paid decimal(12,2) default 0,
  payment_mode text,
  reference_number text,
  bill_photo_url text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Labour Attendance (Phase 2)
create table labour_attendance (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  vendor_id uuid references vendors(id),
  date date not null,
  present boolean default true,
  hours_worked decimal(4,1) default 8.0,
  daily_wage decimal(10,2),
  created_at timestamptz default now()
);
```

### 4.2 Seed Data

```sql
-- Seed expense categories
insert into expense_categories (name, sort_order) values
('Vendors', 1),
('Raw Material', 2),
('Labour / Broker', 3);

-- Seed default sub-categories
insert into expense_subcategories (category_id, name, is_default) values
((select id from expense_categories where name = 'Vendors'), 'Electrical', true),
((select id from expense_categories where name = 'Vendors'), 'Plumbing', true),
((select id from expense_categories where name = 'Vendors'), 'Flooring', true),
((select id from expense_categories where name = 'Vendors'), 'Carpentry', true),
((select id from expense_categories where name = 'Vendors'), 'Painting', true),
((select id from expense_categories where name = 'Vendors'), 'False Ceiling', true),
((select id from expense_categories where name = 'Raw Material'), 'Cement', true),
((select id from expense_categories where name = 'Raw Material'), 'Steel (TMT)', true),
((select id from expense_categories where name = 'Raw Material'), 'Sand', true),
((select id from expense_categories where name = 'Raw Material'), 'Aggregate', true),
((select id from expense_categories where name = 'Raw Material'), 'Bricks / Blocks', true),
((select id from expense_categories where name = 'Raw Material'), 'Tiles', true),
((select id from expense_categories where name = 'Raw Material'), 'Sanitary Ware', true),
((select id from expense_categories where name = 'Raw Material'), 'Paint', true),
((select id from expense_categories where name = 'Raw Material'), 'Hardware', true),
((select id from expense_categories where name = 'Labour / Broker'), 'Mason', true),
((select id from expense_categories where name = 'Labour / Broker'), 'Helper', true),
((select id from expense_categories where name = 'Labour / Broker'), 'Carpenter', true),
((select id from expense_categories where name = 'Labour / Broker'), 'Supervisor', true),
((select id from expense_categories where name = 'Labour / Broker'), 'Broker Commission', true);
```

### 4.3 Row Level Security (RLS)

Enable RLS on all tables. Sample policy:

```sql
alter table clients enable row level security;

create policy "Users can view all clients"
  on clients for select
  to authenticated
  using (true);

create policy "Only owner and accountant can insert clients"
  on clients for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'accountant')
    )
  );
```

### 4.4 Database Functions

```sql
-- Calculate project summary
create or replace function get_project_summary(project_uuid uuid)
returns table (
  total_income decimal,
  total_expenses decimal,
  total_payable decimal,
  profit decimal,
  profit_margin decimal
) as $$
begin
  return query
  select
    coalesce((select sum(amount) from income where project_id = project_uuid), 0) as total_income,
    coalesce((select sum(amount) from expenses where project_id = project_uuid), 0) as total_expenses,
    coalesce((select sum(amount - amount_paid) from expenses where project_id = project_uuid and payment_status != 'paid'), 0) as total_payable,
    coalesce((
      (select sum(amount) from income where project_id = project_uuid) -
      (select sum(amount) from expenses where project_id = project_uuid)
    ), 0) as profit,
    case
      when (select contract_value from projects where id = project_uuid) > 0 then
        round((
          ((select sum(amount) from income where project_id = project_uuid) -
           (select sum(amount) from expenses where project_id = project_uuid)) /
          (select contract_value from projects where id = project_uuid)
        ) * 100, 2)
      else 0
    end as profit_margin;
end;
$$ language plpgsql;
```

---

## 5. API Architecture

### 5.1 Service Layer Structure

```
/backend
├── /src
│   ├── /config          # Supabase client, env vars
│   ├── /middleware      # Auth middleware (verify Supabase JWT)
│   ├── /routes
│   │   ├── auth.js
│   │   ├── clients.js
│   │   ├── projects.js
│   │   ├── income.js
│   │   ├── expenses.js
│   │   ├── vendors.js
│   │   ├── dashboard.js
│   │   └── reports.js
│   ├── /controllers     # Business logic
│   ├── /services        # Supabase queries
│   └── /utils           # Helpers, validators
├── package.json
└── vercel.json
```

### 5.2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | KPIs: receivables, payables, net position, overdue count |
| GET | `/api/dashboard/projects` | Project cards with profit margins |
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Create client |
| GET | `/api/clients/:id/statement` | Full statement PDF/JSON |
| GET | `/api/projects` | List projects (filter by status) |
| POST | `/api/projects` | Create project with milestones |
| GET | `/api/projects/:id/pnl` | Project P&L breakdown |
| POST | `/api/income` | Record client payment |
| GET | `/api/income?project_id=` | Income history |
| POST | `/api/expenses` | Record expense |
| GET | `/api/expenses?project_id=&category=` | Expense list with filters |
| PUT | `/api/expenses/:id/pay` | Mark expense as paid |
| GET | `/api/vendors` | Vendor/labour list |
| GET | `/api/vendors/:id/ledger` | Vendor statement |
| GET | `/api/reports/project-pnl` | Export P&L (PDF/CSV) |

### 5.3 Python Microservice

**Role:** PDF Report Generation, Data Analytics, Image Processing

**Stack:** FastAPI + ReportLab + Supabase Python Client

**Integration:** Node.js API calls Python service via HTTP for PDF generation, or host Python as separate serverless functions.

**Alternative for Phase 1:** Use `jspdf` + `autotable` in frontend to avoid Python backend complexity.

---

## 6. Frontend Architecture

### 6.1 Tech Choices

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14 (App Router) | SSR for SEO, API routes, Vercel-native |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, mobile-first, clean dashboards |
| State | React Query (TanStack) | Server state caching, refetching |
| Forms | React Hook Form + Zod | Validation, type safety |
| Charts | Recharts | Lightweight, React-native |
| Auth | Supabase Auth Helpers | Seamless integration |

### 6.2 Page Structure

```
/app
├── /(auth)
│   └── /login              # Login page
├── /(dashboard)
│   ├── /page.tsx           # Main dashboard (KPIs + project grid)
│   ├── /layout.tsx         # Sidebar + header layout
│   ├── /clients
│   │   ├── /page.tsx       # Client list
│   │   └── /[id]/page.tsx  # Client detail + projects
│   ├── /projects
│   │   ├── /page.tsx       # Project list
│   │   └── /[id]/page.tsx  # Project P&L + expenses
│   ├── /income
│   │   └── /page.tsx       # Record/view income
│   ├── /expenses
│   │   └── /page.tsx       # Record/view expenses
│   ├── /vendors
│   │   ├── /page.tsx       # Vendor list
│   │   └── /[id]/page.tsx  # Vendor ledger
│   └── /reports
│       └── /page.tsx       # Generate reports
/components
├── /ui                     # shadcn components
├── /dashboard
│   ├── KpiCards.tsx
│   ├── ProjectGrid.tsx
│   └── AlertFeed.tsx
├── /forms
│   ├── ClientForm.tsx
│   ├── ProjectForm.tsx
│   ├── IncomeForm.tsx
│   └── ExpenseForm.tsx
├── /charts
│   └── ProjectProfitChart.tsx
/lib
├── /supabase               # Supabase client setup
└── /utils                  # Formatters (INR currency, dates)
```

### 6.3 Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Jaani Constructions     [+] Add Expense    │
│  Funds Management        [👤 Harsh Jani ▼]  │
├──────────┬──────────────────────────────────┤
│          │  [Total Rec] [Total Pay] [Net]   │
│  🏠 Dash │  [Overdue]                        │
│  👥 Clients│                                  │
│  📁 Proj  │  ┌─────────┐ ┌─────────┐        │
│  💰 Income│  │Project A│ │Project B│ ...    │
│  💸 Exp   │  │ ₹12L    │ │ ₹8L     │        │
│  🏗 Vend  │  │ 22% marg│ │ 15% marg│        │
│  📊 Rpts  │  └─────────┘ └─────────┘        │
│          │                                  │
│  ⚠️ 3    │  [Alert: Client X overdue...]    │
│  overdue │                                  │
└──────────┴──────────────────────────────────┘
```

### 6.4 Expense Entry Form (Mobile-Optimized)

1. Select Project (searchable dropdown)
2. Select Category (Vendors / Raw Material / Labour) → auto-filter subcategories
3. Select Sub-category (e.g., "Electrical")
4. Select Vendor (or add new)
5. Enter Amount
6. Toggle: Paid / Unpaid
7. If Paid: Payment mode + Reference
8. Date picker (default today)
9. Notes (optional)
10. Attach Bill Photo (optional)

---

## 7. Step-by-Step Project Setup

### Step 1: Initialize Project

```bash
# Create Next.js project
npx create-next-app@latest jaani-funds --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd jaani-funds

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @tanstack/react-query axios react-hook-form zod @hookform/resolvers
npm install recharts lucide-react date-fns
npm install class-variance-authority clsx tailwind-merge
npm install -D @types/node @types/react @types/react-dom

# Initialize shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select dialog table badge tabs sheet
```

### Step 2: Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `jaani-constructions-funds`
3. Region: Mumbai (closest to Gujarat) or Singapore
4. Run the SQL schema (Section 4.1) in Supabase SQL Editor
5. Seed default categories using seed data (Section 4.2)
6. Enable Row Level Security (RLS) on all tables
7. Create Storage bucket: `bill-photos` (public, 5MB limit)
8. Copy Project URL + Anon Key + Service Role Key

### Step 3: Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 4: Supabase Client Setup

Create `/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const getServerClient = () => {
  const cookieStore = cookies();
  return createRouteHandlerClient({ cookies: () => cookieStore });
};
```

### Step 5: Build Core Pages (Priority Order)

1. **Auth** — Login with Supabase Auth
2. **Dashboard** — Fetch summary via API route + React Query
3. **Projects** — CRUD + milestone setup
4. **Income** — Record payments linked to projects/milestones
5. **Expenses** — Record expenses with category/vendor tagging
6. **Vendors** — Master list + ledger view
7. **Reports** — PDF export (integrate Python or use client-side libraries)

### Step 6: Node.js API Routes

Create API routes in `/app/api/` using Next.js Route Handlers. Example:

```typescript
// app/api/dashboard/summary/route.ts
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getServerClient();

  const { data: income } = await supabase
    .from('income')
    .select('amount');

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, payment_status');

  const totalReceivables = income?.reduce((sum, i) => sum + i.amount, 0) || 0;
  const totalPayables = expenses
    ?.filter(e => e.payment_status !== 'paid')
    ?.reduce((sum, e) => sum + e.amount, 0) || 0;

  return NextResponse.json({
    totalReceivables,
    totalPayables,
    netPosition: totalReceivables - totalPayables,
    overdueCount: 0
  });
}
```

### Step 7: Python PDF Service (Optional)

Create `/python-service/`:

```bash
mkdir python-service
cd python-service
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn reportlab python-multipart supabase
```

Create `main.py`:

```python
from fastapi import FastAPI
from reportlab.pdfgen import canvas
from supabase import create_client
import os

app = FastAPI()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

@app.get("/generate-project-pnl/{project_id}")
async def generate_pnl(project_id: str):
    # Fetch data from Supabase
    # Generate PDF using ReportLab
    # Upload to Storage or return bytes
    pass
```

**Alternative for Phase 1:** Use `jspdf` + `autotable` in the frontend.

### Step 8: Vercel Deployment

1. Push code to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Add Environment Variables in Vercel Dashboard
4. Deploy with default settings
5. Add custom domain if needed: `funds.jaaniconstructions.com`

---

## 8. Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│  Next.js    │────▶│  Supabase   │
│  Frontend   │◄────│   API       │◄────│ PostgreSQL  │
│  (Vercel)   │     │  (Vercel)   │     │  (Mumbai)   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   Python    │
                    │  Service    │
                    │ (PDF/Report)│
                    └─────────────┘
```

---

## 9. MVP Feature Priority

| Priority | Feature | Timeline |
|----------|---------|----------|
| P0 | Auth + Dashboard KPIs | Week 1 |
| P0 | Client + Project CRUD | Week 1-2 |
| P0 | Income recording | Week 2 |
| P0 | Expense recording (3 categories) | Week 2-3 |
| P0 | Project P&L view | Week 3 |
| P1 | Vendor/Labour ledger | Week 3-4 |
| P1 | PDF reports export | Week 4 |
| P1 | Alerts & overdue tracking | Week 4 |
| P2 | Labour attendance | Week 5-6 |
| P2 | Photo upload for bills | Week 5-6 |
| P2 | Multi-user roles | Week 6 |

---

## 10. Success Metrics

1. **Harsh can see his net position in < 10 seconds** after opening the app
2. **Expense entry takes < 60 seconds** per transaction on mobile
3. **Project profit margin accuracy** — within 2% of manual calculation
4. **Zero data loss** — Supabase backups + RLS security
5. **Uptime:** 99.9% via Vercel + Supabase managed infrastructure

---

## 11. Future Enhancements

- **WhatsApp Integration:** Send payment reminders to clients via WhatsApp Business API
- **GST Invoice Generation:** Auto-generate GST-compliant invoices from milestone data
- **Bank Statement Reconciliation:** Upload bank CSV to auto-match income/expense entries
- **Multi-company:** If Harsh expands to multiple entities
- **Mobile App:** React Native wrapper for offline entry at construction sites
- **Budget vs. Actual Tracking:** Set category-wise budgets per project and track variance
- **Vendor Comparison:** Historical pricing per vendor for negotiation

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Receivables** | Money owed to Jaani Constructions by clients |
| **Payables** | Money Jaani Constructions owes to vendors/labour |
| **Net Position** | Receivables minus Payables — working capital snapshot |
| **Milestone** | Pre-defined project stage triggering a client payment |
| **TMT Steel** | Thermo-Mechanically Treated steel bars used in construction |
| **Broker** | Labour contractor who supplies workers for a commission |

---

## Appendix B: Currency & Formatting Standards

- **Currency:** Indian Rupee (₹)
- **Number Format:** Indian numbering system (lakhs/crores)
  - Example: ₹ 12,50,000 (Twelve Lakhs Fifty Thousand)
- **Date Format:** DD-MM-YYYY
- **Time Zone:** IST (UTC+5:30)

---

*End of Document*
