'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  downloadServiceContractPdf,
  generateServiceContractPdf,
  printServiceContractPdf,
} from '@/lib/client-pdf-download'
import { buildServiceContractPdfData } from '@/lib/service-contracts/pdf-data'
import { EditServiceContractForm } from '@/components/service-contracts/edit-service-contract-form'
import { Button } from '@/components/ui/button'
import {
  buildServiceContractFormValues,
  buildServiceContractNotesPayload,
  ServiceContractClientOption,
  ServiceContractFormValues,
  calculateServiceContractTotal,
  computeServiceContractEndDate,
} from '@/lib/service-contracts/form-data'
import { ArrowLeft, Printer, Download, Pencil, Send } from 'lucide-react'
import { toast } from 'sonner'

interface ServiceContract {
  id: string
  client_id: string | null
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
  const searchParams = useSearchParams()
  const contractId = Array.isArray(params.id) ? params.id[0] : params.id
  const [contract, setContract] = useState<ServiceContract | null>(null)
  const [clients, setClients] = useState<ServiceContractClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormValues, setEditFormValues] = useState<ServiceContractFormValues | null>(null)
  const [saving, setSaving] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [printingPdf, setPrintingPdf] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchContract() {
      if (!contractId) {
        toast.error('Invalid service contract')
        router.push('/admin/service-contracts')
        return
      }

      const [{ data, error }, { data: clientsData }] = await Promise.all([
        supabase
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
          .eq('id', contractId)
          .single(),
        supabase
          .from('clients')
          .select('id, contact_name, company_name, address, city, parish')
          .order('company_name'),
      ])

      if (error || !data) {
        toast.error('Failed to load service contract')
        router.push('/admin/service-contracts')
        return
      }

      setContract(data)
      setClients((clientsData || []) as ServiceContractClientOption[])
      setEditFormValues(buildServiceContractFormValues(data as any))
      setLoading(false)
    }

    fetchContract()
  }, [contractId, router, supabase])

  useEffect(() => {
    if (searchParams.get('edit') === '1' && editFormValues) {
      setIsEditing(true)
    }
  }, [editFormValues, searchParams])

  const pdfData = useMemo(
    () => (contract ? buildServiceContractPdfData(contract as any) : null),
    [contract]
  )

  useEffect(() => {
    if (!contract || !pdfData) {
      return
    }

    let cancelled = false

    async function generatePreview() {
      setGeneratingPdf(true)
      setPdfError(null)

      try {
        const result = await generateServiceContractPdf(pdfData)
        if (!cancelled) {
          setPdfBase64(result.pdfBase64)
        }
      } catch (error) {
        if (!cancelled) {
          setPdfError(error instanceof Error ? error.message : 'Failed to generate service contract PDF preview')
        }
      } finally {
        if (!cancelled) {
          setGeneratingPdf(false)
        }
      }
    }

    generatePreview()

    return () => {
      cancelled = true
    }
  }, [contract, pdfData])

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

  async function handlePrint() {
    if (!pdfData) return
    setPrintingPdf(true)

    try {
      await printServiceContractPdf(pdfData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to print service contract PDF')
    } finally {
      setPrintingPdf(false)
    }
  }

  async function handleDownloadPdf() {
    if (!pdfData) return
    setDownloadingPdf(true)

    try {
      const safeFileName = `Service-Contract-${pdfData.contract_number}.pdf`
      await downloadServiceContractPdf(pdfData, safeFileName)
      toast.success('Service contract PDF downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download service contract PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  function clearEditQueryIfNeeded() {
    if (contractId && searchParams.get('edit') === '1') {
      router.replace(`/admin/service-contracts/${contractId}`)
    }
  }

  function handleStartEdit() {
    if (!contract) return

    setEditFormValues(buildServiceContractFormValues(contract as any))
    setIsEditing(true)
  }

  function handleCancelEdit() {
    if (contract) {
      setEditFormValues(buildServiceContractFormValues(contract as any))
    }

    setIsEditing(false)
    clearEditQueryIfNeeded()
  }

  async function handleSave(values: ServiceContractFormValues) {
    if (!contract) return

    const lineItems = values.lineItems
      .map((item) => ({
        ...item,
        description: item.description.trim(),
      }))
      .filter((item) => item.description)

    if (lineItems.length === 0) {
      toast.error('Add at least one line item before saving')
      return
    }

    setSaving(true)

    const startDate = values.startDate || new Date().toISOString().split('T')[0]
    const totalAmount = calculateServiceContractTotal(lineItems)

    const { error: updateError } = await supabase
      .from('service_contracts')
      .update({
        client_id: values.clientId || null,
        title: values.serviceDescription || 'Service Contract',
        amount: totalAmount,
        billing_frequency: values.recurringSchedule,
        status: values.status,
        start_date: startDate,
        end_date: computeServiceContractEndDate(startDate),
        notes: JSON.stringify(
          buildServiceContractNotesPayload({
            ...values,
            startDate,
            lineItems,
          })
        ),
      })
      .eq('id', contract.id)

    if (updateError) {
      toast.error(updateError.message || 'Failed to update service contract')
      setSaving(false)
      return
    }

    const { data: refreshedContract, error: reloadError } = await supabase
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
      .eq('id', contract.id)
      .single()

    if (reloadError || !refreshedContract) {
      toast.error(reloadError?.message || 'Service contract saved, but refresh failed')
      setSaving(false)
      return
    }

    setContract(refreshedContract)
    setEditFormValues(buildServiceContractFormValues(refreshedContract as any))
    setIsEditing(false)
    clearEditQueryIfNeeded()
    toast.success('Service contract updated successfully')
    setSaving(false)
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
          {!isEditing && (
            <>
              <Button variant="outline" onClick={handleStartEdit} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Contract
              </Button>
              <Button variant="outline" onClick={handlePrint} className="gap-2" disabled={printingPdf || generatingPdf}>
                <Printer className="h-4 w-4" />
                {printingPdf ? 'Printing...' : 'Print'}
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleDownloadPdf} disabled={downloadingPdf || generatingPdf}>
                <Download className="h-4 w-4" />
                {downloadingPdf ? 'Downloading...' : 'Download PDF'}
              </Button>
              <Button className="gap-2 bg-[#00BFFF] hover:bg-[#00BFFF]/90">
                <Send className="h-4 w-4" />
                Send to Client
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing && editFormValues && (
        <EditServiceContractForm
          contractNumber={contract.contract_number}
          initialValues={editFormValues}
          clients={clients}
          saving={saving}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Service Contract PDF Preview */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[75vh]">
        {generatingPdf ? (
          <div className="flex min-h-[75vh] items-center justify-center">
            <div className="text-center space-y-3">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[#00BFFF]" />
              <p className="text-sm text-muted-foreground">Generating service contract PDF preview...</p>
            </div>
          </div>
        ) : pdfError ? (
          <div className="flex min-h-[75vh] items-center justify-center p-6">
            <div className="text-center space-y-3">
              <p className="text-sm font-medium text-red-500">Preview generation failed</p>
              <p className="text-sm text-muted-foreground">{pdfError}</p>
              <Button variant="outline" onClick={() => router.refresh()}>
                Retry
              </Button>
            </div>
          </div>
        ) : pdfBase64 ? (
          <iframe
            src={`data:application/pdf;base64,${pdfBase64}`}
            title={`Service Contract ${pdfData?.contract_number || contract.contract_number} PDF Preview`}
            className="h-[calc(100vh-220px)] min-h-[900px] w-full"
          />
        ) : (
          <div className="flex min-h-[75vh] items-center justify-center">
            <p className="text-sm text-muted-foreground">PDF preview will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
