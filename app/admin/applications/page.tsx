'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Search, 
  RefreshCw, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Download,
  Eye,
  Trash2,
  ArrowUpDown,
  CheckCircle,
  Clock,
  XCircle,
  Users
} from 'lucide-react'

interface Application {
  id: string
  name: string
  email: string
  phone: string | null
  skills: string[] | null
  message: string | null
  resume_url: string | null
  resume_filename: string | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: 'New', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  reviewed: { label: 'Reviewed', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Eye },
  contacted: { label: 'Contacted', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Phone },
  interviewed: { label: 'Interviewed', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: Users },
  hired: { label: 'Hired', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<'created_at' | 'name' | 'status'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      toast.success('Status updated')
      fetchApplications()
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status } : null)
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  async function updateNotes(id: string) {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ notes })
        .eq('id', id)

      if (error) throw error
      toast.success('Notes saved')
      fetchApplications()
    } catch (error) {
      toast.error('Failed to save notes')
    }
  }

  async function deleteApplication(id: string) {
    if (!confirm('Are you sure you want to delete this application?')) return
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Application deleted')
      setViewDialogOpen(false)
      fetchApplications()
    } catch (error) {
      toast.error('Failed to delete application')
    }
  }

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = 
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.email.toLowerCase().includes(search.toLowerCase()) ||
        (app.phone && app.phone.includes(search)) ||
        (app.skills && app.skills.some(s => s.toLowerCase().includes(search.toLowerCase())))
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortField === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const toggleSort = (field: 'created_at' | 'name' | 'status') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const openViewDialog = (app: Application) => {
    setSelectedApp(app)
    setNotes(app.notes || '')
    setViewDialogOpen(true)
  }

  const stats = {
    total: applications.length,
    new: applications.filter(a => a.status === 'new').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    hired: applications.filter(a => a.status === 'hired').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Applications</h1>
          <p className="text-white/60 text-sm">Manage applications from the Join Our Team form</p>
        </div>
        <Button onClick={fetchApplications} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00BFFF]/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#00BFFF]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-white/50">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.new}</p>
                <p className="text-xs text-white/50">New</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Eye className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.reviewed}</p>
                <p className="text-xs text-white/50">Reviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.hired}</p>
                <p className="text-xs text-white/50">Hired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search by name, email, phone, or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-black/30 border-white/10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-black/30 border-white/10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg">Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 font-medium text-sm">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-white">
                      Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-white/60 font-medium text-sm">Contact</th>
                  <th className="text-left p-4 text-white/60 font-medium text-sm">Skills</th>
                  <th className="text-left p-4 text-white/60 font-medium text-sm">
                    <button onClick={() => toggleSort('status')} className="flex items-center gap-1 hover:text-white">
                      Status <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-white/60 font-medium text-sm">
                    <button onClick={() => toggleSort('created_at')} className="flex items-center gap-1 hover:text-white">
                      Date <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-right p-4 text-white/60 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-white/50">Loading applications...</td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-white/50">No applications found</td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => {
                    const status = statusConfig[app.status] || statusConfig.new
                    const StatusIcon = status.icon
                    return (
                      <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#f97316]/20 flex items-center justify-center">
                              <User className="h-4 w-4 text-[#f97316]" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{app.name}</p>
                              {app.resume_filename && (
                                <p className="text-xs text-[#00BFFF] flex items-center gap-1">
                                  <FileText className="h-3 w-3" /> Resume attached
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-white/70 text-sm flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-white/40" /> {app.email}
                          </p>
                          {app.phone && (
                            <p className="text-white/50 text-xs flex items-center gap-1.5 mt-1">
                              <Phone className="h-3 w-3 text-white/40" /> {app.phone}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {app.skills?.slice(0, 2).map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs bg-white/5 border-white/10 text-white/60">
                                {skill.length > 20 ? skill.substring(0, 20) + '...' : skill}
                              </Badge>
                            ))}
                            {app.skills && app.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-white/40">
                                +{app.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${status.color} border gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-white/50 text-sm flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => openViewDialog(app)} className="text-[#00BFFF] hover:text-[#00BFFF] hover:bg-[#00BFFF]/10">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#1a1a1a] border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Application Details</DialogTitle>
            <DialogDescription className="text-white/50">
              Submitted on {selectedApp && new Date(selectedApp.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 mt-4">
              {/* Applicant Info */}
              <div className="bg-black/30 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-[#f97316]" /> Applicant Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Full Name</p>
                    <p className="text-white">{selectedApp.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Email</p>
                    <a href={`mailto:${selectedApp.email}`} className="text-[#00BFFF] hover:underline">{selectedApp.email}</a>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Phone</p>
                    <p className="text-white">{selectedApp.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Status</p>
                    <Select value={selectedApp.status} onValueChange={(val) => updateStatus(selectedApp.id, val)}>
                      <SelectTrigger className="w-full bg-black/30 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedApp.skills && selectedApp.skills.length > 0 && (
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.skills.map(skill => (
                      <Badge key={skill} className="bg-[#f97316]/20 text-[#f97316] border-[#f97316]/30">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedApp.message && (
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">Message</h3>
                  <p className="text-white/70 whitespace-pre-wrap">{selectedApp.message}</p>
                </div>
              )}

              {/* Resume */}
              {selectedApp.resume_url && (
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">Resume</h3>
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-[#f97316]" />
                    <div className="flex-1">
                      <p className="text-white">{selectedApp.resume_filename || 'Resume'}</p>
                    </div>
                    <a href={selectedApp.resume_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" /> Download
                      </Button>
                    </a>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Admin Notes</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this applicant..."
                  className="bg-black/30 border-white/10 min-h-[100px]"
                />
                <Button onClick={() => updateNotes(selectedApp.id)} className="mt-3 bg-[#00BFFF] hover:bg-[#00BFFF]/80">
                  Save Notes
                </Button>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-white/10">
                <Button variant="destructive" onClick={() => deleteApplication(selectedApp.id)} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Application
                </Button>
                <div className="flex gap-2">
                  <a href={`mailto:${selectedApp.email}`}>
                    <Button variant="outline" className="gap-2">
                      <Mail className="h-4 w-4" /> Email Applicant
                    </Button>
                  </a>
                  {selectedApp.phone && (
                    <a href={`tel:${selectedApp.phone}`}>
                      <Button variant="outline" className="gap-2">
                        <Phone className="h-4 w-4" /> Call
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
