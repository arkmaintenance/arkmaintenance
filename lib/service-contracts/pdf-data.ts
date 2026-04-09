export interface ServiceContractPdfItem {
  description: string
  qty: number
  unit_price: number
  amount: number
}

export interface ServiceContractPdfScheduleItem {
  label: string
  date: string
}

export interface ServiceContractPdfAssets {
  logo?: string
  footerLeft?: string
  footerRight?: string
}

export interface ServiceContractPdfData {
  contract_number: string
  date: string
  agreement_date: string
  payment_terms: string
  service_description: string
  contract_type: string
  schedule_short_label: string
  schedule_long_label: string
  timeline: string
  client: {
    name: string
    company: string
    address: string
    address_lines: string[]
    city: string
    parish: string
  }
  items: ServiceContractPdfItem[]
  subtotal: number
  total: number
  service_schedule: ServiceContractPdfScheduleItem[]
  customer_representative?: string
  customer_position?: string
  ark_representative: string
  ark_position: string
  scope_of_work_points: string[]
  assets?: ServiceContractPdfAssets
}

type MaybeString = string | null | undefined

interface ServiceContractClient {
  contact_name?: MaybeString
  company_name?: MaybeString
  address?: MaybeString
  city?: MaybeString
  parish?: MaybeString
}

interface ServiceContractRecordLike {
  contract_number?: MaybeString
  title?: MaybeString
  amount?: number | string | null
  billing_frequency?: MaybeString
  start_date?: MaybeString
  created_at?: MaybeString
  notes?: unknown
  items?: unknown
  clients?: ServiceContractClient | null
}

interface ParsedNotes {
  contact_person?: string
  address?: string
  payment_terms?: string
  job_timeline?: string
  recurring_schedule?: string
  scope_of_work_points?: string[]
  customer_representative?: string
  customer_position?: string
  ark_representative?: string
  ark_position?: string
  items?: unknown[]
}

const DEFAULT_AC_SCOPE_POINTS = [
  'Cleaning of Evaporator, Evaporator Coils and Evaporator Fan Motor.',
  'Cleaning of Condenser Fan Motor, Condenser Coil, Compressor and Lubricating of Motor.',
  'Checking/Cleaning of All Electrical Circuits, Cleaning of All Contactor Points and Checking of Relays.',
  'Cleaning off All Electrical Corrosion, Checking of Pressure and Combing of Fins, Check for Leaks.',
  'Flushing Of The Drain.',
  'Cleaning and Treating of Drain Pan and Drain Line.',
  'Cleaning and Treating of Air Filters.',
  'Straightening of Evaporator and Condenser Coil Fins.',
  'Checking Refrigerant (Freon) levels for adequate cooling.',
  'Checking Superheat and Subcooling.',
  'Checking the Compressor Amp draw.',
  'Checking the Indoor & Outdoor Fan Motor Amp draw.',
  'Checking Electrical Components.',
  'Checking Thermostat for Proper Operation.',
  'Inspecting Overall Operation of Unit.',
  'Recording all findings and Maintenance data for future reference.',
]

function formatDate(value?: MaybeString) {
  if (!value) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function safeString(value?: MaybeString) {
  return String(value || '').trim()
}

function parseNotes(notes: unknown): ParsedNotes {
  if (!notes) return {}

  if (typeof notes === 'object' && !Array.isArray(notes)) {
    return notes as ParsedNotes
  }

  if (typeof notes !== 'string') {
    return {}
  }

  try {
    return JSON.parse(notes) as ParsedNotes
  } catch {
    return {}
  }
}

function normalizeAddress(address: string, city: string, parish: string) {
  if (address) return address

  return [city, parish].filter(Boolean).join(', ')
}

function splitAddressLines(address: string) {
  if (!address) return []

  return address
    .split(/\r?\n|,/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function toNumber(value: unknown) {
  const numeric = Number(value)

  return Number.isFinite(numeric) ? numeric : 0
}

function normalizeItems(input: unknown) {
  if (!Array.isArray(input)) return []

  return input
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const record = item as Record<string, unknown>
      const qty = toNumber(record.qty ?? record.quantity ?? 1)
      const unit_price = toNumber(record.unit_price ?? record.rate ?? 0)
      const discount = toNumber(record.discount ?? 0)
      const amount = toNumber(record.amount ?? record.total ?? qty * unit_price - discount)

      return {
        description: safeString(String(record.description || '')),
        qty,
        unit_price,
        amount,
      }
    })
    .filter((item) => item.description)
}

function getOrdinalLabel(index: number) {
  const value = index + 1
  const modTen = value % 10
  const modHundred = value % 100

  if (modTen === 1 && modHundred !== 11) return `${value}st`
  if (modTen === 2 && modHundred !== 12) return `${value}nd`
  if (modTen === 3 && modHundred !== 13) return `${value}rd`

  return `${value}th`
}

function normalizeFrequency(input?: string | null) {
  const frequency = safeString(input).toLowerCase()

  if (frequency === 'monthly') return 'monthly'
  if (frequency === 'quarterly') return 'quarterly'
  if (frequency === 'semi-annual' || frequency === 'semi annual' || frequency === 'bi-annually' || frequency === 'bi-annual') return 'semi-annual'
  if (frequency === 'annual' || frequency === 'yearly') return 'annual'

  return 'quarterly'
}

function getScheduleMeta(frequencyInput?: string | null) {
  const frequency = normalizeFrequency(frequencyInput)

  switch (frequency) {
    case 'monthly':
      return {
        count: 12,
        monthStep: 1,
        shortLabel: 'Monthly',
        longLabel: 'Monthly (12 Times Yearly)',
      }
    case 'semi-annual':
      return {
        count: 2,
        monthStep: 6,
        shortLabel: 'Semi-Annual',
        longLabel: 'Semi-Annual (2 Times Yearly)',
      }
    case 'annual':
      return {
        count: 1,
        monthStep: 12,
        shortLabel: 'Annual',
        longLabel: 'Annual (1 Time Yearly)',
      }
    default:
      return {
        count: 4,
        monthStep: 3,
        shortLabel: 'Quarterly',
        longLabel: 'Quarterly (4 Times Yearly)',
      }
  }
}

function generateSchedule(startDate?: string | null, frequencyInput?: string | null) {
  const meta = getScheduleMeta(frequencyInput)
  const base = startDate ? new Date(`${startDate}T00:00:00`) : new Date()
  const schedule: ServiceContractPdfScheduleItem[] = []

  for (let index = 0; index < meta.count; index += 1) {
    const current = new Date(base)
    current.setMonth(base.getMonth() + index * meta.monthStep)

    schedule.push({
      label: `${getOrdinalLabel(index)} Servicing`,
      date: current.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      }),
    })
  }

  return schedule
}

export function buildServiceContractPdfData(contract: ServiceContractRecordLike): ServiceContractPdfData {
  const parsedNotes = parseNotes(contract.notes)
  const client = contract.clients || {}
  const items = normalizeItems(parsedNotes.items ?? contract.items)
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const total = subtotal || toNumber(contract.amount)
  const address = normalizeAddress(
    safeString(parsedNotes.address),
    safeString(client.address || ''),
    [safeString(client.city || ''), safeString(client.parish || '')].filter(Boolean).join(', ')
  )
  const address_lines = splitAddressLines(address)
  const scheduleMeta = getScheduleMeta(parsedNotes.recurring_schedule || contract.billing_frequency)

  return {
    contract_number: safeString(contract.contract_number) || 'SC-0000',
    date: formatDate(contract.created_at),
    agreement_date: formatDate(contract.created_at),
    payment_terms: safeString(parsedNotes.payment_terms) || '7 Days',
    service_description:
      safeString(contract.title) || 'PREDICTIVE MAINTENANCE SERVICE CONTRACT FOR AIR CONDITIONER MAINTENANCE',
    contract_type: 'SERVICE CONTRACT',
    schedule_short_label: scheduleMeta.shortLabel,
    schedule_long_label: scheduleMeta.longLabel,
    timeline: safeString(parsedNotes.job_timeline) || '3 Days',
    client: {
      name: safeString(parsedNotes.contact_person) || safeString(client.contact_name) || 'Client',
      company: safeString(client.company_name),
      address,
      address_lines,
      city: safeString(client.city),
      parish: safeString(client.parish),
    },
    items,
    subtotal: subtotal || total,
    total,
    service_schedule: generateSchedule(contract.start_date, parsedNotes.recurring_schedule || contract.billing_frequency),
    customer_representative: safeString(parsedNotes.customer_representative),
    customer_position: safeString(parsedNotes.customer_position),
    ark_representative: safeString(parsedNotes.ark_representative) || 'Suzanne Gordon',
    ark_position: safeString(parsedNotes.ark_position) || 'Director',
    scope_of_work_points:
      Array.isArray(parsedNotes.scope_of_work_points) && parsedNotes.scope_of_work_points.length > 0
        ? parsedNotes.scope_of_work_points.map((point) => safeString(point)).filter(Boolean)
        : DEFAULT_AC_SCOPE_POINTS,
  }
}
