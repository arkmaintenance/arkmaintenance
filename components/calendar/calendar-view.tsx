'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'

interface CalendarItem {
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

interface CalendarViewProps {
  items: CalendarItem[]
  mode: 'jobs' | 'appointments'
}

const entryPalettes = [
  'border-[#00BFFF]/35 bg-[#00BFFF]/10 hover:bg-[#00BFFF]/16',
  'border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/16',
  'border-amber-500/35 bg-amber-500/10 hover:bg-amber-500/16',
  'border-fuchsia-500/35 bg-fuchsia-500/10 hover:bg-fuchsia-500/16',
  'border-violet-500/35 bg-violet-500/10 hover:bg-violet-500/16',
  'border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/16',
  'border-cyan-500/35 bg-cyan-500/10 hover:bg-cyan-500/16',
  'border-lime-500/35 bg-lime-500/10 hover:bg-lime-500/16',
]

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
}

const appointmentStatusColors: Record<string, string> = {
  pending: 'bg-amber-500',
  scheduled: 'bg-emerald-500',
  'in-progress': 'bg-cyan-500',
  completed: 'bg-slate-500',
  cancelled: 'bg-red-500',
}

function getEntryPalette(key: string) {
  let hash = 0
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0
  }

  return entryPalettes[hash % entryPalettes.length]
}

export function CalendarView({ items, mode }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const router = useRouter()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function getItemsForDate(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return items.filter((item) => item.scheduled_date === dateStr)
  }

  function openItemDetail(itemId: string) {
    router.push(`/admin/jobs/${itemId}`)
  }

  const today = new Date()
  const isToday = (day: number) => 
    day === today.getDate() && 
    month === today.getMonth() && 
    year === today.getFullYear()

  // Generate calendar grid
  const calendarDays = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-foreground">
          {monthNames[month]} {year}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth} className="border-border">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentDate(new Date())}
            className="border-border text-foreground"
          >
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="border-border">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayItems = day ? getItemsForDate(day) : []
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 rounded-lg border ${
                  day 
                    ? isToday(day)
                      ? 'border-[#00BFFF] bg-[#00BFFF]/5'
                      : 'border-border bg-secondary/20 hover:bg-secondary/40'
                    : 'border-transparent'
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday(day) ? 'text-[#00BFFF]' : 'text-foreground'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayItems.slice(0, 3).map((item) => {
                        const indicatorClass =
                          mode === 'appointments'
                            ? appointmentStatusColors[item.status] || appointmentStatusColors.scheduled
                            : priorityColors[item.priority] || priorityColors.medium
                        const entryPaletteClass = getEntryPalette(`${mode}-${item.id}-${item.title}`)

                        return (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          className={`rounded border p-1.5 text-xs transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#00BFFF] ${entryPaletteClass}`}
                          onClick={() => openItemDetail(item.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              openItemDetail(item.id)
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${indicatorClass}`} />
                            <span className="truncate text-foreground">{item.title}</span>
                          </div>
                          {item.clients?.company_name || item.clients?.contact_name ? (
                            <div className="truncate text-[11px] text-muted-foreground mt-0.5">
                              {item.clients?.company_name || item.clients?.contact_name}
                            </div>
                          ) : null}
                          {item.scheduled_time && (
                            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                              <Clock className="h-3 w-3" />
                              {item.scheduled_time}
                            </div>
                          )}
                        </div>
                        )
                      })}
                      {dayItems.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayItems.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            {mode === 'appointments' ? 'Status:' : 'Priority:'}
          </span>
          {Object.entries(mode === 'appointments' ? appointmentStatusColors : priorityColors).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-sm text-muted-foreground capitalize">{label.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
