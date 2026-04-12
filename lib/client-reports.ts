export interface ClientReportPoint {
  id: string
  text: string
}

export interface ClientReportSection {
  id: string
  heading: string
  points: ClientReportPoint[]
}

export interface ClientReportDraft {
  reportNumber: string
  selectedClientId: string
  title: string
  reportDate: string
  clientName: string
  contactPerson: string
  address: string
  sections: ClientReportSection[]
}

export interface ClientReportPdfSection {
  heading: string
  points: string[]
}

export interface ClientReportPdfAssets {
  content_page_background?: string
  thank_you_page_background?: string
}

export interface ClientReportPdfData {
  title: string
  report_date: string
  client_name: string
  contact_person: string
  address_lines: string[]
  sections: ClientReportPdfSection[]
  assets?: ClientReportPdfAssets
}

export interface ClientReportDocumentParagraph {
  lines: string[]
}

export interface ClientReportDocumentSectionChunk {
  key: string
  heading: string
  paragraphs: ClientReportDocumentParagraph[]
}

export interface ClientReportPageLayout {
  headerMaskHeight: number
  titleBoxHeight: number
  titleTextTop: number
  metaCardTop: number
  metaCardHeight: number
  bodyTop: number
  bodyHeight: number
  bodyContentTopPadding: number
  bodyContentHeight: number
  contactPersonLines: string[]
  clientNameLines: string[]
  addressLines: string[]
}

export interface ClientReportContentPage {
  kind: 'content'
  key: string
  titleLines: string[]
  layout: ClientReportPageLayout
  sections: ClientReportDocumentSectionChunk[]
}

export type ClientReportDocumentPage = ClientReportContentPage

export interface ClientReportClientRecordLike {
  contact_name?: string | null
  company_name?: string | null
  address?: string | null
  city?: string | null
  parish?: string | null
}

export interface ClientReportClientOption extends ClientReportClientRecordLike {
  id: string
}

export interface ClientReportRecordLike {
  id?: string
  report_number?: string | null
  title?: string | null
  client_id?: string | null
  report_type?: string | null
  prepared_for?: string | null
  contact_person?: string | null
  client_name?: string | null
  address?: string | null
  report_date?: string | null
  observations?: string | null
  root_cause?: string | null
  recommendations?: string | null
  conclusion?: string | null
  status?: string | null
  sections?: unknown
  created_at?: string | null
  updated_at?: string | null
  clients?: ClientReportClientRecordLike | null
}

export const CLIENT_REPORT_TEMPLATE_PAGE_1 = '/images/client-report-template-page-1.png'
export const CLIENT_REPORT_TEMPLATE_PAGE_2 = '/images/client-report-template-page-2.png'

export const CLIENT_REPORT_THANK_YOU =
  'Thank you for choosing Ark Air Conditioning, Refrigeration & Kitchen Maintenance Ltd \u00B7 www.arkmaintenance.com'

export const CLIENT_REPORT_PAGE_WIDTH = 595.92
export const CLIENT_REPORT_PAGE_HEIGHT = 841.92

export const CLIENT_REPORT_PREVIEW_PAGE_WIDTH = `${CLIENT_REPORT_PAGE_WIDTH}pt`
export const CLIENT_REPORT_PREVIEW_PAGE_HEIGHT = `${CLIENT_REPORT_PAGE_HEIGHT}pt`

export const CLIENT_REPORT_META_LABEL_PREPARED_FOR = 'PREPARED FOR'
export const CLIENT_REPORT_META_LABEL_DATE = 'DATE'

export const CLIENT_REPORT_COLORS = {
  titleStart: '#2747b2',
  titleEnd: '#ff6b00',
  metaCardBackground: '#f4f7fb',
  metaCardBorder: '#d7dfea',
  label: '#ff6b00',
  heading: '#2c4ab0',
  underline: '#ff6b00',
  body: '#253144',
  muted: '#60718e',
  thankYou: '#16a34a',
} as const

export const CLIENT_REPORT_LAYOUT = {
  titleBoxTop: 146.5,
  titleBoxLeft: 42.52,
  titleBoxWidth: 510.88,
  titleMaskTop: 146.5,
  titleMaskLeft: 42.52,
  titleMaskWidth: 510.88,
  titleBoxRadius: 13,
  titlePaddingTop: 12,
  titlePaddingBottom: 12,
  titleTextLeft: 57.52,
  titleTextWidth: 474,
  titleMinHeight: 42,
  titleToMetaGap: 14,
  metaCardLeft: 42.52,
  metaCardWidth: 510.88,
  metaCardRadius: 12,
  metaCardBorderWidth: 1.25,
  metaPaddingTop: 10,
  metaPaddingRight: 16,
  metaPaddingBottom: 10,
  metaPaddingLeft: 18,
  metaContentLeftWidth: 292,
  metaContentRightWidth: 150,
  metaLabelToValueGap: 8,
  metaContactToClientGap: 2,
  metaClientToAddressGap: 2,
  metaMinHeight: 64,
  metaToBodyGap: -2,
  bodyLeft: 42.52,
  bodyRight: 42.52,
  bodyBottom: 645.75,
  bodyContentTopPadding: 8,
  bodySectionLeft: 42.52,
  bodyTextLeft: 57.52,
  sectionGap: 12,
  sectionHeadingLineHeight: 1.12,
  sectionHeadingFontSize: 11.25,
  sectionUnderlineGap: 4,
  sectionUnderlineHeight: 1.5,
  pointGap: 8,
  pointLineHeight: 1.52,
  pointFontSize: 9,
  bulletIndent: 14.5,
  bulletGlyphOffset: 2.5,
  bulletTextOffset: 9.5,
  footerThankYouTop: 822,
  footerThankYouLeft: 82,
  footerThankYouWidth: 431.92,
  footerThankYouFontSize: 5.25,
} as const

export const CLIENT_REPORT_DOCUMENT_METRICS = {
  titleWrapUnits: 49,
  bodyWrapUnits: 88,
  metaWrapUnits: 48,
  titleLineHeight: 13.5 * 1.16,
  metaLabelLineHeight: 6.75,
  metaContactLineHeight: 9.75,
  metaClientLineHeight: 9,
  metaAddressLineHeight: 8.25 * 1.18,
  metaDateLineHeight: 9.75,
  sectionHeadingLineHeight: CLIENT_REPORT_LAYOUT.sectionHeadingFontSize * CLIENT_REPORT_LAYOUT.sectionHeadingLineHeight,
  paragraphLineHeight: CLIENT_REPORT_LAYOUT.pointFontSize * CLIENT_REPORT_LAYOUT.pointLineHeight,
  sectionHeadingGap: 12,
} as const

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `report-${Math.random().toString(36).slice(2, 10)}`
}

function getTodayDateValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function measureTextUnits(value: string) {
  let total = 0

  for (const char of value) {
    if (char === ' ') {
      total += 0.4
      continue
    }

    if ('fijltI1.,:;\'`!|'.includes(char)) {
      total += 0.52
      continue
    }

    if ('MW@#%&QGODCUmw'.includes(char)) {
      total += 1.2
      continue
    }

    if (/[A-Z]/.test(char)) {
      total += 0.94
      continue
    }

    total += 0.84
  }

  return total
}

function splitLongToken(token: string, maxUnits: number) {
  const parts: string[] = []
  let current = ''

  for (const char of token) {
    const next = `${current}${char}`

    if (current && measureTextUnits(next) > maxUnits) {
      parts.push(current)
      current = char
    } else {
      current = next
    }
  }

  if (current) {
    parts.push(current)
  }

  return parts
}

function wrapTextToLines(value: string, maxUnits: number) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ['']
  }

  const lines: string[] = []

  for (const rawParagraph of trimmed.replace(/\r\n/g, '\n').split('\n')) {
    const paragraph = rawParagraph.replace(/\s+/g, ' ').trim()

    if (!paragraph) {
      lines.push('')
      continue
    }

    const words = paragraph
      .split(' ')
      .flatMap((word) => (measureTextUnits(word) > maxUnits ? splitLongToken(word, maxUnits) : [word]))

    let currentLine = ''

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word

      if (!currentLine || measureTextUnits(candidate) <= maxUnits) {
        currentLine = candidate
        continue
      }

      lines.push(currentLine)
      currentLine = word
    }

    if (currentLine) {
      lines.push(currentLine)
    }
  }

  return lines.length > 0 ? lines : ['']
}

function buildWrappedParagraphs(points: string[]) {
  return points.map((point) => ({
    lines: wrapTextToLines(point, CLIENT_REPORT_DOCUMENT_METRICS.bodyWrapUnits),
  }))
}

function getTextBlockHeight(lineCount: number, lineHeight: number) {
  return Math.max(lineCount, 1) * lineHeight
}

function roundLayoutValue(value: number) {
  return Math.round(value * 100) / 100
}

function buildClientReportPageLayout(
  data: ClientReportPdfData,
  titleLines: string[]
): ClientReportPageLayout {
  const contactPersonLines = wrapTextToLines(
    data.contact_person,
    CLIENT_REPORT_DOCUMENT_METRICS.metaWrapUnits
  )
  const clientNameLines = wrapTextToLines(
    data.client_name,
    CLIENT_REPORT_DOCUMENT_METRICS.metaWrapUnits
  )
  const addressLines = data.address_lines.flatMap((line) =>
    wrapTextToLines(line, CLIENT_REPORT_DOCUMENT_METRICS.metaWrapUnits)
  )

  const titleBoxHeight = roundLayoutValue(
    Math.max(
      CLIENT_REPORT_LAYOUT.titleMinHeight,
      CLIENT_REPORT_LAYOUT.titlePaddingTop
        + getTextBlockHeight(titleLines.length, CLIENT_REPORT_DOCUMENT_METRICS.titleLineHeight)
        + CLIENT_REPORT_LAYOUT.titlePaddingBottom
    )
  )

  const leftColumnHeight =
    CLIENT_REPORT_DOCUMENT_METRICS.metaLabelLineHeight
    + CLIENT_REPORT_LAYOUT.metaLabelToValueGap
    + getTextBlockHeight(
      contactPersonLines.length,
      CLIENT_REPORT_DOCUMENT_METRICS.metaContactLineHeight
    )
    + CLIENT_REPORT_LAYOUT.metaContactToClientGap
    + getTextBlockHeight(clientNameLines.length, CLIENT_REPORT_DOCUMENT_METRICS.metaClientLineHeight)
    + CLIENT_REPORT_LAYOUT.metaClientToAddressGap
    + getTextBlockHeight(addressLines.length, CLIENT_REPORT_DOCUMENT_METRICS.metaAddressLineHeight)

  const rightColumnHeight =
    CLIENT_REPORT_DOCUMENT_METRICS.metaLabelLineHeight
    + CLIENT_REPORT_LAYOUT.metaLabelToValueGap
    + getTextBlockHeight(1, CLIENT_REPORT_DOCUMENT_METRICS.metaDateLineHeight)

  const metaCardHeight = roundLayoutValue(
    Math.max(
      CLIENT_REPORT_LAYOUT.metaMinHeight,
      CLIENT_REPORT_LAYOUT.metaPaddingTop
        + Math.max(leftColumnHeight, rightColumnHeight)
        + CLIENT_REPORT_LAYOUT.metaPaddingBottom
    )
  )

  const titleTextTop = roundLayoutValue(
    CLIENT_REPORT_LAYOUT.titleBoxTop + CLIENT_REPORT_LAYOUT.titlePaddingTop
  )
  const metaCardTop = roundLayoutValue(
    CLIENT_REPORT_LAYOUT.titleBoxTop + titleBoxHeight + CLIENT_REPORT_LAYOUT.titleToMetaGap
  )
  const bodyTop = roundLayoutValue(
    metaCardTop + metaCardHeight + CLIENT_REPORT_LAYOUT.metaToBodyGap
  )

  return {
    headerMaskHeight: roundLayoutValue(bodyTop - CLIENT_REPORT_LAYOUT.titleMaskTop),
    titleBoxHeight,
    titleTextTop,
    metaCardTop,
    metaCardHeight,
    bodyTop,
    bodyHeight: roundLayoutValue(CLIENT_REPORT_LAYOUT.bodyBottom - bodyTop),
    bodyContentTopPadding: CLIENT_REPORT_LAYOUT.bodyContentTopPadding,
    bodyContentHeight: roundLayoutValue(
      CLIENT_REPORT_LAYOUT.bodyBottom - bodyTop - CLIENT_REPORT_LAYOUT.bodyContentTopPadding
    ),
    contactPersonLines,
    clientNameLines,
    addressLines,
  }
}

function createContentPage(
  index: number,
  titleLines: string[],
  layout: ClientReportPageLayout
): ClientReportContentPage {
  return {
    kind: 'content',
    key: `content-${index + 1}`,
    titleLines,
    layout,
    sections: [],
  }
}

function getMinimumChunkHeight() {
  return (
    CLIENT_REPORT_DOCUMENT_METRICS.sectionHeadingLineHeight
    + CLIENT_REPORT_DOCUMENT_METRICS.sectionHeadingGap
    + CLIENT_REPORT_DOCUMENT_METRICS.paragraphLineHeight
  )
}

export function buildClientReportDocumentPages(data: ClientReportPdfData): ClientReportDocumentPage[] {
  const titleLines = wrapTextToLines(data.title.toUpperCase(), CLIENT_REPORT_DOCUMENT_METRICS.titleWrapUnits)
  const pageLayout = buildClientReportPageLayout(data, titleLines)
  const minimumChunkHeight = getMinimumChunkHeight()

  const pages: ClientReportContentPage[] = []
  let currentPage = createContentPage(0, titleLines, pageLayout)
  let remainingHeight = pageLayout.bodyContentHeight

  function pushCurrentPage() {
    if (currentPage.sections.length === 0) {
      return
    }

    pages.push(currentPage)
    currentPage = createContentPage(pages.length, titleLines, pageLayout)
    remainingHeight = pageLayout.bodyContentHeight
  }

  for (const [sectionIndex, section] of data.sections.entries()) {
    const paragraphs = buildWrappedParagraphs(section.points)
    let paragraphIndex = 0
    let lineOffset = 0

    while (paragraphIndex < paragraphs.length) {
      if (remainingHeight < minimumChunkHeight) {
        pushCurrentPage()
      }

      let usedHeight =
        CLIENT_REPORT_DOCUMENT_METRICS.sectionHeadingLineHeight
        + CLIENT_REPORT_DOCUMENT_METRICS.sectionHeadingGap

      const chunk: ClientReportDocumentSectionChunk = {
        key: `${sectionIndex}-${paragraphIndex}-${lineOffset}-${pages.length}-${currentPage.sections.length}`,
        heading: section.heading,
        paragraphs: [],
      }

      let nextParagraphIndex = paragraphIndex
      let nextLineOffset = lineOffset

      while (nextParagraphIndex < paragraphs.length) {
        const sourceParagraph = paragraphs[nextParagraphIndex]
        const lines: string[] = []

        while (
          nextLineOffset < sourceParagraph.lines.length
          && usedHeight + CLIENT_REPORT_DOCUMENT_METRICS.paragraphLineHeight <= remainingHeight + 0.001
        ) {
          lines.push(sourceParagraph.lines[nextLineOffset])
          usedHeight += CLIENT_REPORT_DOCUMENT_METRICS.paragraphLineHeight
          nextLineOffset += 1
        }

        if (lines.length === 0) {
          break
        }

        chunk.paragraphs.push({ lines })

        const paragraphCompleted = nextLineOffset >= sourceParagraph.lines.length

        if (!paragraphCompleted) {
          break
        }

        nextParagraphIndex += 1
        nextLineOffset = 0

        if (
          nextParagraphIndex < paragraphs.length
          && usedHeight + CLIENT_REPORT_LAYOUT.pointGap + CLIENT_REPORT_DOCUMENT_METRICS.paragraphLineHeight
            <= remainingHeight + 0.001
        ) {
          usedHeight += CLIENT_REPORT_LAYOUT.pointGap
        } else if (nextParagraphIndex < paragraphs.length) {
          break
        }
      }

      currentPage.sections.push(chunk)
      remainingHeight -= usedHeight
      paragraphIndex = nextParagraphIndex
      lineOffset = nextLineOffset

      const hasMoreContent =
        paragraphIndex < paragraphs.length
        || sectionIndex < data.sections.length - 1

      if (!hasMoreContent) {
        continue
      }

      if (remainingHeight >= CLIENT_REPORT_LAYOUT.sectionGap + minimumChunkHeight) {
        remainingHeight -= CLIENT_REPORT_LAYOUT.sectionGap
      } else {
        pushCurrentPage()
      }
    }
  }

  if (currentPage.sections.length > 0 || pages.length === 0) {
    pages.push(currentPage)
  }

  return pages
}

export function getNextClientReportNumber(reportNumbers: Array<string | null | undefined>) {
  const start = 1000
  let next = start

  const parsed = reportNumbers
    .map((value) => {
      const match = String(value || '').match(/(\d+)/)
      return match ? Number(match[1]) : Number.NaN
    })
    .filter((value) => Number.isFinite(value) && value >= start)

  if (parsed.length > 0) {
    next = Math.max(...parsed) + 1
  }

  return `RPT-${next}`
}

export function buildClientAddressFromClient(client?: ClientReportClientRecordLike | null) {
  return [client?.address, client?.city, client?.parish].filter(Boolean).join(', ')
}

export function createEmptyPoint(text = ''): ClientReportPoint {
  return {
    id: createId(),
    text,
  }
}

export function createEmptySection(heading = 'Observation'): ClientReportSection {
  return {
    id: createId(),
    heading,
    points: [createEmptyPoint()],
  }
}

export function createDefaultClientReportDraft(reportNumber = ''): ClientReportDraft {
  return {
    reportNumber,
    selectedClientId: '',
    title: 'Client Report',
    reportDate: getTodayDateValue(),
    clientName: '',
    contactPerson: '',
    address: '',
    sections: [createEmptySection('Observation'), createEmptySection('Recommendation')],
  }
}

function normalizePoints(input: unknown) {
  if (!Array.isArray(input) || input.length === 0) {
    return [createEmptyPoint()]
  }

  const points = input
    .map((point) => {
      if (typeof point === 'string') {
        return createEmptyPoint(point)
      }

      if (point && typeof point === 'object') {
        const maybePoint = point as Partial<ClientReportPoint>

        return {
          id: asString(maybePoint.id) || createId(),
          text: asString(maybePoint.text),
        }
      }

      return createEmptyPoint()
    })
    .filter(Boolean)

  return points.length > 0 ? points : [createEmptyPoint()]
}

function normalizeSections(input: unknown, fallback?: ClientReportSection[]) {
  if (!Array.isArray(input) || input.length === 0) {
    return fallback && fallback.length > 0 ? fallback : createDefaultClientReportDraft().sections
  }

  const sections = input
    .map((section) => {
      if (!section || typeof section !== 'object') {
        return null
      }

      const maybeSection = section as Partial<ClientReportSection> & { points?: unknown }

      return {
        id: asString(maybeSection.id) || createId(),
        heading: asString(maybeSection.heading),
        points: normalizePoints(maybeSection.points),
      }
    })
    .filter((section): section is ClientReportSection => Boolean(section))

  return sections.length > 0
    ? sections
    : fallback && fallback.length > 0
      ? fallback
      : createDefaultClientReportDraft().sections
}

function splitLegacyFieldToPoints(value?: string | null) {
  return asString(value)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function buildSectionsFromLegacyFields(record: ClientReportRecordLike) {
  const legacySections = [
    { heading: 'Observations', points: splitLegacyFieldToPoints(record.observations) },
    { heading: 'Root Cause', points: splitLegacyFieldToPoints(record.root_cause) },
    { heading: 'Recommendations', points: splitLegacyFieldToPoints(record.recommendations) },
    { heading: 'Conclusion', points: splitLegacyFieldToPoints(record.conclusion) },
  ]
    .filter((section) => section.points.length > 0)
    .map((section) => ({
      id: createId(),
      heading: section.heading,
      points: section.points.map((point) => createEmptyPoint(point)),
    }))

  return legacySections.length > 0 ? legacySections : createDefaultClientReportDraft().sections
}

export function hydrateClientReportDraft(input: unknown): ClientReportDraft {
  const defaults = createDefaultClientReportDraft()

  if (!input || typeof input !== 'object') {
    return defaults
  }

  const candidate = input as Partial<ClientReportDraft>

  return {
    reportNumber: asString(candidate.reportNumber),
    selectedClientId: asString(candidate.selectedClientId),
    title: asString(candidate.title) || defaults.title,
    reportDate: asString(candidate.reportDate) || defaults.reportDate,
    clientName: asString(candidate.clientName),
    contactPerson: asString(candidate.contactPerson),
    address: asString(candidate.address),
    sections: normalizeSections(candidate.sections),
  }
}

export function buildClientReportDraftFromRecord(record: ClientReportRecordLike): ClientReportDraft {
  const client = record.clients || null
  const fallbackSections = buildSectionsFromLegacyFields(record)

  return {
    reportNumber: asString(record.report_number),
    selectedClientId: asString(record.client_id),
    title: asString(record.title) || 'Client Report',
    reportDate: formatDateInput(record.report_date || record.created_at),
    clientName: asString(record.client_name) || asString(client?.company_name) || asString(client?.contact_name),
    contactPerson:
      asString(record.contact_person) || asString(record.prepared_for) || asString(client?.contact_name),
    address: asString(record.address) || buildClientAddressFromClient(client),
    sections: normalizeSections(record.sections, fallbackSections),
  }
}

export function serializeClientReportSections(sections: ClientReportSection[]) {
  return sections
    .map((section) => ({
      heading: section.heading.trim(),
      points: section.points
        .map((point) => point.text.trim())
        .filter(Boolean),
    }))
    .filter((section) => section.heading || section.points.length > 0)
    .map((section) => ({
      heading: section.heading || 'Report Section',
      points: section.points.length > 0 ? section.points : ['Details pending.'],
    }))
}

export function buildLegacyClientReportFields(sections: ClientReportSection[]) {
  const cleanedSections = serializeClientReportSections(sections)
  const result = {
    observations: null as string | null,
    root_cause: null as string | null,
    recommendations: null as string | null,
    conclusion: null as string | null,
  }

  for (const section of cleanedSections) {
    const heading = section.heading.toLowerCase()
    const content = section.points.join('\n')

    if (!result.observations && heading.includes('observ')) {
      result.observations = content
      continue
    }

    if (!result.root_cause && heading.includes('root cause')) {
      result.root_cause = content
      continue
    }

    if (!result.recommendations && (heading.includes('recommend') || heading.includes('corrective'))) {
      result.recommendations = content
      continue
    }

    if (!result.conclusion && heading.includes('conclusion')) {
      result.conclusion = content
    }
  }

  return result
}

export function splitAddressLines(address: string) {
  return address
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function formatDateInput(value?: string | null) {
  if (!value) {
    return getTodayDateValue()
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return getTodayDateValue()
  }

  const year = parsed.getFullYear()
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0')
  const day = `${parsed.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatClientReportDate(value?: string) {
  const fallback = new Date()
  const parsed = value ? new Date(`${value}T00:00:00`) : fallback
  const safeDate = Number.isNaN(parsed.getTime()) ? fallback : parsed

  return safeDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function buildClientReportPdfData(draft: ClientReportDraft): ClientReportPdfData {
  const cleanedSections = serializeClientReportSections(draft.sections)
  const addressLines = splitAddressLines(draft.address)

  return {
    title: draft.title.trim() || 'Client Report',
    report_date: formatClientReportDate(draft.reportDate),
    client_name: draft.clientName.trim() || 'Client Name',
    contact_person: draft.contactPerson.trim() || 'Client Contact',
    address_lines: addressLines.length > 0 ? addressLines : ['Client Address'],
    sections:
      cleanedSections.length > 0
        ? cleanedSections
        : [
            {
              heading: 'Observation',
              points: ['Details pending.'],
            },
          ],
  }
}

export function getClientReportFilename(draft: ClientReportDraft) {
  const title = (draft.title.trim() || 'Client Report').replace(/[/\\?%*:|"<>]/g, '-')
  const client = (draft.clientName.trim() || draft.contactPerson.trim() || 'Client').replace(/[/\\?%*:|"<>]/g, '-')
  const date = draft.reportDate || getTodayDateValue()

  return `${title} - ${client} - ${date}.pdf`
}
