'use client'

import { useEffect, useMemo, useState } from 'react'
import { isValidEmailAddress, splitEmailList } from '@/lib/email-addresses'

export interface EmailAddressSuggestion {
  email: string
  label?: string
  source?: 'client' | 'history' | 'local'
  lastUsedAt?: string | null
}

const STORAGE_KEY = 'arkmaintenance.saved-email-addresses.v1'

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function buildSeedSuggestions(values: Array<string | null | undefined>): EmailAddressSuggestion[] {
  const suggestions: EmailAddressSuggestion[] = []

  for (const value of values) {
    for (const entry of splitEmailList(value)) {
      if (!isValidEmailAddress(entry)) {
        continue
      }

      suggestions.push({
        email: entry.trim(),
        source: 'local',
        lastUsedAt: null,
      })
    }
  }

  return suggestions
}

function readStoredSuggestions(): EmailAddressSuggestion[] {
  if (typeof window === 'undefined') return []

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)
    if (!rawValue) return []

    const parsedValue = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) return []

    const suggestions: EmailAddressSuggestion[] = []

    for (const entry of parsedValue as unknown[]) {
      if (!entry || typeof entry !== 'object') {
        continue
      }

      const record = entry as Record<string, unknown>
      const email = typeof record.email === 'string' ? record.email.trim() : ''
      if (!isValidEmailAddress(email)) {
        continue
      }

      suggestions.push({
        email,
        label: typeof record.label === 'string' ? record.label : undefined,
        source: record.source === 'client' || record.source === 'history' || record.source === 'local'
          ? record.source
          : 'local',
        lastUsedAt: typeof record.lastUsedAt === 'string' ? record.lastUsedAt : null,
      })
    }

    return suggestions
  } catch {
    return []
  }
}

function writeStoredSuggestions(suggestions: EmailAddressSuggestion[]) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(suggestions))
  } catch {
    // Ignore storage quota and private mode failures.
  }
}

function mergeSuggestions(...groups: EmailAddressSuggestion[][]) {
  const merged = new Map<string, EmailAddressSuggestion>()

  for (const group of groups) {
    for (const suggestion of group) {
      if (!suggestion?.email || !isValidEmailAddress(suggestion.email)) {
        continue
      }

      const email = suggestion.email.trim()
      const key = normalizeEmail(email)
      const current = merged.get(key)
      const nextTimestamp = suggestion.lastUsedAt ? new Date(suggestion.lastUsedAt).getTime() : 0
      const currentTimestamp = current?.lastUsedAt ? new Date(current.lastUsedAt).getTime() : 0

      if (!current) {
        merged.set(key, {
          email,
          label: suggestion.label,
          source: suggestion.source || 'local',
          lastUsedAt: suggestion.lastUsedAt || null,
        })
        continue
      }

      merged.set(key, {
        email: current.email,
        label: current.label || suggestion.label,
        source: current.source === 'local' ? suggestion.source || current.source : current.source,
        lastUsedAt: nextTimestamp > currentTimestamp ? suggestion.lastUsedAt || null : current.lastUsedAt || null,
      })
    }
  }

  return Array.from(merged.values()).sort((left, right) => {
    const leftTimestamp = left.lastUsedAt ? new Date(left.lastUsedAt).getTime() : 0
    const rightTimestamp = right.lastUsedAt ? new Date(right.lastUsedAt).getTime() : 0

    if (leftTimestamp !== rightTimestamp) {
      return rightTimestamp - leftTimestamp
    }

    return left.email.localeCompare(right.email)
  })
}

export function useEmailAddressBook(seedEmails: Array<string | null | undefined> = []) {
  const seedSuggestions = useMemo(() => buildSeedSuggestions(seedEmails), [JSON.stringify(seedEmails)])
  const [suggestions, setSuggestions] = useState<EmailAddressSuggestion[]>(seedSuggestions)

  useEffect(() => {
    const localSuggestions = readStoredSuggestions()
    setSuggestions(mergeSuggestions(localSuggestions, seedSuggestions))

    let active = true

    void fetch('/api/email-addresses?limit=250')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch saved email addresses')
        }

        return response.json()
      })
      .then((payload) => {
        if (!active) return

        const remoteSuggestions = Array.isArray(payload.addresses) ? payload.addresses as EmailAddressSuggestion[] : []
        setSuggestions(mergeSuggestions(readStoredSuggestions(), remoteSuggestions, seedSuggestions))
      })
      .catch(() => {
        if (!active) return
        setSuggestions(mergeSuggestions(readStoredSuggestions(), seedSuggestions))
      })

    return () => {
      active = false
    }
  }, [seedSuggestions])

  const rememberAddresses = (values: Array<string | null | undefined>, source: EmailAddressSuggestion['source'] = 'local') => {
    const nextSuggestions = values
      .flatMap((value) => splitEmailList(value))
      .map((email) => email.trim())
      .filter(isValidEmailAddress)
      .map((email) => ({
        email,
        source,
        lastUsedAt: new Date().toISOString(),
      } satisfies EmailAddressSuggestion))

    if (nextSuggestions.length === 0) {
      return
    }

    const mergedSuggestions = mergeSuggestions(readStoredSuggestions(), suggestions, seedSuggestions, nextSuggestions)
    writeStoredSuggestions(mergedSuggestions)
    setSuggestions(mergedSuggestions)
  }

  return {
    suggestions,
    rememberAddresses,
  }
}
