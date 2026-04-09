export interface ServiceContractLineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  discount: number
  total: number
}

export interface ServiceContractClientOption {
  id: string
  contact_name: string
  company_name: string | null
  address?: string | null
  city?: string | null
  parish?: string | null
}

export interface ServiceContractNotesPayload {
  contact_person?: string
  service_location?: string
  address?: string
  payment_terms?: string
  po_number?: string
  trn?: string
  job_timeline?: string
  is_service_contract?: boolean
  recurring_schedule?: string
  scope_of_work?: string
  scope_of_work_points?: string[]
  notes?: string
  ark_representative?: string
  ark_position?: string
  customer_representative?: string
  customer_position?: string
  items?: unknown[]
}

export interface ServiceContractFormValues {
  clientId: string
  contactPerson: string
  serviceLocation: string
  address: string
  paymentTerms: string
  poNumber: string
  trn: string
  serviceDescription: string
  lineItems: ServiceContractLineItem[]
  jobTimeline: string
  isServiceContract: boolean
  recurringSchedule: string
  scopeOfWork: string
  startDate: string
  status: string
  notes: string
  arkRepresentative: string
  arkPosition: string
  customerRepresentative: string
  customerPosition: string
}

interface ServiceContractRecordLike {
  client_id?: string | null
  title?: string | null
  billing_frequency?: string | null
  start_date?: string | null
  status?: string | null
  notes?: unknown
  items?: unknown
  clients?: {
    contact_name?: string | null
    company_name?: string | null
    address?: string | null
    city?: string | null
    parish?: string | null
  } | null
}

export const SERVICE_CONTRACT_LOCATIONS = [
  'Kingston',
  'St. Andrew',
  'St. Catherine',
  'Portmore',
  'Montego Bay',
  'Ocho Rios',
  'Mandeville',
]

export const SERVICE_CONTRACT_PAYMENT_TERMS = [
  'COD',
  'Net 15',
  'Net 30',
  'Net 60',
  '50% Deposit',
  '7 Days',
  '30 Days',
]

export const SERVICE_CONTRACT_TIMELINE_OPTIONS = [
  '1 Day',
  '2-3 Days',
  '3 Days',
  '3-5 Days',
  '1 Week',
  '2 Weeks',
  '1 Month',
]

export const SERVICE_CONTRACT_RECURRING_OPTIONS = [
  'monthly',
  'quarterly',
  'semi-annual',
  'annual',
]

export const SERVICE_CONTRACT_STATUS_OPTIONS = [
  'pending',
  'sent',
  'accepted',
  'rejected',
  'expired',
  'active',
  'completed',
  'cancelled',
]

export const SERVICE_CONTRACT_SCOPE_OPTIONS: Record<string, string[]> = {
  AC: [
    'Cleaning of Evaporator, Evaporator Coils and Evaporator Fan Motor.',
    'Cleaning of Condenser Fan Motor, Condenser Coils, Fan Blades and Motor.',
    'Cleaning and Treating of Drain Pan and Drain Line.',
    'Cleaning and Treating of Air Filters.',
    'Straightening of Evaporator and Condenser Coil Fins.',
    'Checking Refrigerant (Freon) levels for adequate cooling.',
    'Checking Superheat and Subcooling.',
    'Checking the Compressor Amp draw.',
    'Checking the Indoor & Outdoor Fan Motor Amp draw.',
    'Checking Electrical Components.',
    'Checking Thermostat for Proper Operation.',
    'Checking for Refrigerant Leaks.',
    'Checking & Testing the Capacitor.',
    'Checking the Contactor.',
    'Inspecting Overall Operation of Unit.',
    'Recording all findings and Maintenance data for future reference.',
  ],
  'Ice Machine': [
    'Safety & Power Shutdown',
    'Ice Disposal & Bin Emptying',
    'Disassembly of Water Components',
    'Cleaning/Descaling Evaporator',
    'Cleaning/Descaling Water Circuit',
    'Sanitizing Food-Zone Parts',
    'Water Filter Replacement',
    'Inlet Screen Cleaning',
    'Condenser Coil Cleaning',
    'Water Pump Inspection',
    'Fan Motor Check',
    'Electrical Connection Check',
    'Lubrication of Moving Parts',
    'Reassembly & Rinse Cycle',
    'Operational Performance Check',
    'Service Report ',
  ],
  'Exhaust System': [
    'Site Inspection and Pre-Service Assessment',
    'System Power Isolation and Lockout/Tagout (LOTO)',
    'Protective Covering of Cooking Appliances and Surrounding Areas',
    'Removal and Soaking of Baffle/Mesh Filters',
    'Degreasing and Cleaning of Hood Interior Plenum',
    'Scraping and Scrubbing of Accessible Ductwork',
    'Installation of New Access Panels (If Necessary)',
    'Cleaning of Roof-Mounted or Wall-Mounted Exhaust Fan',
    'Inspection of Fan Belt Tension and Condition',
    'System Reassembly and Final Wipe-Down',
    'System Functionality Test (Fan Start-up)',
    'Final System Testing, Documentation, and Reporting',
  ],
  'Refrigeration Equipment': [
    'Safety Protocol and Lockout/Tagout Implementation',
    'Initial System Operation and Performance Audit',
    'Condenser Coil Cleaning and Airflow Inspection',
    'Evaporator Coil Inspection and Cleaning',
    'Refrigerant Level and Charge Verification',
    'Refrigerant System Leak Testing',
    'Compressor Oil Level and Pressure Check',
    'Electrical Component Inspection and Tightening',
    'Contactors and Relay Inspection',
    'Fan Motor and Blade Inspection/Lubrication',
    'Defrost Cycle and Timer Verification',
    'Drain Pan and Drain Line Cleaning',
    'Door Gasket and Hinge Inspection',
    'Temperature Control and Thermostat Calibration',
    'Suction Line Insulation Inspection',
    'Final System Testing, Documentation, and Reporting',
  ],
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim()
}

function toNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function todayIsoDate() {
  return new Date().toISOString().split('T')[0]
}

function normalizeAddress(client?: ServiceContractRecordLike['clients']) {
  return [client?.address, client?.city, client?.parish].filter(Boolean).join(', ')
}

function normalizeScopePoints(points: unknown) {
  if (!Array.isArray(points)) return []

  return points.map((point) => normalizeString(point)).filter(Boolean)
}

export function parseServiceContractNotes(notes: unknown): ServiceContractNotesPayload {
  if (!notes) return {}

  if (typeof notes === 'object' && !Array.isArray(notes)) {
    return notes as ServiceContractNotesPayload
  }

  if (typeof notes !== 'string') return {}

  try {
    return JSON.parse(notes) as ServiceContractNotesPayload
  } catch {
    return {}
  }
}

export function calculateServiceContractLineTotal(item: Partial<ServiceContractLineItem>) {
  const quantity = Math.max(1, toNumber(item.quantity))
  const unitPrice = toNumber(item.unit_price)
  const discount = toNumber(item.discount)

  return quantity * unitPrice - discount
}

export function createEmptyServiceContractLineItem(seed?: string): ServiceContractLineItem {
  const id = seed || `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return {
    id,
    description: '',
    quantity: 1,
    unit_price: 0,
    discount: 0,
    total: 0,
  }
}

export function normalizeServiceContractLineItems(input: unknown) {
  if (!Array.isArray(input)) {
    return [createEmptyServiceContractLineItem('line-1')]
  }

  const items = input
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const record = item as Record<string, unknown>
      const quantity = Math.max(1, toNumber(record.quantity ?? record.qty ?? 1))
      const unitPrice = toNumber(record.unit_price ?? record.rate ?? 0)
      const discount = toNumber(record.discount ?? 0)

      return {
        id: normalizeString(record.id) || `line-${index + 1}`,
        description: normalizeString(record.description),
        quantity,
        unit_price: unitPrice,
        discount,
        total: toNumber(record.total ?? record.amount ?? quantity * unitPrice - discount),
      }
    })

  return items.length > 0 ? items : [createEmptyServiceContractLineItem('line-1')]
}

export function calculateServiceContractTotal(items: ServiceContractLineItem[]) {
  return items.reduce((sum, item) => sum + calculateServiceContractLineTotal(item), 0)
}

export function computeServiceContractEndDate(startDate: string) {
  const start = startDate || todayIsoDate()
  const baseDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(baseDate)
  endDate.setFullYear(baseDate.getFullYear() + 1)

  return endDate.toISOString().split('T')[0]
}

export function detectServiceContractScopeKey(points: unknown) {
  const normalizedPoints = normalizeScopePoints(points)

  if (normalizedPoints.length === 0) return ''

  for (const [key, scopePoints] of Object.entries(SERVICE_CONTRACT_SCOPE_OPTIONS)) {
    if (scopePoints.length !== normalizedPoints.length) continue

    const isMatch = scopePoints.every(
      (point, index) => normalizeString(point) === normalizedPoints[index]
    )

    if (isMatch) return key
  }

  return ''
}

export function buildServiceContractFormValues(contract: ServiceContractRecordLike): ServiceContractFormValues {
  const parsedNotes = parseServiceContractNotes(contract.notes)
  const detectedScope = detectServiceContractScopeKey(parsedNotes.scope_of_work_points)
  const scopeKey = normalizeString(parsedNotes.scope_of_work)
  const recurringSchedule = normalizeString(parsedNotes.recurring_schedule) || normalizeString(contract.billing_frequency)
  const status = normalizeString(contract.status)
  const paymentTerms = normalizeString(parsedNotes.payment_terms)

  return {
    clientId: normalizeString(contract.client_id),
    contactPerson:
      normalizeString(parsedNotes.contact_person) ||
      normalizeString(contract.clients?.contact_name),
    serviceLocation:
      normalizeString(parsedNotes.service_location) ||
      normalizeString(contract.clients?.parish),
    address:
      normalizeString(parsedNotes.address) ||
      normalizeAddress(contract.clients),
    paymentTerms: SERVICE_CONTRACT_PAYMENT_TERMS.includes(paymentTerms) ? paymentTerms : '7 Days',
    poNumber: normalizeString(parsedNotes.po_number),
    trn: normalizeString(parsedNotes.trn),
    serviceDescription:
      normalizeString(contract.title) || 'Service Contract',
    lineItems: normalizeServiceContractLineItems(parsedNotes.items ?? contract.items),
    jobTimeline: normalizeString(parsedNotes.job_timeline) || '3 Days',
    isServiceContract: parsedNotes.is_service_contract !== false,
    recurringSchedule: SERVICE_CONTRACT_RECURRING_OPTIONS.includes(recurringSchedule)
      ? recurringSchedule
      : 'quarterly',
    scopeOfWork:
      detectedScope ||
      (Object.prototype.hasOwnProperty.call(SERVICE_CONTRACT_SCOPE_OPTIONS, scopeKey) ? scopeKey : ''),
    startDate: normalizeString(contract.start_date).split('T')[0] || todayIsoDate(),
    status: SERVICE_CONTRACT_STATUS_OPTIONS.includes(status) ? status : 'pending',
    notes: normalizeString(parsedNotes.notes),
    arkRepresentative: normalizeString(parsedNotes.ark_representative) || 'Suzanne Gordon',
    arkPosition: normalizeString(parsedNotes.ark_position) || 'Director',
    customerRepresentative: normalizeString(parsedNotes.customer_representative),
    customerPosition: normalizeString(parsedNotes.customer_position),
  }
}

export function buildServiceContractNotesPayload(values: ServiceContractFormValues): ServiceContractNotesPayload {
  const normalizedItems = values.lineItems.map((item) => ({
    id: item.id,
    description: item.description.trim(),
    quantity: Math.max(1, toNumber(item.quantity)),
    unit_price: toNumber(item.unit_price),
    discount: toNumber(item.discount),
    total: calculateServiceContractLineTotal(item),
  }))

  return {
    contact_person: values.contactPerson.trim(),
    service_location: values.serviceLocation.trim(),
    address: values.address.trim(),
    payment_terms: values.paymentTerms.trim(),
    po_number: values.poNumber.trim(),
    trn: values.trn.trim(),
    job_timeline: values.jobTimeline.trim(),
    is_service_contract: values.isServiceContract,
    recurring_schedule: values.recurringSchedule.trim(),
    scope_of_work: values.scopeOfWork.trim(),
    scope_of_work_points: SERVICE_CONTRACT_SCOPE_OPTIONS[values.scopeOfWork] ?? [],
    notes: values.notes.trim(),
    ark_representative: values.arkRepresentative.trim(),
    ark_position: values.arkPosition.trim(),
    customer_representative: values.customerRepresentative.trim(),
    customer_position: values.customerPosition.trim(),
    items: normalizedItems,
  }
}
