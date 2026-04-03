import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar } from 'lucide-react'

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  medium: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
  high: 'bg-orange-500/20 text-orange-500 border-orange-500/50',
  urgent: 'bg-red-500/20 text-red-500 border-red-500/50',
}

export async function UpcomingJobs() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, clients(contact_name, company_name)')
    .gte('scheduled_date', today)
    .in('status', ['pending', 'scheduled'])
    .order('scheduled_date', { ascending: true })
    .limit(5)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Upcoming Jobs</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-[#00BFFF] hover:text-[#00BFFF]/80">
          <Link href="/admin/calendar">
            View Calendar <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!jobs || jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming jobs scheduled.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#00BFFF]/10 p-2">
                    <Calendar className="h-4 w-4 text-[#00BFFF]" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.clients?.company_name || job.clients?.contact_name || 'No client'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {job.scheduled_date && new Date(job.scheduled_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.scheduled_time || 'Time TBD'}
                    </p>
                  </div>
                  <Badge variant="outline" className={priorityColors[job.priority] || priorityColors.medium}>
                    {job.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
