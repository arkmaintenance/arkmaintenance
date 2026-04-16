function cleanPart(value: string | null | undefined) {
  return (value || '').trim()
}

export function getAddressLines(address?: string | null, city?: string | null, parish?: string | null) {
  const normalizedAddress = cleanPart(address)
  const normalizedCity = cleanPart(city)
  const normalizedParish = cleanPart(parish)

  if (normalizedAddress) {
    const addressLines = /\r?\n/.test(normalizedAddress)
      ? normalizedAddress
          .split(/\r?\n/)
          .map((part) => part.trim())
          .filter(Boolean)
      : (() => {
          const firstCommaIndex = normalizedAddress.indexOf(',')
          if (firstCommaIndex === -1) {
            return [normalizedAddress]
          }

          return [
            normalizedAddress.slice(0, firstCommaIndex).trim(),
            normalizedAddress.slice(firstCommaIndex + 1).trim(),
          ].filter(Boolean)
        })()

    const normalizedAddressForComparison = normalizedAddress.toLowerCase()
    const extraLines = [normalizedCity, normalizedParish].filter(
      (part) => part && !normalizedAddressForComparison.includes(part.toLowerCase())
    )

    return [...addressLines, ...extraLines]
  }

  return [normalizedCity, normalizedParish].filter(Boolean)
}
