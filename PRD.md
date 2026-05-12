# Product Requirements Document (PRD)

## Apex Buildcon — Funds Management System

**Version:** 3.0 (Architectural Release)  
**Date:** May 2026  
**Prepared for:** Harsh Jani, Owner — Apex Buildcon  
**Tech Stack:** Next.js 14 · Supabase · Vercel · TanStack Query
**Context:** Internal productivity tool for 2-3 key personnel.

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

### ✅ Phase 3 — Owner Requested Features (v3.0)
- [x] **Milestone Intelligence Engine**: Smart suggestions, urgency scoring, real-time fund flow per milestone, multi-project planning timeline
- [x] **Back Entry & Amendment System**: Historical income/expense entry, amendment flow with audit trail, Settlement Reconciliation Wizard for closing projects
- [x] **Architectural Hardening**: Centralized service layer, improved precision formatting, and global error handling.

---

A high-precision, mobile-first financial dashboard designed to simplify project accounting for Apex Buildcon. This internal tool replaces manual spreadsheets with a unified system for tracking client receivables, project expenses, and net liquidity—optimized for a small team of 2-3 users.

### Business Context
Construction agencies in India operate on negative cash flow cycles: labour is paid weekly, vendors on delivery, but clients pay 30–90 days after billing. The app must make this tension visible instantly. Harsh Jani manages 3–8 simultaneous projects and needs to know at a glance whether he can commit to a new vendor order or must chase a client payment first.

---

### 2. User Personas

#### Primary: Harsh Jani (Owner / Operator)
The principal user who requires instant financial clarity. Uses the system to chase client payments, approve vendor payouts, and monitor project margins from his Mobile or Desktop device.

#### Secondary: Accountant / Site Admin
Small internal team (1-2 people) responsible for manual data entry of daily vendor bills, labour wages, and incoming client checks.

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

### 5. API Architecture

#### 5.1 Evolution from "Scripting" to "Service Layer"
To ensure financial precision for this internal tool, the architecture is transitioning from direct component-to-DB calls to a **Structured Service Layer**.

```
/lib
├── /services        # Centralized business logic (The "Source of Truth")
│   ├── projectService.ts   # P&L calculations, milestone logic
│   ├── financeService.ts   # Income/Expense atomic operations
│   └── authService.ts      # RBAC and session management
├── /utils           # Financial formatters (INR, Date logic)
└── /supabase        # DB client configuration
```

#### 5.2 Technical Hardening Roadmap (Q2 2026)
1. **Atomic Transactions**: Migration of multi-step operations (Income + Milestone Update) to PostgreSQL Functions (RPC) to prevent data desync.
2. **Global Error Boundary**: Implementation of high-fidelity failure handling to protect the UI during network interruptions.
3. **Adaptive UI**: Skeletons and transition states to maintain a premium "Desktop-class" feel on mobile devices.

### 6.3 Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Apex Buildcon     [+] Add Expense    │
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

### Phase 1 (Live — Completed)
| Priority | Feature | Status |
|----------|---------|--------|
| P0 | Auth + Dashboard KPIs | ✅ Done |
| P0 | Client + Project CRUD | ✅ Done |
| P0 | Income recording | ✅ Done |
| P0 | Expense recording (3 categories) | ✅ Done |
| P0 | Project P&L view | ✅ Done |
| P1 | Vendor / Labour ledger | ✅ Done |
| P1 | PDF / CSV reports export | ✅ Done |
| P1 | Alerts & overdue tracking | ✅ Done |
| P1 | Global error boundary + loading states | ✅ Done |

### Phase 2 (In Progress — Architectural Hardening)
| Priority | Feature | Status |
|----------|---------|--------|
| P0 | Atomic Income + Milestone transaction (RPC) | 🔄 Planned |
| P0 | Service Layer (`lib/services/`) consolidation | ✅ Done |
| P1 | Adaptive currency formatting (K / L / Cr) | ✅ Done |
| P1 | Auto-Balance in Milestone Manager | ✅ Done |

### Phase 3 (New Owner Requests — v1.2)
| Priority | Feature | Status |
|----------|---------|--------|
| P0 | **Module H**: Milestone Intelligence Engine | ✅ Done |
| P0 | **Module I**: Back Entry & Financial Amendment System | ✅ Done |
| P1 | Labour attendance | 📋 Backlog |
| P1 | Photo upload for bills | 📋 Backlog |

---

## 10. Success Metrics

1. **Harsh can see his net position in < 10 seconds** after opening the app
2. **Expense entry takes < 60 seconds** per transaction on mobile
3. **Project profit margin accuracy** — within 2% of manual calculation
4. **Zero data loss** — Supabase backups + RLS security
5. **Uptime:** 99.9% via Vercel + Supabase managed infrastructure
6. **Milestone suggestions accepted > 70% of the time** — the engine's defaults should match Harsh's typical project structure
7. **Back entries correctable in < 2 minutes** — the amendment flow should feel like editing, not re-entry

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

---

## Module H: Milestone Intelligence Engine

> **Owner Request:** "Suggest milestones based on running projects, notify urgency of completion by deadline, track what's been done, and help plan new milestones for incoming projects while tracking funds in real-time."

### H.1 Overview

The Milestone Intelligence Engine (MIE) is a context-aware assistant layer built on top of the existing milestone and income data. It does **not** replace manual entry — it enhances it. For an internal team of 2-3 users doing manual data entry, the MIE reduces cognitive load by pre-filling milestone schedules, surfacing urgency, and showing real-time financial health per milestone.

### H.2 Feature Breakdown

#### H.2.1 — Smart Milestone Suggestions (New Project Onboarding)

When creating a new project, the system analyses **all completed and active projects** to suggest a milestone schedule.

**Suggestion Logic (Rule-Based, No AI Required for v1):**
- Pull all milestones grouped by project type/size (contract value bracket)
- Calculate the median `percentage` and `name` per milestone position (1st, 2nd, 3rd…)
- Pre-fill the `MilestoneManager` form with these suggestions as editable defaults

**Suggested Milestone Templates (based on Harsh's construction context):**

| Position | Suggested Name | Typical % |
|----------|---------------|----------|
| 1 | Advance | 10% |
| 2 | Plinth Complete | 20% |
| 3 | Slab Complete | 20% |
| 4 | Brickwork & Plaster | 15% |
| 5 | Finishing & Electrical | 25% |
| 6 | Handover & Final Settlement | 10% |

> These templates are editable per project. The system learns from deviations over time (Phase 2).

#### H.2.2 — Urgency Notifications & Deadline Tracking

For each active milestone across all projects, the system computes an **Urgency Score**:

```
Urgency = (Days to Due Date) × (% of contract value at stake)
```

| Urgency State | Condition | UI Treatment |
|---|---|---|
| 🔴 **Critical** | Due date passed, milestone unpaid | Red badge, top of Alert Feed |
| 🟠 **Urgent** | Due in ≤ 7 days, not paid | Orange badge, Alert Feed |
| 🟡 **Upcoming** | Due in 8–21 days | Yellow badge, Dashboard widget |
| 🟢 **On Track** | Due > 21 days or fully paid | Green, normal display |

**Surfaces:**
- **Alert Feed** (sidebar): Lists all Critical + Urgent milestones across all projects
- **Project Detail page**: Each milestone row colour-coded by urgency
- **Dashboard KPI widget**: "X milestones due this week — ₹Y at stake"

#### H.2.3 — Real-Time Fund Flow per Milestone

Each milestone card on the Project Detail page shows a **live fund flow snapshot**:

```
┌───────────────────────────────────────────────┐
│ Slab Complete          [🟠 Due in 5 days]      │
│ Target: ₹ 6,40,000                             │
│ Received: ₹ 3,20,000 (50%) ████░░░░            │
│ Pending: ₹ 3,20,000                            │
│ Expenses this stage: ₹ 2,10,000                │
│ Net this stage: ₹ 1,10,000 profit so far       │
└───────────────────────────────────────────────┘
```

This is computed from: `income WHERE milestone_id = X` and `expenses WHERE milestone_id = X` in real-time.

#### H.2.4 — Multi-Project Planning View

A new **"Planning" tab** on the Dashboard shows a timeline-style view:

- All active projects on a horizontal axis (by start/end date)
- Each project's pending milestones plotted as markers on the timeline
- Colour-coded by urgency, sized by contract value
- Answers: *"Which project needs my attention this week vs next month?"*

### H.3 Data Requirements

No new DB tables are required. The engine uses:
- `milestones` (due_date, status, amount)
- `income` (milestone_id, amount, payment_date)
- `expenses` (milestone_id, amount, expense_date)
- `projects` (contract_value, start_date, expected_end_date, status)

**New DB function required:**
```sql
CREATE FUNCTION get_milestone_urgency_feed()
RETURNS TABLE (project_name, milestone_name, due_date, amount, received, urgency_state)
```

### H.4 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/milestones/urgency` | Returns urgency-sorted milestone list |
| GET | `/api/projects/[id]/milestone-suggestions` | Returns suggested schedule from historical data |
| GET | `/api/dashboard/planning-timeline` | Returns multi-project timeline data |

---

## Module I: Back Entry & Financial Amendment System

> **Owner Request:** "Allow back entry for ongoing and ended projects to fix financials when entry for a particular milestone is partial, incorrect, or missing — to catch what was skipped during work or final settlement."

### I.1 Overview

The Back Entry system allows **authorised users (owner + accountant)** to retroactively add, edit, or flag financial records for any project — active, completed, or even cancelled. This is critical for construction businesses where payments often arrive in parts, verbal agreements precede paperwork, and final settlements involve reconciliation of months of transactions.

### I.2 Feature Breakdown

#### I.2.1 — Back Entry Panel (Income)

A dedicated panel accessible from the **Project Detail page** for recording income that was received but never entered (or entered incorrectly).

**Fields:**
- `Project` (pre-selected)
- `Milestone` (dropdown, shows all milestones including completed ones)
- `Amount Received`
- `Date Received` (historical date picker — allows past dates)
- `Payment Mode` (Bank / UPI / Cash / Cheque)
- `Reference Number`
- `Reason for Back Entry` (freetext — e.g., "Missed during site visit", "Partial cheque received earlier")
- `Entered By` (auto-filled from session)
- `Entry Date` (system timestamp, immutable)

> The distinction between `Date Received` (historical) and `Entry Date` (now) creates a full audit trail.

#### I.2.2 — Back Entry Panel (Expense)

Same as income panel, but for expenses:
- All fields from the standard `ExpenseForm`
- `Expense Date` allows historical dates
- `Reason for Back Entry` (mandatory)
- Flag: `Is this a correction?` — if checked, links to an existing expense record to mark as "superseded"

#### I.2.3 — Amendment / Correction Flow

For **incorrect existing entries**, not just missing ones:

1. User navigates to any Income or Expense record
2. Clicks **"Amend Entry"** (visible to owner + accountant)
3. A modal shows the original record (read-only) alongside an editable amendment form
4. On save, the system:
   - Creates a new `income_amendments` / `expense_amendments` record (see schema below)
   - Marks the original record with `is_amended = true`
   - Updates the financial totals to use the amended figure
5. Amended records show an **"Amended"** badge with a link to the amendment log

#### I.2.4 — Settlement Reconciliation Wizard

For **completed or closing projects**, a guided wizard that:

1. Shows a side-by-side view:
   - **Left**: Contract milestones and their expected payments
   - **Right**: Actual income received and expenses paid
2. Highlights gaps: milestones with partial payments, unpaid expenses
3. For each gap, prompts: *"Is this a missed entry or genuinely outstanding?"*
4. Owner can either: **Add back entry**, **Mark as written off**, or **Flag for follow-up**
5. On completion, generates a **Final Settlement Report** (PDF) showing all adjustments made

#### I.2.5 — Audit Trail

All back entries and amendments are tracked in a read-only audit log:
- Who made the entry (user ID + name)
- When it was entered (system timestamp)
- What the change was (original vs amended)
- Why (reason field)

The audit log is accessible to the **owner only** from the Project Detail page under an "Audit" tab.

### I.3 Database Changes Required

```sql
-- Amendment tracking for income records
CREATE TABLE income_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_income_id UUID REFERENCES income(id),
  project_id UUID REFERENCES projects(id),
  milestone_id UUID REFERENCES milestones(id),
  original_amount DECIMAL(12,2),
  amended_amount DECIMAL(12,2),
  original_date DATE,
  amended_date DATE,
  reason TEXT NOT NULL,
  is_back_entry BOOLEAN DEFAULT FALSE,
  amended_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Amendment tracking for expense records
CREATE TABLE expense_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_expense_id UUID REFERENCES expenses(id),
  project_id UUID REFERENCES projects(id),
  original_amount DECIMAL(12,2),
  amended_amount DECIMAL(12,2),
  original_date DATE,
  amended_date DATE,
  reason TEXT NOT NULL,
  is_back_entry BOOLEAN DEFAULT FALSE,
  amended_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add amendment flag to existing tables
ALTER TABLE income ADD COLUMN is_amended BOOLEAN DEFAULT FALSE;
ALTER TABLE income ADD COLUMN is_back_entry BOOLEAN DEFAULT FALSE;
ALTER TABLE income ADD COLUMN back_entry_reason TEXT;

ALTER TABLE expenses ADD COLUMN is_amended BOOLEAN DEFAULT FALSE;
ALTER TABLE expenses ADD COLUMN is_back_entry BOOLEAN DEFAULT FALSE;
ALTER TABLE expenses ADD COLUMN back_entry_reason TEXT;
```

### I.4 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/income/back-entry` | Record a historical income entry |
| POST | `/api/expenses/back-entry` | Record a historical expense entry |
| POST | `/api/income/[id]/amend` | Amend an existing income record |
| POST | `/api/expenses/[id]/amend` | Amend an existing expense record |
| GET | `/api/projects/[id]/audit-log` | Full amendment & back-entry log |
| GET | `/api/projects/[id]/settlement-gaps` | Settlement reconciliation gaps |
| POST | `/api/projects/[id]/finalize-settlement` | Mark gaps and generate final report |

### I.5 UI Entry Points

| Location | Action Available |
|----------|------------------|
| Project Detail page → Income tab | "Add Back Entry" button |
| Project Detail page → Expenses tab | "Add Back Entry" button |
| Any income/expense record row | "Amend" action (owner + accountant) |
| Project Detail page → new "Audit" tab | Read-only amendment log |
| Project header (completed projects) | "Run Settlement Wizard" button |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Receivables** | Money owed to Apex Buildcon by clients |
| **Payables** | Money Apex Buildcon owes to vendors/labour |
| **Net Position** | Receivables minus Payables — working capital snapshot |
| **Milestone** | Pre-defined project stage triggering a client payment |
| **TMT Steel** | Thermo-Mechanically Treated steel bars used in construction |
| **Broker** | Labour contractor who supplies workers for a commission |
| **Back Entry** | A financial record entered after the actual transaction date, with a mandatory reason field and audit timestamp |
| **Amendment** | A correction to an existing financial record; original is preserved and marked as superseded |
| **Urgency Score** | A computed value combining days-to-due-date and contract value at stake, used to prioritise milestones |
| **Settlement Wizard** | A guided reconciliation tool for closing out a project's financial records |
| **MIE** | Milestone Intelligence Engine — the rule-based suggestion and urgency system |

---

## Appendix B: Currency & Formatting Standards

- **Currency:** Indian Rupee (₹)
- **Number Format:** Indian numbering system (lakhs/crores)
  - Example: ₹ 12,50,000 (Twelve Lakhs Fifty Thousand)
- **Date Format:** DD-MM-YYYY
- **Time Zone:** IST (UTC+5:30)

---

*End of Document — v1.2*
