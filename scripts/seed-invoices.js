import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ── 1. Ensure British High Commission client exists ──────────────────────────
const { data: existingClient } = await supabase
  .from('clients')
  .select('id')
  .eq('company_name', 'British High Commission')
  .maybeSingle()

let clientId = existingClient?.id

if (!clientId) {
  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({
      contact_name: 'Ms McKay',
      company_name: 'British High Commission',
      address: '28 Trafalgar Road',
      city: 'Kingston 5',
      parish: 'Kingston',
      email: '',
    })
    .select('id')
    .single()
  if (error) { console.error('Error creating client:', error.message); process.exit(1) }
  clientId = newClient.id
  console.log('Created client: British High Commission, id =', clientId)
} else {
  console.log('Client already exists, id =', clientId)
}

// ── 2. Helper to upsert an invoice ──────────────────────────────────────────
async function upsertInvoice(invoice) {
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('invoice_number', invoice.invoice_number)
    .maybeSingle()

  if (existing) {
    console.log(`Invoice ${invoice.invoice_number} already exists — skipping.`)
    return
  }

  const { error } = await supabase.from('invoices').insert(invoice)
  if (error) {
    console.error(`Error inserting invoice ${invoice.invoice_number}:`, error.message)
  } else {
    console.log(`Inserted invoice ${invoice.invoice_number} successfully.`)
  }
}

// ── 3. Invoice 100429 ────────────────────────────────────────────────────────
// High Commissioner's Laundry + Vault Room + Crisis Container AC Repairs
// Dec 15, 2025 — Total: JMD 84,500
await upsertInvoice({
  invoice_number: '100429',
  title: "High Commissioner's Laundry + Vault Room + Crisis Container AC Repairs",
  client_id: clientId,
  items: JSON.stringify([
    { section: "HIGH COMMISSIONER'S LAUNDRY HOUSE" },
    { description: 'General Servicing of Air Conditioner',  qty: 1, unit_price: 14500, discount: 0, amount: 14500 },
    { description: 'Supply and Install New Capacitor',       qty: 1, unit_price: 14500, discount: 0, amount: 14500 },
    { description: 'Travelling',                             qty: 1, unit_price: 3000,  discount: 0, amount: 3000  },
    { section: 'THE VAULT ROOM' },
    { description: 'General Servicing of Air Conditioner',  qty: 1, unit_price: 14500, discount: 0, amount: 14500 },
    { description: 'Repair Leak and Regas Air Conditioner', qty: 1, unit_price: 22500, discount: 0, amount: 22500 },
    { section: 'CRISIS STORE CONTAINER' },
    { description: 'General Servicing of Air Conditioner',  qty: 1, unit_price: 12500, discount: 0, amount: 12500 },
    { description: 'Travelling',                             qty: 1, unit_price: 3000,  discount: 0, amount: 3000  },
  ]),
  subtotal: 84500,
  tax_rate: 0,
  tax_amount: 0,
  discount: 0,
  total: 84500,
  balance_due: 84500,
  status: 'sent',
  issued_date: '2025-12-15',
  notes: JSON.stringify({
    contact_person: 'Ms McKay',
    service_location: 'Kingston',
    address: '28 Trafalgar Road, Kingston 5',
    payment_terms: 'COD',
    po_number: '',
    trn: '',
    job_timeline: '1 Day',
    is_service_contract: false,
    recurring_schedule: 'one-time',
    notes: '',
  }),
})

// ── 4. Invoice 100434 ────────────────────────────────────────────────────────
// New 2 Ton AC Installation – Guard House 3
// Dec 18, 2025 — Total: JMD 63,000
await upsertInvoice({
  invoice_number: '100434',
  title: 'New 2 Ton AC Installation – Guard House 3',
  client_id: clientId,
  items: JSON.stringify([
    { section: 'GUARD HOUSE 3 – INSTALLATION OF NEW AIR CONDITIONER' },
    { description: 'Installation of New 2 Ton Cassette Air Conditioner', qty: 1, unit_price: 50000, discount: 0, amount: 50000 },
    { description: 'UnInstall Old 2 Ton Cassette Air Conditioner',        qty: 1, unit_price: 10000, discount: 0, amount: 10000 },
    { description: 'Travelling',                                           qty: 1, unit_price: 3000,  discount: 0, amount: 3000  },
  ]),
  subtotal: 63000,
  tax_rate: 0,
  tax_amount: 0,
  discount: 0,
  total: 63000,
  balance_due: 63000,
  status: 'sent',
  issued_date: '2025-12-18',
  notes: JSON.stringify({
    contact_person: 'Ms McKay',
    service_location: 'Kingston',
    address: '28 Trafalgar Road, Kingston 5',
    payment_terms: 'COD',
    po_number: '',
    trn: '',
    job_timeline: '1 Day',
    is_service_contract: false,
    recurring_schedule: 'one-time',
    notes: '',
  }),
})

console.log('Done.')
