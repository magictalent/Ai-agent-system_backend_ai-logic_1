'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AiActivity {
  id: string
  activity_type: string
  description: string
  created_at: string
}

interface AiStatus {
  campaignId: string
  activities: AiActivity[]
  lastActivity: AiActivity | null
}

interface AiDashboardData {
  total_active_campaigns: number
  campaigns: Array<{
    id: string
    name: string
    status: string
    channel: string
    leads_count: number
    appointments_count: number
    response_rate: number
    ai_status: AiStatus
  }>
}

export default function AiDashboard() {
  const [dashboardData, setDashboardData] = useState<AiDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  const fetchAiDashboard = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔍 Fetching AI dashboard...')
      
      const response = await fetch('http://localhost:3001/campaigns/ai-dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 AI Dashboard response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ AI Dashboard error:', errorText)
        throw new Error(`AI Dashboard API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📊 AI Dashboard data:', data)
      setDashboardData(data)
    } catch (err: any) {
      console.error('❌ AI Dashboard fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchAiDashboard()
      // Refresh every 30 seconds
      const interval = setInterval(fetchAiDashboard, 30000)
      return () => clearInterval(interval)
    }
  }, [token])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading AI dashboard: {error}</p>
        <div className="mt-2 space-x-2">
          <button
            onClick={fetchAiDashboard}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:3001/campaigns', {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
                const data = await response.json();
                console.log('📊 Campaigns data:', data);
                alert(`Found ${data.length} campaigns. Check console for details.`);
              } catch (err) {
                console.error('❌ Campaigns test failed:', err);
                alert(`Campaigns test failed: ${err.message}`);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Campaigns API
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData || dashboardData.total_active_campaigns === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Dashboard</h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🤖</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Active AI Campaigns</h4>
          <p className="text-gray-600">Start a campaign to see AI automation in action!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">🤖 AI Dashboard</h3>
        <button
          onClick={fetchAiDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardData.campaigns.map((campaign) => (
          <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                campaign.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {campaign.status}
              </span>
            </div>

            <div className="mb-3">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {campaign.channel.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{campaign.leads_count}</div>
                <div className="text-xs text-gray-500">Leads</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{campaign.appointments_count}</div>
                <div className="text-xs text-gray-500">Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{campaign.response_rate}%</div>
                <div className="text-xs text-gray-500">Response</div>
              </div>
            </div>

            {/* AI Activities */}
            <div className="border-t pt-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Recent AI Activity</h5>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {campaign.ai_status.activities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <div className="font-medium">{activity.activity_type.replace('_', ' ')}</div>
                    <div>{activity.description}</div>
                    <div className="text-gray-400">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {campaign.ai_status.activities.length === 0 && (
                  <div className="text-xs text-gray-500 italic">No recent activity</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
