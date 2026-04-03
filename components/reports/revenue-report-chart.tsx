'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const data = [
  { month: 'Jan', revenue: 12500, expenses: 8200 },
  { month: 'Feb', revenue: 15800, expenses: 9100 },
  { month: 'Mar', revenue: 18200, expenses: 10500 },
  { month: 'Apr', revenue: 14600, expenses: 8800 },
  { month: 'May', revenue: 21300, expenses: 12200 },
  { month: 'Jun', revenue: 19800, expenses: 11400 },
  { month: 'Jul', revenue: 23500, expenses: 13100 },
  { month: 'Aug', revenue: 25200, expenses: 14200 },
  { month: 'Sep', revenue: 22100, expenses: 12800 },
  { month: 'Oct', revenue: 27800, expenses: 15500 },
  { month: 'Nov', revenue: 29500, expenses: 16200 },
  { month: 'Dec', revenue: 32100, expenses: 17800 },
]

export function RevenueReportChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Monthly Revenue vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#666" tick={{ fill: '#888' }} />
              <YAxis stroke="#666" tick={{ fill: '#888' }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Bar dataKey="revenue" fill="#00BFFF" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#FF6B00" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-[#00BFFF]" />
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-[#FF6B00]" />
            <span className="text-sm text-muted-foreground">Expenses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
