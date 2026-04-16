interface QuotationFillerRowOptions {
  visibleTableRowCount: number
  hasScopeSection: boolean
  scopePointCount: number
  hasServiceLocation: boolean
}

export function getQuotationFillerRowCount({
  visibleTableRowCount,
  hasScopeSection,
  scopePointCount,
  hasServiceLocation,
}: QuotationFillerRowOptions) {
  const targetVisibleRows = hasScopeSection
    ? scopePointCount > 12
      ? 8
      : scopePointCount > 0
        ? 10
        : 11
    : 14

  return Math.max(0, targetVisibleRows - visibleTableRowCount - (hasServiceLocation ? 1 : 0))
}
