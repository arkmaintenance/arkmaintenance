'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface Invoice {
  id: string
  status: string
  total: number
}

interface InvoiceStatusProps {
  invoices: Invoice[]
}

export function InvoiceStatus({ invoices }: InvoiceStatusProps) {
  // Calculate status counts
  const statusCounts = invoices.reduce((acc, inv) => {
    const status = inv.status || 'draft'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const data = [
    { name: 'Paid', value: statusCounts.paid || 0, color: '#10B981' },
    { name: 'Sent', value: statusCounts.sent || 0, color: '#00BFFF' },
    { name: 'Overdue', value: statusCounts.overdue || 0, color: '#EF4444' },
    { name: 'Draft', value: statusCounts.draft || 0, color: '#6B7280' },
  ].filter(item => item.value > 0)

  // If no data, show placeholder
  if (data.length === 0) {
    data.push({ name: 'No Invoices', value: 1, color: '#333' })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Invoice Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
