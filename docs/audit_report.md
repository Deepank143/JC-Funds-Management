# Architectural & Codebase Audit Report

## 1. Executive Summary
Following the completion of Sprint 7, a comprehensive line-by-line architectural audit was performed on the core functionality, React components, and API routing structure of the Funds Management app. The focus was to identify silent bugs, performance bottlenecks, and structural anomalies. 

The audit confirms the application builds cleanly, is heavily typed, and successfully handles client-server authentication. However, key flaws in error handling and React contexts were identified and resolved, with a few low-level technical debt items documented for future phases.

## 2. Immediate Bugs Identified and Fixed

### A. React Context Re-Render Vulnerability (Fixed)
- **Issue:** In `contexts/AdminContext.tsx`, `fetchProfile` was not memoized but was invoked within a `useEffect`, triggering ESLint exhaustive-deps warnings. This pattern often leads to infinite re-render loops or stale closures in Next.js Context APIs when downstream state updates.
- **Resolution:** Wrapped `fetchProfile` in `useCallback` with proper dependencies (`[supabase]`) and wired it into the `useEffect` array. 

### B. Client-Side Error Swallowing (Fixed)
- **Issue:** The central `lib/services/financeService.ts` wrapper mapped standard HTTP failures natively using `!res.ok`, throwing hardcoded, generic strings (e.g., `throw new Error('Failed to fetch project')`). This entirely swallowed detailed JSON validation errors returned from our Next.js API Routes (like role limitations, atomic failure states, or missing data).
- **Resolution:** Implemented a unified `handleResponse` JSON parser utility directly within `financeService.ts`. This dynamically unwraps the server's HTTP JSON error payload (`errorData.error`), passing true error context to React Query so that toast notifications and error boundaries can explain exactly *why* a mutation failed.

### C. TypeScript Type Compliance Verification (Checked)
- **Issue:** Validating type safety across all components.
- **Resolution:** Ran a strict `tsc --noEmit` compiler pass against the entire repository. **Zero type errors were found.** This indicates that the strict structural relationships between components are solid.

---

## 3. Recommended Architectural Fix Plan (Technical Debt)

The following items are structurally sound enough for production, but should be queued for remediation to guarantee enterprise-scale robustness.

### A. Type Casting on Server API Clients
- **Observation:** `getServerClient() as any` is frequently utilized in API routes (`app/api/expenses/route.ts`, `app/api/vendors/route.ts`) to bypass TypeScript constraints against the Supabase `insert()` payload.
- **Fix Plan:** 
  1. Generate updated Supabase database types locally (`supabase gen types typescript`).
  2. Embed `<Database>` natively inside `getServerClient()`.
  3. Strip `as any` casts to guarantee compile-time failures if the database schema mutates.

### B. Route Handler Security vs Database RLS
- **Observation:** We currently enforce Authorization via `checkRole(['owner'])` at the Next.js API boundary. While secure for web clients, if any secret keys leak, direct API requests to the Supabase instance could bypass these routes.
- **Fix Plan:**
  1. Audit Row Level Security (RLS) policies within `schema.sql`.
  2. Map `owner` roles natively to Postgres policies via `auth.uid()` checks on the `profiles` table to ensure database-level lockdown on `INSERT`/`UPDATE` operations.

### C. Mutation Idempotency & Rate Limiting
- **Observation:** When making an expense payment (`/api/expenses/[id]/pay`) or finalizing settlement, a double-click on a slow network connection can result in a race condition.
- **Fix Plan:**
  1. Introduce idempotency keys to the RPC calls.
  2. Rely heavily on React Query's `isPending` state to disable buttons globally during processing, potentially adding an API-level rate limit.
