-- Add missing columns to emails table for Zoho IMAP sync
ALTER TABLE emails ADD COLUMN IF NOT EXISTS message_id TEXT;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS from_name TEXT;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;

-- Create index on message_id for faster duplicate checking
CREATE INDEX IF NOT EXISTS idx_emails_message_id ON emails(message_id);

-- Disable RLS on emails table for admin access
ALTER TABLE emails DISABLE ROW LEVEL SECURITY;
