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
    setMessage('')
    setLeadPreview(null)
    try {
      const res = await fetch('http://localhost:3001/crm/leads?provider=hubspot')
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
    </div>
  )
}

