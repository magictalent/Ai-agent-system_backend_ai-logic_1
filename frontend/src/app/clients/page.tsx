'use client'

import { useState } from 'react'
import { Search, Filter, Plus, Mail, Phone, MessageCircle, Calendar } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'onboarding'
  campaigns: number
  leads: number
  lastActive: string
}

const clients: Client[] = [
  {
    id: '1',
    name: 'TechCorp Inc.',
    email: 'john@techcorp.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    campaigns: 3,
    leads: 217,
    lastActive: '2024-01-15'
  },
  {
    id: '2',
    name: 'StartupXYZ',
    email: 'sarah@startupxyz.com',
    phone: '+1 (555) 987-6543',
    status: 'active',
    campaigns: 2,
    leads: 89,
    lastActive: '2024-01-14'
  },
  {
    id: '3',
    name: 'Global Solutions',
    email: 'mike@globalsolutions.com',
    phone: '+1 (555) 456-7890',
    status: 'onboarding',
    campaigns: 0,
    leads: 0,
    lastActive: '2024-01-10'
  },
  {
    id: '4',
    name: 'Innovate Labs',
    email: 'lisa@innovatelabs.com',
    phone: '+1 (555) 234-5678',
    status: 'inactive',
    campaigns: 1,
    leads: 45,
    lastActive: '2023-12-20'
  }
]

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'onboarding': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-2">Manage your clients and their automation flows</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search clients..."
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

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(client.status)}`}>
                  {client.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail size={16} />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>{client.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{client.campaigns}</div>
                <div className="text-xs text-gray-500">Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{client.leads}</div>
                <div className="text-xs text-gray-500">Leads</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center justify-center space-x-1">
                <MessageCircle size={16} />
                <span>Messages</span>
              </button>
              <button className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg font-medium hover:bg-green-100 transition flex items-center justify-center space-x-1">
                <Calendar size={16} />
                <span>Calendar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}