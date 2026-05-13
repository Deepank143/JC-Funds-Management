-- ============================================================
-- Apex Buildcon - Comprehensive Dummy Data v3.0
-- Designed for showcasing all v3.0 features (Intelligence, Settlement, Corrections)
-- ============================================================

-- CLEANUP (Optional: Only run if you want a fresh start)
-- DELETE FROM income;
-- DELETE FROM expenses;
-- DELETE FROM milestones;
-- DELETE FROM projects;
-- DELETE FROM clients;
-- DELETE FROM vendors;

-- 1. SEED CLIENTS
INSERT INTO clients (id, name, contact_person, phone, email, address, gstin) VALUES
('c1111111-1111-1111-1111-111111111111', 'Adani Realty', 'Rajesh Gupta', '9876543210', 'rajesh@adani.com', 'Ahmedabad, Gujarat', '24AAAAA0000A1Z1');

INSERT INTO clients (id, name, contact_person, phone, email, address, gstin) VALUES
('c2222222-2222-2222-2222-222222222222', 'Mehta & Sons', 'Snehal Mehta', '9822334455', 'snehal@mehta.in', 'Surat, Gujarat', '24BBBBB1111B2Z2');

INSERT INTO clients (id, name, contact_person, phone, email, address, gstin) VALUES
('c3333333-3333-3333-3333-333333333333', 'Individual Villa', 'Harsh Jani', '9000011111', 'harsh@apex.com', 'Gandhinagar, Gujarat', NULL);

-- 2. SEED VENDORS
INSERT INTO vendors (id, name, type, phone, category_id, subcategory_id, notes) VALUES
('b1111111-1111-1111-1111-111111111111', 'UltraTech Cement', 'vendor', '9988776655', (SELECT id FROM expense_categories WHERE name = 'Raw Material'), (SELECT id FROM expense_subcategories WHERE name = 'Cement'), 'Primary cement supplier');

INSERT INTO vendors (id, name, type, phone, category_id, subcategory_id, notes) VALUES
('b2222222-2222-2222-2222-222222222222', 'Ramesh & Co. (Electrical)', 'vendor', '9911223344', (SELECT id FROM expense_categories WHERE name = 'Vendors'), (SELECT id FROM expense_subcategories WHERE name = 'Electrical'), 'Reliable for high-rise');

INSERT INTO vendors (id, name, type, phone, category_id, subcategory_id, notes) VALUES
('b3333333-3333-3333-3333-333333333333', 'Prakash Bhai (Labour Master)', 'labour', '9012345678', (SELECT id FROM expense_categories WHERE name = 'Labour / Broker'), (SELECT id FROM expense_subcategories WHERE name = 'Mason'), 'Team of 20 masons');

-- 3. SEED PROJECTS
INSERT INTO projects (id, client_id, name, location, contract_value, start_date, expected_end_date, status) VALUES
('f1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Skyline Tower A', 'Ahmedabad', 50000000.00, CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '12 months', 'active');

INSERT INTO projects (id, client_id, name, location, contract_value, start_date, expected_end_date, status) VALUES
('f2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Mehta Residency', 'Surat', 15000000.00, CURRENT_DATE - INTERVAL '12 months', CURRENT_DATE - INTERVAL '10 days', 'active');

INSERT INTO projects (id, client_id, name, location, contract_value, start_date, expected_end_date, status) VALUES
('f3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Apex Office HQ', 'Gandhinagar', 2000000.00, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '2 months', 'on_hold');

-- 4. SEED MILESTONES (Varied states for Intelligence Engine)
INSERT INTO milestones (id, project_id, name, percentage, amount, due_date, status, sort_order) VALUES
('e1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'Excavation Done', 10, 5000000.00, CURRENT_DATE - INTERVAL '5 months', 'paid', 1);

INSERT INTO milestones (id, project_id, name, percentage, amount, due_date, status, sort_order) VALUES
('e1111111-1111-1111-1111-111111111112', 'f1111111-1111-1111-1111-111111111111', 'Plinth Level', 15, 7500000.00, CURRENT_DATE - INTERVAL '2 months', 'billed', 2);

INSERT INTO milestones (id, project_id, name, percentage, amount, due_date, status, sort_order) VALUES
('e1111111-1111-1111-1111-111111111113', 'f1111111-1111-1111-1111-111111111111', '1st Floor Slab', 10, 5000000.00, CURRENT_DATE + INTERVAL '5 days', 'pending', 3);

INSERT INTO milestones (id, project_id, name, percentage, amount, due_date, status, sort_order) VALUES
('e2222222-2222-2222-2222-222222222221', 'f2222222-2222-2222-2222-222222222222', 'Structure Complete', 80, 12000000.00, CURRENT_DATE - INTERVAL '11 months', 'paid', 1);

INSERT INTO milestones (id, project_id, name, percentage, amount, due_date, status, sort_order) VALUES
('e2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 'Finishing & Handover', 20, 3000000.00, CURRENT_DATE - INTERVAL '5 days', 'billed', 2);

-- 5. SEED INCOME (Simulating real payment flow)
INSERT INTO income (project_id, client_id, milestone_id, amount, payment_date, payment_mode, reference_number, notes) VALUES
('f1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 5000000.00, CURRENT_DATE - INTERVAL '150 days', 'bank_transfer', 'TXN001', 'Initial payment received');

INSERT INTO income (project_id, client_id, milestone_id, amount, payment_date, payment_mode, reference_number, notes) VALUES
('f2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222221', 12000000.00, CURRENT_DATE - INTERVAL '300 days', 'cheque', 'CHQ998', 'Milestone 1 clear');

-- 6. SEED EXPENSES (Triggering overdue alerts and showing margin pressure)
INSERT INTO expenses (project_id, category_id, subcategory_id, vendor_id, amount, expense_date, payment_status, amount_paid, notes) VALUES
('f1111111-1111-1111-1111-111111111111', (SELECT id FROM expense_categories WHERE name = 'Raw Material'), (SELECT id FROM expense_subcategories WHERE name = 'Cement'), 'b1111111-1111-1111-1111-111111111111', 1200000.00, CURRENT_DATE - INTERVAL '30 days', 'paid', 1200000.00, 'Bulk cement purchase');

INSERT INTO expenses (project_id, category_id, subcategory_id, vendor_id, amount, expense_date, payment_status, amount_paid, notes) VALUES
('f1111111-1111-1111-1111-111111111111', (SELECT id FROM expense_categories WHERE name = 'Vendors'), (SELECT id FROM expense_subcategories WHERE name = 'Electrical'), 'b2222222-2222-2222-2222-222222222222', 450000.00, CURRENT_DATE - INTERVAL '40 days', 'unpaid', 0, 'Wiring work bill - OVERDUE ALERT');

INSERT INTO expenses (project_id, category_id, subcategory_id, vendor_id, amount, expense_date, payment_status, amount_paid, notes) VALUES
('f2222222-2222-2222-2222-222222222222', (SELECT id FROM expense_categories WHERE name = 'Labour / Broker'), (SELECT id FROM expense_subcategories WHERE name = 'Mason'), 'b3333333-3333-3333-3333-333333333333', 8500000.00, CURRENT_DATE - INTERVAL '60 days', 'paid', 8500000.00, 'Lumpsum labour settlement');

INSERT INTO expenses (project_id, category_id, subcategory_id, vendor_id, amount, expense_date, payment_status, amount_paid, notes) VALUES
('f2222222-2222-2222-2222-222222222222', (SELECT id FROM expense_categories WHERE name = 'Vendors'), (SELECT id FROM expense_subcategories WHERE name = 'Flooring'), NULL, 2000000.00, CURRENT_DATE - INTERVAL '10 days', 'partial', 500000.00, 'Direct tile purchase - 1.5L Pending');

-- 7. SIMULATE AN "ADMIN CORRECTION" (Back Entry Scenario)
-- This record represents a correction made for a missing entry 3 months ago
INSERT INTO income (project_id, client_id, amount, payment_date, payment_mode, notes, created_at) VALUES
('f3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 50000.00, CURRENT_DATE - INTERVAL '90 days', 'cash', 'Correction: Missing site survey fee', CURRENT_DATE - INTERVAL '1 day');

-- 8. SUMMARY LOG FOR SQL RUNNER
-- Output counts to verify success
SELECT 'SUCCESS: Seeding Complete' as status,
       (SELECT COUNT(*) FROM clients) as client_count,
       (SELECT COUNT(*) FROM projects) as project_count,
       (SELECT COUNT(*) FROM milestones) as milestone_count,
       (SELECT COUNT(*) FROM income) as income_count,
       (SELECT COUNT(*) FROM expenses) as expense_count;
