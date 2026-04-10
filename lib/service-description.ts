function normalizeText(value: string | null | undefined) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeForComparison(value: string) {
  return normalizeText(value).replace(/\u2013|\u2014/g, '-').toLowerCase()
}

export function buildServiceDescription(
  description: string | null | undefined,
  serviceLocation?: string | null,
  fallback = '',
) {
  const baseDescription = normalizeText(description)
  const location = normalizeText(serviceLocation)
  const resolvedFallback = normalizeText(fallback)

  if (!baseDescription && !location) {
    return resolvedFallback
  }

  const resolvedDescription = baseDescription || resolvedFallback

  if (!location) {
    return resolvedDescription
  }

  if (!resolvedDescription) {
    return location
  }

  const normalizedDescription = normalizeForComparison(resolvedDescription)
  const normalizedLocation = normalizeForComparison(location)

  if (
    normalizedDescription === normalizedLocation
    || normalizedDescription.endsWith(` - ${normalizedLocation}`)
  ) {
    return resolvedDescription
  }

  return `${resolvedDescription} - ${location}`
}
