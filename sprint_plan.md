# 🏗️ Sprint Plan — Jaani Constructions Funds Management System
**Freelancer POV | Client: Harsh Jani | Last Updated: May 6, 2026**
*Architecture: Hybrid Maker-Checker (Admin Mode + Staff Data Entry)*

---

## Current State Audit

### ✅ What Was Built Pre-Sprint 1
| Area | Status |
|------|--------|
| Next.js 14 project scaffolded | ✅ Done |
| Vercel deployment live | ✅ Done |
| Supabase schema (all tables) live | ✅ Done |
| `lib/supabase.ts` client setup | ✅ Done |
| `lib/utils.ts` (INR formatter, helpers) | ✅ Done |
| `types/supabase.ts` (DB type definitions) | ✅ Done |
| `app/api/dashboard/summary/route.ts` | ✅ Done |
| `app/api/projects/route.ts` (GET + POST) | ✅ Done |
| `app/api/expenses/route.ts` (GET + POST) | ✅ Done |
| `app/api/income/route.ts` (GET + POST) | ✅ Done |
| `components/dashboard/KpiCards.tsx` | ✅ Done |
| `components/dashboard/ProjectGrid.tsx` | ✅ Done |
| `components/forms/ExpenseForm.tsx` | ✅ Done |

---

## Delivery Timeline Overview

```
Week 1  → Sprint 1: Auth + App Shell + Navigation         ✅ COMPLETE
Week 2  → Sprint 2: Clients + Projects (CRUD + P&L View)  ✅ COMPLETE (1 minor gap)
Week 3  → Sprint 3: Income + Expenses (Full flows + Vendor Ledger)  🔲 NEXT
Week 4  → Sprint 4: Reports + Alerts + Polish + Production Hardening
```

---

## Sprint 1 — Auth + App Shell + Navigation
**Duration:** Week 1  
**Status: ✅ COMPLETE**  
**Goal:** Harsh can log in securely and navigate between all sections. The app feels real.

### Tasks

#### 1.1 Authentication
- [x] `app/(auth)/login/page.tsx` — Email/password + Google OAuth ✅
- [x] `app/(auth)/login/layout.tsx` — Centered layout ✅
- [x] Google OAuth button wired to `supabase.auth.signInWithOAuth` ✅ *(fixed: Google SVG icon added)*
- [x] `proxy.ts` — Route protection at root ✅ *(migrated from deprecated `middleware.ts`)*
- [x] `app/api/auth/callback/route.ts` — OAuth callback handler ✅
- [x] Sign-out via Header dropdown menu ✅

#### 1.2 App Shell & Navigation
- [x] `app/(dashboard)/layout.tsx` — Sidebar + Header shell ✅ *(live overdue count wired)*
- [x] `components/layout/Sidebar.tsx` — Desktop + mobile Sheet ✅
- [x] `components/layout/Header.tsx` — Real user name from session ✅ *(was hardcoded, now live)*
- [x] `app/(dashboard)/page.tsx` — Dashboard in route group ✅

#### 1.3 Dashboard Wiring
- [x] `AlertFeed.tsx` — Fetches from `/api/dashboard/alerts` ✅
- [x] `KpiCards` — React Query fetch from `/api/dashboard/summary` via `get_dashboard_kpis()` RPC ✅
- [x] `ProjectGrid` — React Query fetch from `/api/projects?status=active` ✅

### Acceptance Criteria
- [x] Login with email/password works and redirects to dashboard ✅
- [x] Google OAuth wired ✅
- [x] All nav links present in sidebar ✅
- [x] KPI cards fetch real Supabase data ✅
- [x] Unauthenticated users redirect to `/login` ✅ *(proxy.ts guards all dashboard routes)*
- [x] Alert feed shows real data ✅ *(API built + auth-protected)*

### Production Hardening (Sprint 1 scope — Done ahead of schedule)
- [x] Auth check on all Sprint 1 API routes (`dashboard/summary`, `dashboard/alerts`, `projects`, `expenses`, `income`) ✅
- [x] `types/supabase.ts` extended with `milestones`, `expense_categories`, `expense_subcategories`, `labour_attendance`, `project_budgets` ✅
- [x] `hooks/use-toast.ts` established as canonical import path — all 5 files corrected ✅
- [x] `components/ui/toast.tsx` and `toaster.tsx` — `"use client"` added ✅
- [x] Login page — `next/headers` boundary violation fixed (`createClientComponentClient`) ✅
- [x] `package.json` — broken versions corrected (`next@14.2.4`, `jspdf@^2.5.1`, `jspdf-autotable@^3.8.2`) ✅
- [x] Sidebar `overdueCount` wired to live React Query data ✅
- [x] Dashboard summary: 5 sequential DB queries replaced by single `get_dashboard_kpis()` RPC ✅
- [x] **AdminContext & UI:** Implemented `useAdmin` hook, Header shield toggle, and KPI privacy masking ✅

---

## Sprint 2 — Clients + Projects (Full CRUD + P&L)
**Duration:** Week 2  
**Status: ✅ COMPLETE (1 minor gap — milestone PATCH)**  
**Goal:** Harsh can add clients, create projects with milestones, and see a live P&L for each project.

### Tasks

#### 2.1 Client Module
- [x] `app/api/clients/route.ts` — GET (list with search) + POST (create) ✅ *(auth-protected)*
- [x] `app/api/clients/[id]/route.ts` — GET (detail) + PATCH (update) ✅ *(auth-protected)*
- [x] `app/api/clients/[id]/statements/route.ts` — Full JSON statement (milestones + income) ✅ *(auth-protected)*
- [x] `app/(dashboard)/clients/page.tsx` — Client list with search, skeleton, empty state ✅
- [x] `app/(dashboard)/clients/[id]/page.tsx` — Client detail: 4 KPI cards + project list ✅
- [x] `components/forms/ClientForm.tsx` — Zod validation, create + edit mode ✅

#### 2.2 Projects Module
- [x] `app/(dashboard)/projects/page.tsx` — Project list, filter: All/Active/Completed/On Hold ✅
- [x] `app/(dashboard)/projects/[id]/page.tsx` — Full P&L page ✅
  - [x] Income section (milestone-linked payments) ✅
  - [x] Expenses section (category breakdown with paid/unpaid split) ✅
  - [x] Recharts bar chart: category breakdown ✅
  - [x] Profit margin with color coding ✅
- [x] `app/api/projects/[id]/route.ts` — GET project detail (with milestones + income join) ✅ *(auth-protected)*
- [x] `app/api/projects/[id]/pnl/route.ts` — Calls `get_project_summary()` DB RPC ✅ *(auth-protected)*
- [x] `components/forms/ProjectForm.tsx` — Client dropdown, milestones builder, live INR preview ✅
- [x] `components/charts/ProjectProfitChart.tsx` — Recharts bar with custom INR tooltip ✅

#### 2.3 Milestones API
- [x] `app/api/milestones/route.ts` — GET (by project_id) + POST (create with auto-amount calc) ✅ *(auth-protected)*
- [x] Auto-calculate milestone amounts from % × contract value ✅
- [ ] `app/api/milestones/[id]/route.ts` — PATCH status toggle (pending → billed → paid) ❌ **GAP**

### Acceptance Criteria
- [x] Can create a client and link a project to them ✅
- [x] Project P&L shows correct income vs. expenses vs. profit ✅
- [ ] Milestone status can be changed from UI ❌ **GAP — PATCH endpoint missing**
- [x] Project card on dashboard links to project detail page ✅

### Sprint 2 Issues Fixed During Verification
- [x] Auth check added to all 6 new Sprint 2 API routes ✅ *(was missing on initial submission)*
- [x] `ClientForm.tsx` toast import path fixed (`@/hooks/use-toast`) ✅
- [x] `ProjectForm.tsx` toast import path fixed (`@/hooks/use-toast`) ✅

---

## Sprint 3 — Income + Expenses (Full Flows) + Vendor Ledger
**Duration:** Week 3 (May 19–23)  
**Status: 🔲 NOT STARTED**  
**Goal:** End-to-end money tracking — recording what comes in, what goes out, and who is owed what.

### Pre-work (carry from Sprint 2 gap)
- [ ] `app/api/milestones/[id]/route.ts` — PATCH status toggle *(needed by IncomeForm)*

### Tasks

#### 3.1 Income Module
- [ ] Create `app/(dashboard)/income/page.tsx` — Income list (filter by project) + "Record Payment" button
- [ ] Create `components/forms/IncomeForm.tsx`:
  - Project dropdown
  - Milestone selector (auto-populates amount)
  - Date, amount, payment mode (Bank/UPI/Cash/Cheque)
  - Reference number, notes
- [ ] Enhance `app/api/income/route.ts` — add `milestone_id` update on payment record (set milestone → `paid`)

#### 3.2 Expenses Module
- [ ] Create `app/(dashboard)/expenses/page.tsx` — Expense list with filters (project, category, payment_status)
- [ ] Add `app/api/expenses/[id]/pay/route.ts` — PATCH: mark expense paid (amount_paid, payment_mode, reference)
- [ ] Enhance `ExpenseForm.tsx` — add bill photo upload via Supabase Storage (`bill-photos` bucket)
- [ ] Add "Mark as Paid" quick action on expense list rows *(UI Enforcement: Only visible to `canManageFunds` admin)*

#### 3.3 Vendor Module
- [ ] Create `app/api/vendors/route.ts` — GET + POST *(already exists — needs page)*
- [ ] Create `app/api/vendors/[id]/route.ts` — GET detail
- [ ] Create `app/api/vendors/[id]/ledger/route.ts` — All expenses for vendor with running balance
- [ ] Create `app/(dashboard)/vendors/page.tsx` — Vendor/Labour master list (filter by type: vendor/labour/broker)
- [ ] Create `app/(dashboard)/vendors/[id]/page.tsx` — Vendor ledger: bills, payments, closing balance
- [ ] Create `components/forms/VendorForm.tsx` — Name, type, phone, category, subcategory

#### 3.4 Expense Sub-category API
- [ ] Create `app/api/categories/route.ts` — GET all categories with subcategories *(already partially covered by `/api/expenses/categories` and `/api/expenses/subcategories`)*

### Sprint 4: Command & Control (Security Hardening) 🟢 COMPLETED
**Goal**: Enforce professional hierarchy and "Privacy Shield".

- [x] **Maker-Checker Gate**: Implement server-side check for payment approvals.
- [x] **Privacy Shield v2**: Server-side masking for dashboard KPIs based on role.
- [x] **RBAC API Protection**: Secure sensitive routes (`/pnl`, `/summary`) using `checkRole` utility.
- [x] **Calculation Logic Fix**: Refactor Net Position to `(Cash + Receivables) - Payables`.

### Sprint 5: Premium Polish & Handover 🟢 COMPLETED
**Goal**: Delight Harsh Jani with high-end UX details.

- [x] **Mobile-First Data**: Convert overflow tables to responsive cards for site use.
- [x] **Color-Coded Health**: Profit margins color-coded in project grid (G: >15%, Y: 5-15%, R: <5%).
- [x] **Admin Feedback**: Prominent Admin Mode indicator in header.
- [x] **SQL Performance**: Consolidate KPI logic into high-performance RPC functions.

### Tasks

#### 4.1 Reports Module
- [ ] Implement **Expense Summary CSV** export (date range filter)
- [ ] Implement **Client Statement PDF** — all projects, payments received, pending
- [ ] Implement **Vendor Ledger PDF**
- [ ] Create `app/api/reports/project-pnl/route.ts` — serves JSON data for report generation

#### 4.2 Alerts & Overdue Tracking
- [x] `app/api/dashboard/alerts/route.ts` — Built + auth-protected ✅ *(done in Sprint 1)*
- [x] `AlertFeed` component wired to alerts API ✅ *(done in Sprint 1)*
- [x] Overdue count on sidebar badge ✅ *(done in Sprint 1)*
- [ ] Budget threshold alert: category total > 80% of contract estimate *(logic not yet in alerts API)*

#### 4.3 Aging Report UI
- [ ] Add Aging Report tab on the Clients page:
  - Buckets: 0–30, 31–60, 61–90, 90+ days overdue
  - Per-client breakdown

#### 4.4 Production Hardening & Security (Maker-Checker)
- [x] Auth check on all API routes ✅ *(completed ahead of schedule across Sprint 1 & 2)*
- [ ] Implement **Role-Based RLS Policies** in Supabase (enforce `owner` vs `accountant` permissions)
- [ ] Secure API routes: ensure `PATCH /pay` and `DELETE` handlers explicitly verify `profiles.role === 'owner'`
- [ ] Seed `expense_categories` and `expense_subcategories` in Supabase if not done
- [ ] Create `bill-photos` storage bucket in Supabase (5MB limit, authenticated upload)
- [x] Loading skeletons on all list pages ✅ *(done in Sprint 2)*
- [x] Empty states on all list pages ✅ *(done in Sprint 2)*
- [x] Toast notifications working (shadcn `Toaster`) ✅ *(fixed in Sprint 1)*
- [ ] Mobile QA — test all forms on 375px viewport
- [ ] End-to-end smoke test: create client → project → record income → record expense → view P&L → export PDF
- [ ] Migrate from `@supabase/auth-helpers-nextjs` (deprecated) to `@supabase/ssr`
- [ ] Full `tsc --noEmit` pass with zero errors

### Acceptance Criteria
- [ ] Harsh can export a Project P&L PDF in one click
- [ ] Alert feed shows real overdue milestones ✅ *(partial — budget threshold not yet)*
- [ ] All pages work on mobile (iPhone 13 equivalent viewport)
- [ ] No unauthenticated API calls succeed ✅ *(done)*
- [ ] App loads dashboard KPIs in < 3 seconds on 4G

---

## API Endpoint Completion Tracker

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/dashboard/summary` | GET | ✅ Done (RPC optimised) |
| `/api/dashboard/alerts` | GET | ✅ Done (Sprint 1) |
| `/api/projects` | GET + POST | ✅ Done |
| `/api/projects/[id]` | GET | ✅ Done (Sprint 2) |
| `/api/projects/[id]/pnl` | GET | ✅ Done (Sprint 2) |
| `/api/clients` | GET + POST | ✅ Done (Sprint 2) |
| `/api/clients/[id]` | GET + PATCH | ✅ Done (Sprint 2) |
| `/api/clients/[id]/statements` | GET | ✅ Done (Sprint 2) |
| `/api/income` | GET + POST | ✅ Done |
| `/api/expenses` | GET + POST | ✅ Done |
| `/api/expenses/categories` | GET | ✅ Done (Sprint 1) |
| `/api/expenses/subcategories` | GET | ✅ Done (Sprint 1) |
| `/api/expenses/[id]` | PUT | ✅ Done (Sprint 1) |
| `/api/milestones` | GET + POST | ✅ Done (Sprint 2) |
| `/api/milestones/[id]` | PATCH | ❌ Gap — Sprint 3 pre-work |
| `/api/vendors` | GET + POST | ✅ Done (Sprint 1) |
| `/api/vendors/[id]` | GET | ❌ Sprint 3 |
| `/api/vendors/[id]/ledger` | GET | ❌ Sprint 3 |
| `/api/expenses/[id]/pay` | PATCH | ❌ Sprint 3 |
| `/api/categories` | GET | ❌ Sprint 3 *(partially covered)* |
| `/api/reports/project-pnl` | GET | ❌ Sprint 4 |
| `/api/auth/callback` | GET | ✅ Done (Sprint 1) |

---

## Page Completion Tracker

| Page | Status |
|------|--------|
| `/login` | ✅ Done (Sprint 1) |
| `/` (Dashboard) | ✅ Done — KPIs, Alerts, ProjectGrid all live |
| `/clients` | ✅ Done (Sprint 2) |
| `/clients/[id]` | ✅ Done (Sprint 2) |
| `/projects` | ✅ Done (Sprint 2) |
| `/projects/[id]` | ✅ Done (Sprint 2) — full P&L with chart |
| `/income` | ❌ Sprint 3 |
| `/expenses` | ❌ Sprint 3 |
| `/vendors` | ❌ Sprint 3 |
| `/vendors/[id]` | ❌ Sprint 3 |
| `/reports` | ❌ Sprint 4 |

---

## Definition of Done (for every feature)
1. API route returns correct data from Supabase (verified in browser/Postman)
2. UI renders data correctly on both desktop and mobile (375px)
3. Form validates inputs with Zod + shows inline errors
4. Loading state shown while fetching
5. Empty state shown when no data exists
6. Error toast shown on API failure
7. No TypeScript `tsc` errors
8. Auth check passes — unauthenticated request returns 401

---

## Backlog (Post-MVP / Phase 2)

> These are explicitly out of scope for the 4-week delivery but should be estimated for a follow-up proposal.

| Feature | Effort | Notes |
|---------|--------|-------|
| Labour Attendance Register | M | Phase 2 — `labour_attendance` table ready |
| Weekly Summary Email | M | Use Supabase Edge Functions + Resend |
| WhatsApp Payment Reminders | L | WhatsApp Business API |
| GST Invoice Generation | L | Requires GST number validation |
| Bank Statement Reconciliation (CSV upload) | L | Auto-match income entries |
| Budget vs. Actual per Category | S | Per-project budget fields in `projects` table |
| React Native Mobile App | XL | Offline entry at construction sites |

---

*Prepared by: Freelance Developer | For: Harsh Jani, Jaani Constructions*
*Last Updated: May 6, 2026*
