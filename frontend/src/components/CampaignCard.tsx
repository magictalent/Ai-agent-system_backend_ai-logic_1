'use client'

import { useState } from 'react'
import { Campaign, CHANNEL_CONFIGS, STATUS_CONFIGS } from '@/types/campaign'

interface CampaignCardProps {
  campaign: Campaign
  onEdit: (campaign: Campaign) => void
  onStart: (campaignId: string) => void
  onPause: (campaignId: string) => void
  onStop: (campaignId: string) => void
}

export default function CampaignCard({ campaign, onEdit, onStart, onPause, onStop }: CampaignCardProps) {
  const [showActions, setShowActions] = useState(false)

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
            <span>▶️</span>
            <span>Start</span>
          </button>
        )
      case 'active':
        return (
          <button
            onClick={() => handleAction('pause')}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            <span>⏸️</span>
            <span>Pause</span>
          </button>
        )
      case 'paused':
        return (
          <button
            onClick={() => handleAction('start')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
          >
            <span>▶️</span>
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
            <span className="text-lg">👥</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{campaign.leads_count}</div>
          <div className="text-xs text-gray-500">Leads</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <span className="text-lg">📅</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{campaign.appointments_count}</div>
          <div className="text-xs text-gray-500">Appointments</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <span className="text-lg">💬</span>
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
          <span>✏️</span>
          <span>Edit</span>
        </button>
      </div>
    </div>
  )
}
