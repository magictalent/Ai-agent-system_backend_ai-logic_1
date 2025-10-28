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

  useEffect(() => {
    // initial selection
    if (!selectedLead && uiLeads.length > 0) setSelectedLead(uiLeads[0])
  }, [uiLeads, selectedLead])

  useEffect(() => {
    const fetchLeads = async () => {
      if (!token) return
      setLoading(true)
      setError('')
      try {
        const res = await fetch('http://localhost:3001/crm/leads-db?limit=200', {
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
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <span>{lead.source}</span>
                  <span>•</span>
                  <span>{lead.lastContact}</span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h3>
              
              {/* AI Message */}
              <div className="flex space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-600">AI</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 flex-1">
                  <div className="text-sm text-blue-700">
                    Hi {selectedLead.name.split(' ')[0]}, I saw you're looking for a Toyota 2008.
                  </div>
                  <div className="text-xs text-blue-600 mt-2">2 hours ago</div>
                </div>
              </div>

              {/* Lead Reply (example content) */}
              <div className="flex space-x-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-600">
                    {selectedLead.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 flex-1">
                  <div className="text-sm text-gray-700">
                    Yes! What's your asking price?
                  </div>
                  <div className="text-xs text-gray-600 mt-2">1 hour ago</div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-600">AI</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 flex-1">
                  <div className="text-sm text-blue-700">
                    It's 2500 USD. Would you like to schedule a viewing?
                  </div>
                  <div className="text-xs text-blue-600 mt-2">Just now</div>
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Send
                  </button>
                </div>
                <div className="flex space-x-2 mt-2">
                  <button className="text-sm text-gray-600 hover:text-gray-800">Schedule follow-up</button>
                  <button className="text-sm text-gray-600 hover:text-gray-800">Mark as booked</button>
                  <button className="text-sm text-gray-600 hover:text-gray-800">Add note</button>
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
