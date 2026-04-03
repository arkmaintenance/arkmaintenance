-- Seed 2025 Invoice Data for ARK Maintenance
-- First, ensure we have the clients

-- Insert clients if they don't exist
INSERT INTO public.clients (id, user_id, company_name, contact_name, address, city, parish, client_type, status)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  company_name,
  contact_name,
  address,
  city,
  parish,
  'commercial',
  'active'
FROM (VALUES
  ('Aqua Cube', 'Ms Simpson', 'Old Harbour', 'Old Harbour', 'St Catherine'),
  ('British High Commission', 'Ms McKay', '28 Trafalgar Road', 'Kingston 5', 'Kingston'),
  ('Lasco Distributors Ltd', 'Mr Gattie', 'White Marl', 'White Marl', 'St Catherine'),
  ('Island Grill', 'Manager', 'Head Office', 'Kingston', 'Kingston'),
  ('NextGen Impact Ministries Int''l', 'Contact Person', 'Address', 'City', 'Parish'),
  ('Ms Chin Sue', 'Ms Chin Sue', 'Address', 'City', 'Kingston'),
  ('Mr Smith', 'Mr Smith', 'Address', 'City', 'Kingston'),
  ('Social Development Commission', 'Contact Person', 'Address', 'Kingston', 'Kingston'),
  ('22 Jerk', 'Manager', 'Address', 'City', 'Parish'),
  ('St Francis', 'Contact Person', 'Address', 'City', 'Parish'),
  ('NHT', 'Contact Person', 'St Mary', 'St Mary', 'St Mary')
) AS t(company_name, contact_name, address, city, parish)
WHERE NOT EXISTS (
  SELECT 1 FROM public.clients WHERE clients.company_name = t.company_name
);
