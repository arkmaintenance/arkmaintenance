import { useState } from 'react'
import {
  createEmptySection,
  createId,
  type IncidentReportDraft,
  type IncidentReportSection,
} from '@/lib/incident-reports'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus, GripVertical } from 'lucide-react'

interface IncidentReportFormProps {
  value: IncidentReportDraft
  onChange: (value: IncidentReportDraft) => void
  clients?: { id: string; contact_name?: string | null; company_name?: string | null; address?: string | null }[]
}

export function IncidentReportForm({ value, onChange, clients }: IncidentReportFormProps) {
  const handleChange = (field: keyof IncidentReportDraft, newValue: any) => {
    onChange({ ...value, [field]: newValue })
  }

  const handleAddSection = () => {
    const next = [...value.sections, createEmptySection('New Section')]
    handleChange('sections', next)
  }

  const handleRemoveSection = (sectionId: string) => {
    const next = value.sections.filter((s) => s.id !== sectionId)
    handleChange('sections', next)
  }

  const handleSectionHeadingChange = (sectionId: string, heading: string) => {
    const next = value.sections.map((s) => (s.id === sectionId ? { ...s, heading } : s))
    handleChange('sections', next)
  }

  const handleAddPoint = (sectionId: string) => {
    const next = value.sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          points: [...s.points, { id: createId(), text: '' }],
        }
      }
      return s
    })
    handleChange('sections', next)
  }

  const handlePointChange = (sectionId: string, pointId: string, text: string) => {
    const next = value.sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          points: s.points.map((p) => (p.id === pointId ? { ...p, text } : p)),
        }
      }
      return s
    })
    handleChange('sections', next)
  }

  const handleRemovePoint = (sectionId: string, pointId: string) => {
    const next = value.sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          points: s.points.filter((p) => p.id !== pointId),
        }
      }
      return s
    })
    handleChange('sections', next)
  }

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="client-select">Select Existing Client (Optional)</Label>
          <select 
            id="client-select" 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            onChange={(e) => {
              const client = clients?.find(c => c.id === e.target.value)
              if (client) {
                onChange({
                  ...value,
                  selectedClientId: client.id,
                  clientName: client.company_name || client.contact_name || '',
                  contactPerson: client.contact_name || '',
                  address: [client.address, client.city, client.parish].filter(Boolean).join(', ')
                })
              }
            }}
          >
            <option value="">Select a client...</option>
            {clients?.map(c => (
              <option key={c.id} value={c.id}>{c.company_name || c.contact_name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Report Title</Label>
          <Input 
            id="title" 
            value={value.title} 
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g. WATER ACCUMULATION IN STORE ROOM"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Report Date</Label>
          <Input 
            id="date" 
            type="date" 
            value={value.reportDate} 
            onChange={(e) => handleChange('reportDate', e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Prepared For (Contact Name)</Label>
          <Input 
            id="contact" 
            value={value.contactPerson} 
            onChange={(e) => handleChange('contactPerson', e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client">Client / Company Name</Label>
          <Input 
            id="client" 
            value={value.clientName} 
            onChange={(e) => handleChange('clientName', e.target.value)} 
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input 
            id="address" 
            value={value.address} 
            onChange={(e) => handleChange('address', e.target.value)} 
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Report Sections</h3>
          <Button onClick={handleAddSection} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Section
          </Button>
        </div>

        {value.sections.map((section, sIdx) => (
          <Card key={section.id} className="relative group">
            <CardContent className="pt-6">
              <div className="flex gap-4 items-start mb-4">
                <div className="flex-1 space-y-2">
                  <Label>Section Heading</Label>
                  <Input 
                    value={section.heading} 
                    onChange={(e) => handleSectionHeadingChange(section.id, e.target.value)}
                    className="font-bold text-[#19459a]"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-8"
                  onClick={() => handleRemoveSection(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 ml-6 border-l-2 border-slate-100 pl-6">
                <Label>Points</Label>
                {section.points.map((point) => (
                  <div key={point.id} className="flex gap-2">
                    <Input 
                      value={point.text} 
                      onChange={(e) => handlePointChange(section.id, point.id, e.target.value)}
                      placeholder="Enter details..."
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleRemovePoint(section.id, point.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  onClick={() => handleAddPoint(section.id)} 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-slate-500"
                >
                  <Plus className="h-4 w-4" /> Add Point
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
