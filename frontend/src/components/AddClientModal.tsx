'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CreateClientData, CRMProvider } from '@/types/client'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (clientData: CreateClientData) => Promise<void>
}

const BASE_PROVIDERS: CRMProvider[] = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'All-in-one CRM platform',
    icon: '/icons/hubspot.png',
    connected: false
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Enterprise CRM solution',
    icon: '/icons/salesforce.png',
    connected: false
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Sales-focused CRM',
    icon: '/icons/pipedrive.png',
    connected: false
  },
  {
    id: 'mock',
    name: 'Mock CRM',
    description: 'For testing purposes',
    icon: '/icons/mock.png', // ✅ now points correctly to /public/icons/mock.png
    connected: true
  }
]

const personalityOptions = [
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable tone' },
  { value: 'professional', label: 'Professional', description: 'Formal and business-focused' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' }
]

export default function AddClientModal({ isOpen, onClose, onSubmit }: AddClientModalProps) {
  const [formData, setFormData] = useState<CreateClientData>({
    name: '',
    email: '',
    phone: '',
    industry: '',
    crm_provider: 'mock',
    openai_personality: 'professional'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [providers, setProviders] = useState<CRMProvider[]>(BASE_PROVIDERS)

  // Fetch CRM provider connection status from backend when modal opens
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:3001/crm/status')
        if (res.ok) {
          const status = await res.json()
          setProviders(prev => prev.map(p => ({
            ...p,
            connected: status[p.id]?.connected ?? p.connected,
          })))
        }
      } catch (e) {
        // ignore; keep defaults
      }
    }
    if (isOpen) fetchStatus()
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onSubmit(formData)
      setFormData({
        name: '',
        email: '',
        phone: '',
        industry: '',
        crm_provider: 'mock',
        openai_personality: 'professional'
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create client')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
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
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Company/Client Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@acme.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Technology, Healthcare, Finance..."
                />
              </div>
            </div>

            {/* CRM Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                CRM Provider *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {providers.map((provider) => (
                  <label
                    key={provider.id}
                    className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.crm_provider === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="crm_provider"
                      value={provider.id}
                      checked={formData.crm_provider === provider.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <Image
                        src={provider.icon}
                        alt={provider.name}
                        width={40}
                        height={40}
                        className="rounded-md object-contain"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{provider.name}</div>
                        <div className="text-sm text-gray-500">{provider.description}</div>
                        {provider.connected && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Connected
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* AI Personality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                AI Communication Style
              </label>
              <div className="space-y-2">
                {personalityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.openai_personality === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="openai_personality"
                      value={option.value}
                      checked={formData.openai_personality === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
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
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
