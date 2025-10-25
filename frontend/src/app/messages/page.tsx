'use client'

import { useState, useEffect } from 'react'
import { Conversation, MessageFilters } from '@/types/message'
import ConversationCard from '@/components/ConversationCard'
import { useAuth } from '@/contexts/AuthContext'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<MessageFilters>({})
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const { user, token } = useAuth()

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔍 Fetching conversations...')
      
      const response = await fetch('http://localhost:3001/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Conversations response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Conversations error:', errorText)
        throw new Error(`Messages API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📊 Conversations data:', data)
      setConversations(data)
    } catch (err: any) {
      console.error('❌ Conversations fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter conversations
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = 
      conversation.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.lead_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.campaign_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesChannel = !filters.channel || conversation.channel === filters.channel
    const matchesCampaign = !filters.campaign_id || conversation.campaign_id === filters.campaign_id
    
    return matchesSearch && matchesChannel && matchesCampaign
  })

  useEffect(() => {
    if (user && token) {
      fetchConversations()
    }
  }, [user, token])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view messages.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="mt-2 text-gray-600">
                AI conversations with leads across all campaigns
              </p>
            </div>
            <button
              onClick={fetchConversations}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filters.channel || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value as any || undefined }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Channels</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <span>🔧</span>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">📧</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-2xl font-bold text-gray-900">
                  {conversations.filter(c => c.channel === 'email').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                <p className="text-2xl font-bold text-gray-900">
                  {conversations.filter(c => c.channel === 'whatsapp').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">📱</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">SMS</p>
                <p className="text-2xl font-bold text-gray-900">
                  {conversations.filter(c => c.channel === 'sms').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filters.channel 
                ? 'Try adjusting your search or filter criteria'
                : 'Start a campaign to see AI conversations with leads'
              }
            </p>
            {!searchTerm && !filters.channel && (
              <button
                onClick={() => window.location.href = '/campaigns'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Campaigns
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.lead_id}
                conversation={conversation}
                onSelect={setSelectedConversation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}