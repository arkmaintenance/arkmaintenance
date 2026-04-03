'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  FileText, 
  ClipboardList, 
  FileCheck, 
  Download,
  Eye,
  Printer,
  Filter
} from 'lucide-react'

interface Client {
  id: string
  company_name: string | null
  contact_name: string
}

interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  total: number
  status: string
  issued_date: string
  clients?: Client
}

interface Quotation {
  id: string
  quote_number: string
  client_id: string
  total: number
  status: string
  created_at: string
  clients?: Client
}

interface ServiceContract {
  id: string
  contract_number: string
  client_id: string
  amount: number
  status: string
  start_date: string
  end_date: string
  clients?: Client
}

export default function ClientReportsPage() {
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [contracts, setContracts] = useState<ServiceContract[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    
    const [clientsRes, invoicesRes, quotationsRes, contractsRes] = await Promise.all([
      supabase.from('clients').select('*').order('company_name'),
      supabase.from('invoices').select('*, clients(*)').order('issued_date', { ascending: false }),
      supabase.from('quotations').select('*, clients(*)').order('created_at', { ascending: false }),
      supabase.from('service_contracts').select('*, clients(*)').order('start_date', { ascending: false }),
    ])

    if (clientsRes.data) setClients(clientsRes.data)
    if (invoicesRes.data) setInvoices(invoicesRes.data)
    if (quotationsRes.data) setQuotations(quotationsRes.data)
    if (contractsRes.data) setContracts(contractsRes.data)
    
    setLoading(false)
  }

  const filteredInvoices = invoices.filter(inv => {
    const matchesClient = selectedClient === 'all' || inv.client_id === selectedClient
    const matchesSearch = searchQuery === '' || 
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clients?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clients?.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesClient && matchesSearch
  })

  const filteredQuotations = quotations.filter(q => {
    const matchesClient = selectedClient === 'all' || q.client_id === selectedClient
    const matchesSearch = searchQuery === '' || 
      q.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.clients?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.clients?.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesClient && matchesSearch
  })

  const filteredContracts = contracts.filter(c => {
    const matchesClient = selectedClient === 'all' || c.client_id === selectedClient
    const matchesSearch = searchQuery === '' || 
      c.contract_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clients?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clients?.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesClient && matchesSearch
  })

  // Calculate client-specific stats
  const clientStats = selectedClient !== 'all' ? {
    totalInvoices: filteredInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0),
    totalQuotations: filteredQuotations.reduce((sum, q) => sum + Number(q.total || 0), 0),
    activeContracts: filteredContracts.filter(c => c.status === 'active').length,
    totalContractValue: filteredContracts.reduce((sum, c) => sum + Number(c.amount || 0), 0),
  } : null

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-500/20 text-green-400',
      sent: 'bg-blue-500/20 text-blue-400',
      draft: 'bg-gray-500/20 text-gray-400',
      overdue: 'bg-red-500/20 text-red-400',
      approved: 'bg-green-500/20 text-green-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      active: 'bg-green-500/20 text-green-400',
      expired: 'bg-red-500/20 text-red-400',
    }
    return (
      <Badge className={colors[status] || 'bg-gray-500/20 text-gray-400'}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader title="Client Reports" />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter by:</span>
              </div>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[250px] bg-input border-border">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name || client.contact_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Summary Stats */}
        {clientStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-[#1a5f4a] to-[#0d3d2e] border-0">
              <CardContent className="p-4">
                <p className="text-sm text-gray-300">Total Invoiced</p>
                <p className="text-2xl font-bold text-white">
                  JMD {clientStats.totalInvoices.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#1a4a5f] to-[#0d2e3d] border-0">
              <CardContent className="p-4">
                <p className="text-sm text-gray-300">Total Quoted</p>
                <p className="text-2xl font-bold text-white">
                  JMD {clientStats.totalQuotations.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#5f4a1a] to-[#3d2e0d] border-0">
              <CardContent className="p-4">
                <p className="text-sm text-gray-300">Active Contracts</p>
                <p className="text-2xl font-bold text-white">{clientStats.activeContracts}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#FF6B00] to-[#cc5500] border-0">
              <CardContent className="p-4">
                <p className="text-sm text-gray-300">Contract Value</p>
                <p className="text-2xl font-bold text-white">
                  JMD {clientStats.totalContractValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabbed Content */}
        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="invoices" className="data-[state=active]:bg-[#00BFFF]/20 data-[state=active]:text-[#00BFFF]">
              <FileText className="h-4 w-4 mr-2" />
              Invoices ({filteredInvoices.length})
            </TabsTrigger>
            <TabsTrigger value="quotations" className="data-[state=active]:bg-[#00BFFF]/20 data-[state=active]:text-[#00BFFF]">
              <ClipboardList className="h-4 w-4 mr-2" />
              Quotations ({filteredQuotations.length})
            </TabsTrigger>
            <TabsTrigger value="contracts" className="data-[state=active]:bg-[#00BFFF]/20 data-[state=active]:text-[#00BFFF]">
              <FileCheck className="h-4 w-4 mr-2" />
              Service Contracts ({filteredContracts.length})
            </TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card className="bg-card border-border">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg">Invoices</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gradient-to-r from-[#1a3a5c] via-[#4a3a5c] to-[#5c3a3a]">
                        <th className="text-left p-4 text-sm font-medium text-foreground">Invoice #</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Client</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Date</th>
                        <th className="text-right p-4 text-sm font-medium text-[#FF6B00]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No invoices found
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.map(inv => (
                          <tr key={inv.id} className="border-b border-border hover:bg-secondary/50">
                            <td className="p-4 text-[#FF6B00] font-medium">{inv.invoice_number}</td>
                            <td className="p-4 text-[#00BFFF]">
                              {inv.clients?.company_name || inv.clients?.contact_name || '-'}
                            </td>
                            <td className="p-4">JMD {Number(inv.total || 0).toLocaleString()}</td>
                            <td className="p-4">{getStatusBadge(inv.status)}</td>
                            <td className="p-4 text-muted-foreground">
                              {inv.issued_date ? new Date(inv.issued_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => window.open(`/admin/invoices/${inv.id}`, '_blank')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => window.open(`/admin/invoices/${inv.id}`, '_blank')}>
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations">
            <Card className="bg-card border-border">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg">Quotations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gradient-to-r from-[#1a3a5c] via-[#4a3a5c] to-[#5c3a3a]">
                        <th className="text-left p-4 text-sm font-medium text-foreground">Quote #</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Client</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Date</th>
                        <th className="text-right p-4 text-sm font-medium text-[#FF6B00]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuotations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No quotations found
                          </td>
                        </tr>
                      ) : (
                        filteredQuotations.map(q => (
                          <tr key={q.id} className="border-b border-border hover:bg-secondary/50">
                            <td className="p-4 text-[#FF6B00] font-medium">{q.quote_number}</td>
                            <td className="p-4 text-[#00BFFF]">
                              {q.clients?.company_name || q.clients?.contact_name || '-'}
                            </td>
                            <td className="p-4">JMD {Number(q.total || 0).toLocaleString()}</td>
                            <td className="p-4">{getStatusBadge(q.status)}</td>
                            <td className="p-4 text-muted-foreground">
                              {q.created_at ? new Date(q.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => window.open(`/admin/quotations/${q.id}`, '_blank')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => window.open(`/admin/quotations/${q.id}`, '_blank')}>
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Contracts Tab */}
          <TabsContent value="contracts">
            <Card className="bg-card border-border">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg">Service Contracts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gradient-to-r from-[#1a3a5c] via-[#4a3a5c] to-[#5c3a3a]">
                        <th className="text-left p-4 text-sm font-medium text-foreground">Contract #</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Client</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Value</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-foreground">Period</th>
                        <th className="text-right p-4 text-sm font-medium text-[#FF6B00]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContracts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No service contracts found
                          </td>
                        </tr>
                      ) : (
                        filteredContracts.map(c => (
                          <tr key={c.id} className="border-b border-border hover:bg-secondary/50">
                            <td className="p-4 text-[#FF6B00] font-medium">{c.contract_number}</td>
                            <td className="p-4 text-[#00BFFF]">
                              {c.clients?.company_name || c.clients?.contact_name || '-'}
                            </td>
                            <td className="p-4">JMD {Number(c.amount || 0).toLocaleString()}</td>
                            <td className="p-4">{getStatusBadge(c.status)}</td>
                            <td className="p-4 text-muted-foreground">
                              {c.start_date ? new Date(c.start_date).toLocaleDateString() : '-'} - {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'Ongoing'}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => window.open(`/admin/service-contracts/${c.id}`, '_blank')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => window.open(`/admin/service-contracts/${c.id}`, '_blank')}>
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
