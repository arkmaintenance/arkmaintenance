-- Disable RLS on emails table for admin access
ALTER TABLE IF EXISTS emails DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read emails" ON emails;
DROP POLICY IF EXISTS "Allow service role to manage emails" ON emails;
DROP POLICY IF EXISTS "Allow all to read emails" ON emails;
DROP POLICY IF EXISTS "Allow all to insert emails" ON emails;
DROP POLICY IF EXISTS "Allow all to update emails" ON emails;
DROP POLICY IF EXISTS "Allow all to delete emails" ON emails;

-- Re-enable RLS but with open policies for now
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all operations
CREATE POLICY "Allow all to read emails" ON emails FOR SELECT USING (true);
CREATE POLICY "Allow all to insert emails" ON emails FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update emails" ON emails FOR UPDATE USING (true);
CREATE POLICY "Allow all to delete emails" ON emails FOR DELETE USING (true);
