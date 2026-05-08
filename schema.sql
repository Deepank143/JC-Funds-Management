-- ============================================================
-- Jaani Constructions - Funds Management System
-- Supabase PostgreSQL Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase Auth users)
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('owner', 'accountant', 'viewer')) DEFAULT 'owner',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  gstin TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  contract_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  start_date DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')) DEFAULT 'active',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MILESTONES
-- ============================================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  percentage DECIMAL(5,2) DEFAULT 0,
  amount DECIMAL(12,2) DEFAULT 0,
  due_date DATE,
  completed_date DATE,
  status TEXT CHECK (status IN ('pending', 'billed', 'paid')) DEFAULT 'pending',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXPENSE CATEGORIES
-- ============================================================
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXPENSE SUB-CATEGORIES
-- ============================================================
CREATE TABLE expense_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VENDORS / LABOUR MASTERS
-- ============================================================
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('vendor', 'labour', 'broker')) DEFAULT 'vendor',
  phone TEXT,
  email TEXT,
  address TEXT,
  category_id UUID REFERENCES expense_categories(id),
  subcategory_id UUID REFERENCES expense_subcategories(id),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INCOME / CLIENT PAYMENTS
-- ============================================================
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer', 'cheque', 'other')) DEFAULT 'bank_transfer',
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id),
  subcategory_id UUID REFERENCES expense_subcategories(id),
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('paid', 'unpaid', 'partial')) DEFAULT 'unpaid',
  amount_paid DECIMAL(12,2) DEFAULT 0,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer', 'cheque', 'other')),
  reference_number TEXT,
  bill_photo_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LABOUR ATTENDANCE (Phase 2)
-- ============================================================
CREATE TABLE labour_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  present BOOLEAN DEFAULT TRUE,
  hours_worked DECIMAL(4,1) DEFAULT 8.0,
  daily_wage DECIMAL(10,2),
  overtime_hours DECIMAL(4,1) DEFAULT 0,
  overtime_rate DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECT BUDGETS (for tracking budget vs actual)
-- ============================================================
CREATE TABLE project_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id),
  subcategory_id UUID REFERENCES expense_subcategories(id),
  budget_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, category_id, subcategory_id)
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert default expense categories
INSERT INTO expense_categories (name, sort_order, color) VALUES
('Vendors', 1, '#8b5cf6'),
('Raw Material', 2, '#f59e0b'),
('Labour / Broker', 3, '#10b981');

-- Insert default sub-categories
INSERT INTO expense_subcategories (category_id, name, is_default) VALUES
((SELECT id FROM expense_categories WHERE name = 'Vendors'), 'Electrical', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Vendors'), 'Plumbing', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Vendors'), 'Flooring', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Vendors'), 'Carpentry', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Vendors'), 'Painting', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Vendors'), 'False Ceiling', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Vendors'), 'Equipment Rental', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Vendors'), 'Transport', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Raw Material'), 'Cement', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Raw Material'), 'Steel (TMT)', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Raw Material'), 'Sand', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Raw Material'), 'Aggregate', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Raw Material'), 'Bricks / Blocks', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Raw Material'), 'Tiles', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Raw Material'), 'Sanitary Ware', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Raw Material'), 'Paint', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Raw Material'), 'Hardware', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Raw Material'), 'Electrical Fittings', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Labour / Broker'), 'Mason', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Labour / Broker'), 'Helper', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Labour / Broker'), 'Carpenter', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Labour / Broker'), 'Supervisor', TRUE),
((SELECT id FROM expense_categories WHERE name = 'Labour / Broker'), 'Broker Commission', TRUE);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all profiles, update own
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Clients: All authenticated users can view, owner/accountant can modify
CREATE POLICY "Clients viewable by all authenticated" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Clients insertable by owner and accountant" ON clients
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'accountant'))
  );

CREATE POLICY "Clients updatable by owner and accountant" ON clients
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'accountant'))
  );

-- Projects: Same pattern
CREATE POLICY "Projects viewable by all authenticated" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Projects modifiable by owner and accountant" ON projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'accountant'))
  );

-- Expenses: Same pattern
CREATE POLICY "Expenses viewable by all authenticated" ON expenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Expenses modifiable by owner and accountant" ON expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'accountant'))
  );

-- Income: Same pattern
CREATE POLICY "Income viewable by all authenticated" ON income
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Income modifiable by owner and accountant" ON income
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'accountant'))
  );

-- Vendors: Same pattern
CREATE POLICY "Vendors viewable by all authenticated" ON vendors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Vendors modifiable by owner and accountant" ON vendors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'accountant'))
  );

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

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to get project summary
CREATE OR REPLACE FUNCTION get_project_summary(project_uuid UUID)
RETURNS TABLE (
  total_income DECIMAL,
  total_expenses DECIMAL,
  total_paid DECIMAL,
  total_payable DECIMAL,
  profit DECIMAL,
  profit_margin DECIMAL,
  realized_profit DECIMAL
) AS $$
BEGIN
  -- Set local search_path to public for security hardening
  SET LOCAL search_path = public;
  RETURN QUERY
  SELECT
    COALESCE((SELECT SUM(amount) FROM income WHERE project_id = project_uuid), 0) AS total_income,
    COALESCE((SELECT SUM(amount) FROM expenses WHERE project_id = project_uuid), 0) AS total_expenses,
    COALESCE((SELECT SUM(amount_paid) FROM expenses WHERE project_id = project_uuid), 0) AS total_paid,
    COALESCE((SELECT SUM(amount - amount_paid) FROM expenses WHERE project_id = project_uuid AND payment_status != 'paid'), 0) AS total_payable,
    COALESCE((
      (SELECT SUM(amount) FROM income WHERE project_id = project_uuid) -
      (SELECT SUM(amount) FROM expenses WHERE project_id = project_uuid)
    ), 0) AS profit,
    CASE
      WHEN (SELECT contract_value FROM projects WHERE id = project_uuid) > 0 THEN
        ROUND((
          ((SELECT SUM(amount) FROM income WHERE project_id = project_uuid) -
           (SELECT SUM(amount) FROM expenses WHERE project_id = project_uuid)) /
          (SELECT contract_value FROM projects WHERE id = project_uuid)
        ) * 100, 2)
      ELSE 0
    END AS profit_margin,
    COALESCE((
      (SELECT SUM(amount) FROM income WHERE project_id = project_uuid) -
      (SELECT SUM(amount_paid) FROM expenses WHERE project_id = project_uuid)
    ), 0) AS realized_profit;
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis()
RETURNS TABLE (
  total_receivables DECIMAL,
  total_payables DECIMAL,
  net_position DECIMAL,
  total_projects BIGINT,
  active_projects BIGINT,
  overdue_income_count BIGINT,
  overdue_expense_count BIGINT
) AS $$
BEGIN
  -- Set local search_path to public for security hardening
  SET LOCAL search_path = public;
  RETURN QUERY
  SELECT
    COALESCE((SELECT SUM(amount) FROM income), 0) AS total_receivables,
    COALESCE((SELECT SUM(amount - amount_paid) FROM expenses WHERE payment_status != 'paid'), 0) AS total_payables,
    COALESCE((SELECT SUM(amount) FROM income), 0) - COALESCE((SELECT SUM(amount - amount_paid) FROM expenses WHERE payment_status != 'paid'), 0) AS net_position,
    (SELECT COUNT(*) FROM projects) AS total_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'active') AS active_projects,
    (SELECT COUNT(*) FROM milestones WHERE status = 'billed' AND due_date < CURRENT_DATE) AS overdue_income_count,
    (SELECT COUNT(*) FROM expenses WHERE payment_status = 'unpaid' AND expense_date < CURRENT_DATE - INTERVAL '30 days') AS overdue_expense_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get client aging report
CREATE OR REPLACE FUNCTION get_client_aging(client_uuid UUID)
RETURNS TABLE (
  bucket TEXT,
  amount DECIMAL
) AS $$
BEGIN
  -- Set local search_path to public for security hardening
  SET LOCAL search_path = public;
  RETURN QUERY
  SELECT 
    CASE
      WHEN m.due_date >= CURRENT_DATE THEN 'Current'
      WHEN m.due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 Days'
      WHEN m.due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 Days'
      WHEN m.due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 Days'
      ELSE '90+ Days'
    END AS bucket,
    COALESCE(SUM(m.amount - COALESCE(i.amount, 0)), 0) AS amount
  FROM milestones m
  LEFT JOIN income i ON i.milestone_id = m.id
  JOIN projects p ON p.id = m.project_id
  WHERE p.client_id = client_uuid AND m.status IN ('pending', 'billed')
  GROUP BY bucket;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Set local search_path to public for security hardening
  SET LOCAL search_path = public;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STORAGE BUCKET SETUP (Run in Supabase Dashboard or via API)
-- ============================================================
-- Create bucket: bill-photos
-- Set public: true
-- Set file size limit: 5MB
-- Allowed mime types: image/*
