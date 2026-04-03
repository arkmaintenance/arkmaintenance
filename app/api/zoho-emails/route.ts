import { NextRequest, NextResponse } from 'next/server'
import { fetchZohoEmails } from '@/lib/zoho-mail'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

async function syncFolder(folder: string, limit: number): Promise<{ total: number; saved: number }> {
  const emails = await fetchZohoEmails(folder, limit)
  const direction = folder === 'INBOX' ? 'incoming' : 'outgoing'
  
  let savedCount = 0
  for (const email of emails) {
    // Check if email already exists using folder-specific UID
    const { data: existing } = await supabase
      .from('emails')
      .select('id')
      .eq('resend_id', `zoho_${folder}_${email.uid}`)
      .single()
    
    if (!existing) {
      let emailType = 'general'
      const subjectLower = email.subject.toLowerCase()
      if (subjectLower.includes('quote') || subjectLower.includes('quotation')) emailType = 'quotation'
      else if (subjectLower.includes('invoice')) emailType = 'invoice'
      else if (subjectLower.includes('contract')) emailType = 'contract'
      else if (subjectLower.includes('contact')) emailType = 'contact'
      else if (subjectLower.includes('application') || subjectLower.includes('job')) emailType = 'job_application'
      
      const { error } = await supabase.from('emails').insert({
        resend_id: `zoho_${folder}_${email.uid}`,
        direction,
        from_email: email.fromEmail || email.from,
        to_email: email.to,
        subject: email.subject,
        body_text: email.bodyText,
        body_html: email.bodyHtml,
        status: 'delivered',
        email_type: emailType,
        metadata: { 
          from_name: email.from,
          is_read: email.isRead,
          sent_at: email.date,
          folder
        }
      })
      
      if (!error) {
        savedCount++
      }
    }
  }
  
  return { total: emails.length, saved: savedCount }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    // Sync both INBOX (incoming) and Sent (outgoing) folders
    const inboxStats = await syncFolder('INBOX', limit)
    const sentStats = await syncFolder('Sent', limit)

    return NextResponse.json({ 
      success: true, 
      stats: { 
        total: inboxStats.total + sentStats.total, 
        saved: inboxStats.saved + sentStats.saved,
        inbox: inboxStats,
        sent: sentStats
      }
    })
  } catch (error) {
    console.error('Zoho sync error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to sync emails' 
    }, { status: 500 })
  }
}
