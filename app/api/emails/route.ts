import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const direction = searchParams.get('direction')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('emails')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (direction) {
      query = query.eq('direction', direction)
    }
    if (type) {
      query = query.eq('email_type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching emails:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ emails: data })
  } catch (error) {
    console.error('Emails fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('emails')
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Error creating email:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ email: data })
  } catch (error) {
    console.error('Email creation error:', error)
    return NextResponse.json({ error: 'Failed to create email' }, { status: 500 })
  }
}
