'use client'

import { useEffect, useState } from 'react'
import { Campaign, CHANNEL_CONFIGS, STATUS_CONFIGS } from '@/types/campaign'
import { useAuth } from '@/contexts/AuthContext'

interface CampaignCardProps {
  campaign: Campaign
  onEdit: (campaign: Campaign) => void
  onStart: (campaignId: string) => void
  onPause: (campaignId: string) => void
  onStop: (campaignId: string) => void
  onDelete: (campaignId: string) => void
}

export default function CampaignCard({ campaign, onEdit, onStart, onPause, onStop, onDelete }: CampaignCardProps) {
  const [showActions, setShowActions] = useState(false)
  const { token } = useAuth()
  const [showSequence, setShowSequence] = useState(false)
  const [leadEmail, setLeadEmail] = useState('')
  const [queue, setQueue] = useState<any[]>([])
  const [loadingQueue, setLoadingQueue] = useState(false)
  const [starting, setStarting] = useState(false)
  const [seqMsg, setSeqMsg] = useState('')

  const loadQueue = async () => {
    if (!token) return
    try {
      setLoadingQueue(true)
      const items = await loadQueueInternal(campaign.id, token)
      setQueue(items)
    } catch (e) {
      // ignore for now
    } finally {
      setLoadingQueue(false)
    }
  }

  useEffect(() => {
    if (showSequence) {
      loadQueue()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSequence])

  const channelConfig = CHANNEL_CONFIGS.find(c => c.id === campaign.channel)
  const statusConfig = STATUS_CONFIGS[campaign.status]

  const handleAction = (action: string) => {
    setShowActions(false)
    switch (action) {
      case 'start':
        onStart(campaign.id)
        break
      case 'pause':
        onPause(campaign.id)
        break
      case 'stop':
        onStop(campaign.id)
        break
      case 'edit':
        onEdit(campaign)
        break
      case 'delete':
        onDelete(campaign.id)
        break
    }
  }

  const getActionButton = () => {
    switch (campaign.status) {
      case 'draft':
        return (
          <button
            onClick={() => handleAction('start')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
          >
            <span>
              <img src="/icons/start.png" alt="Start" className="w-5 h-5 inline" />
            </span>
            <span>Start</span>
          </button>
        )
      case 'active':
        return (
          <button
            onClick={() => handleAction('pause')}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            <span>
              <img src="/icons/pause.png" alt="Pause" className="w-5 h-5 inline" />
            </span>
            <span>Pause</span>
          </button>
        )
      case 'paused':
        return (
          <button
            onClick={() => handleAction('start')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
          >
            <span>
              <img src="/icons/start.png" alt="Start" className="w-5 h-5 inline" />
            </span>
            <span>Start</span>
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{campaign.name}</h3>
          <p className="text-sm text-gray-600">{campaign.client_name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <span className="text-gray-400">⋯</span>
            </button>
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleAction('edit')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ✏️ Edit Campaign
                  </button>
                  <button
                    onClick={() => handleAction('start')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ▶️ Start Campaign
                  </button>
                  <button
                    onClick={() => handleAction('pause')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ⏸️ Pause Campaign
                  </button>
                  <button
                    onClick={() => handleAction('stop')}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    🛑 Stop Campaign
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${channelConfig?.color}`}>
          {channelConfig?.icon} {channelConfig?.name}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <img src="/icons/users.png" alt="Leads" className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{campaign.leads_count}</div>
          <div className="text-xs text-gray-500">Leads</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <img src="/icons/calendar.png" alt="Appointments" className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{campaign.appointments_count}</div>
          <div className="text-xs text-gray-500">Appointments</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <img src="/icons/sms.png" alt="Response" className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{campaign.response_rate}%</div>
          <div className="text-xs text-gray-500">Response</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {getActionButton()}
        <button
          onClick={() => handleAction('edit')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <img src="/icons/edit.png" alt="Edit" className="w-5 h-5" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => setShowSequence(s => !s)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors"
        >
          <img src="/icons/start.png" alt="Seq" className="w-5 h-5" />
          <span>Sequence</span>
        </button>
        <button
          onClick={() => handleAction('delete')}
          className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
        >
          <span>Delete</span>
        </button>
      </div>

      {showSequence && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Start Sequence</h4>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Lead Email</label>
              <input
                type="email"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                placeholder="lead@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={async () => {
                setSeqMsg('')
                if (!token) { setSeqMsg('Please log in'); return }
                if (!leadEmail) { setSeqMsg('Enter a lead email'); return }
                try {
                  setStarting(true)
                  const res = await fetch('http://localhost:3001/sequences/start', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      clientId: campaign.client_id,
                      campaignId: campaign.id,
                      leadEmail,
                      channel: 'email',
                    })
                  })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data?.message || 'Failed to start sequence')
                  setSeqMsg(`Queued ${data.created} steps`)
                  // refresh queue
                  await loadQueue()
                } catch (e: any) {
                  setSeqMsg(e.message)
                } finally {
                  setStarting(false)
                }
              }}
              disabled={starting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {starting ? 'Starting…' : 'Start'}
            </button>
          </div>
          {seqMsg && <div className="text-sm text-gray-700 mt-2">{seqMsg}</div>}

          <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-gray-800">Queued Steps</h5>
            <button
              onClick={async () => { await loadQueue() }}
              className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={async () => {
                if (!token) { setSeqMsg('Please log in'); return }
                try {
                  const res = await fetch('http://localhost:3001/sequences/tick', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  })
                  const data = await res.json()
                  setSeqMsg(`Tick processed ${data.processed} items`)
                  await loadQueue()
                } catch (e: any) {
                  setSeqMsg(e.message)
                }
              }}
              className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
            >
              Run Tick
            </button>
          </div>
            <div className="space-y-2">
              {loadingQueue && <div className="text-sm text-gray-500">Loading…</div>}
              {!loadingQueue && queue.length === 0 && (
                <div className="text-sm text-gray-500">No queued steps</div>
              )}
              {queue.map((q) => (
                <div key={q.id} className="text-sm text-gray-700 bg-gray-50 p-2 rounded flex justify-between">
                  <div>
                    <div className="font-medium">{q.subject || '(no subject)'}</div>
                    <div className="text-xs text-gray-500">{q.channel} • due {new Date(q.due_at).toLocaleString()}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${q.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : q.status === 'sent' ? 'bg-green-100 text-green-800' : q.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800' }`}>
                    {q.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

async function loadQueueInternal(campaignId: string, token: string) {
  const res = await fetch('http://localhost:3001/sequences/queue', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ campaignId, limit: 5 })
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt)
  }
  return await res.json()
}




