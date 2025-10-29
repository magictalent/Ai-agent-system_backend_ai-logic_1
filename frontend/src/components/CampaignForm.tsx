"use client"

import { useEffect, useMemo, useState } from 'react'
import { CreateCampaignData, CHANNEL_CONFIGS } from '@/types/campaign'

type SimpleClient = { id: string; name: string }

export default function CampaignForm({
  mode,
  clients,
  onSubmit,
  onCancel,
  initial,
}: {
  mode: 'create' | 'edit'
  clients: SimpleClient[]
  onSubmit: (data: CreateCampaignData, options?: { startNow?: boolean }) => Promise<void>
  onCancel?: () => void
  initial?: Partial<CreateCampaignData>
}) {
  const [form, setForm] = useState<CreateCampaignData>({
    client_id: initial?.client_id || '',
    name: initial?.name || '',
    description: initial?.description || '',
    channel: (initial?.channel || 'email') as any,
  })
  const [startNow, setStartNow] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const hasClients = useMemo(() => clients && clients.length > 0, [clients])

  useEffect(() => {
    setForm({
      client_id: initial?.client_id || '',
      name: initial?.name || '',
      description: initial?.description || '',
      channel: (initial?.channel || 'email') as any,
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

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-4">
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
        {/* Client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Client {mode === 'create' ? '*' : ''}</label>
          {hasClients ? (
            <select
              name="client_id"
              value={form.client_id}
              onChange={update}
              required={mode === 'create'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a client…</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">
              No clients found. Add one in Clients.
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={update}
            required
            placeholder="e.g., Q1 Outreach"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={update}
            rows={3}
            placeholder="Goals, audiences, strategy…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Channel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
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
          <button type="submit" disabled={submitting} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {submitting ? (mode === 'edit' ? 'Saving…' : 'Creating…') : (mode === 'edit' ? 'Save Changes' : 'Create Campaign')}
          </button>
        </div>
      </form>
    </div>
  )
}

