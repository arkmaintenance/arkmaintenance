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
import { generateQuotationEmailHtml } from '@/lib/email-templates/quotation-email'

interface QuotationItem {
  description: string
  qty: number
  unit_price: number
  discount?: number
  amount: number
}

interface QuotationData {
  quote_number: string
  date: string
  payment_terms: string
  service_description: string
  timeline?: string
  client: {
    name: string
    company: string
    address: string
    city: string
    email?: string
  }
  items: QuotationItem[]
  subtotal: number
  total: number
}

interface SendQuotationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quotationData: QuotationData
  clientEmail?: string
}

export function SendQuotationDialog({
  open,
  onOpenChange,
  quotationData,
  clientEmail,
}: SendQuotationDialogProps) {
  const [sending, setSending] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [recipientEmail, setRecipientEmail] = useState(clientEmail || '')
  const [ccEmails, setCcEmails] = useState<string[]>([])
  const [newCcEmail, setNewCcEmail] = useState('')
  const [subject, setSubject] = useState(
    `Quotation ${quotationData.quote_number} from ARK Maintenance`
  )
  const [personalMessage, setPersonalMessage] = useState('')
  const [activeTab, setActiveTab] = useState('compose')

  const pdfFilename = `Quote-${quotationData.quote_number}.pdf`

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPdfGenerated(false)
      setPdfBase64(null)
      setPdfError(null)
      setRecipientEmail(clientEmail || quotationData.client.email || '')
    }
  }, [open, clientEmail, quotationData.client.email])

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
      const response = await fetch('/api/generate-quotation-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quotationData }),
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

  const handleAddCc = () => {
    if (newCcEmail && !ccEmails.includes(newCcEmail)) {
      setCcEmails([...ccEmails, newCcEmail])
      setNewCcEmail('')
    }
  }

  const handleRemoveCc = (email: string) => {
    setCcEmails(ccEmails.filter((e) => e !== email))
  }

  const handleSend = async () => {
    if (!recipientEmail) {
      toast.error('Please enter a recipient email address')
      return
    }

    if (!pdfBase64) {
      toast.error('Please wait for PDF generation to complete')
      return
    }

    setSending(true)

    try {
      const allRecipients = [recipientEmail, ...ccEmails]

      const response = await fetch('/api/send-quotation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: allRecipients,
          subject,
          quotationData,
          pdfBase64,
          pdfFilename,
          customMessage: personalMessage,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      toast.success(`Quotation sent successfully to ${recipientEmail}`)
      onOpenChange(false)
    } catch (error) {
      console.error('Error sending quotation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send quotation')
    } finally {
      setSending(false)
    }
  }

  const emailPreviewHtml = generateQuotationEmailHtml(quotationData, personalMessage)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#00BFFF]" />
            Send Quotation {quotationData.quote_number}
          </DialogTitle>
          <DialogDescription>
            Send this quotation to your client with a professional PDF attachment.
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
              <Label htmlFor="recipient">Recipient Email *</Label>
              <Input
                id="recipient"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="client@example.com"
                className="bg-input border-border"
              />
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

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (optional)</Label>
              <Textarea
                id="message"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="Add a personal note to your client..."
                className="bg-input border-border min-h-[100px]"
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
              <CardContent className="p-0 h-full">
                <div className="bg-secondary/30 px-4 py-2 border-b border-border">
                  <p className="text-sm"><span className="text-muted-foreground">To:</span> {recipientEmail || 'No recipient specified'}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Subject:</span> {subject}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Attachment:</span> {pdfFilename}</p>
                </div>
                <div className="overflow-auto h-[calc(100%-80px)]">
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
              <CardContent className="p-0 h-full">
                <div className="bg-secondary/30 px-4 py-2 border-b border-border flex items-center justify-between">
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
                <div className="overflow-auto h-[calc(100%-52px)] bg-gray-100 p-4 flex items-center justify-center">
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
            disabled={sending || !recipientEmail || !pdfGenerated}
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
                Send Quotation with PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
