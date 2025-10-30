
'use client'
import { API_BASE } from '@/lib/api';
import { useState, useEffect } from 'react'
import { CreateClientData } from '@/types/client'
import AddClientModal from '@/components/AddClientModal'
import ClientsTable from '@/components/ClientsTable'
import { useAuth } from '@/contexts/AuthContext'

export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  industry?: string
  crm_provider: 'hubspot' | 'salesforce' | 'pipedrive' | 'mock'
  created_at: string
  updated_at: string
  crm_connected: boolean;
  ai_status: 'idle' | 'active' | 'paused';
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [error, setError] = useState('')
  const { user, token } = useAuth()

  // Fetch clients from backend
  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }

      const data = await response.json()
      setClients(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create new client
  const handleCreateClient = async (clientData: CreateClientData) => {
    try {
      const response = await fetch(`${API_BASE}/clients/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create client')
      }

      const newClient = await response.json()
      setClients(prev => [...prev, newClient])
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create client')
    }
  }

  // Delete client
  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const response = await fetch(`${API_BASE}/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete client')
      }

      setClients(prev => prev.filter(client => client.id !== clientId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    if (user && token) {
      fetchClients()
    }
  }, [user, token])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view clients.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
              <p className="mt-2 text-gray-600">
                Manage your client relationships and CRM integrations
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>Add Client</span>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <img src="/icons/users.png" alt="Total Clients" className="w-10 h-10" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <img src="/icons/crm.png" alt="CRM Connected" className="w-10 h-10" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">CRM Connected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.crm_connected).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <img src="/icons/ai.png" alt="AI Active" className="w-10 h-10" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">AI Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.ai_status !== 'idle').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <img src="/icons/chart.png" alt="This Month" className="w-10 h-10" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => {
                    const created = new Date(c.created_at)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <ClientsTable
          clients={clients}
          loading={loading}
          onDelete={handleDeleteClient}
        />

        {/* Add Client Modal */}
        <AddClientModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateClient}
        />
      </div>
    </div>
  )
}
