# Jaani Constructions - Funds Management System

A robust funds tracking and project profitability dashboard for construction consultancy agencies.

## Features

- 📊 Real-time dashboard with KPIs (Receivables, Payables, Net Position)
- 🏗️ Project-wise expense tracking across 3 categories: Vendors, Raw Material, Labour/Broker
- 💰 Client income tracking with milestone-based payments
- 📈 Project P&L with profit margin calculations
- 🔔 Overdue payment alerts
- 📱 Mobile-first responsive design

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Node.js
- **Database:** Supabase (PostgreSQL)
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Deployment:** Vercel

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd jaani-funds
npm install
```

### 2. Environment Setup

Copy `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Run the SQL schema from `schema.sql` in the SQL Editor
3. Seed data will be automatically inserted
4. Enable Storage bucket `bill-photos` for receipt uploads

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
npm run build
```

Or connect your GitHub repo to [Vercel](https://vercel.com) for automatic deployments.

## Project Structure

```
jaani-funds/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── (dashboard)/       # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/
│   ├── dashboard/         # Dashboard components
│   ├── forms/             # Form components
│   ├── ui/                # shadcn/ui components
│   └── providers/         # Context providers
├── lib/
│   ├── supabase.ts        # Supabase clients
│   └── utils.ts           # Utility functions
├── types/
│   └── supabase.ts        # TypeScript types
├── schema.sql             # Database schema
└── package.json
```

## Default Expense Categories

### Vendors
- Electrical, Plumbing, Flooring, Carpentry, Painting
- False Ceiling, Equipment Rental, Transport

### Raw Material
- Cement, Steel (TMT), Sand, Aggregate
- Bricks/Blocks, Tiles, Sanitary Ware, Paint, Hardware

### Labour / Broker
- Mason, Helper, Carpenter, Supervisor
- Broker Commission

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Dashboard KPIs |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/expenses` | List expenses |
| POST | `/api/expenses` | Create expense |
| GET | `/api/income` | List income |
| POST | `/api/income` | Record income |

## Authentication

- Supabase Auth with Email/Password and Google OAuth
- Role-based access: Owner, Accountant, Viewer
- Row Level Security (RLS) enabled on all tables

## Future Enhancements

- [ ] WhatsApp integration for payment reminders
- [ ] GST invoice generation
- [ ] Bank statement reconciliation
- [ ] Labour attendance tracking
- [ ] Mobile app (React Native)
- [ ] Multi-company support

## License

Private - For Jaani Constructions use only.

---

Built for Harsh Jani, Owner - Jaani Constructions
