-- Add missing columns to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_filename TEXT;

-- Update status constraint to include more statuses
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check 
  CHECK (status IN ('new', 'reviewing', 'shortlisted', 'rejected', 'reviewed', 'contacted', 'interviewed', 'hired'));

-- Make phone optional
ALTER TABLE applications ALTER COLUMN phone DROP NOT NULL;
