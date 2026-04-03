import Imap from 'imap'
import { simpleParser, ParsedMail } from 'mailparser'
import nodemailer from 'nodemailer'

export interface ZohoEmail {
  id: string
  uid: number
  from: string
  fromEmail: string
  to: string
  subject: string
  date: Date
  bodyText: string | null
  bodyHtml: string | null
  isRead: boolean
  folder: string
}

const imapConfig = {
  user: process.env.ZOHO_MAIL_USER || '',
  password: process.env.ZOHO_MAIL_PASSWORD || '',
  host: 'imappro.zoho.com', // Use 'imappro.zoho.com' for Zoho Workplace (business)
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  connTimeout: 30000,
  authTimeout: 15000,
}

const smtpConfig = {
  host: 'smtppro.zoho.com', // Use 'smtppro.zoho.com' for Zoho Workplace (business)
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_MAIL_USER || '',
    pass: process.env.ZOHO_MAIL_PASSWORD || '',
  },
}

function parseAddress(address: any): { name: string; email: string } {
  if (!address || !address.value || !address.value[0]) {
    return { name: 'Unknown', email: '' }
  }
  const addr = address.value[0]
  return { name: addr.name || addr.address || 'Unknown', email: addr.address || '' }
}

export async function fetchZohoEmails(folder: string = 'INBOX', limit: number = 100): Promise<ZohoEmail[]> {
  // Check if credentials are set
  if (!process.env.ZOHO_MAIL_USER || !process.env.ZOHO_MAIL_PASSWORD) {
    return []
  }
  
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig)
    const emails: ZohoEmail[] = []
    let pendingParsing = 0
    let fetchEnded = false

    const checkComplete = () => {
      if (fetchEnded && pendingParsing === 0) {
        imap.end()
        emails.sort((a, b) => b.date.getTime() - a.date.getTime())
        resolve(emails)
      }
    }

    imap.once('ready', () => {
      imap.openBox(folder, false, (err, box) => {
        if (err) { imap.end(); reject(err); return }
        if (box.messages.total === 0) { imap.end(); resolve([]); return }

        imap.search(['ALL'], (searchErr, uids) => {
          if (searchErr || !uids?.length) {
            imap.end()
            searchErr ? reject(searchErr) : resolve([])
            return
          }

          const recentUids = uids.slice(-limit)
          const fetch = imap.fetch(recentUids, { bodies: '', struct: true })

          fetch.on('message', (msg, seqno) => {
            let uid = 0
            const flags: string[] = []
            pendingParsing++

            msg.on('body', (stream) => {
              let buffer = ''
              stream.on('data', (chunk: Buffer) => buffer += chunk.toString('utf8'))
              stream.once('end', () => {
                simpleParser(buffer)
                  .then((parsed: ParsedMail) => {
                    const from = parseAddress(parsed.from)
                    const to = parseAddress(parsed.to)
                    emails.push({
                      id: `${folder}-${uid || seqno}`,
                      uid: uid || seqno,
                      from: from.name,
                      fromEmail: from.email,
                      to: to.email,
                      subject: parsed.subject || '(No Subject)',
                      date: parsed.date || new Date(),
                      bodyText: parsed.text || null,
                      bodyHtml: parsed.html || null,
                      isRead: flags.includes('\\Seen'),
                      folder,
                    })
                  })
                  .finally(() => { pendingParsing--; checkComplete() })
              })
            })

            msg.once('attributes', (attrs) => {
              uid = attrs.uid
              flags.push(...(attrs.flags || []))
            })
          })

          fetch.once('error', (err) => { imap.end(); reject(err) })
          fetch.once('end', () => { fetchEnded = true; checkComplete() })
        })
      })
    })

    imap.once('error', reject)
    imap.connect()
  })
}

export async function sendZohoEmail(
  to: string, 
  subject: string, 
  html: string, 
  text?: string, 
  inReplyTo?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = nodemailer.createTransport(smtpConfig)
    const mailOptions: nodemailer.SendMailOptions = {
      from: `ARK Maintenance <${process.env.ZOHO_MAIL_USER}>`,
      to, 
      subject, 
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    }
    if (inReplyTo) { 
      mailOptions.inReplyTo = inReplyTo
      mailOptions.references = inReplyTo 
    }
    const result = await transporter.sendMail(mailOptions)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send' }
  }
}
