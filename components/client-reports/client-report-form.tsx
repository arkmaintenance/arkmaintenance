'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  buildClientAddressFromClient,
  createEmptyPoint,
  createEmptySection,
  type ClientReportClientOption,
  type ClientReportDraft,
} from '@/lib/client-reports'
import { Building2, Plus, Trash2, UserSquare2 } from 'lucide-react'

interface ClientReportFormProps {
  value: ClientReportDraft
  onChange: (next: ClientReportDraft) => void
  clients: ClientReportClientOption[]
  clientsLoading?: boolean
  clientLoadError?: string | null
  onAddClientClick?: () => void
}

export function ClientReportForm({
  value,
  onChange,
  clients,
  clientsLoading = false,
  clientLoadError = null,
  onAddClientClick,
}: ClientReportFormProps) {
  function updateDraft<K extends keyof ClientReportDraft>(key: K, nextValue: ClientReportDraft[K]) {
    onChange({
      ...value,
      [key]: nextValue,
    })
  }

  function handleClientChange(clientId: string) {
    if (clientId === 'manual') {
      updateDraft('selectedClientId', '')
      return
    }

    const selectedClient = clients.find((client) => client.id === clientId)

    if (!selectedClient) {
      updateDraft('selectedClientId', '')
      return
    }

    onChange({
      ...value,
      selectedClientId: clientId,
      clientName:
        selectedClient.company_name?.trim()
        || selectedClient.contact_name?.trim()
        || value.clientName,
      contactPerson: selectedClient.contact_name?.trim() || value.contactPerson,
      address: buildClientAddressFromClient(selectedClient) || value.address,
    })
  }

  function updateSectionHeading(sectionId: string, heading: string) {
    onChange({
      ...value,
      sections: value.sections.map((section) =>
        section.id === sectionId ? { ...section, heading } : section
      ),
    })
  }

  function updatePoint(sectionId: string, pointId: string, text: string) {
    onChange({
      ...value,
      sections: value.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              points: section.points.map((point) =>
                point.id === pointId ? { ...point, text } : point
              ),
            }
          : section
      ),
    })
  }

  function addSection() {
    onChange({
      ...value,
      sections: [...value.sections, createEmptySection('Section Header')],
    })
  }

  function removeSection(sectionId: string) {
    onChange({
      ...value,
      sections:
        value.sections.length > 1
          ? value.sections.filter((section) => section.id !== sectionId)
          : value.sections,
    })
  }

  function addPoint(sectionId: string) {
    onChange({
      ...value,
      sections: value.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              points: [...section.points, createEmptyPoint()],
            }
          : section
      ),
    })
  }

  function removePoint(sectionId: string, pointId: string) {
    onChange({
      ...value,
      sections: value.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              points:
                section.points.length > 1
                  ? section.points.filter((point) => point.id !== pointId)
                  : section.points,
            }
          : section
      ),
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <UserSquare2 className="h-5 w-5 text-[#00BFFF]" />
            Report Details
          </CardTitle>
          <CardDescription>
            Use the same saved-record flow as invoices and quotations, but for client reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.reportNumber ? (
            <div className="space-y-2">
              <Label>Report Number</Label>
              <div className="rounded-md border border-[#00BFFF]/40 bg-[#00BFFF]/10 px-3 py-2 text-sm font-semibold text-[#00BFFF]">
                {value.reportNumber}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="existing-client">Existing Client</Label>
            <div className="flex gap-2">
              <Select
                value={value.selectedClientId || 'manual'}
                onValueChange={handleClientChange}
                disabled={clientsLoading}
              >
                <SelectTrigger id="existing-client" className="bg-input">
                  <SelectValue placeholder={clientsLoading ? 'Loading clients...' : 'Select client'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name || client.contact_name || 'Client'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {onAddClientClick ? (
                <Button type="button" variant="outline" onClick={onAddClientClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              ) : null}
            </div>
          </div>

          {clientLoadError ? (
            <Alert variant="destructive">
              <AlertDescription>{clientLoadError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="report-title">Report Title</Label>
              <Input
                id="report-title"
                value={value.title}
                onChange={(event) => updateDraft('title', event.target.value)}
                placeholder="Incident Report: Water Accumulation in Store Room"
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-date">Date</Label>
              <Input
                id="report-date"
                type="date"
                value={value.reportDate}
                onChange={(event) => updateDraft('reportDate', event.target.value)}
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-person">Contact Person</Label>
              <Input
                id="contact-person"
                value={value.contactPerson}
                onChange={(event) => updateDraft('contactPerson', event.target.value)}
                placeholder="Ms Khalia O'Connor"
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-name">Client / Site Name</Label>
              <Input
                id="client-name"
                value={value.clientName}
                onChange={(event) => updateDraft('clientName', event.target.value)}
                placeholder="Island Grill"
                className="bg-input"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="report-address">Address</Label>
              <Textarea
                id="report-address"
                value={value.address}
                onChange={(event) => updateDraft('address', event.target.value)}
                placeholder="2 Valentine Drive, Kingston 19"
                className="min-h-[96px] bg-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Building2 className="h-5 w-5 text-[#FF6B00]" />
                Report Sections
              </CardTitle>
              <CardDescription>
                Add multiple report section headers and multiple points under each section.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addSection}>
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.sections.map((section, sectionIndex) => (
            <div key={section.id} className="rounded-xl border border-border bg-background/70 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Section {sectionIndex + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-400"
                  onClick={() => removeSection(section.id)}
                  disabled={value.sections.length === 1}
                  title="Remove section"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`section-heading-${section.id}`}>Section Header</Label>
                <Input
                  id={`section-heading-${section.id}`}
                  value={section.heading}
                  onChange={(event) => updateSectionHeading(section.id, event.target.value)}
                  placeholder="Observation"
                  className="bg-input"
                />
              </div>

              <div className="mt-4 space-y-3">
                {section.points.map((point, pointIndex) => (
                  <div key={point.id} className="rounded-lg border border-border/70 bg-card p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <Label htmlFor={`point-${point.id}`}>Point {pointIndex + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-400"
                        onClick={() => removePoint(section.id, point.id)}
                        disabled={section.points.length === 1}
                        title="Remove point"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      id={`point-${point.id}`}
                      value={point.text}
                      onChange={(event) => updatePoint(section.id, point.id, event.target.value)}
                      placeholder="Enter the report point exactly as it should appear in the client report."
                      className="min-h-[84px] bg-input"
                    />
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => addPoint(section.id)}
              >
                <Plus className="h-4 w-4" />
                Add Point
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
