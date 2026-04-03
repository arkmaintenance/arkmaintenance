-- ARK Maintenance Database Schema

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'admin',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  parish TEXT,
  contact_person TEXT,
  client_type TEXT DEFAULT 'residential', -- residential, commercial
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id)
);

-- Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  status TEXT DEFAULT 'active', -- active, inactive
  hourly_rate DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id)
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- AC, Refrigeration, Kitchen
  base_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number TEXT UNIQUE,
  client_id UUID REFERENCES clients(id),
  technician_id UUID REFERENCES technicians(id),
  service_id UUID REFERENCES services(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, scheduled, in_progress, completed, cancelled
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  scheduled_date DATE,
  scheduled_time TIME,
  completion_date DATE,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT, -- weekly, monthly, quarterly, yearly
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id)
);

-- Quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT UNIQUE,
  client_id UUID REFERENCES clients(id),
  job_id UUID REFERENCES jobs(id),
  status TEXT DEFAULT 'draft', -- draft, sent, accepted, rejected, expired
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 15,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  valid_until DATE,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id)
);

-- Quotation items
CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE,
  client_id UUID REFERENCES clients(id),
  job_id UUID REFERENCES jobs(id),
  quotation_id UUID REFERENCES quotations(id),
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 15,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id)
);

-- Invoice items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT, -- cash, cheque, bank_transfer, card
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  vendor TEXT,
  receipt_url TEXT,
  job_id UUID REFERENCES jobs(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT, -- website, referral, social, advertisement
  status TEXT DEFAULT 'new', -- new, contacted, qualified, proposal, won, lost
  notes TEXT,
  estimated_value DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id)
);

-- Service Contracts table
CREATE TABLE IF NOT EXISTS service_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT UNIQUE,
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  value DECIMAL(10,2),
  billing_frequency TEXT, -- monthly, quarterly, yearly
  status TEXT DEFAULT 'active', -- active, expired, cancelled
  terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id)
);

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  status TEXT DEFAULT 'sent', -- sent, failed, pending
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for clients
CREATE POLICY "clients_select" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for technicians
CREATE POLICY "technicians_select" ON technicians FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "technicians_insert" ON technicians FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "technicians_update" ON technicians FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "technicians_delete" ON technicians FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "services_select" ON services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "services_insert" ON services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "services_update" ON services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "services_delete" ON services FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for jobs
CREATE POLICY "jobs_select" ON jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "jobs_insert" ON jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jobs_update" ON jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "jobs_delete" ON jobs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for quotations
CREATE POLICY "quotations_select" ON quotations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "quotations_insert" ON quotations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quotations_update" ON quotations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "quotations_delete" ON quotations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for quotation_items (via quotation)
CREATE POLICY "quotation_items_select" ON quotation_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM quotations WHERE quotations.id = quotation_items.quotation_id AND quotations.user_id = auth.uid()));
CREATE POLICY "quotation_items_insert" ON quotation_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM quotations WHERE quotations.id = quotation_items.quotation_id AND quotations.user_id = auth.uid()));
CREATE POLICY "quotation_items_update" ON quotation_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM quotations WHERE quotations.id = quotation_items.quotation_id AND quotations.user_id = auth.uid()));
CREATE POLICY "quotation_items_delete" ON quotation_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM quotations WHERE quotations.id = quotation_items.quotation_id AND quotations.user_id = auth.uid()));

-- RLS Policies for invoices
CREATE POLICY "invoices_select" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "invoices_insert" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invoices_update" ON invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "invoices_delete" ON invoices FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for invoice_items (via invoice)
CREATE POLICY "invoice_items_select" ON invoice_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "invoice_items_insert" ON invoice_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "invoice_items_update" ON invoice_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "invoice_items_delete" ON invoice_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));

-- RLS Policies for payments
CREATE POLICY "payments_select" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "payments_delete" ON payments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for expenses
CREATE POLICY "expenses_select" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "expenses_insert" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "expenses_update" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "expenses_delete" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for leads
CREATE POLICY "leads_select" ON leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "leads_insert" ON leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leads_update" ON leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "leads_delete" ON leads FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for service_contracts
CREATE POLICY "service_contracts_select" ON service_contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service_contracts_insert" ON service_contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "service_contracts_update" ON service_contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "service_contracts_delete" ON service_contracts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for email_templates
CREATE POLICY "email_templates_select" ON email_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "email_templates_insert" ON email_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "email_templates_update" ON email_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "email_templates_delete" ON email_templates FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for email_logs
CREATE POLICY "email_logs_select" ON email_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "email_logs_insert" ON email_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'last_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create sequences for auto-incrementing numbers
CREATE SEQUENCE IF NOT EXISTS job_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS contract_number_seq START 1000;

-- Functions to generate formatted numbers
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'JOB-' || LPAD(nextval('job_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || LPAD(nextval('invoice_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QUO-' || LPAD(nextval('quote_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CON-' || LPAD(nextval('contract_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
