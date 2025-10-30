'use client'
import { API_BASE } from '@/lib/api';

import { useState, useEffect } from 'react'
import { Conversation, MessageFilters } from '@/types/message'
import ConversationCard from '@/components/ConversationCard'
import { useAuth } from '@/contexts/AuthContext'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

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
      const response = await fetch(`${API_BASE}/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error(`Error ${response.status}`)
      const data = await response.json()
      setConversations(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
    if (user && token) fetchConversations()
  }, [user, token])

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <DotLottieReact
          src="https://lottie.host/972f5692-c538-4c9d-8b49-a95f962d21e3/ET4TOwMNEM.lottie"
          loop
          autoplay
          className="w-64 h-64 mb-8"
        />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Please log in</h2>
        <p className="text-gray-600">You need to be logged in to view messages.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                Conversations
              </span>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-semibold">
                Live
              </span>
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage and monitor AI-driven chats with leads across all campaigns.
            </p>
            <button
              onClick={fetchConversations}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow transition"
            >
              Refresh
            </button>
          </div>

          <div className="mt-8 lg:mt-0 w-60 h-60">
            <DotLottieReact
              src="https://lottie.host/543733f0-2f25-481b-a4ac-9d21e2dd67e3/aD9Jv5JocS.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="absolute left-3 top-3 text-gray-400 text-lg">🔍</div>
          </div>
          <select
            value={filters.channel || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value as 'whatsapp' | 'email' | 'sms' | undefined }))}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-3 text-red-500 hover:text-red-700 font-semibold"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Conversations', value: conversations.length, color: 'blue', icon: '💬' },
            { 
              title: 'Email',
              value: conversations.filter(c => c.channel === 'email').length,
              color: 'green',
              icon: <img src="/gmail.png" alt="Email" className="w-7 h-7" />
            },
            { 
              title: 'WhatsApp',
              value: conversations.filter(c => c.channel === 'whatsapp').length,
              color: 'yellow',
              icon: <img src="/whatsapp.png" alt="WhatsApp" className="w-7 h-7" />
            },
            { title: 'SMS', value: conversations.filter(c => c.channel === 'sms').length, color: 'purple', icon: '📱' },
          ].map(({ title, value, color, icon }) => (
            <div
              key={title}
              className={`bg-gradient-to-br from-${color}-50 to-white border border-${color}-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition`}
            >
              <div className="flex items-center">
                <div className={`p-3 bg-${color}-100 rounded-xl text-${color}-600 text-2xl`}>
                  {icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{title}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Conversations List */}
        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse flex space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                  <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
            <DotLottieReact
              src="https://lottie.host/3068bef2-cd5a-44d9-8d39-e2e7932b9071/XVQmT4YP2O.lottie"
              loop
              autoplay
              className="w-48 h-48 mx-auto mb-6"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Conversations Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filters.channel
                ? 'Try adjusting your filters or search terms.'
                : 'Start a campaign to see your AI agent in action.'}
            </p>
            {!searchTerm && !filters.channel && (
              <button
                onClick={() => (window.location.href = '/campaigns')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
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

