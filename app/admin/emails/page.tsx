'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Mail, Send, Inbox, PenSquare, Users, RefreshCw, FileText, Briefcase, Phone, Clock, Paperclip, Eye, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'
import { splitEmailList } from '@/lib/email-addresses'

interface Email {
  id: string
  resend_id: string | null
  direction: 'incoming' | 'outgoing'
  from_email: string
  to_email: string
  subject: string
  body_text: string | null
  body_html: string | null
  status: string
  email_type: string | null
  related_id: string | null
  attachments: Array<{ filename: string }> | null
  metadata: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/emails?limit=200')
      const data = await res.json()
      if (!data.error) {
        setEmails(data.emails || [])
      }
    } catch (err) {
      console.error('Emails fetch error:', err)
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    toast.info('Syncing emails...', { description: 'Connecting to Zoho Mail server' })
    
    try {
      // First sync from Zoho IMAP
      const syncRes = await fetch('/api/zoho-emails')
      const syncData = await syncRes.json()
      
      if (syncData.error) {
        toast.error('Sync Error', { description: syncData.error })
      } else if (syncData.stats) {
        const inboxInfo = syncData.stats.inbox ? `Inbox: ${syncData.stats.inbox.saved}/${syncData.stats.inbox.total}` : ''
        const sentInfo = syncData.stats.sent ? `Sent: ${syncData.stats.sent.saved}/${syncData.stats.sent.total}` : ''
        toast.success('Emails Synchronized', { 
          description: `Synced ${syncData.stats.saved} new emails. ${inboxInfo} ${sentInfo}`.trim() 
        })
      }
    } catch (err) {
      toast.error('Sync Failed', { description: 'Failed to connect to Zoho Mail. Check console for details.' })
    }
    // Then fetch all emails from database
    await fetchEmails()
  }

  // Filter emails - treat null/undefined direction as 'incoming' (default for old emails)
  const incomingEmails = emails.filter(e => e.direction === 'incoming' || !e.direction)
  const outgoingEmails = emails.filter(e => e.direction === 'outgoing')

  const getEmailTypeIcon = (type: string | null) => {
    switch (type) {
      case 'invoice': return <FileText className="h-4 w-4" />
      case 'quotation': return <FileText className="h-4 w-4" />
      case 'contact': return <Phone className="h-4 w-4" />
      case 'job_application': return <Briefcase className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const getEmailTypeBadge = (type: string | null) => {
    const variants: Record<string, { color: string; label: string }> = {
      invoice: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Invoice' },
      quotation: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Quotation' },
      contact: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Contact' },
      job_application: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Job Application' },
    }
    const variant = variants[type || ''] || { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'General' }
    return <Badge className={`${variant.color} border`}>{variant.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string }> = {
      sent: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      delivered: { color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      opened: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
      failed: { color: 'bg-red-500/20 text-red-400 border-red-500/30' },
      bounced: { color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    }
    const variant = variants[status] || { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
    return <Badge className={`${variant.color} border capitalize`}>{status}</Badge>
  }

  const handleViewEmail = (email: Email) => {
    setSelectedEmail(email)
    setViewDialogOpen(true)
  }

  const getCcRecipients = (email: Email) => {
    const ccValue = email.metadata?.cc

    if (Array.isArray(ccValue)) {
      return ccValue.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    }

    if (typeof ccValue === 'string') {
      return splitEmailList(ccValue)
    }

    return []
  }
  const selectedEmailCcRecipients = selectedEmail ? getCcRecipients(selectedEmail) : []

  const EmailList = ({ emailList, emptyMessage, emptyIcon: EmptyIcon }: { 
    emailList: Email[], 
    emptyMessage: string,
    emptyIcon: React.ElementType 
  }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#00BFFF]" />
        </div>
      )
    }

    if (emailList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <EmptyIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {emailList.map((email) => (
          <div
            key={email.id}
            className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
            onClick={() => handleViewEmail(email)}
          >
            <div className="flex-shrink-0 mt-1 p-2 rounded-full bg-[#00BFFF]/10 text-[#00BFFF]">
              {getEmailTypeIcon(email.email_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{email.subject}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {email.direction === 'incoming' ? `From: ${email.from_email}` : `To: ${email.to_email}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getEmailTypeBadge(email.email_type)}
                  {getStatusBadge(email.status)}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(email.created_at), { addSuffix: true })}
                </span>
                {email.attachments && email.attachments.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Email Management" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Email Management</h2>
            <p className="text-muted-foreground">
              View all incoming and outgoing emails. Primary email: admin@arkmaintenance.com
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="border-border text-foreground"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold">
              <PenSquare className="mr-2 h-4 w-4" />
              Compose Email
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{emails.length}</p>
                <p className="text-sm text-muted-foreground">Total Emails</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10 text-green-400">
                <Inbox className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{incomingEmails.length}</p>
                <p className="text-sm text-muted-foreground">Incoming</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{outgoingEmails.length}</p>
                <p className="text-sm text-muted-foreground">Outgoing</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {emails.filter(e => e.email_type === 'job_application').length}
                </p>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
              <Mail className="mr-2 h-4 w-4" />
              All ({emails.length})
            </TabsTrigger>
            <TabsTrigger value="inbox" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
              <Inbox className="mr-2 h-4 w-4" />
              Inbox ({incomingEmails.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
              <Send className="mr-2 h-4 w-4" />
              Sent ({outgoingEmails.length})
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">All Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailList 
                  emailList={emails} 
                  emptyMessage="No emails yet. Emails will appear here when you send invoices, quotations, or receive contact form submissions."
                  emptyIcon={Mail}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inbox">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Inbox - Incoming Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailList 
                  emailList={incomingEmails} 
                  emptyMessage="No incoming emails yet. Contact form submissions and job applications will appear here."
                  emptyIcon={Inbox}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Sent Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailList 
                  emailList={outgoingEmails} 
                  emptyMessage="No sent emails yet. Emails sent from invoices and quotations will appear here."
                  emptyIcon={Send}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Email Templates</CardTitle>
                <Button variant="outline" className="border-border text-foreground">
                  Create Template
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Invoice Email', description: 'Professional invoice email template', type: 'invoice' },
                    { name: 'Quotation Email', description: 'Quotation submission template', type: 'quotation' },
                    { name: 'Contact Confirmation', description: 'Auto-reply for contact form submissions', type: 'contact' },
                    { name: 'Job Application Confirmation', description: 'Auto-reply for job applications', type: 'job_application' },
                  ].map((template) => (
                    <div
                      key={template.name}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[#00BFFF]/10 text-[#00BFFF]">
                          {getEmailTypeIcon(template.type)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Email View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEmail && getEmailTypeIcon(selectedEmail.email_type)}
              {selectedEmail?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <p><span className="text-muted-foreground">From:</span> {selectedEmail.from_email}</p>
                  <p><span className="text-muted-foreground">To:</span> {selectedEmail.to_email}</p>
                  {selectedEmailCcRecipients.length > 0 && (
                    <p><span className="text-muted-foreground">Cc:</span> {selectedEmailCcRecipients.join(', ')}</p>
                  )}
                  <p><span className="text-muted-foreground">Date:</span> {format(new Date(selectedEmail.created_at), 'PPpp')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getEmailTypeBadge(selectedEmail.email_type)}
                  {getStatusBadge(selectedEmail.status)}
                </div>
              </div>

              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Attachments:</span>
                  {selectedEmail.attachments.map((att, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {att.filename}
                    </Badge>
                  ))}
                </div>
              )}

              <ScrollArea className="h-[400px] rounded-lg border border-border">
                {selectedEmail.body_html ? (
                  <div 
                    className="p-4 bg-white text-black [&_*]:text-black [&_p]:text-black [&_div]:text-black [&_span]:text-black [&_td]:text-black [&_th]:text-black [&_li]:text-black"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                  />
                ) : (
                  <div className="p-4 whitespace-pre-wrap text-foreground">
                    {selectedEmail.body_text || 'No content available'}
                  </div>
                )}
              </ScrollArea>

              {selectedEmail.metadata && Object.keys(selectedEmail.metadata).length > 0 && (
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Additional Info</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedEmail.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                        <span className="text-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
