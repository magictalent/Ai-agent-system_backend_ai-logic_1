'use client'

import { useState, useEffect } from 'react'
import { Campaign, CreateCampaignData } from '@/types/campaign'
import { Client } from '@/types/client'
import AddCampaignModal from '@/components/AddCampaignModal'
import CampaignCard from '@/components/CampaignCard'
import AiDashboard from '@/components/AiDashboard'
import { useAuth } from '@/contexts/AuthContext'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [error, setError] = useState('')
  const { user, token } = useAuth()

  // Fetch campaigns and clients
  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      if (!token) {
        setError('Missing user token. Please re-login.')
        setLoading(false)
        return
      }

      console.log('🔍 Fetching data with token:', token ? 'Present' : 'Missing')

      const [campaignsResponse, clientsResponse] = await Promise.all([
        fetch('http://localhost:3001/campaigns', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('http://localhost:3001/clients', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ])

      console.log('📡 Campaigns response status:', campaignsResponse.status)
      console.log('📡 Clients response status:', clientsResponse.status)

      if (!campaignsResponse.ok) {
        const campaignsError = await campaignsResponse.text()
        console.error('❌ Campaigns error:', campaignsError)
        throw new Error(`Campaigns API error: ${campaignsResponse.status} - ${campaignsError}`)
      }

      if (!clientsResponse.ok) {
        const clientsError = await clientsResponse.text()
        console.error('❌ Clients error:', clientsError)
        throw new Error(`Clients API error: ${clientsResponse.status} - ${clientsError}`)
      }

      const campaignsData = await campaignsResponse.json()
      const clientsData = await clientsResponse.json()

      console.log('📊 Campaigns data:', campaignsData)
      console.log('👥 Clients data:', clientsData)

      setCampaigns(campaignsData)
      setClients(clientsData)
    } catch (err: any) {
      console.error('❌ Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create new campaign
  const handleCreateCampaign = async (campaignData: CreateCampaignData) => {
    try {
      const response = await fetch('http://localhost:3001/campaigns/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      })

      if (!response.ok) {
        let errorMsg = 'Failed to create campaign'
        try {
          const errorData = await response.json()
          errorMsg = errorData.message || errorMsg
        } catch (e) {}
        throw new Error(errorMsg)
      }

      const newCampaign = await response.json()
      setCampaigns(prev => [...prev, newCampaign])
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign')
      throw new Error(err.message || 'Failed to create campaign')
    }
  }

  // Campaign actions
  const handleStartCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/campaigns/${campaignId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to start campaign')

      setCampaigns(prev => prev.map(c =>
        c.id === campaignId ? { ...c, status: 'active' as const } : c
      ))

      // After marking campaign active, enqueue sequences for all leads for this campaign's client
      const camp = campaigns.find(c => c.id === campaignId)
      if (camp) {
        try {
          const bulk = await fetch('http://localhost:3001/sequences/start-all', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clientId: camp.client_id, campaignId: camp.id, channel: 'email' })
          })
          const data = await bulk.json()
          if (!bulk.ok) throw new Error(data?.message || 'Failed to enqueue sequences')
          // Surface a lightweight toast via error banner for now
          setError(`Enqueued ${data.enqueued} leads (${data.steps_created} steps) for '${camp.name}'`)
        } catch (e: any) {
          setError(e.message)
        }
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/campaigns/${campaignId}/pause`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to pause campaign')

      setCampaigns(prev => prev.map(c =>
        c.id === campaignId ? { ...c, status: 'paused' as const } : c
      ))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleStopCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/campaigns/${campaignId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to stop campaign')

      setCampaigns(prev => prev.map(c =>
        c.id === campaignId ? { ...c, status: 'completed' as const } : c
      ))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      if (!confirm('Delete this campaign? This cannot be undone.')) return
      const res = await fetch(`http://localhost:3001/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to delete campaign')
      }
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleEditCampaign = (campaign: Campaign) => {
    // TODO: Implement edit functionality
    console.log('Edit campaign:', campaign)
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus
    return matchesSearch && matchesFilter
  })

  useEffect(() => {
    if (user && token) {
      fetchData()
    }
  }, [user, token])

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
              <p className="mt-2 text-gray-600">
                Manage your AI automation campaigns
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <img src="/icons/plus.png" alt="New" className="w-8 h-7" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
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
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <img src="/icons/filter.png" alt="Filter" className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900">Debug Info</h3>
              <div className="space-x-2">
                <button
                  onClick={fetchData}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Refresh Data
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:3001/clients/test', {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });
                      const result = await response.json();
                      console.log('🧪 Test connection result:', result);
                      alert(`Test result: ${JSON.stringify(result, null, 2)}`);
                    } catch (err: any) {
                      console.error('❌ Test failed:', err);
                      alert(`Test failed: ${err.message || err}`);
                    }
                  }}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Test DB
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:3001/clients', {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });
                      const result = await response.json();
                      console.log('👥 All clients result:', result);
                      alert(`Found ${result.length} clients: ${JSON.stringify(result, null, 2)}`);
                    } catch (err: any) {
                      console.error('❌ Get clients failed:', err);
                      alert(`Get clients failed: ${err.message || err}`);
                    }
                  }}
                  className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                >
                  List Clients
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">Clients loaded: {clients.length}</p>
            <p className="text-sm text-gray-600">Campaigns loaded: {campaigns.length}</p>
            {clients.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Available clients:</p>
                <ul className="text-sm text-gray-600 ml-4">
                  {clients.map(client => (
                    <li key={client.id}>• {client.name} ({client.email})</li>
                  ))}
                </ul>
              </div>
            )}
            {clients.length === 0 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-700 mb-2">
                  No clients found. Make sure you have added clients and they are properly saved to the database.
                </p>
                <a 
                  href="/clients" 
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Go to Clients page to add clients →
                </a>
              </div>
            )}
          </div>
        )}

        {/* AI Dashboard */}
        <div className="mb-8">
          <AiDashboard />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg flex items-center justify-center">
                <img src="/icons/chart.png" alt="Total Campaigns" className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg flex items-center justify-center">
                <img src="/icons/start.png" alt="Active" className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg flex items-center justify-center">
                <img src="/icons/pause.png" alt="Paused" className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Paused</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'paused').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg flex items-center justify-center">
                <img src="/icons/users.png" alt="Total Leads" className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + c.leads_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="mb-4 flex justify-center">
              <img src="/icons/chart.png" alt="No Campaigns" className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first campaign'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Campaign
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onEdit={handleEditCampaign}
                onStart={handleStartCampaign}
                onPause={handlePauseCampaign}
                onStop={handleStopCampaign}
                onDelete={handleDeleteCampaign}
              />
            ))}
          </div>
        )}

        {/* Add Campaign Modal */}
        <AddCampaignModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateCampaign}
        />
      </div>
    </div>
  )
}
