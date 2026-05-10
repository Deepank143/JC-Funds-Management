# Apex Buildcon - Funds Management System

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License: Private](https://img.shields.io/badge/License-Private-red?style=for-the-badge)](LICENSE)

A premium, enterprise-grade funds tracking and project profitability dashboard specifically engineered for construction consultancy agencies.

[**🌐 View Live Demo**](https://jc-funds-management.vercel.app)

---

## 🏗️ Project Overview

Apex Buildcon Funds Management System provides a unified platform to track multi-project finances with high precision. It implements a **Maker-Checker security model**, ensuring that while accountants can record data, only the owner can finalize sensitive financial transactions like payments.

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
- **Maker-Checker Payments**: Secure payment flow where accountants request and owners approve.
- **Receipt Management**: Upload and track bill copies directly against expenses.

---

## 🛠️ Technical Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | High-performance React framework with SSR/ISR |
| **Styling** | Tailwind CSS + shadcn/ui | Premium, mobile-first design system |
| **Backend** | Next.js API Routes | Serverless edge functions for data processing |
| **Database** | Supabase (PostgreSQL) | Real-time DB with Row Level Security (RLS) |
| **Auth** | Supabase Auth | Secure Email/Password & Google OAuth integration |
| **State** | TanStack Query v5 | Robust data fetching and server-state caching |
| **Validation** | Zod + React Hook Form | Strict type safety for all data entries |

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

## 📅 Roadmap (Phase 2)
- [ ] **WhatsApp Bot**: Automated payment reminders for clients.
- [ ] **GST Module**: Automated tax calculation and invoice generation.
- [ ] **Attendance**: QR-based labour attendance linked to payroll.
- [ ] **Analytics**: Predictive cash flow forecasting based on milestone dates.

---

## 📝 License
Proprietary software for **Apex Buildcon**. All rights reserved.

---

**Built with ❤️ for Harsh Jani**
