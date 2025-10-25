'use client'

import { useState } from 'react'
import { Search, Filter, Plus, Play, Pause, Edit, MoreVertical, Users, MessageCircle, Calendar } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'draft'
  client: string
  leads: number
  appointments: number
  responseRate: number
  channel: 'whatsapp' | 'email' | 'sms' | 'multi'
  lastActive: string
}

const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'TechCorp - Q1 Outreach',
    status: 'active',
    client: 'TechCorp Inc.',
    leads: 54,
    appointments: 12,
    responseRate: 30,
    channel: 'whatsapp',
    lastActive: '2024-01-15'
  },
  {
    id: '2',
    name: 'StartupXYZ - Lead Nurturing',
    status: 'active',
    client: 'StartupXYZ',
    leads: 32,
    appointments: 8,
    responseRate: 40,
    channel: 'email',
    lastActive: '2024-01-14'
  },
  {
    id: '3',
    name: 'Global Solutions - Onboarding',
    status: 'draft',
    client: 'Global Solutions',
    leads: 0,
    appointments: 0,
    responseRate: 0,
    channel: 'multi',
    lastActive: '2024-01-10'
  },
  {
    id: '4',
    name: 'Innovate Labs - Reactivation',
    status: 'paused',
    client: 'Innovate Labs',
    leads: 19,
    appointments: 5,
    responseRate: 36,
    channel: 'sms',
    lastActive: '2023-12-20'
  }
]

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.client.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return 'bg-green-50 text-green-700 border-green-200'
      case 'email': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'sms': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'multi': return 'bg-orange-50 text-orange-700 border-orange-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-2">Manage your AI automation campaigns</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2">
          <Plus size={20} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2">
          <Filter size={20} />
          <span>Filter</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{campaign.client}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getChannelColor(campaign.channel)}`}>
                {campaign.channel.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-1">
                  <Users size={16} />
                  <span>Leads</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{campaign.leads}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-1">
                  <Calendar size={16} />
                  <span>Appointments</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{campaign.appointments}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-1">
                  <MessageCircle size={16} />
                  <span>Response</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{campaign.responseRate}%</div>
              </div>
            </div>

            <div className="flex space-x-2">
              {campaign.status === 'active' ? (
                <button className="flex-1 bg-yellow-50 text-yellow-700 py-2 rounded-lg font-medium hover:bg-yellow-100 transition flex items-center justify-center space-x-1">
                  <Pause size={16} />
                  <span>Pause</span>
                </button>
              ) : (
                <button className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg font-medium hover:bg-green-100 transition flex items-center justify-center space-x-1">
                  <Play size={16} />
                  <span>Start</span>
                </button>
              )}
              <button className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center justify-center space-x-1">
                <Edit size={16} />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}