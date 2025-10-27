'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Client } from '@/types/client'

type ProviderStatus = {
  [key: string]: { id: string; connected: boolean }
}

export default function IntegrationsPage() {
  const { token } = useAuth()
  const [status, setStatus] = useState<ProviderStatus>({})
  const [testing, setTesting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState('')
  const [leadPreview, setLeadPreview] = useState<number | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:3001/crm/status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchStatus()
    const loadClients = async () => {
      if (!token) return
      try {
        const res = await fetch('http://localhost:3001/clients', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setClients(data)
          if (data?.length && !selectedClientId) setSelectedClientId(data[0].id)
        }
      } catch {}
    }
    loadClients()
  }, [])

  const testHubspot = async () => {
    setTesting(true)
    setMessage('')
    try {
      const res = await fetch('http://localhost:3001/crm/test?provider=hubspot')
      const data = await res.json()
      if (data.ok) setMessage(`HubSpot OK (sample: ${data.sample ?? 0})`)
      else setMessage(`HubSpot test failed: ${data.status || ''} ${data.message || ''}`)
    } catch (e: any) {
      setMessage(`HubSpot test error: ${e.message}`)
    } finally {
      setTesting(false)
    }
  }

  const previewLeads = async () => {
    if (!token) {
      setMessage('Please log in to preview contacts')
      return
    }
    setMessage('')
    setLeadPreview(null)
    try {
      const res = await fetch('http://localhost:3001/crm/leads?provider=hubspot', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt)
      }
      const data = await res.json()
      setLeadPreview(Array.isArray(data) ? data.length : 0)
      setMessage(`Fetched ${Array.isArray(data) ? data.length : 0} contacts from HubSpot`)
    } catch (e: any) {
      setMessage(`Preview failed: ${e.message}`)
    }
  }

  const importLeads = async () => {
    if (!token) {
      setMessage('Please log in to import leads')
      return
    }
    setImporting(true)
    setMessage('')
    try {
      const res = await fetch('http://localhost:3001/crm/import?provider=hubspot', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`Imported ${data.inserted} (updated ${data.updated}) out of ${data.total}`)
      } else {
        setMessage(`Import failed: ${data?.message || res.status}`)
      }
    } catch (e: any) {
      setMessage(`Import error: ${e.message}`)
    } finally {
      setImporting(false)
    }
  }

  const hubspotConnected = status?.hubspot?.connected

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
      <p className="text-gray-600">Connect your CRM to find leads, and connect Gmail to let the AI send messages. Gmail tokens are stored server‑side only.</p>
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">HubSpot</div>
            <div className="text-sm text-gray-600">CRM contacts import and sync</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${hubspotConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {hubspotConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={testHubspot}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
          <button
            onClick={previewLeads}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
          >
            Preview Contacts
          </button>
          <button
            onClick={importLeads}
            disabled={importing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {importing ? 'Importing…' : 'Import to Leads'}
          </button>
        </div>

        {leadPreview !== null && (
          <div className="text-sm text-gray-700">Preview count: {leadPreview}</div>
        )}
        {message && (
          <div className="text-sm text-gray-700">{message}</div>
        )}
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Gmail</div>
            <div className="text-sm text-gray-600">Used for sending email sequences via your Google account</div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
            ))}
          </select>
          <a
            href={`http://localhost:3001/google/auth/login?clientId=${encodeURIComponent(selectedClientId || '')}&returnUrl=${encodeURIComponent('http://localhost:3000/integrations')}`}
            className={`px-4 py-2 rounded-lg text-white ${selectedClientId ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}
            onClick={(e) => { if (!selectedClientId) e.preventDefault() }}
          >
            Connect Gmail
          </a>
          <p className="text-sm text-gray-600">Tokens are stored securely on the server for sending.</p>
        </div>
      </div>
    </div>
  )
}
