"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Campaign, CreateCampaignData } from '@/types/campaign'
import { Client } from '@/types/client'
import CampaignCard from '@/components/CampaignCard'
import CampaignForm from '@/components/CampaignForm'
import { useAuth } from '@/contexts/AuthContext'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const [editing, setEditing] = useState<Campaign | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterClientId, setFilterClientId] = useState<string>('all')
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [error, setError] = useState('')
  const { user, token } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      if (!token) { setError('Missing user token. Please re-login.'); setLoading(false); return }
      const [camps, clis] = await Promise.all([
        fetch('http://localhost:3001/campaigns', { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }),
        fetch('http://localhost:3001/clients', { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } })
      ])
      if (!camps.ok) throw new Error(await camps.text())
      if (!clis.ok) throw new Error(await clis.text())
      setCampaigns(await camps.json())
      setClients(await clis.json())
    } catch (e: any) {
      setError(e?.message || 'Failed to load data')
    } finally { setLoading(false) }
  }

  const handleCreateCampaign = async (campaignData: CreateCampaignData, options?: { startNow?: boolean }) => {
    try {
      const response = await fetch('http://localhost:3001/campaigns/add', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(campaignData) })
      if (!response.ok) throw new Error((await response.text()) || 'Failed to create campaign')
      const created = await response.json()
      setCampaigns(prev => [created, ...prev])
      if (options?.startNow && created?.id) await handleStartCampaign(created.id)
    } catch (e: any) { setError(e?.message || 'Failed to create campaign'); throw e }
  }

  const handleUpdateCampaign = async (campaignData: CreateCampaignData) => {
    if (!editing) return
    try {
      const res = await fetch(`http://localhost:3001/campaigns/${editing.id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(campaignData) })
      if (!res.ok) throw new Error((await res.text()) || 'Failed to update campaign')
      const updated = await res.json()
      setCampaigns(prev => prev.map(c => c.id === updated.id ? updated : c))
      setEditing(null)
    } catch (e: any) { setError(e?.message || 'Failed to update campaign'); throw e }
  }

  const handleStartCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/campaigns/${campaignId}/start`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } })
      if (!response.ok) throw new Error('Failed to start campaign')
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'active' as const } : c))
      const camp = campaigns.find(c => c.id === campaignId)
      if (camp) {
        try {
          const bulk = await fetch('http://localhost:3001/sequences/start-all', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: camp.client_id, campaignId: camp.id, channel: 'email' }) })
          const data = await bulk.json()
          if (!bulk.ok) throw new Error(data?.message || 'Failed to enqueue sequences')
          setError(`Enqueued ${data.enqueued} leads (${data.steps_created} steps) for '${camp.name}'`)
        } catch (e: any) { setError(e.message) }
      }
    } catch (e: any) { setError(e?.message || 'Failed to start') }
  }

  const handlePauseCampaign = async (campaignId: string) => {
    try { const res = await fetch(`http://localhost:3001/campaigns/${campaignId}/pause`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }); if (!res.ok) throw new Error('Failed to pause campaign'); setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'paused' as const } : c)) } catch (e: any) { setError(e?.message || 'Failed to pause') }
  }
  const handleStopCampaign = async (campaignId: string) => {
    try { const res = await fetch(`http://localhost:3001/campaigns/${campaignId}/stop`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }); if (!res.ok) throw new Error('Failed to stop campaign'); setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'completed' as const } : c)) } catch (e: any) { setError(e?.message || 'Failed to stop') }
  }
  const handleDeleteCampaign = async (campaignId: string) => {
    try { if (!confirm('Delete this campaign? This cannot be undone.')) return; const res = await fetch(`http://localhost:3001/campaigns/${campaignId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }); if (!res.ok) throw new Error((await res.text()) || 'Failed to delete campaign'); setCampaigns(prev => prev.filter(c => c.id !== campaignId)) } catch (e: any) { setError(e?.message || 'Failed to delete') }
  }
  const handleEditCampaign = (campaign: Campaign) => { setEditing(campaign) }

  const filteredCampaigns = campaigns.filter(c => {
    const q = searchTerm.toLowerCase()
    const byText = c.name.toLowerCase().includes(q) || c.client_name.toLowerCase().includes(q)
    const byStatus = filterStatus === 'all' || c.status === filterStatus
    const byClient = filterClientId === 'all' || c.client_id === filterClientId
    const byChannel = filterChannel === 'all' || c.channel === filterChannel
    return byText && byStatus && byClient && byChannel
  })

  useEffect(() => { if (user && token) fetchData() }, [user, token])

  // Open create panel when `?new=1` is present
  useEffect(() => {
    const isNew = searchParams?.get('new')
    if (isNew && !showCreatePanel && !editing) setShowCreatePanel(true)
  }, [searchParams, showCreatePanel, editing])

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
            <button onClick={() => {
              const next = !showCreatePanel
              setShowCreatePanel(next)
              try {
                const url = new URL(window.location.href)
                if (next) url.searchParams.set('new', '1'); else url.searchParams.delete('new')
                router.replace(url.pathname + (url.search ? url.search : ''))
              } catch {}
            }} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <img src="/icons/plus.png" alt="New" className="w-8 h-7" />
              <span>{showCreatePanel ? 'Hide Form' : 'New Campaign'}</span>
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input type="text" placeholder="Search campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
            <select value={filterClientId} onChange={(e) => setFilterClientId(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Clients</option>
              {clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Channels</option>
              <option value="email">Email</option>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow"><div className="flex items-center"><div className="p-2 bg-blue-100 rounded-lg flex items-center justify-center"><img src="/icons/chart.png" alt="Total Campaigns" className="w-7 h-7" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-500">Total Campaigns</p><p className="text-2xl font-bold text-gray-900">{campaigns.length}</p></div></div></div>
          <div className="bg-white p-6 rounded-lg shadow"><div className="flex items-center"><div className="p-2 bg-green-100 rounded-lg flex items-center justify-center"><img src="/icons/start.png" alt="Active" className="w-7 h-7" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-500">Active</p><p className="text-2xl font-bold text-gray-900">{campaigns.filter(c => c.status === 'active').length}</p></div></div></div>
          <div className="bg-white p-6 rounded-lg shadow"><div className="flex items-center"><div className="p-2 bg-yellow-100 rounded-lg flex items-center justify-center"><img src="/icons/pause.png" alt="Paused" className="w-7 h-7" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-500">Paused</p><p className="text-2xl font-bold text-gray-900">{campaigns.filter(c => c.status === 'paused').length}</p></div></div></div>
          <div className="bg-white p-6 rounded-lg shadow"><div className="flex items-center"><div className="p-2 bg-purple-100 rounded-lg flex items-center justify-center"><img src="/icons/users.png" alt="Total Leads" className="w-7 h-7" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-500">Total Leads</p><p className="text-2xl font-bold text-gray-900">{campaigns.reduce((sum, c) => sum + c.leads_count, 0)}</p></div></div></div>
        </div>

        {/* List + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex space-x-3">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="mb-4 flex justify-center"><img src="/icons/chart.png" alt="No Campaigns" className="w-16 h-16 text-gray-400" /></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-500 mb-6">{searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter criteria' : 'Get started by creating your first campaign'}</p>
                {!searchTerm && filterStatus === 'all' && (
                  <button onClick={() => {
                    setShowCreatePanel(true)
                    try {
                      const url = new URL(window.location.href)
                      url.searchParams.set('new', '1')
                      router.replace(url.pathname + (url.search ? url.search : ''))
                    } catch {}
                  }} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Create Your First Campaign</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} onEdit={handleEditCampaign} onStart={handleStartCampaign} onPause={handlePauseCampaign} onStop={handleStopCampaign} onDelete={handleDeleteCampaign} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {(showCreatePanel || editing) ? (
              <CampaignForm
                mode={editing ? 'edit' : 'create'}
                clients={clients.map(c => ({ id: c.id, name: c.name }))}
                initial={editing ? { client_id: editing.client_id, name: editing.name, description: editing.description, channel: editing.channel } : undefined}
                onSubmit={async (data, opts) => {
                  if (editing) {
                    await handleUpdateCampaign(data)
                  } else {
                    await handleCreateCampaign(data, opts)
                    setShowCreatePanel(false)
                  }
                }}
                onCancel={() => { setEditing(null); setShowCreatePanel(false) }}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-dashed shadow-sm p-6 text-center text-gray-600">
                <div className="font-semibold mb-1">Create a new campaign</div>
                <div className="text-sm mb-4">Pick a client, set details, and start immediately.</div>
                <button onClick={() => setShowCreatePanel(true)} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Open Form</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
