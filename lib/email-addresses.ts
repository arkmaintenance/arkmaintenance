const BASIC_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function splitEmailList(value: string | null | undefined) {
  if (!value) return []

  return value
    .split(/[,\n;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function isValidEmailAddress(value: string) {
  return BASIC_EMAIL_PATTERN.test(value.trim())
}

export function uniqueEmailList(values: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const email = value.trim()
    const normalized = email.toLowerCase()

    if (!email || seen.has(normalized)) {
      continue
    }

    seen.add(normalized)
    result.push(email)
  }

  return result
}

export function parseValidEmailList(value: string | null | undefined) {
  const entries = splitEmailList(value)

  return {
    valid: uniqueEmailList(entries.filter(isValidEmailAddress)),
    invalid: uniqueEmailList(entries.filter((entry) => !isValidEmailAddress(entry))),
  }
}

export function formatEmailList(values: string[]) {
  return values.join(', ')
}
