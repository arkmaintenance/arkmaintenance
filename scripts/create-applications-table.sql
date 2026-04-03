-- Create applications table to store job applicants from the Join Our Team form
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  skills TEXT,
  message TEXT,
  resume_url TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'shortlisted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admin) can read/update applications
CREATE POLICY "Admin can view applications" ON applications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can update applications" ON applications
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin can delete applications" ON applications
  FOR DELETE TO authenticated USING (true);

-- Public can insert (submit application)
CREATE POLICY "Anyone can submit application" ON applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
