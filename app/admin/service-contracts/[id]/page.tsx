'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ServiceContractTemplate } from '@/components/templates/service-contract-template'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, Download, Send } from 'lucide-react'
import { toast } from 'sonner'

interface ServiceContract {
  id: string
  contract_number: string
  title: string
  description: string
  service_type: string
  start_date: string
  end_date: string
  billing_frequency: string
  amount: number
  status: string
  next_service_date: string
  terms: string
  notes: string
  created_at: string
  clients: {
    contact_name: string
    company_name: string
    address: string
    city: string
    parish: string
  } | null
}

export default function ServiceContractPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<ServiceContract | null>(null)
  const [loading, setLoading] = useState(true)
  const templateRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchContract() {
      const { data, error } = await supabase
        .from('service_contracts')
        .select(`
          *,
          clients (
            contact_name,
            company_name,
            address,
            city,
            parish
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        toast.error('Failed to load service contract')
        router.push('/admin/service-contracts')
        return
      }

      setContract(data)
      setLoading(false)
    }

    fetchContract()
  }, [params.id, router, supabase])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BFFF]"></div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Service contract not found</p>
      </div>
    )
  }

  // Generate service schedule based on billing frequency
  const generateServiceSchedule = () => {
    const schedules = []
    const startDate = new Date(contract.start_date)
    const frequency = contract.billing_frequency

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December']

    if (frequency === 'quarterly') {
      for (let i = 0; i < 4; i++) {
        const serviceDate = new Date(startDate)
        serviceDate.setMonth(startDate.getMonth() + (i * 3))
        schedules.push({
          period: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Servicing`,
          date: `${months[serviceDate.getMonth()]} ${serviceDate.getFullYear()}`
        })
      }
    } else if (frequency === 'monthly') {
      for (let i = 0; i < 12; i++) {
        const serviceDate = new Date(startDate)
        serviceDate.setMonth(startDate.getMonth() + i)
        schedules.push({
          period: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Servicing`,
          date: `${months[serviceDate.getMonth()]} ${serviceDate.getFullYear()}`
        })
      }
    } else {
      // bi-annually
      for (let i = 0; i < 2; i++) {
        const serviceDate = new Date(startDate)
        serviceDate.setMonth(startDate.getMonth() + (i * 6))
        schedules.push({
          period: `${i + 1}${i === 0 ? 'st' : 'nd'} Servicing`,
          date: `${months[serviceDate.getMonth()]} ${serviceDate.getFullYear()}`
        })
      }
    }

    return schedules
  }

  let parsedNotes: any = {}
  try {
    if (contract.notes) {
      parsedNotes = typeof contract.notes === 'string' ? JSON.parse(contract.notes) : contract.notes
    }
  } catch (e) {}

  const contractItems = (contract as any).items || []
  const subtotal = contractItems.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price) - (item.discount || 0), 0)

  const contractData = {
    contract_number: contract.contract_number,
    date: new Date(contract.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    payment_terms: parsedNotes.payment_terms || 'As per agreement',
    service_description: contract.title || 'PREDICTIVE MAINTENANCE SERVICE CONTRACT FOR AIR CONDITIONER MAINTENANCE',
    contract_type: 'SERVICE CONTRACT',
    schedule_frequency: contract.billing_frequency === 'quarterly' 
      ? 'Quarterly (4 Times Yearly)' 
      : contract.billing_frequency === 'monthly'
      ? 'Monthly (12 Times Yearly)'
      : 'Bi-Annually (2 Times Yearly)',
    client: {
      name: parsedNotes.contact_person || contract.clients?.contact_name || 'Client',
      company: contract.clients?.company_name || '',
      address: parsedNotes.address || contract.clients?.address || '',
      city: contract.clients?.city || ''
    },
    items: contractItems.map((item: any) => ({
      description: item.description,
      qty: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount || 0,
      amount: (item.quantity * item.unit_price) - (item.discount || 0)
    })),
    subtotal: subtotal,
    total: subtotal,
    service_schedule: generateServiceSchedule(),
    ark_representative: parsedNotes.ark_representative || 'Suzanne Gordon',
    ark_position: parsedNotes.ark_position || 'Director',
    customer_representative: parsedNotes.customer_representative || '',
    customer_position: parsedNotes.customer_position || '',
    scopeOfWork: parsedNotes.scope_of_work,
    scopeOfWorkPoints: parsedNotes.scope_of_work_points
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between print:hidden">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/service-contracts')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Service Contracts
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button className="gap-2 bg-[#00BFFF] hover:bg-[#00BFFF]/90">
            <Send className="h-4 w-4" />
            Send to Client
          </Button>
        </div>
      </div>

      {/* Service Contract Template */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <ServiceContractTemplate ref={templateRef} data={contractData} />
      </div>
    </div>
  )
}
