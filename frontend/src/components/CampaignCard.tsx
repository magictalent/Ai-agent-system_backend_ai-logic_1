'use client'

import { useEffect, useState } from 'react'
import { Campaign, CHANNEL_CONFIGS, STATUS_CONFIGS } from '@/types/campaign'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE } from '@/lib/api'

interface CampaignCardProps {
  campaign: Campaign
  onEdit: (campaign: Campaign) => void
  onStart: (campaignId: string) => void
  onPause: (campaignId: string) => void
  onStop: (campaignId: string) => void
  onDelete: (campaignId: string) => void
  highlighted?: boolean
}

export default function CampaignCard({ campaign, onEdit, onStart, onPause, onStop, onDelete, highlighted = false }: CampaignCardProps) {
  const { token } = useAuth()
  const [showActions, setShowActions] = useState(false)
  const [showSequence, setShowSequence] = useState(false)
  const [leadEmail, setLeadEmail] = useState('')
  const [queue, setQueue] = useState<any[]>([])
  const [loadingQueue, setLoadingQueue] = useState(false)
  const [starting, setStarting] = useState(false)
  const [bulkStarting, setBulkStarting] = useState(false)
  const [seqMsg, setSeqMsg] = useState('')

  const channelConfig = CHANNEL_CONFIGS.find(c => c.id === campaign.channel)
  const statusConfig = STATUS_CONFIGS[campaign.status]
  const tone = (campaign as any).tone as ('friendly'|'professional'|'casual'|undefined)

  const toneBadge = tone ? (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
      tone === 'professional' ? 'bg-blue-100 text-blue-800' : tone === 'casual' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
    }`} title="Tone">
      {tone.charAt(0).toUpperCase() + tone.slice(1)}
    </span>
  ) : null

  const handleAction = (action: string) => {
    setShowActions(false)
    switch (action) {
      case 'start': return onStart(campaign.id)
      case 'pause': return onPause(campaign.id)
      case 'stop': return onStop(campaign.id)
      case 'edit': return onEdit(campaign)
      case 'delete': return onDelete(campaign.id)
    }
  }

  const loadQueue = async () => {
    if (!token) return
    try {
      setLoadingQueue(true)
      const items = await loadQueueInternal(campaign.id, token)
      setQueue(items)
    } finally { setLoadingQueue(false) }
  }

  useEffect(() => { if (showSequence) loadQueue() }, [showSequence])

  const ActionPrimary = () => {
    if (campaign.status === 'draft' || campaign.status === 'paused') {
      return (
        <button onClick={() => handleAction('start')} className="px-3 py-1.5 rounded-md text-sm bg-emerald-600 text-white hover:bg-emerald-700">
          Start
        </button>
      )
    }
    if (campaign.status === 'active') {
      return (
        <button onClick={() => handleAction('pause')} className="px-3 py-1.5 rounded-md text-sm bg-amber-500 text-white hover:bg-amber-600">
          Pause
        </button>
      )
    }
    return null
  }

  return (
    <div className={`relative bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow ${highlighted ? 'ring-2 ring-violet-500' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-gray-900 truncate">{campaign.name}</div>
          <div className="text-sm text-gray-600 truncate">{campaign.client_name}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>{statusConfig.label}</span>
          {toneBadge}
          <div className="relative">
            <button onClick={() => setShowActions(s => !s)} className="p-1.5 hover:bg-gray-100 rounded-full" aria-label="More actions">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-500"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </button>
            {showActions && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow z-10">
                <button onClick={() => handleAction('edit')} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Edit Campaign</button>
                <button onClick={() => handleAction('start')} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Start Campaign</button>
                <button onClick={() => handleAction('pause')} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Pause Campaign</button>
                <button onClick={() => handleAction('stop')} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Stop Campaign</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${channelConfig?.color}`}>
          {channelConfig?.icon} {channelConfig?.name}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Metric label="Leads" icon="/icons/users.png" value={campaign.leads_count} />
        <Metric label="Appointments" icon="/icons/calendar.png" value={campaign.appointments_count} />
        <Metric label="Response" icon="/icons/sms.png" value={`${campaign.response_rate}%`} />
      </div>

      {/* Footer actions - refined layout */}
      <div className="mt-2 pt-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ActionPrimary />
          <button
            onClick={async () => {
              setSeqMsg('')
              if (!token) { setSeqMsg('Please log in'); return }
              try {
                setBulkStarting(true)
                const res = await fetch(`${API_BASE}/sequences/start-all`, {
                  method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ clientId: campaign.client_id, campaignId: campaign.id, channel: 'email', tone: (campaign as any).tone || 'friendly' })
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data?.message || 'Failed to enqueue sequences')
                setSeqMsg(`Enqueued ${data.enqueued} leads (${data.steps_created} steps) for '${campaign.name}'. Sending first emails…`)
                try { await fetch(`${API_BASE}/sequences/tick?force=1`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }) } catch {}
                if (!showSequence) setShowSequence(true)
                await loadQueue()
              } catch (e:any) { setSeqMsg(e.message) } finally { setBulkStarting(false) }
            }}
            disabled={bulkStarting}
            className="px-3 py-1.5 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >{bulkStarting ? 'Broadcasting…' : 'Broadcast'}</button>
          <button onClick={() => onEdit(campaign)} className="px-3 py-1.5 rounded-md text-sm border border-gray-300 text-gray-700 hover:bg-gray-50">Edit</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSequence(s => !s)} className="px-3 py-1.5 rounded-md text-sm border border-indigo-300 text-indigo-700 hover:bg-indigo-50">Sequence</button>
          <button onClick={() => onDelete(campaign.id)} className="px-3 py-1.5 rounded-md text-sm border border-red-200 text-red-600 hover:bg-red-50">Delete</button>
        </div>
      </div>

      {/* Sequence tools */}
      {showSequence && (
        <div className="mt-5 rounded-lg border bg-gray-50 p-4">
          <div className="text-sm text-gray-700 mb-3">Start sequence for a single lead (email)</div>
          <div className="flex gap-2 mb-3 items-center">
            <input value={leadEmail} onChange={(e)=>setLeadEmail(e.target.value)} placeholder="lead@company.com" className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400" />
            <button
              onClick={async () => {
                setSeqMsg('')
                if (!token) { setSeqMsg('Please log in'); return }
                if (!leadEmail) { setSeqMsg('Enter a lead email'); return }
                try {
                  setStarting(true)
                  const res = await fetch(`${API_BASE}/sequences/start`, {
                    method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clientId: campaign.client_id, campaignId: campaign.id, leadEmail, channel: 'email' })
                  })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data?.message || 'Failed to start sequence')
                  setSeqMsg(`Queued ${data.created} steps`)
                  await loadQueue()
                } catch (e:any) { setSeqMsg(e.message) } finally { setStarting(false) }
              }}
              disabled={starting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >{starting ? 'Starting…' : 'Start'}</button>
          </div>
          {seqMsg && <div className="text-sm text-gray-700 mb-2">{seqMsg}</div>}
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-gray-800">Queued Steps</h5>
            <div className="flex gap-2">
              <button onClick={async()=>{ await loadQueue() }} className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Refresh</button>
              <button
                onClick={async () => {
                  if (!token) { setSeqMsg('Please log in'); return }
                  try {
                    const res = await fetch(`${API_BASE}/sequences/tick?force=1`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } })
                    const data = await res.json()
                    setSeqMsg(`Tick processed ${data.processed} items`)
                    await loadQueue()
                  } catch (e:any) { setSeqMsg(e.message) }
                }}
                className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
              >Run Tick</button>
            </div>
          </div>
          <div className="space-y-2">
            {loadingQueue && <div className="text-sm text-gray-500">Loading…</div>}
            {!loadingQueue && queue.length === 0 && <div className="text-sm text-gray-500">No queued steps</div>}
            {queue.map((q) => (
              <div key={q.id} className="text-sm text-gray-700 bg-white p-2 rounded border flex justify-between">
                <div>
                  <div className="font-medium truncate max-w-[260px]">{q.subject || '(no subject)'}</div>
                  <div className="text-xs text-gray-500">{q.channel} • due {new Date(q.due_at).toLocaleString()}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${q.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : q.status === 'sent' ? 'bg-green-100 text-green-800' : q.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800' }`}>
                  {q.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, icon, value }: { label: string; icon: string; value: any }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-1"><img src={icon} alt={label} className="w-5 h-5" /></div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

async function loadQueueInternal(campaignId: string, token: string) {
  const res = await fetch(`${API_BASE}/sequences/queue`, {
    method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ campaignId, limit: 5 })
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}
