import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Create the emails table using raw SQL via RPC or direct query
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS emails (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          resend_id TEXT,
          direction TEXT NOT NULL,
          from_email TEXT NOT NULL,
          to_email TEXT NOT NULL,
          subject TEXT NOT NULL,
          body_text TEXT,
          body_html TEXT,
          status TEXT DEFAULT 'sent',
          email_type TEXT,
          related_id UUID,
          attachments JSONB DEFAULT '[]',
          metadata JSONB DEFAULT '{}',
          read_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (error) {
      // Table might already exist or we need different approach
      console.log('Note:', error.message)
    }

    return NextResponse.json({ success: true, message: 'Emails table setup attempted' })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Failed to setup emails table' }, { status: 500 })
  }
}
