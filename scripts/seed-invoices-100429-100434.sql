-- ============================================================
-- Seed: British High Commission invoices 100429 & 100434
-- ============================================================

-- 1. Ensure British High Commission exists as a client
INSERT INTO clients (contact_name, company_name, address, city, parish, email)
SELECT 'Ms McKay', 'British High Commission', '28 Trafalgar Road', 'Kingston', 'Kingston', ''
WHERE NOT EXISTS (
  SELECT 1 FROM clients WHERE company_name = 'British High Commission'
);

-- ============================================================
-- INVOICE 100429
-- High Commissioner's Laundry + Vault Room + Crisis Container
-- Date: December 15, 2025  |  Total: JMD 84,500
-- ============================================================

INSERT INTO invoices (
  invoice_number,
  title,
  client_id,
  items,
  subtotal,
  tax_rate,
  tax_amount,
  discount,
  total,
  balance_due,
  status,
  issued_date,
  notes
)
SELECT
  '100429',
  'High Commissioner''s Laundry + Vault Room + Crisis Container AC Repairs',
  (SELECT id FROM clients WHERE company_name = 'British High Commission' LIMIT 1),
  '[
    {"section": "HIGH COMMISSIONER''S LAUNDRY HOUSE"},
    {"description": "SERVICE AND REPAIR OF AIR CONDITIONERS", "qty": 1, "unit_price": 0, "discount": 0, "amount": 0},
    {"description": "General Servicing of Air Conditioner", "qty": 1, "unit_price": 14500, "discount": 0, "amount": 14500},
    {"description": "Supply and Install New Capacitor",       "qty": 1, "unit_price": 14500, "discount": 0, "amount": 14500},
    {"description": "Travelling",                             "qty": 1, "unit_price": 3000,  "discount": 0, "amount": 3000},
    {"section": "THE VAULT ROOM"},
    {"description": "General Servicing of Air Conditioner",  "qty": 1, "unit_price": 14500, "discount": 0, "amount": 14500},
    {"description": "Repair Leak and Regas Air Conditioner", "qty": 1, "unit_price": 22500, "discount": 0, "amount": 22500},
    {"section": "CRISIS STORE CONTAINER"},
    {"description": "General Servicing of Air Conditioner",  "qty": 1, "unit_price": 12500, "discount": 0, "amount": 12500},
    {"description": "Travelling",                             "qty": 1, "unit_price": 3000,  "discount": 0, "amount": 3000}
  ]'::jsonb,
  84500,
  0,
  0,
  0,
  84500,
  84500,
  'sent',
  '2025-12-15',
  '{"contact_person":"Ms McKay","service_location":"Kingston","address":"28 Trafalgar Road, Kingston 5","payment_terms":"COD","po_number":"","trn":"","job_timeline":"1 Day","is_service_contract":false,"recurring_schedule":"one-time","notes":""}'
WHERE NOT EXISTS (
  SELECT 1 FROM invoices WHERE invoice_number = '100429'
);

-- ============================================================
-- INVOICE 100434
-- New 2 Ton AC Installation – Guard House 3
-- Date: December 18, 2025  |  Total: JMD 63,000
-- ============================================================

INSERT INTO invoices (
  invoice_number,
  title,
  client_id,
  items,
  subtotal,
  tax_rate,
  tax_amount,
  discount,
  total,
  balance_due,
  status,
  issued_date,
  notes
)
SELECT
  '100434',
  'New 2 Ton AC Installation – Guard House 3',
  (SELECT id FROM clients WHERE company_name = 'British High Commission' LIMIT 1),
  '[
    {"section": "GUARD HOUSE 3 – INSTALLATION OF NEW AIR CONDITIONER"},
    {"description": "Installation of New 2 Ton Cassette Air Conditioner", "qty": 1, "unit_price": 50000, "discount": 0, "amount": 50000},
    {"description": "UnInstall Old 2 Ton Cassette Air Conditioner",        "qty": 1, "unit_price": 10000, "discount": 0, "amount": 10000},
    {"description": "Travelling",                                           "qty": 1, "unit_price": 3000,  "discount": 0, "amount": 3000}
  ]'::jsonb,
  63000,
  0,
  0,
  0,
  63000,
  63000,
  'sent',
  '2025-12-18',
  '{"contact_person":"Ms McKay","service_location":"Kingston","address":"28 Trafalgar Road, Kingston 5","payment_terms":"COD","po_number":"","trn":"","job_timeline":"1 Day","is_service_contract":false,"recurring_schedule":"one-time","notes":""}'
WHERE NOT EXISTS (
  SELECT 1 FROM invoices WHERE invoice_number = '100434'
);
