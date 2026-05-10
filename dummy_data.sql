-- Apex Buildcon Dummy Data (Comprehensive Project & Milestone Tracking)

-- 1. Setup Sample Client
INSERT INTO clients (id, name, email, phone)
VALUES ('22222222-2222-2222-2222-222222222222', 'Harsh Jani', 'janiharsh996@gmail.com', '9876543210')
ON CONFLICT (id) DO NOTHING;

-- 2. Setup RA Residence Project
INSERT INTO projects (id, name, location, client_id, contract_value, status, start_date)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'RA Residence', 
  'Ahmadabad, Gujarat', 
  '22222222-2222-2222-2222-222222222222', 
  2500000.00, 
  'active', 
  '2026-02-01'
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, contract_value = EXCLUDED.contract_value;

-- 3. Setup 12 Payment Milestones (RA Residence Schedule)
DELETE FROM milestones WHERE project_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO milestones (id, project_id, name, amount, percentage, order_index, due_date)
VALUES 
('m1', '11111111-1111-1111-1111-111111111111', 'Advance / Booking', 250000, 10, 0, '2026-02-01'),
('m2', '11111111-1111-1111-1111-111111111111', 'Excavation Completion', 200000, 8, 1, '2026-03-01'),
('m3', '11111111-1111-1111-1111-111111111111', 'Plinth Level', 300000, 12, 2, '2026-04-01'),
('m4', '11111111-1111-1111-1111-111111111111', 'Ground Floor Slab', 250000, 10, 3, '2026-05-15'),
('m5', '11111111-1111-1111-1111-111111111111', 'First Floor Slab', 250000, 10, 4, '2026-07-01'),
('m6', '11111111-1111-1111-1111-111111111111', 'Brickwork & Internal Plaster', 200000, 8, 5, '2026-08-15'),
('m7', '11111111-1111-1111-1111-111111111111', 'External Plaster', 150000, 6, 6, '2026-10-01'),
('m8', '11111111-1111-1111-1111-111111111111', 'Plumbing & Electrical Conceal', 200000, 8, 7, '2026-11-15'),
('m9', '11111111-1111-1111-1111-111111111111', 'Flooring & Tiling', 250000, 10, 8, '2027-01-01'),
('m10', '11111111-1111-1111-1111-111111111111', 'Painting & Finishing', 200000, 8, 9, '2027-02-15'),
('m11', '11111111-1111-1111-1111-111111111111', 'Doors & Windows', 150000, 6, 10, '2027-04-01'),
('m12', '11111111-1111-1111-1111-111111111111', 'Handover', 100000, 4, 11, '2027-05-01');

-- 4. Setup Income (Payments Received)
INSERT INTO income (project_id, amount, payment_date, payment_mode, reference_number, milestone_id)
VALUES 
('11111111-1111-1111-1111-111111111111', 250000, '2026-02-05', 'bank_transfer', 'TXN001', 'm1'),
('11111111-1111-1111-1111-111111111111', 200000, '2026-03-05', 'cheque', 'CHQ442', 'm2');

-- 5. Setup Linked Expenses (Stage-wise Profitability)
INSERT INTO expenses (project_id, category_id, subcategory_id, amount, expense_date, payment_status, amount_paid, notes, milestone_id)
VALUES 
-- Expenses for Advance stage (Admin, Permits)
('11111111-1111-1111-1111-111111111111', 
  (SELECT id FROM expense_categories WHERE name = 'Misc'),
  (SELECT id FROM expense_subcategories WHERE name = 'Permits'),
  50000, '2026-02-10', 'paid', 50000, 'Corporation plan approval', 'm1'),

-- Expenses for Excavation stage (Labour + Machine)
('11111111-1111-1111-1111-111111111111', 
  (SELECT id FROM expense_categories WHERE name = 'Labour'),
  (SELECT id FROM expense_subcategories WHERE name = 'Daily Wage'),
  40000, '2026-03-10', 'paid', 40000, 'JCB and Manual labour for excavation', 'm2'),
  
('11111111-1111-1111-1111-111111111111', 
  (SELECT id FROM expense_categories WHERE name = 'Raw Material'),
  (SELECT id FROM expense_subcategories WHERE name = 'Cement'),
  60000, '2026-03-12', 'paid', 60000, 'Initial cement stock for foundation', 'm2');

-- 6. General (Non-linked) Expenses
INSERT INTO expenses (project_id, category_id, subcategory_id, amount, expense_date, payment_status, amount_paid, notes)
VALUES 
('11111111-1111-1111-1111-111111111111', 
  (SELECT id FROM expense_categories WHERE name = 'Misc'),
  (SELECT id FROM expense_subcategories WHERE name = 'Refreshments'),
  2000, '2026-02-15', 'paid', 2000, 'Site office tea and water');
