# Apex Buildcon - Funds Management System

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License: Private](https://img.shields.io/badge/License-Private-red?style=for-the-badge)](LICENSE)

A high-precision, internal funds tracking and project profitability dashboard engineered for Apex Buildcon.

[**🌐 View Live Demo**](https://jc-funds-management.vercel.app)

---

Apex Buildcon Funds Management System provides a unified platform to track multi-project finances with high precision. Designed for an internal team of 2-3 users, it focuses on manual data entry efficiency and absolute financial integrity.

### Key Value Propositions
- **Financial Integrity**: Project-wise P&L tracking with real-time margin calculations.
- **Operational Oversight**: 360° view of Vendors, Raw Material, and Labour costs.
- **Liquidity Management**: Real-time KPI tracking for Receivables, Payables, and Net Position.
- **Audit Ready**: Comprehensive transaction history for every project and vendor.

---

## ✨ Core Features

### 📊 Intelligence Dashboard
- **Real-time KPIs**: Instant visibility into total receivables, payables, and net cash position.
- **Smart Alerts**: Automated feed for overdue client payments and pending vendor dues.
- **Activity Stream**: Audit log of recent financial activities across all projects.

### 🏗️ Project Management
- **Milestone Tracking**: Link client payments to physical site progress.
- **Categorized Expenses**: Granular tracking across Vendors, Raw Materials, and Labour.
- **Profitability Analysis**: Project-wise income vs. expense breakdown with margin % tracking.

### 💰 Vendor & Ledger Management
- **Vendor Specific Ledgers**: Full transaction history and outstanding balance tracking for every vendor.
- **Manual Entry Optimization**: Simplified forms for quick recording of bills and payments.
- **Receipt Management**: Upload and track bill copies directly against expenses.

---

## 🛠️ Technical Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | High-performance React framework |
| **Database** | Supabase (PostgreSQL) | Centralized ledger with RLS security |
| **Logic Layer** | Lib Services | Structured business logic & atomic operations |
| **Auth** | Supabase Auth | Secure Email/Password & Google OAuth |
| **State** | TanStack Query v5 | Efficient server-state synchronization |

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Supabase Account

### 2. Installation
```bash
git clone https://github.com/Deepank143/JC-Funds-Management.git
cd JC-Funds-Management
npm install
```

### 3. Environment Variables
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Initialization
1. Run the `schema.sql` in your Supabase SQL Editor.
2. Ensure the `bill-photos` storage bucket is created with public access for previews.

### 5. Development
```bash
npm run dev
```

---

## 📁 Repository Structure

- `app/` - Next.js 14 App Router (Auth, Dashboard, API)
- `components/` - Atomic UI design system (Dashboard, Forms, Layout)
- `contexts/` - Global state (Admin/Maker-Checker logic)
- `lib/` - Shared utilities and lazy-loaded Supabase clients
- `types/` - Database and application type definitions
- `schema.sql` - Single-source-of-truth database architecture

---

## 📅 Roadmap

### ✅ Phase 1 — Core System (Live)
- [x] Auth, RBAC (Owner / Accountant / Viewer)
- [x] Project, Client, Vendor CRUD
- [x] Income & Expense recording
- [x] Project P&L and KPI Dashboard
- [x] PDF / CSV Report Export
- [x] Alerts & Overdue Tracking
- [x] Global Error Boundary + Loading States

### 🔄 Phase 2 — Architectural Hardening (In Progress)
- [x] Global Error Boundary
- [ ] Service Layer (`lib/services/`) consolidation
- [ ] Atomic Income + Milestone RPC transactions
- [ ] Auto-Balance in Milestone Manager

### 📋 Phase 3 — Owner Requested Features (v1.2)
- [ ] **Milestone Intelligence Engine**: Smart suggestions, urgency scoring, real-time fund flow per milestone, multi-project planning timeline
- [ ] **Back Entry & Amendment System**: Historical income/expense entry, amendment flow with audit trail, Settlement Reconciliation Wizard for closing projects

---

## 📝 License
Proprietary software for **Apex Buildcon**. All rights reserved.

---

**Built with ❤️ for Harsh Jani**
