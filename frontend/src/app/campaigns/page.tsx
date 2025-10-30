"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Campaign } from '@/types/campaign'
// import { useAuth } from '@/contexts/AuthContext'

// A simple details component
import { useAuth } from '@/contexts/AuthContext'

function CampaignDetails({
  campaign,
  onEdit,
  onStart,
  onPause,
  onStop,
  onDelete,
  onBroadcast,
  loadingActionId,
}: {
  campaign: Campaign | null,
  onEdit: (c: Campaign) => void,
  onStart: (id: string) => void,
  onPause: (id: string) => void,
  onStop: (id: string) => void,
  onDelete: (id: string) => void,
  onBroadcast: (c: Campaign) => Promise<void>,
  loadingActionId: string | null,
}) {
  const { token } = useAuth()
  const [progress, setProgress] = useState<{ pending: number; sent: number; failed: number; cancelled: number; nextDue?: string } | null>(null)
  const [progressLoading, setProgressLoading] = useState(false)

  useEffect(() => {
    const loadProgress = async () => {
      if (!campaign || !token) return
      try {
        setProgressLoading(true)
        // Load up to 50 queued items to estimate pending/cancelled/failed
        const qRes = await fetch('http://localhost:3001/sequences/queue', {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: campaign.id, limit: 50 })
        })
        const queue = qRes.ok ? await qRes.json() : []
        const pending = Array.isArray(queue) ? queue.filter((i:any)=>i.status==='pending').length : 0
        const cancelled = Array.isArray(queue) ? queue.filter((i:any)=>i.status==='cancelled').length : 0
        const failed = Array.isArray(queue) ? queue.filter((i:any)=>i.status==='failed').length : 0
        const nextDue = Array.isArray(queue) && queue.length ? queue.find((i:any)=>i.status==='pending')?.due_at : undefined
        // Load sent messages to compute sent count
        const mRes = await fetch(`http://localhost:3001/messages/campaign/${campaign.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        const msgs = mRes.ok ? await mRes.json() : []
        const sent = Array.isArray(msgs) ? msgs.filter((m:any)=>m.direction==='outbound' && m.status==='sent').length : 0
        setProgress({ pending, sent, failed, cancelled, nextDue })
      } catch {
        setProgress({ pending: 0, sent: 0, failed: 0, cancelled: 0 })
      } finally {
        setProgressLoading(false)
      }
    }
    loadProgress()
  }, [campaign?.id, token])
  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-gray-400 text-lg mb-2"><img src="/icons/chart.png" className="w-14 h-14 mb-2 opacity-50" alt="Select" /></div>
        <span className="text-gray-400">Select a campaign from the list</span>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{campaign.name}</h2>
      <div className="mb-1 text-gray-600">for <b>{campaign.client_name}</b></div>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          Status: <span className="ml-1">
            {campaign.status === 'active' && <span className="text-green-600">Active</span>}
            {campaign.status === 'paused' && <span className="text-yellow-500">Paused</span>}
            {campaign.status === 'draft' && <span className="text-gray-500">Draft</span>}
            {campaign.status === 'completed' && <span className="text-blue-600">Completed</span>}
          </span>
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800">Channel: {campaign.channel || 'email'}</span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800">Tone: {(campaign as any).tone || 'friendly'}</span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800">Industry: {(campaign as any).industry || '—'}</span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-800">Leads: {campaign.leads_count ?? 0}</span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800">Response: {(campaign as any).response_rate ?? 0}%</span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800">Appointments: {(campaign as any).appointments_count ?? 0}</span>
      </div>
      {/* Progress */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-800 mb-1">Progress</div>
        {progressLoading && <div className="text-xs text-gray-400">Loading progress…</div>}
        {!progressLoading && progress && (
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Pending: {progress.pending}</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">Sent: {progress.sent}</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">Failed: {progress.failed}</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700">Cancelled: {progress.cancelled}</span>
            {progress.nextDue && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">Next: {new Date(progress.nextDue).toLocaleString()}</span>
            )}
          </div>
        )}
      </div>
      <div className="mb-4">
        <div className="font-medium text-gray-800 mb-2">Campaign Info</div>
        <div className="text-sm text-gray-600 whitespace-pre-line">{campaign.description || <span className="italic text-gray-400">No description</span>}</div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => onEdit(campaign)}>Edit</button>
        {campaign.status === 'draft' && (
          <button
            className={`px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 ${loadingActionId===campaign.id ? 'opacity-60 cursor-wait' : ''}`}
            onClick={() => onStart(campaign.id)}
            disabled={loadingActionId===campaign.id}
          >Start</button>
        )}
        {campaign.status === 'active' && (
          <>
            <button
              className={`px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 ${loadingActionId===campaign.id ? 'opacity-60 cursor-wait' : ''}`}
              onClick={() => onPause(campaign.id)}
              disabled={loadingActionId===campaign.id}
            >Pause</button>
            <button
              className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 ${loadingActionId===campaign.id ? 'opacity-60 cursor-wait' : ''}`}
              onClick={() => onStop(campaign.id)}
              disabled={loadingActionId===campaign.id}
            >Stop</button>
          </>
        )}
        <button
          className={`px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 ${loadingActionId===campaign.id ? 'opacity-60 cursor-wait' : ''}`}
          onClick={() => onBroadcast(campaign)}
          disabled={loadingActionId===campaign.id}
        >Broadcast</button>
        {(campaign.status === 'paused' || campaign.status === 'completed' || campaign.status === 'draft') && (
          <button
            className={`px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 ${loadingActionId===campaign.id ? 'opacity-60 cursor-wait' : ''}`}
            onClick={() => onDelete(campaign.id)}
            disabled={loadingActionId===campaign.id}
          >Delete</button>
        )}
      </div>
    </div>
  )
}


export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [filterTone, setFilterTone] = useState<string>('all')
  const [error, setError] = useState('')
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)
  const { user, token } = useAuth()
  const search = useSearchParams()
  const router = useRouter()

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      if (!token) { setError('Missing user token. Please re-login.'); setLoading(false); return }
      const camps = await fetch('http://localhost:3001/campaigns', { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } })
      if (!camps.ok) throw new Error(await camps.text())
      const json = await camps.json()
      setCampaigns(json)
      // Select first campaign if none selected
      if (!selectedCampaignId && json.length > 0) setSelectedCampaignId(json[0].id)
    } catch (e: any) {
      setError(e?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleStartCampaign = async (campaignId: string) => {
    setLoadingActionId(campaignId)
    try {
      const response = await fetch(`http://localhost:3001/campaigns/${campaignId}/start`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } })
      if (!response.ok) throw new Error('Failed to start campaign')
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'active' as const } : c))
      const camp = campaigns.find(c => c.id === campaignId)
      if (camp) {
        try {
          const bulk = await fetch('http://localhost:3001/sequences/start-all', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId: camp.client_id, campaignId: camp.id, channel: 'email', tone: (camp as any).tone || 'friendly' })
          })
          const data = await bulk.json()
          if (!bulk.ok) throw new Error(data?.message || 'Failed to enqueue sequences')
          setError(`Enqueued ${data.enqueued} leads (${data.steps_created} steps) for '${camp.name}'`)
        } catch (e: any) { setError(e.message) }
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to start')
    } finally {
      setLoadingActionId(null)
    }
  }

  const handlePauseCampaign = async (campaignId: string) => {
    setLoadingActionId(campaignId)
    try {
      const res = await fetch(`http://localhost:3001/campaigns/${campaignId}/pause`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error('Failed to pause campaign')
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'paused' as const } : c))
    } catch (e: any) {
      setError(e?.message || 'Failed to pause')
    } finally {
      setLoadingActionId(null)
    }
  }
  const handleBroadcast = async (camp: Campaign) => {
    try {
      setLoadingActionId(camp.id)
      const bulk = await fetch('http://localhost:3001/sequences/start-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: camp.client_id, campaignId: camp.id, channel: 'email', tone: (camp as any).tone || 'friendly' })
      })
      const data = await bulk.json()
      if (!bulk.ok) throw new Error(data?.message || 'Failed to enqueue sequences')
      // Bubble the result to detail instead of page banner
      setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, leads_count: (c.leads_count ?? 0) + (data.enqueued ?? 0) } : c))
      try { await fetch('http://localhost:3001/sequences/tick', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }) } catch {}
    } catch (e:any) {
      setError(e?.message || 'Broadcast failed')
    } finally {
      setLoadingActionId(null)
    }
  }
  const handleStopCampaign = async (campaignId: string) => {
    setLoadingActionId(campaignId)
    try {
      const res = await fetch(`http://localhost:3001/campaigns/${campaignId}/stop`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error('Failed to stop campaign')
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'completed' as const } : c))
    } catch (e: any) {
      setError(e?.message || 'Failed to stop')
    } finally {
      setLoadingActionId(null)
    }
  }
  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Delete this campaign? This cannot be undone.')) return;
    setLoadingActionId(campaignId)
    try {
      const res = await fetch(`http://localhost:3001/campaigns/${campaignId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error((await res.text()) || 'Failed to delete campaign')
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
      // If deleted campaign is selected, select another
      if (selectedCampaignId === campaignId) {
        setSelectedCampaignId(prev => {
          const next = campaigns.find(c => c.id !== campaignId)
          return next ? next.id : null
        })
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to delete')
    } finally {
      setLoadingActionId(null)
    }
  }
  const handleEditCampaign = (campaign: Campaign) => { router.push(`/campaigns/new?edit=${campaign.id}`) }

  const filteredCampaigns = campaigns.filter(c => {
    const q = searchTerm.toLowerCase()
    const byText = c.name.toLowerCase().includes(q) || c.client_name.toLowerCase().includes(q)
    const byStatus = filterStatus === 'all' || c.status === filterStatus
    const byChannel = filterChannel === 'all' || c.channel === filterChannel
    const byTone = filterTone === 'all' || ((c as any).tone || 'friendly') === filterTone
    return byText && byStatus && byChannel && byTone
  })

  useEffect(() => { if (user && token) fetchData() }, [user, token])
  // If redirected with ?open=ID, select it when data loads
  useEffect(() => {
    const openId = search?.get('open')
    if (openId && campaigns.find(c => c.id === openId)) setSelectedCampaignId(openId)
  }, [search, campaigns])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view campaigns.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
              <p className="mt-2 text-gray-600">Manage your AI automation campaigns</p>
            </div>
            <button onClick={() => router.push('/campaigns/new')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <img src="/icons/plus.png" alt="New" className="w-8 h-7" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img src="/icons/search.png" alt="Search" className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
            <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Channels</option>
              <option value="email">Email</option>
            </select>
            <select value={filterTone} onChange={(e) => setFilterTone(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Tones</option>
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-start">
            <div className="pr-3">{error}</div>
            <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700 text-xl leading-none">×</button>
          </div>
        )}

        {/* Sidebar+Main */}
        <div className="flex bg-white rounded-lg shadow-md min-h-[32rem] overflow-hidden" style={{ minHeight: '28rem' }}>
          {/* Sidebar */}
          <aside className="w-[18rem] border-r bg-gray-50 hidden md:block">
            <div className="h-full flex flex-col">
              <div className="px-4 py-4 border-b text-sm font-medium text-gray-500 bg-gray-100">CAMPAIGNS</div>
              {loading ? (
                <div className="flex-1 px-4 py-3 text-gray-300 animate-pulse">Loading...</div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="flex-1 px-4 py-8 text-gray-400 text-center">
                  <img src="/icons/chart.png" alt="No Campaigns" className="mx-auto w-10 h-10 opacity-50 mb-2" />
                  <div>No campaigns</div>
                </div>
              ) : (
                <ul className="flex-1 overflow-y-auto">
                  {filteredCampaigns.map((c) => (
                    <li key={c.id}
                        className={`py-3 px-4 border-b border-dashed border-gray-100 hover:bg-blue-50 cursor-pointer flex items-center transition-colors ${selectedCampaignId === c.id ? 'bg-blue-100 font-bold text-blue-900' : 'text-gray-800'}`}
                        onClick={() => setSelectedCampaignId(c.id)}
                    >
                      <span className="flex-1 truncate">{c.name}</span>
                      {c.status === 'active' && <span className="ml-2 rounded-full w-2.5 h-2.5 bg-green-500 inline-block" title="Active"></span>}
                      {c.status === 'paused' && <span className="ml-2 rounded-full w-2.5 h-2.5 bg-yellow-400 inline-block" title="Paused"></span>}
                    </li>
                  ))}
                </ul>
              )}
              <div className="px-4 py-4 border-t bg-white">
                <button onClick={() => router.push('/campaigns/new')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center"><img src="/icons/plus.png" alt="New" className="w-5 h-5 mr-2" /> New Campaign</button>
              </div>
            </div>
          </aside>
          {/* Mobile Sidebar dropdown */}
          <aside className="block md:hidden w-full border-b bg-gray-100">
            {filteredCampaigns.length ? (
              <select
                className="w-full px-3 py-3 border-0 bg-gray-100 text-gray-800"
                value={selectedCampaignId || ''}
                onChange={e => setSelectedCampaignId(e.target.value)}
              >
                {filteredCampaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <div className="px-4 py-3 text-gray-400">No campaigns</div>
            )}
          </aside>
          {/* Main Details */}
          <main className="flex-1 min-h-[24rem]">
            {loading ? (
              <div className="flex items-center justify-center h-full"><div className="text-gray-300 text-lg animate-pulse">Loading...</div></div>
            ) : (
              <CampaignDetails
                campaign={campaigns.find(c => c.id === selectedCampaignId) || null}
                onEdit={handleEditCampaign}
                onStart={handleStartCampaign}
                onPause={handlePauseCampaign}
                onStop={handleStopCampaign}
                onDelete={handleDeleteCampaign}
                onBroadcast={handleBroadcast}
                loadingActionId={loadingActionId}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
