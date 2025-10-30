'use client'
import { API_BASE } from '@/lib/api';
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
  const [provider, setProvider] = useState<string>('mock')
  const [hubspotConnected, setHubspotConnected] = useState<boolean | null>(null)
  const [hubspotHubId, setHubspotHubId] = useState<string | number | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // ✅ Run only on client mount to safely access window/localStorage
  useEffect(() => {
    setIsClient(true)
    const storedProvider = localStorage.getItem('crm_provider')
    if (storedProvider) setProvider(storedProvider)
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/crm/status`)
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch {}
  }

  useEffect(() => {
    fetchStatus()
    // user-level HubSpot status
    const fetchHubspot = async () => {
      if (!token) return
      try {
        const res = await fetch(`${API_BASE}/hubspot/auth/status`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setHubspotConnected(!!data.connected)
          if (data.hub_id) setHubspotHubId(data.hub_id)
        }
      } catch {}
    }
    fetchHubspot()
  }, [token])

  // Auto-preview HubSpot contacts count once connected
  useEffect(() => {
    if (provider === 'hubspot' && hubspotConnected) {
      previewLeads()
    }
  }, [provider, hubspotConnected])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('crm_provider', provider)
    }
  }, [provider, isClient])

  const testProvider = async () => {
    setTesting(true)
    setMessage('')
    try {
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(
        `${API_BASE}/crm/test?provider=${encodeURIComponent(provider)}`,
        { headers }
      )
      const data = await res.json()
      if (data.ok)
        setMessage(`${provider} OK${data.sample ? ` (sample: ${data.sample})` : ''}`)
      else setMessage(`${provider} test failed: ${data.status || ''} ${data.message || ''}`)
    } catch (e: any) {
      setMessage(`${provider} test error: ${e.message}`)
    } finally {
      setTesting(false)
    }
  }

  // HubSpot connect helpers (must be inside component to access state)
  // Directly hit the public login endpoint to avoid fetch/CORS timing issues
  const startHubspotConnect = async (authToken?: string) => {
    const t = authToken ?? token
    if (!t) { setMessage('Please log in first'); return }
    setConnecting(true)
    try {
      const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/integrations` : 'http://localhost:3000/integrations'
      const url = `${API_BASE}/hubspot/auth/login?token=${encodeURIComponent(t)}&returnUrl=${encodeURIComponent(returnUrl)}`
      window.location.href = url
    } catch (e: any) {
      setMessage(e.message)
      setConnecting(false)
    }
  }

  const reconnectHubspot = async (authToken?: string) => {
    const t = authToken ?? token
    if (!t) { setMessage('Please log in first'); return }
    try {
      await fetch(`${API_BASE}/hubspot/auth/disconnect`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      await startHubspotConnect(t)
    } catch (e: any) {
      setMessage(e.message)
    }
  }

  const previewLeads = async () => {
    if (!token) {
      setMessage('Please log in to preview contacts')
      return
    }
    if (provider === 'hubspot' && !hubspotConnected) {
      setMessage('Please connect HubSpot first')
      return
    }
    setMessage('')
    setLeadPreview(null)
    try {
      const qs = new URLSearchParams({
        provider,
        archived: '1',
        includeSamples: '1',
      }).toString()
      const res = await fetch(
        `${API_BASE}/crm/leads?${qs}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      if (!res.ok) throw new Error(await res.text())
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
    if (provider === 'hubspot' && !hubspotConnected) {
      setMessage('Please connect HubSpot first')
      return
    }
    setImporting(true)
    setMessage('')
    try {
      const qs = new URLSearchParams({
        provider,
        archived: '1',
        includeSamples: '1',
      }).toString()
      const res = await fetch(
        `${API_BASE}/crm/import?${qs}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
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

  const providerConnected =
    provider === 'hubspot'
      ? !!hubspotConnected
      : status?.[provider as keyof typeof status]?.connected

  // ⚠️ Ensure we only render UI after client hydration
  if (!isClient) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-600">Loading integrations...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
      <p className="text-gray-600">
        Connect your CRM to find leads, and connect Google Calendar so the AI can book meetings for you.
      </p>

      {/* CRM Section */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">CRM Provider</div>
            <div className="text-sm text-gray-600">Select your CRM and test connectivity</div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              providerConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
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

          {provider === 'hubspot' && (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => startHubspotConnect()}
                disabled={connecting}
                className={`px-4 py-2 rounded-lg text-white ${
                  hubspotConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'
                } disabled:opacity-50`}
              >
                {connecting ? 'Connecting…' : hubspotConnected ? 'HubSpot Connected' : 'Connect HubSpot'}
              </button>
              {hubspotConnected && (
                <>
                  {hubspotHubId && (
                    <span className="text-sm text-gray-600">Portal: {hubspotHubId}</span>
                  )}
                  {leadPreview !== null && (
                    <span className="text-sm text-gray-600">Contacts: {leadPreview}</span>
                  )}
                  <button
                    onClick={() => reconnectHubspot()}
                    className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                  >
                    Reconnect
                  </button>
                </>
              )}
            </div>
          )}

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
        {message && <div className="text-sm text-gray-700">{message}</div>}
      </div>

      {/* Google Calendar Section */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Google Calendar</div>
            <div className="text-sm text-gray-600">
              Authorize calendar access so the AI can book meetings automatically.
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <a
            href={`${API_BASE}/google/auth/login?clientId=shared&returnUrl=${encodeURIComponent(
              'http://localhost:3000/integrations'
            )}`}
            className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700"
          >
            Connect Google Calendar
          </a>
          <p className="text-sm text-gray-600">
            Tokens are stored securely on the server and used only to create calendar events.
          </p>
        </div>
      </div>
    </div>
  )
}



