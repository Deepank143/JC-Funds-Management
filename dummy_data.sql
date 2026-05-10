-- ============================================================
-- Apex Buildcon - Dummy Data for Demonstration
-- ============================================================
-- INSTRUCTIONS: 
-- 1. Copy this SQL and run it in your Supabase SQL Editor.
-- 2. This will populate your app with realistic projects, expenses, and income.
-- 3. To delete this data, run: DELETE FROM clients; DELETE FROM vendors; (Cascade will handle the rest)
-- ============================================================

-- 1. INSERT CLIENTS
INSERT INTO clients (id, name, contact_person, phone, email, address)
VALUES 
  ('c1111111-1111-4111-b111-111111111111', 'Sunil Mehta', 'Sunil Mehta', '+91 98250 12345', 'sunil@example.com', 'B-402, Royal Residency, Ahmedabad'),
  ('c2222222-2222-4222-b222-222222222222', 'Ravi Infrastructure', 'Rajesh Bhai', '+91 99090 54321', 'contact@ravi-infra.com', '101, Corporate Tower, SG Highway');

-- 2. INSERT PROJECTS
INSERT INTO projects (id, client_id, name, location, contract_value, status, start_date)
VALUES 
  ('a1111111-1111-4111-b111-111111111111', 'c1111111-1111-4111-b111-111111111111', 'Mehta Villa - Renovation', 'Gandhinagar', 1250000, 'active', CURRENT_DATE - INTERVAL '30 days'),
  ('a2222222-2222-4222-b222-222222222222', 'c2222222-2222-4222-b222-222222222222', 'Commercial Complex - Phase 1', 'Ahmedabad', 8500000, 'active', CURRENT_DATE - INTERVAL '60 days');

-- 3. INSERT VENDORS
INSERT INTO vendors (id, name, type, phone)
VALUES 
  ('f1111111-1111-4111-b111-111111111111', 'Gajanan Cement Agency', 'vendor', '+91 98000 11111'),
  ('f2222222-2222-4222-b222-222222222222', 'Shakti Steels', 'vendor', '+91 98000 22222'),
  ('f3333333-3333-4333-b333-333333333333', 'Ahmedabad Electricals', 'vendor', '+91 98000 33333'),
  ('f4444444-4444-4444-b444-444444444444', 'Ram Singh Labour Group', 'labour', '+91 98000 44444');

-- 4. INSERT MILESTONES
INSERT INTO milestones (project_id, name, percentage, amount, status, sort_order)
VALUES 
  ('a1111111-1111-4111-b111-111111111111', 'Initial Advance', 20, 250000, 'paid', 0),
  ('a1111111-1111-4111-b111-111111111111', 'Slab Completion', 30, 375000, 'pending', 1),
  ('a2222222-2222-4222-b222-222222222222', 'Site Preparation', 10, 850000, 'paid', 0),
  ('a2222222-2222-4222-b222-222222222222', 'Foundation Work', 20, 1700000, 'paid', 1);

-- 5. INSERT INCOME (Matching the paid milestones)
INSERT INTO income (project_id, client_id, milestone_id, amount, payment_date, payment_mode)
VALUES 
  ('a1111111-1111-4111-b111-111111111111', 'c1111111-1111-4111-b111-111111111111', (SELECT id FROM milestones WHERE name='Initial Advance' LIMIT 1), 250000, CURRENT_DATE - INTERVAL '25 days', 'bank_transfer'),
  ('a2222222-2222-4222-b222-222222222222', 'c2222222-2222-4222-b222-222222222222', (SELECT id FROM milestones WHERE name='Site Preparation' LIMIT 1), 850000, CURRENT_DATE - INTERVAL '55 days', 'bank_transfer'),
  ('a2222222-2222-4222-b222-222222222222', 'c2222222-2222-4222-b222-222222222222', (SELECT id FROM milestones WHERE name='Foundation Work' LIMIT 1), 1700000, CURRENT_DATE - INTERVAL '40 days', 'cheque');

-- 6. INSERT EXPENSES
-- We need category IDs, we'll use a subquery to find them
INSERT INTO expenses (project_id, vendor_id, amount, expense_date, payment_status, amount_paid, notes)
VALUES 
  ('a1111111-1111-4111-b111-111111111111', 'f1111111-1111-4111-b111-111111111111', 45000, CURRENT_DATE - INTERVAL '20 days', 'paid', 45000, '50 bags of Ultratech Cement'),
  ('a1111111-1111-4111-b111-111111111111', 'f4444444-4444-4444-b444-444444444444', 12000, CURRENT_DATE - INTERVAL '15 days', 'paid', 12000, 'Weekly labour payment'),
  ('a2222222-2222-4222-b222-222222222222', 'f2222222-2222-4222-b222-222222222222', 450000, CURRENT_DATE - INTERVAL '30 days', 'paid', 450000, 'TMT Steel Bars for foundation'),
  ('a2222222-2222-4222-b222-222222222222', 'f1111111-1111-4111-b111-111111111111', 125000, CURRENT_DATE - INTERVAL '10 days', 'unpaid', 0, 'Pending cement invoice'),
  ('a2222222-2222-4222-b222-222222222222', 'f3333333-3333-4333-b333-333333333333', 18000, CURRENT_DATE - INTERVAL '5 days', 'paid', 18000, 'Electric conduit pipes');
