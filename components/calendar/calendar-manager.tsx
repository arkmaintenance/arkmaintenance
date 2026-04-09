'use client'

import { useMemo, useState } from 'react'
import { CalendarView } from '@/components/calendar/calendar-view'
import { AddAppointmentDialog } from '@/components/calendar/add-appointment-dialog'
import { AddJobDialog } from '@/components/jobs/add-job-dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CalendarRecord {
  id: string
  title: string
  status: string
  priority: string
  job_type: string
  scheduled_date: string
  scheduled_time: string | null
  clients: { contact_name: string; company_name: string | null } | null
  technicians: { name: string } | null
}

interface Client {
  id: string
  contact_name: string
  company_name: string | null
  address?: string
  city?: string
  parish?: string
}

interface Technician {
  id: string
  name: string
}

interface CalendarManagerProps {
  records: CalendarRecord[]
  clients: Client[]
  technicians: Technician[]
}

export function CalendarManager({ records, clients, technicians }: CalendarManagerProps) {
  const [activeTab, setActiveTab] = useState<'jobs' | 'appointments'>('jobs')

  const jobs = useMemo(
    () => records.filter((record) => record.job_type !== 'appointment'),
    [records]
  )
  const appointments = useMemo(
    () => records.filter((record) => record.job_type === 'appointment'),
    [records]
  )

  const copy = activeTab === 'jobs'
    ? {
        title: 'Job Calendar',
        description: 'View and manage scheduled jobs.',
        countLabel: `${jobs.length} scheduled job${jobs.length === 1 ? '' : 's'}`,
      }
    : {
        title: 'Appointment Calendar',
        description: 'View and manage scheduled appointments.',
        countLabel: `${appointments.length} scheduled appointment${appointments.length === 1 ? '' : 's'}`,
      }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'jobs' | 'appointments')}>
            <TabsList className="h-auto gap-1 border border-border bg-secondary p-1">
              <TabsTrigger value="jobs" className="px-4 data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
                Jobs
              </TabsTrigger>
              <TabsTrigger value="appointments" className="px-4 data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                Appointments
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{copy.title}</h2>
            <p className="text-muted-foreground">{copy.description}</p>
            <p className="mt-1 text-sm text-muted-foreground">{copy.countLabel}</p>
          </div>
        </div>

        <div className="shrink-0">
          {activeTab === 'jobs' ? (
            <AddJobDialog clients={clients} technicians={technicians} />
          ) : (
            <AddAppointmentDialog clients={clients} technicians={technicians} />
          )}
        </div>
      </div>

      <CalendarView
        items={activeTab === 'jobs' ? jobs : appointments}
        mode={activeTab}
      />
    </div>
  )
}
