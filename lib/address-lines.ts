function cleanPart(value: string | null | undefined) {
  return (value || '').trim()
}

export function getAddressLines(address?: string | null, city?: string | null, parish?: string | null) {
  const normalizedAddress = cleanPart(address)

  if (normalizedAddress) {
    if (/\r?\n/.test(normalizedAddress)) {
      return normalizedAddress
        .split(/\r?\n/)
        .map((part) => part.trim())
        .filter(Boolean)
    }

    const firstCommaIndex = normalizedAddress.indexOf(',')
    if (firstCommaIndex === -1) {
      return [normalizedAddress]
    }

    return [
      normalizedAddress.slice(0, firstCommaIndex).trim(),
      normalizedAddress.slice(firstCommaIndex + 1).trim(),
    ].filter(Boolean)
  }

  return [cleanPart(city), cleanPart(parish)].filter(Boolean)
}
