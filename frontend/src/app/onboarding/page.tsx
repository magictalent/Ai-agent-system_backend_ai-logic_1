'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function OnboardingPage() {
  const { token } = useAuth()
  const [emailStatus, setEmailStatus] = useState<string>('')
  const [automationMsg, setAutomationMsg] = useState<string>('')
  const [provider, setProvider] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('crm_provider') || 'mock'
    return 'mock'
  })
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [starting, setStarting] = useState(false)

  const verifyEmail = async () => {
    setCheckingEmail(true)
    setEmailStatus('')
    try {
      const res = await fetch('http://localhost:3001/email/verify')
      const data = await res.json()
      if (data.ok) setEmailStatus('SMTP configured and reachable')
      else setEmailStatus(data.message || 'SMTP not configured')
    } catch (e: any) {
      setEmailStatus(e.message)
    } finally {
      setCheckingEmail(false)
    }
  }

  const startAutomation = async () => {
    if (!token) {
      setAutomationMsg('Please log in first')
      return
    }
    setStarting(true)
    setAutomationMsg('')
    try {
      const res = await fetch('http://localhost:3001/automation/run', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setAutomationMsg(`Automation run complete. Enqueued: ${data.enqueued ?? 0}`)
      } else {
        setAutomationMsg(data?.message || 'Failed to start automation')
      }
    } catch (e: any) {
      setAutomationMsg(e.message)
    } finally {
      setStarting(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('crm_provider', provider)
  }, [provider])

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Get Started</h1>
      <p className="text-gray-600">Connect calendar, choose your CRM, and start a campaign. The AI will import leads, reach out, and auto-book meetings.</p>

      {/* Step 1: Calendar */}
      <div className="bg-white rounded-lg border p-6 space-y-3">
        <div className="text-lg font-semibold">1) Connect Google Calendar</div>
        <div className="text-sm text-gray-600">Authorize access so the AI can book meetings on your behalf.</div>
        <a
          href={`http://localhost:3001/google/auth/login?clientId=shared&returnUrl=${encodeURIComponent('http://localhost:3000/onboarding?calendar=connected')}`}
          className="inline-block px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700"
        >
          Connect Google Calendar
        </a>
      </div>

      {/* Step 2: CRM */}
      <div className="bg-white rounded-lg border p-6 space-y-3">
        <div className="text-lg font-semibold">2) Choose CRM Provider</div>
        <div className="text-sm text-gray-600">Pick your CRM and import contacts into the Leads tab.</div>
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="mock">Mock CRM</option>
            <option value="hubspot">HubSpot</option>
          </select>
          <a href="/integrations" className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">Manage Integrations</a>
        </div>
      </div>

      {/* Step 3: Email Sender */}
      <div className="bg-white rounded-lg border p-6 space-y-3">
        <div className="text-lg font-semibold">3) Verify Email Sender</div>
        <div className="text-sm text-gray-600">Make sure SMTP is configured so the AI can send emails.</div>
        <div className="flex gap-3 items-center flex-wrap">
          <button onClick={verifyEmail} disabled={checkingEmail} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {checkingEmail ? 'Checking…' : 'Verify SMTP'}
          </button>
          {emailStatus && <span className="text-sm text-gray-700">{emailStatus}</span>}
        </div>
      </div>

      {/* Step 4: Start */}
      <div className="bg-white rounded-lg border p-6 space-y-3">
        <div className="text-lg font-semibold">4) Start Campaign Automation</div>
        <div className="text-sm text-gray-600">Kick off lead syncing and message sequences. You can also manage campaigns directly.</div>
        <div className="flex gap-3 items-center flex-wrap">
          <button onClick={startAutomation} disabled={starting} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {starting ? 'Starting…' : 'Start Automation'}
          </button>
          <a href="/campaigns" className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">Go to Campaigns</a>
          {automationMsg && <span className="text-sm text-gray-700">{automationMsg}</span>}
        </div>
      </div>
    </div>
  )
}

