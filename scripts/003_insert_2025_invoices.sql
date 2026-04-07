-- INSERT 2025 INVOICES FROM PDF DATA
-- Only exact data from provided PDFs. No fake/generated data.

INSERT INTO invoices (
  invoice_number, title, items, subtotal, tax_rate, tax_amount, discount,
  total, amount_paid, balance_due, status, issued_date, due_date,
  notes, terms, po_number, location
) VALUES

-- 1. INV 100334 - British High Commission - Server Room & Wash Room - Oct 3, 2025
(
  'INV-100334',
  'Servicing and Repair of Air Conditioners - Server Room & Wash Room',
  '[
    {"description": "SERVER ROOM - 1st Floor (Backend): General Servicing of Air Conditioner", "quantity": 1, "unit_price": 14500, "total": 14500},
    {"description": "SERVER ROOM - Regas and Repair Leak", "quantity": 1, "unit_price": 18000, "total": 18000},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000},
    {"description": "WASH ROOM: General Servicing of Air Conditioner - Wash Room", "quantity": 1, "unit_price": 14500, "total": 14500},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  53000, 0, 0, 0,
  53000, 0, 53000, 'unpaid', '2025-10-03', '2025-10-03',
  'British High Commission - Trafalgar Road. Contact: Ms McKay. HIGH COMMISSIONER LAUNDRY ROOM / WASH ROOM SERVICING AND REPAIR OF AIR CONDITIONER',
  'COD', NULL, 'British High Commission, 28 Trafalgar Road, Kingston 5'
),

-- 2. INV 100390 - British High Commission - Dryer Repairs - Sonoma Estates - Oct 16, 2025
(
  'INV-100390-A',
  'Dryer Repairs - Sonoma Estates',
  '[
    {"description": "Service Dryer Filter - APT 2B SONOMA ESTATES, 30 HOPEFIELD AVE, KGN.", "quantity": 1, "unit_price": 15000, "total": 15000},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  18000, 0, 0, 0,
  18000, 0, 18000, 'unpaid', '2025-10-16', '2025-10-16',
  'British High Commission - Sonoma Estates. Contact: Ms McKay. PO: PUR1165457',
  'COD', 'PUR1165457', 'APT 2B Sonoma Estates, 30 Hopefield Ave, Kingston'
),

-- 3. INV 100419 - British High Commission - AC Servicing and Repairs - Nov 6/13, 2025
(
  'INV-100419',
  'Servicing and Repair of Air Conditioners - British High Commission Trafalgar Road',
  '[
    {"description": "Servicing of 3 Ton Air Conditioner - 3 Ton (Kitchen)", "quantity": 1, "unit_price": 36000, "total": 36000},
    {"description": "Servicing of Mini Split Air Conditioners (Transit Flat / Windsor Room)", "quantity": 1, "unit_price": 14500, "total": 14500},
    {"description": "Replacement of Fan Blade", "quantity": 1, "unit_price": 12500, "total": 12500},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  66000, 0, 0, 0,
  66000, 0, 66000, 'unpaid', '2025-11-13', '2025-11-13',
  'British High Commission - Trafalgar Road. Contact: Ms McKay. PO: PUR1165088',
  'COD', 'PUR1165088', 'British High Commission, 28 Trafalgar Road, Kingston 5'
),

-- 4. INV 100420 - Island Grill Head Office - Mold Removal and Deep Cleaning - Nov 7, 2025
(
  'INV-100420-A',
  'Mold Removal, Deep Clean and Sanitize Tent - Island Grill Head Office',
  '[
    {"description": "Deep Clean, Sanitize and Mold Removal in Lunch Tent (16W x 32L)", "quantity": 1, "unit_price": 35000, "total": 35000},
    {"description": "PPEs (Respirators + Gloves + Cleaning Gown + Glasses)", "quantity": 1, "unit_price": 18000, "total": 18000},
    {"description": "Application of Chemicals To Delay ReGrowth of Mold", "quantity": 1, "unit_price": 22000, "total": 22000},
    {"description": "Chemicals and Detergents for Container and Floor Treatment (Degreaser, Bleach and Disinfectant)", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  78000, 0, 0, 0,
  78000, 0, 78000, 'unpaid', '2025-11-07', '2025-11-07',
  'Island Grill Head Office - Boulevard Super Center, Kingston 20. Contact: Ms Scott. PO: 014599',
  'COD', '014599', 'Island Grill, Boulevard Super Center, Kingston 20'
),

-- 5. INV 100420 - British High Commission - Guard House - AC Servicing - Nov 12, 2025
(
  'INV-100420-B',
  'Servicing of Air Conditioners - Guard House - British High Commission',
  '[
    {"description": "Servicing of Mini Split Air Conditioners - Guard House", "quantity": 4, "unit_price": 14500, "total": 58000},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  61000, 0, 0, 0,
  61000, 0, 61000, 'unpaid', '2025-11-12', '2025-11-12',
  'British High Commission - Guard House, Trafalgar Road. Contact: Ms McKay.',
  'COD', NULL, 'British High Commission, 28 Trafalgar Road, Kingston 5'
),

-- 6. INV 100421 - Island Grill Head Office - Deep Cleaning Outside Lunch Tent - Nov 12, 2025
(
  'INV-100421-A',
  'Deep Clean and Sanitize Outside Lunch Tent - Island Grill Head Office',
  '[
    {"description": "Deep Clean, Sanitize and Mold Removal in Lunch Tent and (16W x 32L)", "quantity": 1, "unit_price": 35000, "total": 35000},
    {"description": "PPEs (Respirators + Gloves + Cleaning Gown + Glasses)", "quantity": 1, "unit_price": 18000, "total": 18000},
    {"description": "Application of Chemicals To Delay ReGrowth of Mold", "quantity": 1, "unit_price": 22000, "total": 22000},
    {"description": "Chemicals and Detergents for Container and Floor Treatment (Degreaser, Bleach and Disinfectant)", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  78000, 0, 0, 0,
  78000, 0, 78000, 'unpaid', '2025-11-12', '2025-11-12',
  'Island Grill - Boulevard Super Center, Kingston 20. Contact: Ms Scott. PO: 014682',
  'COD', '014682', 'Island Grill, Boulevard Super Center, Kingston 20'
),

-- 7. INV 100421 - St Francis - Deep Fryer Safety Valve Replacement - Nov 16, 2025
(
  'INV-100421-B',
  'Repair of Kitchen Equipment - Deep Fryer Safety Valve Replacement - St Francis',
  '[
    {"description": "UnInstall Old and ReInstall New - Repair of Kitchen Equipment", "quantity": 1, "unit_price": 45000, "total": 45000},
    {"description": "Supply of New Safety Valve", "quantity": 1, "unit_price": 25000, "total": 21000},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  69000, 0, 0, 4000,
  69000, 0, 69000, 'unpaid', '2025-11-16', '2025-11-16',
  'St Francis Basic and Primary Schools. Contact: Ms Gyles. Total Discounts: $4,000',
  'COD', NULL, 'St Francis Basic and Primary Schools, Old Hope Road, Kingston 5'
),

-- 8. INV 100390 - British High Commission - Dryer Repairs - Sonoma Estates - Nov 14, 2025
(
  'INV-100390-B',
  'Dryer Repairs - Sonoma Estates - British High Commission',
  '[
    {"description": "Service Dryer Filter - APT 2B SONOMA ESTATES, 30 HOPEFIELD AVE, KGN.", "quantity": 1, "unit_price": 15000, "total": 15000},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  18000, 0, 0, 0,
  18000, 0, 18000, 'unpaid', '2025-11-14', '2025-11-14',
  'British High Commission - Sonoma Estates. Contact: Ms McKay. PO: PUR1165457',
  'COD', 'PUR1165457', 'APT 2B Sonoma Estates, 30 Hopefield Ave, Kingston'
),

-- 9. INV 100423 - British High Commission - New AC Installation - Nov 17, 2025
(
  'INV-100423',
  'Installation of New Air Conditioners - British High Commission Trafalgar Mews',
  '[
    {"description": "TOWNHOUSE 2: Installation of New 12,000 BTU and 18,000 BTU Air Conditioners", "quantity": 3, "unit_price": 35000, "total": 105000},
    {"description": "TOWNHOUSE 2: Installation Materials", "quantity": 3, "unit_price": 13500, "total": 40500},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000},
    {"description": "TOWNHOUSE 3: Installation of New 12,000 BTU Air Conditioner", "quantity": 1, "unit_price": 35000, "total": 35000},
    {"description": "TOWNHOUSE 3: Installation Materials", "quantity": 1, "unit_price": 13500, "total": 13500}
  ]'::jsonb,
  197000, 0, 0, 0,
  197000, 0, 197000, 'unpaid', '2025-11-17', '2025-11-17',
  'British High Commission - Trafalgar Road, Townhouse 2 & 3 Trafalgar Mews. Contact: Ms McKay.',
  'COD', NULL, 'British High Commission, 28 Trafalgar Road, Kingston 5'
),

-- 10. INV 100424 - NHT - St Mary AC Servicing and Installation - Nov 25, 2025
(
  'INV-100424',
  'Air Conditioner Service and Replacement - NHT St Mary Branch',
  '[
    {"description": "General Servicing of 24,000 BTU Air Conditioners", "quantity": 2, "unit_price": 32500, "total": 65000},
    {"description": "New 18,000 BTU Air Conditioner (Server Room and Kitchen)", "quantity": 1, "unit_price": 14000, "total": 14000},
    {"description": "General Servicing of 18,000 BTU Air Conditioner", "quantity": 1, "unit_price": 8500, "total": 8500},
    {"description": "Misc Installation Materials", "quantity": 2, "unit_price": 115000, "total": 230000},
    {"description": "Travelling/Truckage", "quantity": 2, "unit_price": 10000, "total": 20000},
    {"description": "Chemicals", "quantity": 2, "unit_price": 12000, "total": 24000}
  ]'::jsonb,
  361500, 0, 0, 0,
  361500, 0, 361500, 'unpaid', '2025-11-25', '2025-11-25',
  'NHT St Mary Branch. Contact: Ms Campbell. PO: 160769. TRN: 002-903-288. Payment Terms: 3 Days',
  '3 Days', '160769', 'NHT, 4 Park Blvd, Kingston 5'
),

-- 11. INV 100425 - Lasco - Oven Repairs - Dec 7, 2025
(
  'INV-100425',
  'Oven Repairs - Lasco Distributors',
  '[
    {"description": "Oven Safety Valves", "quantity": 2, "unit_price": 45000, "total": 90000},
    {"description": "Pilot Gas Tube", "quantity": 1, "unit_price": 3500, "total": 3500},
    {"description": "UnInstall Old Parts and ReInstall New", "quantity": 1, "unit_price": 45000, "total": 45000},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  141500, 0, 0, 0,
  141500, 0, 141500, 'unpaid', '2025-12-07', '2025-12-07',
  'Lasco Distributors Ltd - White Marl, St Catherine. Contact: Mr Gattie.',
  'COD', NULL, 'Lasco Distributors Ltd, White Marl, St Catherine'
),

-- 12. INV 100426 - Social Development Commission - Cleaning of Bathroom Vents - Dec 10, 2025
(
  'INV-100426',
  'Cleaning of Bathroom Vents - Social Development Commission',
  '[
    {"description": "Cleaning Extractor Vent System in Bathrooms", "quantity": 2, "unit_price": 7500, "total": 15000},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  18000, 0, 0, 0,
  18000, 0, 18000, 'unpaid', '2025-12-10', '2025-12-10',
  'Social Development Commission - 22 Camp Road, Kingston 5. Contact: Mr McFarlane. TRN: 002-903-288',
  'COD', NULL, 'Social Development Commission, 22 Camp Road, Kingston 5'
),

-- 13. INV 100427 (Mr Smith) - AC Servicing and Repairs - Dec 10, 2025
(
  'INV-100427-A',
  'Servicing and Repair of Air Conditioners - Mr Smith',
  '[
    {"description": "General Servicing of Air Conditioners", "quantity": 2, "unit_price": 7000, "total": 14000},
    {"description": "Gassing of Air Conditioners", "quantity": 2, "unit_price": 8500, "total": 17000},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  34000, 0, 0, 0,
  34000, 0, 34000, 'unpaid', '2025-12-10', '2025-12-10',
  'Mr Smith - Unit 205, Echelon Apts, 41 Upper Waterloo Road, Kingston 8.',
  'COD', NULL, 'Unit 205, Echelon Apts, 41 Upper Waterloo Road, Kingston 8'
),

-- 14. INV 100427 (Ms Chin Sue) - AC Servicing and Repairs - Dec 11, 2025
(
  'INV-100427-B',
  'Servicing and Repair of Air Conditioner - Ms Chin Sue',
  '[
    {"description": "General Servicing of Air Conditioners", "quantity": 1, "unit_price": 10000, "total": 10000},
    {"description": "Gassing of Air Conditioner", "quantity": 1, "unit_price": 8500, "total": 8500},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  21500, 0, 0, 0,
  21500, 0, 21500, 'unpaid', '2025-12-11', '2025-12-11',
  'Ms Chin Sue - Unit 205, Echelon Apts, 41 Upper Waterloo Road, Kingston 8. PO: PUR1169139',
  'COD', 'PUR1169139', 'Unit 205, Echelon Apts, 41 Upper Waterloo Road, Kingston 8'
),

-- 15. INV 100428 - Mrs Chin Shue - AC Servicing and Repairs - Dec 22, 2025 (PAID IN FULL)
(
  'INV-100428',
  'Servicing and Repair of Air Conditioner - Mrs Chin Shue',
  '[
    {"description": "General Servicing of Air Conditioners", "quantity": 1, "unit_price": 7000, "total": 7000},
    {"description": "Gassing of Air Conditioner", "quantity": 1, "unit_price": 8500, "total": 8500},
    {"description": "Repair Piping Leak", "quantity": 1, "unit_price": 10500, "total": 10500},
    {"description": "Travelling", "quantity": 2, "unit_price": 3000, "total": 6000},
    {"description": "Payment Received", "quantity": 1, "unit_price": -32000, "total": -32000}
  ]'::jsonb,
  32000, 0, 0, 0,
  32000, 32000, 0, 'paid', '2025-12-22', '2025-12-22',
  'Mrs Chin Shue - 8 Dennis Ave, Off Molynes Rd. PAID IN FULL.',
  'COD', NULL, '8 Dennis Ave, Off Molynes Rd'
),

-- 16. INV 100431 - 22 Jerk - Ice Machine Conversion and Compressor Replacement - Dec 16, 2025
(
  'INV-100431',
  'Ice Machine Compressor Replacement and Conversion from 110V to 220V - 22 Jerk',
  '[
    {"description": "Supply of New 220v Compressor", "quantity": 1, "unit_price": 47000, "total": 47000},
    {"description": "Conversion Parts Replacement", "quantity": 1, "unit_price": 25000, "total": 25000},
    {"description": "Installation Materials and Refrigerant for Regassing Unit", "quantity": 1, "unit_price": 33850, "total": 33850},
    {"description": "Conversion Parts and Materials", "quantity": 1, "unit_price": 58100, "total": 58100},
    {"description": "UnInstall Old and Installation of New", "quantity": 1, "unit_price": 25000, "total": 25000},
    {"description": "Travelling", "quantity": 1, "unit_price": 22000, "total": 22000},
    {"description": "Less Deposit Received", "quantity": 1, "unit_price": -110950, "total": -110950}
  ]'::jsonb,
  210950, 0, 0, 0,
  210950, 110950, 100000, 'partial', '2025-12-16', '2025-12-16',
  '22 Jerk - 22 Barbican Road, Kingston. Contact: Ms Dixon. Payment Terms: 50% Deposit Required. Deposit received: $110,950.',
  '50% Deposit Required', NULL, '22 Jerk, 22 Barbican Road, Kingston'
),

-- 17. INV 100430 - Aqua Cube - Ice Machine Servicing - Dec 16, 2025
(
  'INV-100430',
  'Deep General Servicing of Ice Machine - Aqua Cube',
  '[
    {"description": "Deep General Servicing of Ice Machine", "quantity": 1, "unit_price": 35000, "total": 35000},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 3000}
  ]'::jsonb,
  35000, 0, 0, 0,
  35000, 0, 35000, 'unpaid', '2025-12-16', '2025-12-16',
  'Aqua Cube - Old Harbour, St Catherine. Contact: Ms Simpson.',
  'COD', NULL, 'Aqua Cube, Old Harbour, St Catherine'
),

-- 18. INV 100433 - NextGen Impact Ministries - Installation of 3 Ton Air Conditioners - Dec 29, 2025
(
  'INV-100600',
  'Installation of New 3 Ton Air Conditioners - NextGen Impact Ministries International',
  '[
    {"description": "Installation of New 3 Ton Air Conditioners", "quantity": 2, "unit_price": 45000, "total": 70000},
    {"description": "Travelling", "quantity": 1, "unit_price": 3000, "total": 0}
  ]'::jsonb,
  70000, 0, 0, 26000,
  70000, 0, 70000, 'unpaid', '2025-12-29', '2025-12-29',
  'NextGen Impact Ministries International - Clairdale Ave, Kingston. Contact: Mr Taylor. Total Discounts: $26,000',
  'COD', NULL, 'NextGen Impact Ministries International, Clairdale Ave, Kingston'
);
