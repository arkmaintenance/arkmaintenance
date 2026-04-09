'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Send, Eye, Mail, FileText, X, Plus, Download, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatEmailList, parseValidEmailList, uniqueEmailList } from '@/lib/email-addresses'
import { generateInvoiceEmailHtml, getDefaultInvoiceEmailContent } from '@/lib/email-templates/invoice-email'

interface InvoiceItem {
  description: string
  qty: number
  unit_price: number
  amount: number
}

interface InvoiceData {
  invoice_number: string
  date: string
  payment_terms: string
  service_description: string
  client: {
    name: string
    company: string
    address: string
    city: string
    parish: string
    email?: string
  }
  items: InvoiceItem[]
  subtotal: number
  total: number
  balance_due: number
}

interface SendInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceData: InvoiceData
  clientEmail?: string
}

export function SendInvoiceDialog({
  open,
  onOpenChange,
  invoiceData,
  clientEmail,
}: SendInvoiceDialogProps) {
  const defaultSubject = `Invoice ${invoiceData.invoice_number} from ARK Maintenance`
  const [sending, setSending] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [recipientEmails, setRecipientEmails] = useState<string[]>([])
  const [newRecipientEmail, setNewRecipientEmail] = useState('')
  const [ccEmails, setCcEmails] = useState<string[]>([])
  const [newCcEmail, setNewCcEmail] = useState('')
  const [subject, setSubject] = useState(defaultSubject)
  const [emailTitle, setEmailTitle] = useState('')
  const [greetingName, setGreetingName] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [activeTab, setActiveTab] = useState('compose')

  const pdfFilename = `Invoice-${invoiceData.invoice_number}.pdf`

  const addEmails = (
    rawValue: string,
    currentValues: string[],
    updateValues: (emails: string[]) => void,
    clearInput?: () => void
  ) => {
    const { valid, invalid } = parseValidEmailList(rawValue)

    if (invalid.length > 0) {
      toast.error(`Invalid email address${invalid.length > 1 ? 'es' : ''}: ${invalid.join(', ')}`)
    }

    if (valid.length === 0) {
      return
    }

    updateValues(uniqueEmailList([...currentValues, ...valid]))
    clearInput?.()
  }

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      const defaultEmailContent = getDefaultInvoiceEmailContent(invoiceData)
      setPdfGenerated(false)
      setPdfBase64(null)
      setPdfError(null)
      setRecipientEmails(parseValidEmailList(clientEmail || invoiceData.client.email || '').valid)
      setCcEmails([])
      setNewRecipientEmail('')
      setNewCcEmail('')
      setSubject(defaultSubject)
      setEmailTitle(defaultEmailContent.title)
      setGreetingName(defaultEmailContent.greetingName)
      setEmailMessage(defaultEmailContent.message)
      setActiveTab('compose')
    }
  }, [open, clientEmail, invoiceData.client.email, invoiceData.client.name, invoiceData.invoice_number, invoiceData.service_description, defaultSubject])

  // Auto-generate PDF when dialog opens
  useEffect(() => {
    if (open && !pdfGenerated && !generatingPdf && !pdfError) {
      generatePdf()
    }
  }, [open, pdfGenerated, generatingPdf, pdfError])

  const generatePdf = async () => {
    setGeneratingPdf(true)
    setPdfError(null)
    
    try {
      // Call server-side API to generate PDF using @react-pdf/renderer
      const response = await fetch('/api/generate-invoice-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceData }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to generate PDF')
      }

      setPdfBase64(result.pdfBase64)
      setPdfGenerated(true)
      toast.success('PDF generated successfully')
    } catch (error) {
      console.error('[v0] Error generating PDF:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF'
      setPdfError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleDownloadPdf = () => {
    if (!pdfBase64) return

    const link = document.createElement('a')
    link.href = `data:application/pdf;base64,${pdfBase64}`
    link.download = pdfFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAddRecipient = () => {
    addEmails(newRecipientEmail, recipientEmails, setRecipientEmails, () => setNewRecipientEmail(''))
  }

  const handleRemoveRecipient = (email: string) => {
    setRecipientEmails(recipientEmails.filter((item) => item !== email))
  }

  const handleAddCc = () => {
    addEmails(newCcEmail, ccEmails, setCcEmails, () => setNewCcEmail(''))
  }

  const handleRemoveCc = (email: string) => {
    setCcEmails(ccEmails.filter((e) => e !== email))
  }

  const handleSend = async () => {
    if (recipientEmails.length === 0) {
      toast.error('Please add at least one recipient email address')
      return
    }

    if (!pdfBase64) {
      toast.error('Please wait for PDF generation to complete')
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientEmails,
          cc: ccEmails,
          subject,
          invoiceData,
          pdfBase64,
          pdfFilename,
          emailTitle,
          greetingName,
          emailMessage,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      toast.success(`Invoice sent successfully to ${recipientEmails.length} recipient${recipientEmails.length > 1 ? 's' : ''}`)
      onOpenChange(false)
    } catch (error) {
      console.error('Error sending invoice:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send invoice')
    } finally {
      setSending(false)
    }
  }

  const emailPreviewHtml = generateInvoiceEmailHtml(invoiceData, {
    title: emailTitle,
    greetingName,
    message: emailMessage,
  })
  const recipientDisplay = recipientEmails.length > 0 ? formatEmailList(recipientEmails) : 'No recipients specified'
  const ccDisplay = ccEmails.length > 0 ? formatEmailList(ccEmails) : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-[96vw] h-[92vh] max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#00BFFF]" />
            Send Invoice {invoiceData.invoice_number}
          </DialogTitle>
          <DialogDescription>
            Send this invoice to your client with a professional PDF attachment.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="compose" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
              <Mail className="mr-2 h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="preview-email" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
              <Eye className="mr-2 h-4 w-4" />
              Email Preview
            </TabsTrigger>
            <TabsTrigger value="preview-pdf" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
              <FileText className="mr-2 h-4 w-4" />
              PDF Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="flex-1 overflow-auto mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Emails *</Label>
              <div className="flex gap-2">
                <Input
                  id="recipient"
                  type="email"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  placeholder="Add one or more emails separated by comma"
                  className="bg-input border-border"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddRecipient()
                    }
                  }}
                />
                <Button variant="outline" onClick={handleAddRecipient} type="button">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {recipientEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {recipientEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(email)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>CC (optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newCcEmail}
                  onChange={(e) => setNewCcEmail(e.target.value)}
                  placeholder="Add CC email"
                  className="bg-input border-border"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCc()
                    }
                  }}
                />
                <Button variant="outline" onClick={handleAddCc} type="button">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {ccEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {ccEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveCc(email)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email-title">Email Heading</Label>
                <Input
                  id="email-title"
                  value={emailTitle}
                  onChange={(e) => setEmailTitle(e.target.value)}
                  placeholder="Invoice heading"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="greeting-name">Greeting Name</Label>
                <Input
                  id="greeting-name"
                  value={greetingName}
                  onChange={(e) => setGreetingName(e.target.value)}
                  placeholder="Contact person name"
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Email Message</Label>
              <Textarea
                id="message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Edit the email body before sending..."
                className="bg-input border-border min-h-[160px]"
              />
            </div>

            {/* PDF Attachment Status */}
            <Card className={`border-2 ${
              pdfError 
                ? 'border-red-500/50 bg-red-500/5' 
                : pdfGenerated 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-[#00BFFF]/50 bg-[#00BFFF]/5'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {generatingPdf ? (
                      <Spinner className="h-5 w-5 text-[#00BFFF]" />
                    ) : pdfError ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : pdfGenerated ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-[#00BFFF]" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {generatingPdf 
                          ? 'Generating high-quality PDF...' 
                          : pdfError 
                            ? 'PDF Generation Failed' 
                            : pdfGenerated 
                              ? 'PDF Ready' 
                              : 'PDF Attachment'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pdfError || pdfFilename}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {pdfError && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generatePdf}
                        className="gap-2"
                      >
                        Retry
                      </Button>
                    )}
                    {pdfGenerated && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPdf}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview-email" className="flex-1 overflow-hidden mt-4">
            <Card className="h-full overflow-hidden border-border">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="bg-secondary/30 px-4 py-2 border-b border-border shrink-0">
                  <p className="text-sm"><span className="text-muted-foreground">To:</span> {recipientDisplay}</p>
                  {ccDisplay && <p className="text-sm"><span className="text-muted-foreground">Cc:</span> {ccDisplay}</p>}
                  <p className="text-sm"><span className="text-muted-foreground">Subject:</span> {subject}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Attachment:</span> {pdfFilename}</p>
                </div>
                <div className="overflow-auto flex-1">
                  <iframe
                    srcDoc={emailPreviewHtml}
                    className="w-full h-full border-0"
                    title="Email Preview"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview-pdf" className="flex-1 overflow-hidden mt-4">
            <Card className="h-full overflow-hidden border-border">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="bg-secondary/30 px-4 py-2 border-b border-border flex items-center justify-between shrink-0">
                  <p className="text-sm font-medium">PDF Attachment Preview</p>
                  <div className="flex gap-2">
                    {pdfError && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generatePdf}
                        disabled={generatingPdf}
                      >
                        {generatingPdf ? <Spinner className="h-4 w-4" /> : 'Retry'}
                      </Button>
                    )}
                    {pdfGenerated && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPdf}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                    )}
                  </div>
                </div>
                <div className="overflow-auto flex-1 bg-gray-100 p-4 flex items-center justify-center">
                  {generatingPdf ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Spinner className="h-8 w-8" />
                      <p>Generating high-quality PDF...</p>
                    </div>
                  ) : pdfError ? (
                    <div className="flex flex-col items-center gap-3 text-red-500">
                      <AlertCircle className="h-8 w-8" />
                      <p>{pdfError}</p>
                      <Button variant="outline" onClick={generatePdf}>
                        Try Again
                      </Button>
                    </div>
                  ) : pdfBase64 ? (
                    <iframe
                      src={`data:application/pdf;base64,${pdfBase64}`}
                      className="w-full h-full border-0 bg-white shadow-lg"
                      title="PDF Preview"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>PDF will be generated automatically</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || recipientEmails.length === 0 || !pdfGenerated}
            className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold"
          >
            {sending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Invoice with PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
