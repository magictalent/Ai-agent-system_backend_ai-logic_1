'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Send, Maximize2, Minimize2, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE } from '@/lib/api'

type ChatMsg = { role: 'user' | 'assistant'; text: string }

export default function AiAssistantPanel() {
  const { token } = useAuth()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', text: 'Hi! I’m Toki. Ask me anything about your campaigns, replies, or how to use SellienT.' }
  ])
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = () => setOpen((v) => !v)
    const openHandler = () => setOpen(true)
    if (typeof window !== 'undefined') {
      window.addEventListener('toggle-assistant', handler)
      window.addEventListener('open-assistant', openHandler)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('toggle-assistant', handler)
        window.removeEventListener('open-assistant', openHandler)
      }
    }
  }, [])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open])

  const send = async () => {
    const prompt = input.trim()
    if (!prompt || busy) return
    setMessages((m) => [...m, { role: 'user', text: prompt }])
    setInput('')
    setBusy(true)
    try {
      const res = await fetch(`${API_BASE}/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ prompt, context: { route: typeof window !== 'undefined' ? window.location.pathname : '' } })
      })
      const data = res.ok ? await res.json() : { text: 'Sorry, I could not reach the assistant service.' }
      setMessages((m) => [...m, { role: 'assistant', text: data?.text || 'No response' }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Network error while contacting assistant.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-y-0 right-0 z-[100] transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ width: expanded ? 'min(760px, 96vw)' : 'min(420px, 94vw)' }}
    >
      <div className="h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-pink-50 via-white to-purple-50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Toki</div>
              <div className="text-xs text-gray-500 -mt-0.5">Assistant</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-gray-100" aria-label="Expand" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button className="p-1.5 rounded hover:bg-gray-100" aria-label="Close" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-white to-gray-50">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[90%] ${m.role === 'assistant' ? 'mr-auto' : 'ml-auto'} `}>
              <div className={`px-3 py-2 rounded-2xl shadow ${m.role === 'assistant' ? 'bg-white border border-gray-100 text-gray-800' : 'bg-purple-600 text-white'}`}>
                <p className="text-sm whitespace-pre-wrap leading-5">{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="p-3 border-t bg-white">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send() }}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="Ask me anything."
            />
            <button
              className="px-3 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              onClick={send}
              disabled={busy || !input.trim()}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-[10px] text-gray-400 mt-2">AI-generated content may be inaccurate.</div>
        </div>
      </div>
    </div>
  )
}
