import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isValidEmailAddress, splitEmailList } from '@/lib/email-addresses'

interface EmailAddressSuggestion {
  email: string
  label?: string
  source?: 'client' | 'history'
  lastUsedAt?: string | null
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function safeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function buildClientLabel(contactName: string, companyName: string) {
  if (contactName && companyName) {
    return `${contactName} · ${companyName}`
  }

  return contactName || companyName || undefined
}

function readMetadataAddresses(metadata: Record<string, unknown> | null | undefined) {
  const values: string[] = []
  const ccValue = metadata?.cc

  if (Array.isArray(ccValue)) {
    for (const entry of ccValue) {
      if (typeof entry === 'string') {
        values.push(...splitEmailList(entry))
      }
    }
  } else if (typeof ccValue === 'string') {
    values.push(...splitEmailList(ccValue))
  }

  return values
}

function mergeSuggestions(addresses: EmailAddressSuggestion[]) {
  const merged = new Map<string, EmailAddressSuggestion>()

  for (const address of addresses) {
    if (!address?.email || !isValidEmailAddress(address.email)) {
      continue
    }

    const email = address.email.trim()
    const key = normalizeEmail(email)
    const current = merged.get(key)
    const nextTimestamp = address.lastUsedAt ? new Date(address.lastUsedAt).getTime() : 0
    const currentTimestamp = current?.lastUsedAt ? new Date(current.lastUsedAt).getTime() : 0

    if (!current) {
      merged.set(key, {
        email,
        label: address.label,
        source: address.source,
        lastUsedAt: address.lastUsedAt || null,
      })
      continue
    }

    merged.set(key, {
      email: current.email,
      label: current.label || address.label,
      source: current.source === 'client' ? current.source : address.source || current.source,
      lastUsedAt: nextTimestamp > currentTimestamp ? address.lastUsedAt || null : current.lastUsedAt || null,
    })
  }

  return Array.from(merged.values())
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || '100'), 1), 500)
    const query = safeString(searchParams.get('q')).toLowerCase()
    const suggestions: EmailAddressSuggestion[] = []

    const [clientsResult, emailsResult] = await Promise.all([
      supabase
        .from('clients')
        .select('contact_name, company_name, email')
        .not('email', 'is', null)
        .limit(300),
      supabase
        .from('emails')
        .select('to_email, metadata, created_at')
        .eq('direction', 'outgoing')
        .order('created_at', { ascending: false })
        .limit(300),
    ])

    if (!clientsResult.error && Array.isArray(clientsResult.data)) {
      for (const client of clientsResult.data) {
        const email = safeString(client.email)
        if (!isValidEmailAddress(email)) {
          continue
        }

        suggestions.push({
          email,
          label: buildClientLabel(safeString(client.contact_name), safeString(client.company_name)),
          source: 'client',
          lastUsedAt: null,
        })
      }
    }

    if (!emailsResult.error && Array.isArray(emailsResult.data)) {
      for (const emailRecord of emailsResult.data) {
        const clientName = safeString(emailRecord.metadata?.client_name)
        const lastUsedAt = safeString(emailRecord.created_at) || null

        for (const email of splitEmailList(emailRecord.to_email)) {
          if (!isValidEmailAddress(email)) {
            continue
          }

          suggestions.push({
            email,
            label: clientName || undefined,
            source: 'history',
            lastUsedAt,
          })
        }

        for (const email of readMetadataAddresses(emailRecord.metadata as Record<string, unknown> | null | undefined)) {
          if (!isValidEmailAddress(email)) {
            continue
          }

          suggestions.push({
            email,
            label: clientName || undefined,
            source: 'history',
            lastUsedAt,
          })
        }
      }
    }

    const addresses = mergeSuggestions(suggestions)
      .filter((entry) => {
        if (!query) return true

        return entry.email.toLowerCase().includes(query) || (entry.label || '').toLowerCase().includes(query)
      })
      .sort((left, right) => {
        const leftTimestamp = left.lastUsedAt ? new Date(left.lastUsedAt).getTime() : 0
        const rightTimestamp = right.lastUsedAt ? new Date(right.lastUsedAt).getTime() : 0

        if (leftTimestamp !== rightTimestamp) {
          return rightTimestamp - leftTimestamp
        }

        return left.email.localeCompare(right.email)
      })
      .slice(0, limit)

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Email address lookup error:', error)
    return NextResponse.json({ error: 'Failed to fetch saved email addresses' }, { status: 500 })
  }
}
