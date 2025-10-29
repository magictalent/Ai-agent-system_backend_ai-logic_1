"use client"

import { useEffect, useState } from 'react'
import { CreateCampaignData, CHANNEL_CONFIGS } from '@/types/campaign'

interface AddCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (campaignData: CreateCampaignData, options?: { startNow?: boolean }) => Promise<void>
  initial?: Partial<CreateCampaignData>
  mode?: 'create' | 'edit'
}

export default function AddCampaignModal({ isOpen, onClose, onSubmit, initial, mode = 'create' }: AddCampaignModalProps) {
  const [formData, setFormData] = useState<CreateCampaignData>({
    name: initial?.name || '',
    description: initial?.description || '',
    channel: (initial?.channel || 'email') as any,
    tone: (initial?.tone || 'friendly') as any,
  })
  const [startNow, setStartNow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initial?.name || '',
        description: initial?.description || '',
        channel: (initial?.channel || 'email') as any,
        tone: (initial?.tone || 'friendly') as any,
      })
      setStartNow(false)
      setError('')
    }
  }, [isOpen, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onSubmit(formData, { startNow })
      if (mode === 'create') setFormData({ name: '', description: '', channel: 'email', tone: 'friendly' })
      onClose()
    } catch (err: any) {
      setError(err.message || (mode === 'edit' ? 'Failed to update campaign' : 'Failed to create campaign'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Right side-sheet */}
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80 font-semibold">{mode === 'edit' ? 'Edit' : 'Create'}</div>
              <h2 className="text-2xl font-bold">{mode === 'edit' ? 'Edit Campaign' : 'New Campaign'}</h2>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            </button>
          </div>
          <p className="text-sm mt-1 text-white/90">Set the essentials and tone; you can tweak sequences later.</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Describe the campaign goals and strategy..."
              />
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Communication Channel</label>
              <div className="grid grid-cols-2 gap-3">
                {CHANNEL_CONFIGS.map((channel) => (
                  <label
                    key={channel.id}
                    className={`relative flex items-center p-4 border rounded-md cursor-pointer transition-colors ${
                      formData.channel === channel.id
                        ? 'border-violet-500 bg-violet-50'
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

            {/* Tone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'friendly', label: 'Friendly' },
                  { id: 'professional', label: 'Professional' },
                  { id: 'casual', label: 'Casual' },
                ] as const).map(opt => (
                  <label key={opt.id} className={`px-3 py-2 border rounded-md text-sm cursor-pointer text-center ${formData.tone === opt.id ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input type="radio" name="tone" value={opt.id} checked={formData.tone === opt.id} onChange={handleChange} className="sr-only" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {mode === 'create' && (
              <div className="flex items-center gap-2">
                <input id="startNow" type="checkbox" className="h-4 w-4" checked={startNow} onChange={(e) => setStartNow(e.target.checked)} />
                <label htmlFor="startNow" className="text-sm text-gray-700">Start campaign immediately after creation</label>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create Campaign')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
