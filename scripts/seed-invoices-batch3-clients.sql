-- Insert missing clients first
INSERT INTO clients (contact_name, company_name, email, phone, address, city)
VALUES
  ('Mr Henry',  'Denbigh High School',              NULL, NULL, 'May Pen, Clarendon',           'May Pen'),
  ('Mr Cottrell','Mr Cottrell',                     NULL, NULL, 'Manor Park Drive, Kingston 8', 'Kingston'),
  ('Mr Morrison','Mr Morrison',                     NULL, NULL, '12 Charlemont Avenue, Kingston 8', 'Kingston'),
  ('Ms Noble',  'BH Paints',                        NULL, NULL, '10 Bell Road, Kingston 11',    'Kingston'),
  ('Mr Murphy', 'Grand Hotel Excelsior Port Royal', NULL, NULL, "Morgan''s Harbour, Port Royal", 'Port Royal'),
  ('Khalia O''Connor', 'Island Grill Centerpoint',  NULL, NULL, 'Centerpoint, Montego Bay',     'Montego Bay')
ON CONFLICT DO NOTHING;
