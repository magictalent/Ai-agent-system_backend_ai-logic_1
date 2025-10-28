
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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
  const [provider, setProvider] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('crm_provider') || 'mock'
    }
    return 'mock'
  })

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:3001/crm/status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch {}
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('crm_provider', provider)
    }
  }, [provider])

  const testProvider = async () => {
    setTesting(true)
    setMessage('')
    try {
      const res = await fetch(`http://localhost:3001/crm/test?provider=${encodeURIComponent(provider)}`)
      const data = await res.json()
      if (data.ok) setMessage(`${provider} OK${data.sample ? ` (sample: ${data.sample})` : ''}`)
      else setMessage(`${provider} test failed: ${data.status || ''} ${data.message || ''}`)
    } catch (e: any) {
      setMessage(`${provider} test error: ${e.message}`)
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
      const res = await fetch(`http://localhost:3001/crm/leads?provider=${encodeURIComponent(provider)}`, {
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
      const count = Array.isArray(data) ? data.length : 0
      setLeadPreview(count)
      setMessage(`Fetched ${count} contacts from ${provider}`)
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
      const res = await fetch(`http://localhost:3001/crm/import?provider=${encodeURIComponent(provider)}`, {
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

  const providerConnected = status?.[provider as keyof typeof status]?.connected

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
      <p className="text-gray-600">Connect your CRM to find leads, and connect Google Calendar so the AI can book meetings for you.</p>

      {/* CRM Section */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">CRM Provider</div>
            <div className="text-sm text-gray-600">Select your CRM and test connectivity</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${providerConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {providerConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="mock">Mock CRM</option>
            <option value="hubspot">HubSpot</option>
          </select>

          <button
            onClick={testProvider}
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

      {/* Google Calendar Section */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Google Calendar</div>
            <div className="text-sm text-gray-600">Authorize calendar access so the AI can book meetings automatically.</div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <a
            href={`http://localhost:3001/google/auth/login?clientId=shared&returnUrl=${encodeURIComponent('http://localhost:3000/integrations')}`}
            className={`px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700`}
          >
            Connect Google Calendar
          </a>
          <p className="text-sm text-gray-600">Tokens are stored securely on the server and used only to create calendar events.</p>
        </div>
      </div>
    </div>
  )
}
