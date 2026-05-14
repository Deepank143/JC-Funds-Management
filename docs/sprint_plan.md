# 🏗️ Sprint Plan — Apex Buildcon Funds Management System
**Client: Harsh Jani | Version: 3.0 (Architectural Release) | Last Updated: May 2026**
*Architecture: Hybrid Maker-Checker (Admin Mode + Staff Data Entry)*

---

## Current State Audit

The application has successfully completed its MVP phases (Sprints 1-5) and the recent Version 3.0 architectural upgrade (Sprint 6). The system is now a highly secure, role-based command center for fund management.

### ✅ Completed Modules (v1.0 - v3.0)
| Area | Status |
|------|--------|
| Next.js 14, Vercel, Supabase Schema & Auth | ✅ Done |
| App Shell, Navigation & Role-based Routing | ✅ Done |
| Clients & Projects (CRUD + P&L View) | ✅ Done |
| Income & Expenses Tracking | ✅ Done |
| Vendor / Labour Ledger | ✅ Done |
| PDF / CSV Reports Export | ✅ Done |
| **Command & Control**: Admin Toggle & Privacy Shield | ✅ Done |
| **Maker-Checker Workflow**: Payment Authorization | ✅ Done |
| **Milestone Intelligence Engine**: Suggestions & Urgency | ✅ Done |
| **Back Entry & Amendment System**: Historical edits | ✅ Done |

---

## Delivery Timeline Overview

```
Phase 1 (MVP)
Sprint 1: Auth + App Shell + Navigation                     ✅ COMPLETE
Sprint 2: Clients + Projects (CRUD + P&L View)              ✅ COMPLETE
Sprint 3: Income + Expenses + Vendor Ledger                 ✅ COMPLETE

Phase 2 (Hardening & Polish)
Sprint 4: Command & Control (Security & Roles)              ✅ COMPLETE
Sprint 5: Premium Polish & Performance (RPCs)               ✅ COMPLETE

Phase 3 (Owner Requests - v3.0)
Sprint 6: Milestone Intelligence & Back Entry Amendments    ✅ COMPLETE

Phase 4 (Current)
Sprint 7: Data Integrity & UI Enhancements                  🔄 IN PROGRESS
```

---

## Completed Sprints (Historical Record)

### Sprint 1 — 3: Core MVP
**Status: ✅ COMPLETE**
- **Auth & Shell**: Supabase auth, Google OAuth, Admin Context, proxy routing.
- **Project Accounting**: Client and Project creation, real-time P&L, KPI dashboard.
- **Financial Flows**: Income recording, Expense recording across categories (Vendors, Raw Material, Labour).
- **Ledger & Reports**: Vendor specific ledgers and basic PDF/CSV exports.

### Sprint 4: Command & Control (Security Hardening)
**Status: ✅ COMPLETE**
- **Maker-Checker Gate**: Server-side checks for payment approvals (only `owner` can approve).
- **Privacy Shield**: Admin Mode toggle to mask sensitive KPIs from staff in the field.
- **RBAC API Protection**: Secured sensitive routes (`/pnl`, `/summary`) using `checkRole`.

### Sprint 5: Premium Polish & Handover
**Status: ✅ COMPLETE**
- **Mobile-First Data**: Converted overflow tables to responsive cards.
- **Color-Coded Health**: Profit margins color-coded in project grid.
- **SQL Performance**: Consolidated KPI logic into high-performance RPC functions.

### Sprint 6: Intelligence & Amendments (v3.0)
**Status: ✅ COMPLETE**
- **Milestone Intelligence Engine**: Smart milestone suggestions on project creation, urgency scoring, and real-time fund flow tracking per milestone.
- **Back Entry System**: Retroactive financial recording with reason tracking and audit trails for ongoing or completed projects.

---

## Current: Sprint 7 — Data Integrity & UI Enhancements
**Duration:** 1 Week  
**Status: ✅ COMPLETE**  
**Goal:** Finalize the transition to a robust Service Layer with atomic database transactions, enhance UI status tracking, and implement file storage.

### Tasks

#### 7.1 Database & Service Layer Hardening
- [x] **Atomic Transactions**: Implement RPCs for multi-step operations (e.g., creating an Income record and automatically updating the linked Milestone status simultaneously) to prevent data desynchronization.
- [x] **Global Error Boundary**: Implement high-fidelity failure handling across the app to protect UI state during network drops.

#### 7.2 UI Status Enhancements (Completed)
- [x] **Payment Status Indicators**: Color-coded status badges for Income (based on milestone `due_date`) and Expenses (`paid`, `partial`, `unpaid`).
- [x] **Milestone Input Integration**: Integrated milestone creation directly into the project creation flow.

#### 7.3 Bill & Invoice Storage (Completed)
- [x] Implement photo upload widget for the `ExpenseForm`.
- [x] Integrate Supabase Storage bucket (`bill-photos`) with authenticated uploads (5MB limit).
- [x] Add image preview modals in the Expense list and Vendor Ledger views.

---

## Backlog (Future Enhancements)

> *To be estimated for subsequent phases once Sprint 7 is deployed.*

| Feature | Effort | Notes |
|---------|--------|-------|
| WhatsApp Integration | M | Send automated payment reminders to clients via WhatsApp API. |
| GST Invoice Generation | L | Auto-generate GST-compliant PDF invoices from milestone data. |
| Bank Statement Reconciliation | L | CSV upload to auto-match bank transactions with app entries. |
| Budget vs. Actual | S | Set category-wise budgets per project and track variance visually. |
| Multi-company Support | M | Support for multiple business entities under a single owner login. |
| React Native App | XL | Native mobile wrapper for robust offline entry at construction sites. |
