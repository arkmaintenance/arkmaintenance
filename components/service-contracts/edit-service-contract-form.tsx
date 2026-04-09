'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Minus, Plus, Save, Trash2, X } from 'lucide-react'
import {
  SERVICE_CONTRACT_PAYMENT_TERMS,
  SERVICE_CONTRACT_LOCATIONS,
  SERVICE_CONTRACT_RECURRING_OPTIONS,
  SERVICE_CONTRACT_SCOPE_OPTIONS,
  SERVICE_CONTRACT_STATUS_OPTIONS,
  SERVICE_CONTRACT_TIMELINE_OPTIONS,
  ServiceContractClientOption,
  ServiceContractFormValues,
  calculateServiceContractLineTotal,
  calculateServiceContractTotal,
  createEmptyServiceContractLineItem,
} from '@/lib/service-contracts/form-data'

interface EditServiceContractFormProps {
  contractNumber: string
  initialValues: ServiceContractFormValues
  clients: ServiceContractClientOption[]
  saving: boolean
  onSave: (values: ServiceContractFormValues) => void
  onCancel: () => void
}

type LineItemField = 'description' | 'quantity' | 'unit_price' | 'discount'

function toNumber(value: string | number) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function EditServiceContractForm({
  contractNumber,
  initialValues,
  clients,
  saving,
  onSave,
  onCancel,
}: EditServiceContractFormProps) {
  const [values, setValues] = useState<ServiceContractFormValues>(initialValues)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const totalAmount = useMemo(
    () => calculateServiceContractTotal(values.lineItems),
    [values.lineItems]
  )

  const sortedClients = useMemo(
    () =>
      [...clients].sort((left, right) =>
        String(left.company_name || left.contact_name || '').localeCompare(
          String(right.company_name || right.contact_name || '')
        )
      ),
    [clients]
  )

  const selectedScopePointCount = values.scopeOfWork
    ? SERVICE_CONTRACT_SCOPE_OPTIONS[values.scopeOfWork]?.length ?? 0
    : 0

  function updateValue<K extends keyof ServiceContractFormValues>(
    key: K,
    nextValue: ServiceContractFormValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [key]: nextValue,
    }))
  }

  function updateLineItem(id: string, field: LineItemField, nextValue: string | number) {
    setValues((current) => ({
      ...current,
      lineItems: current.lineItems.map((item) => {
        if (item.id !== id) return item

        const nextItem = {
          ...item,
          [field]:
            field === 'description'
              ? String(nextValue)
              : field === 'quantity'
              ? Math.max(1, toNumber(nextValue))
              : Math.max(0, toNumber(nextValue)),
        }

        return {
          ...nextItem,
          total: calculateServiceContractLineTotal(nextItem),
        }
      }),
    }))
  }

  function addLineItem() {
    setValues((current) => ({
      ...current,
      lineItems: [...current.lineItems, createEmptyServiceContractLineItem()],
    }))
  }

  function removeLineItem(id: string) {
    setValues((current) => ({
      ...current,
      lineItems:
        current.lineItems.length > 1
          ? current.lineItems.filter((item) => item.id !== id)
          : current.lineItems,
    }))
  }

  function handleClientChange(clientId: string) {
    if (clientId === 'manual') {
      updateValue('clientId', '')
      return
    }

    const client = clients.find((item) => item.id === clientId)

    setValues((current) => ({
      ...current,
      clientId,
      contactPerson: client?.contact_name || current.contactPerson,
      serviceLocation: client?.parish || current.serviceLocation,
      address:
        [client?.address, client?.city, client?.parish].filter(Boolean).join(', ') ||
        current.address,
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      ...values,
      lineItems: values.lineItems.map((item) => ({
        ...item,
        total: calculateServiceContractLineTotal(item),
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Edit Service Contract</h2>
          <p className="text-sm text-muted-foreground">
            {contractNumber}
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Preview updates after save
          </p>
          <p className="text-lg font-semibold text-[#FF6B00]">
            JMD {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="space-y-6 px-6 py-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={values.clientId || 'manual'} onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual / no linked client</SelectItem>
                {sortedClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.company_name || client.contact_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Contact Person</Label>
            <Input
              value={values.contactPerson}
              onChange={(event) => updateValue('contactPerson', event.target.value)}
              placeholder="Contact person"
            />
          </div>

          <div className="space-y-2">
            <Label>Service Location</Label>
            <Input
              list="service-contract-locations"
              value={values.serviceLocation}
              onChange={(event) => updateValue('serviceLocation', event.target.value)}
              placeholder="Service location"
            />
            <datalist id="service-contract-locations">
              {SERVICE_CONTRACT_LOCATIONS.map((location) => (
                <option key={location} value={location} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Textarea
            value={values.address}
            onChange={(event) => updateValue('address', event.target.value)}
            placeholder="Address"
            className="min-h-[84px]"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Payment Terms</Label>
            <Select value={values.paymentTerms} onValueChange={(value) => updateValue('paymentTerms', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CONTRACT_PAYMENT_TERMS.map((term) => (
                  <SelectItem key={term} value={term}>
                    {term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>PO Number</Label>
            <Input
              value={values.poNumber}
              onChange={(event) => updateValue('poNumber', event.target.value)}
              placeholder="PO number"
            />
          </div>

          <div className="space-y-2">
            <Label>TRN</Label>
            <Input
              value={values.trn}
              onChange={(event) => updateValue('trn', event.target.value)}
              placeholder="TRN"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Contract Title / Service Description</Label>
          <Input
            value={values.serviceDescription}
            onChange={(event) => updateValue('serviceDescription', event.target.value)}
            placeholder="Contract title exactly as it should appear on the PDF"
          />
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
              <p className="text-xs text-muted-foreground">Edit the charges shown in the service contract PDF.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {values.lineItems.map((item, index) => (
              <div key={item.id} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[minmax(0,1fr)_100px_140px_120px_120px_48px]">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(event) => updateLineItem(item.id, 'description', event.target.value)}
                    placeholder={`Line item ${index + 1}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Qty</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => updateLineItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => updateLineItem(item.id, 'quantity', event.target.value)}
                      className="text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min={0}
                    value={item.unit_price}
                    onChange={(event) => updateLineItem(item.id, 'unit_price', event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    min={0}
                    value={item.discount}
                    onChange={(event) => updateLineItem(item.id, 'discount', event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="flex h-9 items-center rounded-md border border-border bg-muted/40 px-3 text-sm font-semibold text-[#FF6B00]">
                    JMD {calculateServiceContractLineTotal(item).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </div>
                </div>

                <div className="flex items-end justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-500 hover:text-red-400"
                    onClick={() => removeLineItem(item.id)}
                    disabled={values.lineItems.length === 1}
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Job Completion Timeline</Label>
            <Input
              list="service-contract-timelines"
              value={values.jobTimeline}
              onChange={(event) => updateValue('jobTimeline', event.target.value)}
              placeholder="Timeline"
            />
            <datalist id="service-contract-timelines">
              {SERVICE_CONTRACT_TIMELINE_OPTIONS.map((timeline) => (
                <option key={timeline} value={timeline} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label>Recurring Schedule</Label>
            <Select
              value={values.recurringSchedule}
              onValueChange={(value) => updateValue('recurringSchedule', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CONTRACT_RECURRING_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={values.startDate}
              onChange={(event) => updateValue('startDate', event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={values.status} onValueChange={(value) => updateValue('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CONTRACT_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border border-[#00BFFF]/20 bg-[#00BFFF]/5 p-4">
          <div className="flex items-start gap-3">
            <Switch
              checked={values.isServiceContract}
              onCheckedChange={(checked) => updateValue('isServiceContract', checked)}
              className="mt-0.5 data-[state=checked]:bg-[#00BFFF]"
            />
            <div>
              <Label className="text-sm font-medium text-foreground">Service contract PDF layout enabled</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Keep this enabled to preserve the service contract PDF structure.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Scope of Work</Label>
          <Select value={values.scopeOfWork || 'none'} onValueChange={(value) => updateValue('scopeOfWork', value === 'none' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select scope of work" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None / custom</SelectItem>
              {Object.keys(SERVICE_CONTRACT_SCOPE_OPTIONS).map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedScopePointCount > 0 && (
            <p className="text-xs text-[#FF6B00]">
              {selectedScopePointCount} scope points will be included in the PDF.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={values.notes}
            onChange={(event) => updateValue('notes', event.target.value)}
            placeholder="Notes"
            className="min-h-[96px]"
          />
        </div>

        <div className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>ARK Representative</Label>
            <Input
              value={values.arkRepresentative}
              onChange={(event) => updateValue('arkRepresentative', event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>ARK Position</Label>
            <Input
              value={values.arkPosition}
              onChange={(event) => updateValue('arkPosition', event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Customer Representative</Label>
            <Input
              value={values.customerRepresentative}
              onChange={(event) => updateValue('customerRepresentative', event.target.value)}
              placeholder="Customer representative"
            />
          </div>

          <div className="space-y-2">
            <Label>Customer Position</Label>
            <Input
              value={values.customerPosition}
              onChange={(event) => updateValue('customerPosition', event.target.value)}
              placeholder="Customer position"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
        <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="gap-2 bg-[#FF6B00] hover:bg-[#FF6B00]/90">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
