import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { ExpensesTable } from '@/components/expenses/expenses-table'
import { AddExpenseDialog } from '@/components/expenses/add-expense-dialog'

export default async function ExpensesPage() {
  const supabase = await createClient()
  
  const [
    { data: expenses },
    { data: invoices },
    { data: quotations },
  ] = await Promise.all([
    supabase.from('expenses').select('*').order('date', { ascending: false }),
    supabase.from('invoices').select('id, invoice_number').order('created_at', { ascending: false }),
    supabase.from('quotations').select('id, quote_number').order('created_at', { ascending: false }),
  ])

  // Calculate totals
  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
  const pendingExpenses = expenses?.filter(e => e.status === 'pending').reduce((sum, exp) => sum + Number(exp.amount), 0) || 0

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Expenses" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Expense Tracking</h2>
            <p className="text-muted-foreground">
              Track and manage business expenses.
            </p>
          </div>
          <AddExpenseDialog invoices={invoices || []} quotations={quotations || []} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-[#FF6B00]">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-500">
              ${pendingExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-[#00BFFF]">
              ${expenses?.filter(e => {
                const expDate = new Date(e.date)
                const now = new Date()
                return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
              }).reduce((sum, exp) => sum + Number(exp.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
        </div>

        <ExpensesTable expenses={expenses || []} />
      </div>
    </div>
  )
}
