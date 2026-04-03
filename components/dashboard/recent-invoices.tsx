import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  total: number
  status: string
  issued_date: string | null
  created_at: string
  clients: { contact_name: string; company_name: string | null } | null
}

interface RecentInvoicesProps {
  invoices: Invoice[]
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  sent: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  paid: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
  overdue: 'bg-red-500/20 text-red-500 border-red-500/50',
  partial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Recent Invoices</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-[#00BFFF] hover:text-[#00BFFF]/80">
          <Link href="/admin/invoices">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No invoices yet. Create your first invoice to get started.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#1a3a5c] via-[#3a2a5c] to-[#5c2a2a] border-b border-border">
                  <th className="text-left p-3 text-xs font-medium text-foreground uppercase tracking-wide">Invoice #</th>
                  <th className="text-left p-3 text-xs font-medium text-foreground uppercase tracking-wide">Client</th>
                  <th className="text-left p-3 text-xs font-medium text-foreground uppercase tracking-wide">Amount</th>
                  <th className="text-left p-3 text-xs font-medium text-foreground uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-3">
                      <Link
                        href={`/admin/invoices/${inv.id}`}
                        className="text-[#FF6B00] font-medium hover:underline text-sm"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="p-3">
                      <span className="text-[#00BFFF] text-sm">
                        {inv.clients?.company_name || inv.clients?.contact_name || '—'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-foreground font-medium text-sm">
                        JMD {Number(inv.total).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={`uppercase text-xs font-semibold ${statusColors[inv.status] || statusColors.draft}`}
                      >
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
