import { API_BASE } from '@/lib/api';
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Mail, Phone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

type DbLead = {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  status?: string
  last_contacted?: string
}

type UiLead = {
  id: string
  name: string
  email: string
  phone: string
  source: string
  lastContact: string
  status: string
  notes?: string
}

export default function Leads() {
  const { token } = useAuth()
  const [dbLeads, setDbLeads] = useState<DbLead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const uiLeads: UiLead[] = useMemo(() => {
    return (dbLeads || []).map((l) => ({
      id: l.id,
      name: `${l.first_name || ''} ${l.last_name || ''}`.trim() || l.email || l.id,
      email: l.email || '',
      phone: l.phone || '',
      source: 'CRM',
      lastContact: l.last_contacted ? new Date(l.last_contacted).toLocaleString() : '—',
      status: l.status || 'new',
    }))
  }, [dbLeads])

  const [selectedLead, setSelectedLead] = useState<UiLead | null>(null)
  const [convLoading, setConvLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [convIndex, setConvIndex] = useState<Record<string, { count: number; last: string; lastDirection: 'outbound'|'inbound' }>>({})
  const [tickLoading, setTickLoading] = useState(false)
  const [simText, setSimText] = useState('')
  const [simLoading, setSimLoading] = useState(false)

  useEffect(() => {
    // initial selection
    if (!selectedLead && uiLeads.length > 0) setSelectedLead(uiLeads[0])
  }, [uiLeads, selectedLead])

  // Load conversation for selected lead
  useEffect(() => {
    const load = async () => {
      if (!token || !selectedLead?.id) { setMessages([]); return }
      setConvLoading(true)
      try {
        const res = await fetch(`${API_BASE}/messages/lead/${encodeURIComponent(selectedLead.id)}` ,{
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setMessages(Array.isArray(data) ? data : [])
      } catch {
        // ignore
      } finally {
        setConvLoading(false)
      }
    }
    load()
  }, [token, selectedLead?.id])

  useEffect(() => {
    const fetchLeads = async () => {
      if (!token) return
      setLoading(true)
      setError('')
      try {
        const res = await fetch(${API_BASE}/crm/leads-db?limit=200', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setDbLeads(Array.isArray(data) ? data : [])
      } catch (e: any) {
        setError(e.message || 'Failed to fetch leads')
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [token])

  // Load conversation summaries for all leads
  useEffect(() => {
    const loadConversations = async () => {
      if (!token) return
      try {
        const res = await fetch(${API_BASE}/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const list = await res.json()
        const map: Record<string, { count: number; last: string; lastDirection: 'outbound'|'inbound' }> = {}
        for (const c of Array.isArray(list) ? list : []) {
          const lastMsg = (c.messages && c.messages[c.messages.length - 1]) || null
          map[c.lead_id] = {
            count: c.message_count || (c.messages ? c.messages.length : 0) || 0,
            last: c.last_message_at || (lastMsg?.created_at || ''),
            lastDirection: (lastMsg?.direction || 'outbound') as 'outbound'|'inbound',
          }
        }
        setConvIndex(map)
      } catch {}
    }
    loadConversations()
  }, [token])

  const filteredLeads = uiLeads
    .filter(lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(lead => activeTab === 'all' || lead.status === activeTab)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'replied': return 'bg-green-100 text-green-800'
      case 'interested': return 'bg-blue-100 text-blue-800'
      case 'booked': return 'bg-purple-100 text-purple-800'
      case 'no-reply': return 'bg-gray-100 text-gray-800'
      case 'new': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'replied': return 'Replied'
      case 'interested': return 'Interested'
      case 'booked': return 'Booked'
      case 'no-reply': return 'No Reply'
      case 'new': return 'New'
      default: return status
    }
  }

  return (
    <div className="h-full flex">
      {/* Leads List */}
      <div className="w-1/3 border-r border-gray-200 pr-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2">
              <Plus size={20} />
              <span>Add Lead</span>
            </button>
          </div>

          {loading && (
            <div className="text-sm text-gray-600">Loading leads…</div>
          )}
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {['all', 'replied', 'interested', 'no-reply'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'all' ? 'All Leads' : getStatusText(tab)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Leads List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`p-4 rounded-lg border cursor-pointer transition ${
                  selectedLead?.id === lead.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {getStatusText(lead.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                  <Mail size={14} />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2 flex-wrap">
                  <span>{lead.source}</span>
                  <span>•</span>
                  <span>{lead.lastContact}</span>
                  {convIndex[lead.id] && (
                    <>
                      <span>•</span>
                      <span className="text-gray-700">{convIndex[lead.id].count} msg</span>
                      {convIndex[lead.id].last && (
                        <span className="text-gray-500">(last {new Date(convIndex[lead.id].last).toLocaleString()})</span>
                      )}
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${convIndex[lead.id].lastDirection === 'outbound' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                        {convIndex[lead.id].lastDirection === 'outbound' ? 'AI' : 'Lead'}
                      </span>
                    </>
                  )}
                </div>
                {lead.notes && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{lead.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Details & Conversation */}
      <div className="flex-1 pl-6">
        {selectedLead ? (
          <div className="space-y-6">
            {/* Lead Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLead.name}</h2>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail size={16} />
                      <span>{selectedLead.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone size={16} />
                      <span>{selectedLead.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedLead.status)}`}>
                    {getStatusText(selectedLead.status)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Source: {selectedLead.source}</div>
                </div>
              </div>
              
              {selectedLead.notes && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">Notes</div>
                  <div className="text-sm text-yellow-700 mt-1">{selectedLead.notes}</div>
                </div>
              )}
            </div>

            {/* Conversation */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Conversation</h3>
                <button
                  onClick={async () => {
                    if (!token) return
                    setTickLoading(true)
                    try {
                      const res = await fetch(${API_BASE}/sequences/tick?limit=25', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                      })
                      await res.json().catch(() => null)
                      // reload selected lead conversation
                      const resConv = await fetch(`${API_BASE}/messages/lead/${encodeURIComponent(selectedLead!.id)}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      })
                      if (resConv.ok) setMessages(await resConv.json())
                      // reload index
                      const resIdx = await fetch(${API_BASE}/messages/conversations', {
                        headers: { Authorization: `Bearer ${token}` },
                      })
                      if (resIdx.ok) {
                        const list = await resIdx.json()
                        const map: Record<string, { count: number; last: string; lastDirection: 'outbound'|'inbound' }> = {}
                        for (const c of Array.isArray(list) ? list : []) {
                          const lastMsg = (c.messages && c.messages[c.messages.length - 1]) || null
                          map[c.lead_id] = {
                            count: c.message_count || (c.messages ? c.messages.length : 0) || 0,
                            last: c.last_message_at || (lastMsg?.created_at || ''),
                            lastDirection: (lastMsg?.direction || 'outbound') as 'outbound'|'inbound',
                          }
                        }
                        setConvIndex(map)
                      }
                    } finally {
                      setTickLoading(false)
                    }
                  }}
                  className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  disabled={tickLoading}
                >
                  {tickLoading ? 'Processing…' : 'Run Tick'}
                </button>
              </div>
              {convLoading && <div className="text-sm text-gray-500 mb-2">Loading conversation</div>}
              {!convLoading && messages.length === 0 && (
                <div className="text-sm text-gray-500">No messages for this lead yet.</div>
              )}
              <div className="space-y-4">
                {messages.map((m: any) => (
                  <div key={m.id} className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                    {m.direction === 'inbound' && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600">
                          {selectedLead.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <div className={`${m.direction === 'outbound' ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-800'} rounded-lg p-4 max-w-[70%]`}>
                      <div className="text-xs mb-1 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full ${m.direction === 'outbound' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                          {m.direction === 'outbound' ? 'AI' : 'Lead'}
                        </span>
                        <span className="text-gray-500">{new Date(m.created_at).toLocaleString()}</span>
                        <span className="text-gray-500">• {m.channel}</span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simulate an inbound reply (testing helper) */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex gap-2 items-center">
                  <input
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Simulate lead reply..."
                  />
                  <button
                    onClick={async () => {
                      if (!token || !selectedLead?.id || !simText.trim()) return
                      setSimLoading(true)
                      try {
                        const res = await fetch(${API_BASE}/messages/simulate', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ leadId: selectedLead.id, content: simText.trim() }),
                        })
                        await res.json().catch(() => null)
                        setSimText('')
                        // Refresh conversation and index
                        const resConv = await fetch(`${API_BASE}/messages/lead/${encodeURIComponent(selectedLead.id)}`, { headers: { Authorization: `Bearer ${token}` } })
                        if (resConv.ok) setMessages(await resConv.json())
                        const resIdx = await fetch(${API_BASE}/messages/conversations', { headers: { Authorization: `Bearer ${token}` } })
                        if (resIdx.ok) {
                          const list = await resIdx.json()
                          const map: Record<string, { count: number; last: string; lastDirection: 'outbound'|'inbound' }> = {}
                          for (const c of Array.isArray(list) ? list : []) {
                            const lastMsg = (c.messages && c.messages[c.messages.length - 1]) || null
                            map[c.lead_id] = {
                              count: c.message_count || (c.messages ? c.messages.length : 0) || 0,
                              last: c.last_message_at || (lastMsg?.created_at || ''),
                              lastDirection: (lastMsg?.direction || 'outbound') as 'outbound'|'inbound',
                            }
                          }
                          setConvIndex(map)
                        }
                      } finally {
                        setSimLoading(false)
                      }
                    }}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50"
                    disabled={simLoading}
                  >
                    {simLoading ? 'Sending…' : 'Simulate Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a lead to view details
          </div>
        )}
      </div>
    </div>
  )
}



