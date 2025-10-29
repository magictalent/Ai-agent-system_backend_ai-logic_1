"use client"

import { useEffect, useState } from 'react'
import { CreateCampaignData, CHANNEL_CONFIGS } from '@/types/campaign'

export default function CampaignForm({
  mode,
  onSubmit,
  onCancel,
  initial,
  bgClass,
  inputClass,
  labelClass,
  buttonClass,
}: {
  mode: 'create' | 'edit'
  onSubmit: (data: CreateCampaignData, options?: { startNow?: boolean }) => Promise<void>
  onCancel?: () => void
  initial?: Partial<CreateCampaignData>
  bgClass?: string
  inputClass?: string
  labelClass?: string
  buttonClass?: string
}) {
  const [form, setForm] = useState<CreateCampaignData>({
    name: initial?.name || '',
    description: initial?.description || '',
    channel: (initial?.channel || 'email') as any,
    tone: (initial?.tone || 'friendly') as any,
  })
  const [startNow, setStartNow] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({
      name: initial?.name || '',
      description: initial?.description || '',
      channel: (initial?.channel || 'email') as any,
      tone: (initial?.tone || 'friendly') as any,
      // client_id intentionally omitted from UI
    })
    setStartNow(false)
    setError('')
  }, [initial, mode])

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(form, { startNow })
    } catch (err: any) {
      setError(err?.message || 'Failed to save campaign')
    } finally {
      setSubmitting(false)
    }
  }

  const baseInput = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  const baseLabel = "block text-sm font-medium text-gray-700 mb-2"
  const baseBtn = "px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"

  return (
    <div className={`${bgClass ?? 'bg-white'} rounded-2xl border shadow-sm p-6 sticky top-4`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{mode === 'edit' ? 'Edit' : 'Create'}</div>
          <h3 className="text-xl font-bold text-gray-900">{mode === 'edit' ? 'Edit Campaign' : 'New Campaign'}</h3>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-5">
        {/* Name */}
        <div>
          <label className={`${labelClass ?? baseLabel}`}>Campaign Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={update}
            required
            placeholder="e.g., Q1 Outreach"
            className={`${inputClass ?? baseInput}`}
          />
        </div>

        {/* Description */}
        <div>
          <label className={`${labelClass ?? baseLabel}`}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={update}
            rows={3}
            placeholder="Goals, audiences, strategy…"
            className={`${inputClass ?? baseInput}`}
          />
        </div>

        {/* Channel */}
        <div>
          <label className={`${labelClass ?? baseLabel}`}>Channel</label>
          <div className="grid grid-cols-2 gap-3">
            {CHANNEL_CONFIGS.map(ch => (
              <label key={ch.id} className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${form.channel === ch.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <input type="radio" name="channel" value={ch.id} checked={form.channel === ch.id} onChange={update} className="sr-only" />
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ch.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{ch.name}</div>
                    <div className="text-xs text-gray-500">{ch.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className={`${labelClass ?? baseLabel}`}>Tone</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'friendly', label: 'Friendly' },
              { id: 'professional', label: 'Professional' },
              { id: 'casual', label: 'Casual' },
            ] as const).map(opt => (
              <label key={opt.id} className={`px-3 py-2 border rounded-lg text-sm cursor-pointer text-center ${form.tone === opt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <input type="radio" name="tone" value={opt.id} checked={form.tone === opt.id} onChange={update} className="sr-only" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {mode === 'create' && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4" checked={startNow} onChange={(e) => setStartNow(e.target.checked)} />
            Start campaign immediately after creation
          </label>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          )}
          <button type="submit" disabled={submitting} className={`${buttonClass ?? baseBtn}`}>
            {submitting ? (mode === 'edit' ? 'Saving…' : 'Creating…') : (mode === 'edit' ? 'Save Changes' : 'Create Campaign')}
          </button>
        </div>
      </form>
    </div>
  )
}
