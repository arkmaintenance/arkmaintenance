'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { X, Send, MessageCircle, Loader2 } from 'lucide-react'

function getMessageText(parts: Array<{ type: string; text?: string }> | undefined): string {
  if (!parts) return ''
  return parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

const INITIAL_MESSAGE = "Hi! I'm the ARK Maintenance assistant. How can I help you today? Whether you need AC repair, refrigeration service, or kitchen exhaust cleaning, I'm here to assist!"

export function ArkChatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chatbot' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage({ text })
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[9999] flex flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{
            width: '400px',
            height: '500px',
            background: 'hsl(220, 25%, 10%)',
            border: '1px solid hsl(220, 20%, 18%)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #f97316 100%)',
            }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-white" />
              <span className="font-bold text-white text-sm">ARK Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors" aria-label="Close chat">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {/* Initial greeting */}
            <div className="flex justify-start">
              <div
                className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-[13px] leading-relaxed"
                style={{ background: 'hsl(220, 20%, 18%)', color: 'hsl(220, 10%, 88%)' }}
              >
                {INITIAL_MESSAGE}
              </div>
            </div>

            {messages.map((m) => {
              const text = getMessageText(m.parts as Array<{ type: string; text?: string }>)
              return (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                    style={
                      m.role === 'user'
                        ? { background: '#2563eb', color: '#fff', borderBottomRightRadius: '4px' }
                        : { background: 'hsl(220, 20%, 18%)', color: 'hsl(220, 10%, 88%)', borderBottomLeftRadius: '4px' }
                    }
                  >
                    {text}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-2"
                  style={{ background: 'hsl(220, 20%, 18%)' }}
                >
                  <Loader2 className="h-3.5 w-3.5 text-white/60 animate-spin" />
                  <span className="text-white/60 text-[12px]">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 py-3 shrink-0 flex items-center gap-2 border-t"
            style={{ borderColor: 'hsl(220, 20%, 18%)', background: 'hsl(220, 25%, 12%)' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Ask about our services..."
              className="flex-1 bg-transparent text-white placeholder-white/40 text-[13px] outline-none px-2"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: '#2563eb' }}
              aria-label="Send message"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        aria-label="Open ARK chat assistant"
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>
    </>
  )
}
