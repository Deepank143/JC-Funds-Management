-- ============================================================
-- Supabase Security Hardening Script
-- Based on Security Advisor Warnings & Info
-- ============================================================

-- 1. ADD MISSING RLS POLICIES
-- These tables had RLS enabled but no policies, making them inaccessible.

-- Expense Categories: Viewable by all authenticated, modifiable by owner/accountant
CREATE POLICY "Expense categories viewable by all authenticated" ON expense_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Expense categories modifiable by owner and accountant" ON expense_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'accountant'))
  );

-- Expense Subcategories: Viewable by all authenticated, modifiable by owner/accountant
CREATE POLICY "Expense subcategories viewable by all authenticated" ON expense_subcategories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Expense subcategories modifiable by owner and accountant" ON expense_subcategories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'accountant'))
  );

-- Milestones: Viewable by all authenticated, modifiable by owner/accountant
CREATE POLICY "Milestones viewable by all authenticated" ON milestones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Milestones modifiable by owner and accountant" ON milestones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'accountant'))
  );

-- Labour Attendance: Viewable by all authenticated, modifiable by owner/accountant
CREATE POLICY "Labour attendance viewable by all authenticated" ON labour_attendance
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Labour attendance modifiable by owner and accountant" ON labour_attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'accountant'))
  );

-- Project Budgets: Viewable by all authenticated, modifiable by owner/accountant
CREATE POLICY "Project budgets viewable by all authenticated" ON project_budgets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Project budgets modifiable by owner and accountant" ON project_budgets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'accountant'))
  );

-- 2. HARDEN FUNCTION SEARCH PATHS
-- Prevents search_path injection attacks by fixing it to 'public'.

ALTER FUNCTION get_project_summary(UUID) SET search_path = public;
ALTER FUNCTION get_dashboard_kpis() SET search_path = public;
ALTER FUNCTION get_client_aging(UUID) SET search_path = public;
ALTER FUNCTION update_updated_at_column() SET search_path = public;

-- 3. RESTRICT SECURITY DEFINER FUNCTIONS
-- Revoke public execution of sensitive utility functions.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
    REVOKE EXECUTE ON FUNCTION rls_auto_enable() FROM public;
    REVOKE EXECUTE ON FUNCTION rls_auto_enable() FROM authenticated;
    REVOKE EXECUTE ON FUNCTION rls_auto_enable() FROM anon;
  END IF;
END $$;

-- 4. LEAKED PASSWORD PROTECTION
-- NOTE: This cannot be done via SQL. 
-- Please go to: Supabase Dashboard > Auth > Providers > Email
-- And enable "Leaked Password Protection".
