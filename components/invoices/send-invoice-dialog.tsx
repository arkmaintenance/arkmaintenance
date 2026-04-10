'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Send, Eye, Mail, FileText, X, Plus, Download, CheckCircle2, AlertCircle, Upload } from 'lucide-react'
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

interface ExtraEmailAttachment {
  filename: string
  contentBase64: string
  contentType: string
  size: number
}

const MAX_EXTRA_ATTACHMENTS = 3
const MAX_EXTRA_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Failed to read attachment'))
        return
      }

      const [, base64 = ''] = result.split(',')
      resolve(base64)
    }

    reader.onerror = () => reject(new Error('Failed to read attachment'))
    reader.readAsDataURL(file)
  })
}

export function SendInvoiceDialog({
  open,
  onOpenChange,
  invoiceData,
  clientEmail,
}: SendInvoiceDialogProps) {
  const defaultSubject = `Invoice ${invoiceData.invoice_number} from ARK Maintenance`
  const attachmentInputRef = useRef<HTMLInputElement>(null)
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
  const [attachmentNote, setAttachmentNote] = useState('')
  const [followUpMessage, setFollowUpMessage] = useState('')
  const [closingMessage, setClosingMessage] = useState('')
  const [extraAttachments, setExtraAttachments] = useState<ExtraEmailAttachment[]>([])
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
      setAttachmentNote(defaultEmailContent.attachmentNote)
      setFollowUpMessage(defaultEmailContent.followUpMessage)
      setClosingMessage(defaultEmailContent.closingMessage)
      setExtraAttachments([])
      setActiveTab('compose')
    }
  }, [open, clientEmail, invoiceData.client.email, invoiceData.client.name, invoiceData.invoice_number, invoiceData.service_description, defaultSubject])

  // Auto-generate PDF when dialog opens
  useEffect(() => {
    if (open && !pdfGenerated && !generatingPdf && !pdfError) {
      void generatePdf()
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
      return result.pdfBase64 as string
    } catch (error) {
      console.error('[v0] Error generating PDF:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF'
      setPdfError(errorMessage)
      toast.error(errorMessage)
      return null
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

  const handleAttachmentSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const availableSlots = Math.max(0, MAX_EXTRA_ATTACHMENTS - extraAttachments.length)
    const nextFiles = files.slice(0, availableSlots)

    if (files.length > availableSlots) {
      toast.error(`You can attach up to ${MAX_EXTRA_ATTACHMENTS} extra files`)
    }

    const validFiles = nextFiles.filter((file) => {
      if (file.size > MAX_EXTRA_ATTACHMENT_SIZE_BYTES) {
        toast.error(`${file.name} is larger than 5 MB`)
        return false
      }

      return true
    })

    if (validFiles.length === 0) {
      event.target.value = ''
      return
    }

    try {
      const preparedAttachments = await Promise.all(
        validFiles.map(async (file) => ({
          filename: file.name,
          contentBase64: await readFileAsBase64(file),
          contentType: file.type || 'application/octet-stream',
          size: file.size,
        }))
      )

      setExtraAttachments((current) => {
        const seen = new Set(current.map((attachment) => `${attachment.filename}:${attachment.size}`.toLowerCase()))
        const additions = preparedAttachments.filter((attachment) => {
          const key = `${attachment.filename}:${attachment.size}`.toLowerCase()
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })

        return [...current, ...additions]
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to attach file')
    } finally {
      event.target.value = ''
    }
  }

  const handleRemoveAttachment = (filename: string, size: number) => {
    setExtraAttachments((current) =>
      current.filter((attachment) => !(attachment.filename === filename && attachment.size === size))
    )
  }

  const handleSend = async () => {
    const pendingRecipients = parseValidEmailList(newRecipientEmail)
    const pendingCc = parseValidEmailList(newCcEmail)

    if (pendingRecipients.invalid.length > 0) {
      toast.error(`Invalid email address${pendingRecipients.invalid.length > 1 ? 'es' : ''}: ${pendingRecipients.invalid.join(', ')}`)
      return
    }

    if (pendingCc.invalid.length > 0) {
      toast.error(`Invalid email address${pendingCc.invalid.length > 1 ? 'es' : ''}: ${pendingCc.invalid.join(', ')}`)
      return
    }

    const nextRecipients = uniqueEmailList([...recipientEmails, ...pendingRecipients.valid])
    const nextCc = uniqueEmailList([...ccEmails, ...pendingCc.valid])

    if (nextRecipients.length === 0) {
      toast.error('Please add at least one recipient email address')
      return
    }

    setRecipientEmails(nextRecipients)
    setCcEmails(nextCc)
    setNewRecipientEmail('')
    setNewCcEmail('')

    let nextPdfBase64 = pdfBase64
    if (!nextPdfBase64) {
      nextPdfBase64 = await generatePdf()
    }

    if (!nextPdfBase64) {
      toast.error('Unable to generate the PDF attachment')
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
          to: nextRecipients,
          cc: nextCc,
          subject,
          invoiceData,
          pdfBase64: nextPdfBase64,
          pdfFilename,
          extraAttachments,
          emailTitle,
          greetingName,
          emailMessage,
          emailAttachmentNote: attachmentNote,
          emailFollowUpMessage: followUpMessage,
          emailClosingMessage: closingMessage,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      toast.success(`Invoice sent successfully to ${nextRecipients.length} recipient${nextRecipients.length > 1 ? 's' : ''}`)
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
    attachmentNote,
    followUpMessage,
    closingMessage,
  })
  const recipientDisplay = recipientEmails.length > 0 ? formatEmailList(recipientEmails) : 'No recipients specified'
  const ccDisplay = ccEmails.length > 0 ? formatEmailList(ccEmails) : ''
  const attachmentNames = [pdfFilename, ...extraAttachments.map((attachment) => attachment.filename)].join(', ')

  const renderTemplateEditor = (prefix: string, compact = false) => (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className={compact ? 'space-y-3' : 'grid gap-4 lg:grid-cols-2'}>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-email-title`}>Email Heading</Label>
          <Input
            id={`${prefix}-email-title`}
            value={emailTitle}
            onChange={(e) => setEmailTitle(e.target.value)}
            placeholder="Invoice heading"
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-greeting-name`}>Greeting Name</Label>
          <Input
            id={`${prefix}-greeting-name`}
            value={greetingName}
            onChange={(e) => setGreetingName(e.target.value)}
            placeholder="Contact person name"
            className="bg-input border-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${prefix}-message`}>Main Message</Label>
        <Textarea
          id={`${prefix}-message`}
          value={emailMessage}
          onChange={(e) => setEmailMessage(e.target.value)}
          placeholder="Edit the opening email body before sending..."
          className={`bg-input border-border ${compact ? 'min-h-[110px]' : 'min-h-[160px]'}`}
        />
      </div>

      <div className={compact ? 'space-y-3' : 'grid gap-4 xl:grid-cols-3'}>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-attachment-note`}>Attachment Note</Label>
          <Textarea
            id={`${prefix}-attachment-note`}
            value={attachmentNote}
            onChange={(e) => setAttachmentNote(e.target.value)}
            placeholder="Attachment notice text"
            className={`bg-input border-border ${compact ? 'min-h-[90px]' : 'min-h-[110px]'}`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-follow-up-message`}>Follow-up Message</Label>
          <Textarea
            id={`${prefix}-follow-up-message`}
            value={followUpMessage}
            onChange={(e) => setFollowUpMessage(e.target.value)}
            placeholder="Questions/help text"
            className={`bg-input border-border ${compact ? 'min-h-[90px]' : 'min-h-[110px]'}`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-closing-message`}>Closing Message</Label>
          <Textarea
            id={`${prefix}-closing-message`}
            value={closingMessage}
            onChange={(e) => setClosingMessage(e.target.value)}
            placeholder="Closing/sign-off text"
            className={`bg-input border-border ${compact ? 'min-h-[90px]' : 'min-h-[110px]'}`}
          />
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-6xl h-[88vh] max-h-[88vh] overflow-hidden flex flex-col">
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

            {renderTemplateEditor('compose')}

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

            <Card className="border-border">
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Extra Attachments</p>
                    <p className="text-xs text-muted-foreground">
                      Attach up to {MAX_EXTRA_ATTACHMENTS} extra files, 5 MB each.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={attachmentInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleAttachmentSelect}
                    />
                    <Button type="button" variant="outline" onClick={() => attachmentInputRef.current?.click()} className="gap-2">
                      <Upload className="h-4 w-4" />
                      Attach File
                    </Button>
                  </div>
                </div>

                {extraAttachments.length > 0 ? (
                  <div className="space-y-2">
                    {extraAttachments.map((attachment) => (
                      <div
                        key={`${attachment.filename}-${attachment.size}`}
                        className="flex items-center justify-between rounded-md border border-border bg-secondary/20 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{attachment.filename}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAttachment(attachment.filename, attachment.size)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No extra files attached.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview-email" className="flex-1 overflow-hidden mt-4">
            <Card className="h-full overflow-hidden border-border">
              <CardContent className="p-0 h-full grid lg:grid-cols-[360px_minmax(0,1fr)]">
                <div className="border-b lg:border-b-0 lg:border-r border-border overflow-auto p-4 bg-secondary/10">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Edit Template</p>
                      <p className="text-xs text-muted-foreground">
                        Changes here update the preview and the sent email.
                      </p>
                    </div>
                    {renderTemplateEditor('preview', true)}
                  </div>
                </div>
                <div className="min-w-0 flex flex-col overflow-hidden">
                  <div className="bg-secondary/30 px-4 py-2 border-b border-border shrink-0">
                    <p className="text-sm"><span className="text-muted-foreground">To:</span> {recipientDisplay}</p>
                    {ccDisplay && <p className="text-sm"><span className="text-muted-foreground">Cc:</span> {ccDisplay}</p>}
                    <p className="text-sm"><span className="text-muted-foreground">Subject:</span> {subject}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Attachments:</span> {attachmentNames}</p>
                  </div>
                  <div className="overflow-auto flex-1">
                    <iframe
                      srcDoc={emailPreviewHtml}
                      className="w-full h-full border-0"
                      title="Email Preview"
                    />
                  </div>
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
            disabled={sending}
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
