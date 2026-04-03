import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface Job {
  id: string
  title: string
  status: string
  scheduled_date: string | null
  clients: { contact_name: string; company_name: string | null } | null
  technicians: { name: string } | null
}

interface RecentJobsProps {
  jobs: Job[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
  scheduled: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  'in-progress': 'bg-purple-500/20 text-purple-500 border-purple-500/50',
  completed: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
  cancelled: 'bg-red-500/20 text-red-500 border-red-500/50',
}

export function RecentJobs({ jobs }: RecentJobsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Recent Jobs</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-[#00BFFF] hover:text-[#00BFFF]/80">
          <Link href="/admin/jobs">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No jobs yet. Create your first job to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{job.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.clients?.company_name || job.clients?.contact_name || 'No client'}
                    {job.technicians?.name && ` • ${job.technicians.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {job.scheduled_date && (
                    <span className="text-sm text-muted-foreground">
                      {new Date(job.scheduled_date).toLocaleDateString()}
                    </span>
                  )}
                  <Badge variant="outline" className={statusColors[job.status] || statusColors.pending}>
                    {job.status}
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
