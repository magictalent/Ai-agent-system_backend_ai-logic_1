'use client'

import { useState, useEffect } from 'react'
import { CreateCampaignData, CHANNEL_CONFIGS } from '@/types/campaign'
import { Client } from '@/types/client'

interface AddCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (campaignData: CreateCampaignData) => Promise<void>
  clients: Client[]
}

export default function AddCampaignModal({ isOpen, onClose, onSubmit, clients }: AddCampaignModalProps) {
  const [formData, setFormData] = useState<CreateCampaignData>({
    client_id: '',
    name: '',
    description: '',
    channel: 'whatsapp'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('🔍 AddCampaignModal - Clients:', clients)
    console.log('🔍 AddCampaignModal - isOpen:', isOpen)
    console.log('🔍 AddCampaignModal - formData.client_id:', formData.client_id)
    
    if (isOpen && clients.length > 0 && !formData.client_id) {
      console.log('✅ Setting default client:', clients[0])
      setFormData(prev => ({ ...prev, client_id: clients[0].id }))
    }
  }, [isOpen, clients, formData.client_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onSubmit(formData)
      // Reset form
      setFormData({
        client_id: '',
        name: '',
        description: '',
        channel: 'whatsapp'
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                Select Client *
              </label>
              {clients.length === 0 ? (
                <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700">
                  No clients found. Please add a client first.
                </div>
              ) : (
                <select
                  id="client_id"
                  name="client_id"
                  required
                  value={formData.client_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Q1 Outreach Campaign"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the campaign goals and strategy..."
              />
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Communication Channel *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CHANNEL_CONFIGS.map((channel) => (
                  <label
                    key={channel.id}
                    className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.channel === channel.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="channel"
                      value={channel.id}
                      checked={formData.channel === channel.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{channel.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{channel.name}</div>
                        <div className="text-sm text-gray-500">{channel.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* AI Features Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">🤖 AI Features Included</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Automatic lead generation and qualification</li>
                <li>• Personalized message sequences</li>
                <li>• Smart follow-up automation</li>
                <li>• Appointment booking integration</li>
                <li>• 24/7 response handling</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.client_id}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
