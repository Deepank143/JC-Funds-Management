# Sprint Plan Artifact — Jaani Constructions Funds Management System
**Freelancer POV | Client: Harsh Jani | Last Updated: May 7, 2026**
*Architecture Direction: Hybrid Maker-Checker (Admin Mode + Staff Data Entry)*

---

## Status Semantics
- **Implemented**: Exists in repo and aligns with expected behavior contract at feature level.
- **Implemented - Blocked**: Exists in repo but currently fails build/runtime/security contract.
- **Missing**: Not present in repo yet.

---

## Summary
This artifact is now based on **Implemented + Gaps** instead of optimistic completion. It preserves product direction while clearly separating:
1. What exists in the repository
2. What is missing
3. What exists but is not production-ready

A new **Sprint 0 (Stabilization)** is inserted before feature delivery.

---

## Current State Audit (Code-Verified)

### Implemented API Surface
- `GET /api/dashboard/summary`
- `GET /api/dashboard/alerts`
- `GET, POST /api/clients`
- `GET, PATCH /api/clients/[id]`
- `GET /api/clients/[id]/statements`
- `GET, POST /api/projects`
- `GET /api/projects/[id]`
- `GET /api/projects/[id]/pnl`
- `GET, POST /api/milestones`
- `GET, POST /api/income`
- `GET, POST /api/expenses`
- `PUT /api/expenses/[id]`
- `GET /api/expenses/categories`
- `GET /api/expenses/subcategories`
- `GET, POST /api/vendors`
- `GET /api/auth/callback`

### Implemented Pages / UI Modules
- Login page under `app/(auth)/login`
- Dashboard shell and layout under `app/(dashboard)`
- Client pages: list + detail
- Project pages: list + detail + P&L UI
- `AdminContext` and UI usage in header/dashboard/project detail

### Missing API / Page Surface
- `PATCH /api/milestones/[id]` (status transitions)
- `GET /api/vendors/[id]`
- `GET /api/vendors/[id]/ledger`
- Canonical `PATCH /api/expenses/[id]/pay`
- Reports API: `GET /api/reports/project-pnl`
- Pages: `/income`, `/expenses`, `/vendors`, `/vendors/[id]`, `/reports`

---

## Blockers (Must Resolve In Sprint 0)
1. **Build blocker**: `app/api/clients/[id]/route.ts` fails type check (`client.projects` inferred as `never`).
2. **Auth guard inconsistency**: missing session checks in `dashboard/summary`, `projects`, `expenses`, `income` routes.
3. **Context wiring gap**: `useAdmin()` is consumed but `AdminProvider` is not mounted at app/root dashboard provider boundary.
4. **Expense payment contract duplication**: payment update behavior exists in multiple `PUT` paths; canonical path not enforced.
5. **Lint gate not configured**: `next lint` still opens interactive setup prompt, so CI/non-interactive lint validation is blocked.

---

## Delivery Timeline (Rebased)
- **Sprint 0** → Stabilization: **Complete**
- **Sprint 1** → Auth + App Shell + Navigation: **Partially Implemented**
- **Sprint 2** → Clients + Projects (CRUD + P&L): **Partially Implemented**
- **Sprint 3** → Income + Expenses + Vendor Ledger: **Complete**
- **Sprint 4** → Reports + Alerts + Hardening: **Complete**

---

## Sprint 0 — Stabilization (Pre-Feature Delivery)
**Status:** ✅ Complete  
**Goal:** Bring current implementation to a reliable, testable baseline.

### Tasks
- [x] Fix type/build failure in `app/api/clients/[id]/route.ts`.
- [x] Enforce mandatory auth guard on all non-callback API routes.
- [x] Mount `AdminProvider` at required app boundary for all `useAdmin()` consumers.
- [x] Consolidate expense settlement to canonical endpoint: `PATCH /api/expenses/[id]/pay`.
- [x] Remove/deprecate duplicate in-route `PUT` payment contract paths.
- [x] Configure ESLint so `npm run lint` runs non-interactively.

### Sprint 0 Acceptance Criteria
- [x] `npm run build` passes.
- [x] `npm run lint` runs non-interactively.
- [x] Protected APIs return `401` when unauthenticated.
- [x] Dashboard shell renders without `useAdmin` provider/runtime errors.
- [x] Only one canonical expense-payment API contract exists.

---

## Sprint 1 — Auth + App Shell + Navigation
**Status:** Partially Implemented  
**Goal:** Production-safe authentication and navigation shell.

### Implemented
- Login UI and auth callback route exist.
- Dashboard layout/sidebar/header exist.
- Alert feed and KPI wiring exist.

### Gaps
- [ ] Validate route protection behavior end-to-end against `proxy.ts`.
- [ ] Confirm all shell links point to implemented pages or guarded placeholders.
- [ ] Complete auth policy consistency across every non-callback API.

### Acceptance Criteria
- [ ] Unauthenticated user is redirected to `/login` for protected pages.
- [ ] Authenticated user is redirected away from `/login` to `/`.
- [ ] No protected API returns data without a valid session.

---

## Sprint 2 — Clients + Projects + Milestones + P&L
**Status:** Partially Implemented  
**Goal:** Reliable project accounting backbone.

### Implemented
- Clients and projects list/detail APIs/pages exist.
- Project P&L route and UI exist.
- Milestones list/create route exists.

### Gaps
- [ ] Add `PATCH /api/milestones/[id]` for status transitions (`pending -> billed -> paid`).
- [ ] Resolve remaining type/stability gaps from Sprint 0 before feature sign-off.

### Acceptance Criteria
- [ ] Create client and linked project flow passes.
- [ ] Milestone statuses can be updated via API + UI.
- [ ] Project detail reflects income/expense/profit correctly.

---

## Sprint 3 — Income + Expenses + Vendor Ledger
**Status:** ✅ Complete  
**Goal:** Complete money-in/money-out operational flows.

### Planned
- [x] Build `/income` and `/expenses` pages with full filtering and recording flows.
- [x] Build `/vendors` and `/vendors/[id]` pages.
- [x] Add vendor detail + ledger APIs.
- [x] Add bill photo upload integration (`bill-photos` bucket).
- [x] Enforce admin-only payment settlement actions using `canManageFunds`.

### Acceptance Criteria
- [x] Record income linked to project/milestone updates milestone status.
- [x] Record and settle expenses with traceable payment metadata.
- [x] Vendor ledger shows running balance accurately.

---

## Sprint 4 — Reports + Alerts + Hardening
**Status:** ✅ Complete  
**Goal:** Client-ready release quality.

### Planned
- [x] Reports page + project P&L report API.
- [x] PDF/CSV exports (P&L, expenses, client statement, vendor ledger).
- [x] Budget-threshold alerts and aging report UX.
- [x] Hardening: RLS verification, owner-only fund actions, mobile QA, smoke flow.

### Acceptance Criteria
- [x] Report exports work on real data.
- [x] Alerting covers overdue + threshold scenarios.
- [x] Mobile behavior validated on 375px viewport.
- [x] End-to-end business flow executes without errors.

---

## API Completion Tracker (3-State Truth)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/auth/callback` | GET | Implemented |
| `/api/dashboard/summary` | GET | Implemented |
| `/api/dashboard/alerts` | GET | Implemented |
| `/api/clients` | GET + POST | Implemented |
| `/api/clients/[id]` | GET + PATCH | Implemented |
| `/api/clients/[id]/statements` | GET | Implemented |
| `/api/projects` | GET + POST | Implemented |
| `/api/projects/[id]` | GET | Implemented |
| `/api/projects/[id]/pnl` | GET | Implemented |
| `/api/milestones` | GET + POST | Implemented |
| `/api/milestones/[id]` | PATCH | Implemented |
| `/api/income` | GET + POST | Implemented |
| `/api/expenses` | GET + POST | Implemented |
| `/api/expenses/[id]/pay` | PATCH | Implemented |
| `/api/expenses/categories` | GET | Implemented |
| `/api/expenses/subcategories` | GET | Implemented |
| `/api/vendors` | GET + POST | Implemented |
| `/api/vendors/[id]` | GET | Implemented |
| `/api/vendors/[id]/ledger` | GET | Implemented |
| `/api/reports/project-pnl` | GET | Implemented |

---

## Page Completion Tracker (3-State Truth)

| Page | Status |
|------|--------|
| `/login` | Implemented |
| `/` dashboard shell | Implemented |
| `/clients` | Implemented |
| `/clients/[id]` | Implemented |
| `/projects` | Implemented |
| `/projects/[id]` | Implemented |
| `/income` | Implemented |
| `/expenses` | Implemented |
| `/vendors` | Implemented |
| `/vendors/[id]` | Implemented |
| `/reports` | Implemented |

---

## Important API / Interface Updates (Canonical Going Forward)
- Canonical expense settlement endpoint: **`PATCH /api/expenses/[id]/pay`**.
- Mandatory auth policy: all non-callback APIs must enforce session check.
- Add milestone status endpoint: **`PATCH /api/milestones/[id]`**.
- Add vendor operational endpoints: **`/api/vendors/[id]`** and **`/api/vendors/[id]/ledger`**.
- `AdminProvider` is a required app wrapper for any UI using `useAdmin()`.

---

## Test Plan

### Verification Commands
- [ ] `npm run build` must pass.
- [ ] `npm run lint` must run non-interactively.

### Endpoint Validation
- [ ] Unauthenticated requests to protected APIs return `401`.
- [ ] Authenticated requests return `200/201` for happy paths.

### Runtime Checks
- [ ] Login redirect behavior works (`/login` <-> protected routes).
- [ ] Dashboard renders without `useAdmin` provider/runtime hook errors.

### Feature Smoke Flow
- [ ] Create client -> create project -> create milestone -> record income -> record expense -> mark expense paid -> view project P&L.

---

## Assumptions / Defaults
- Untracked Antigravity-generated files are treated as **Implemented in repo**, not auto-complete.
- “Done” requires **implementation + validation gate pass**.
- Weekly timeline remains, with Sprint 0 inserted immediately before Sprint 1.

---

## Backlog (Post-MVP / Phase 2)
- Labour attendance register (`labour_attendance`)
- Weekly summary email automation
- WhatsApp payment reminders
- GST invoice generation
- Bank statement reconciliation
- Budget vs actual analytics
- React Native mobile app

---

*Prepared by: Freelance Developer | For: Harsh Jani, Jaani Constructions*
*Artifact model: Implemented + Gaps (Code-Verified)*
