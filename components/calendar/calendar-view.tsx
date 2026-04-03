'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'

interface Job {
  id: string
  title: string
  status: string
  priority: string
  scheduled_date: string
  scheduled_time: string | null
  clients: { contact_name: string; company_name: string | null } | null
  technicians: { name: string } | null
}

interface CalendarViewProps {
  jobs: Job[]
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
}

export function CalendarView({ jobs }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

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

  function getJobsForDate(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return jobs.filter(job => job.scheduled_date === dateStr)
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
            const dayJobs = day ? getJobsForDate(day) : []
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
                      {dayJobs.slice(0, 3).map(job => (
                        <div
                          key={job.id}
                          className="p-1 rounded text-xs bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${priorityColors[job.priority]}`} />
                            <span className="truncate text-foreground">{job.title}</span>
                          </div>
                          {job.scheduled_time && (
                            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                              <Clock className="h-3 w-3" />
                              {job.scheduled_time}
                            </div>
                          )}
                        </div>
                      ))}
                      {dayJobs.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayJobs.length - 3} more
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
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Priority:</span>
          {Object.entries(priorityColors).map(([priority, color]) => (
            <div key={priority} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-sm text-muted-foreground capitalize">{priority}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
