'use client'

import { useState } from 'react'
import { Plus, Users, Save } from 'lucide-react'

type Segment = {
  id: number
  name: string
  description: string
  criteria: string
}

const initialSegments: Segment[] = [
  {
    id: 1,
    name: 'Recent Leads',
    description: 'Leads who joined in the last 30 days',
    criteria: 'joined_within_30_days',
  },
  {
    id: 2,
    name: 'In-Market Buyers',
    description: 'Leads looking to buy within next 2 weeks',
    criteria: 'ready_to_buy_2_weeks',
  },
]

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>(initialSegments)
  const [creating, setCreating] = useState(false)
  const [newSegment, setNewSegment] = useState<Omit<Segment, 'id'>>({
    name: '',
    description: '',
    criteria: '',
  })

  const handleCreateSegment = () => {
    if (!newSegment.name.trim()) return
    setSegments([
      ...segments,
      {
        id: Date.now(),
        ...newSegment,
      },
    ])
    setNewSegment({ name: '', description: '', criteria: '' })
    setCreating(false)
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Users className="text-blue-500" size={26} />
          <h1 className="text-2xl font-bold text-blue-900">Segments</h1>
        </div>
        <button
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          onClick={() => setCreating(true)}
        >
          <Plus size={18} /> New Segment
        </button>
      </div>
      <div className="mb-10">
        <p className="text-gray-600">
          Group your leads into smart segments for targeted communication, campaigns, and automations.
        </p>
      </div>
      {segments.length === 0 ? (
        <div className="text-center text-gray-500 py-16">No segments yet. Click 'New Segment' to get started!</div>
      ) : (
        <div className="space-y-6">
          {segments.map(segment => (
            <div
              key={segment.id}
              className="border border-blue-100 rounded-xl p-5 shadow hover:shadow-md transition"
            >
              <h2 className="font-semibold text-blue-800 text-lg">{segment.name}</h2>
              <div className="text-gray-700">{segment.description}</div>
              <div className="mt-1 text-xs text-blue-500 font-mono bg-blue-50 inline-block rounded px-2 py-0.5">
                Criteria: {segment.criteria}
              </div>
            </div>
          ))}
        </div>
      )}
      {creating && (
        <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/30">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-[95vw] max-w-md relative">
            <button
              className="absolute right-4 top-4 text-lg font-bold text-gray-400 hover:text-blue-700"
              onClick={() => setCreating(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-900">
              <Plus className="text-blue-500" size={20} />
              Add New Segment
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-blue-800 mb-1">Name</label>
                <input
                  className="w-full border border-blue-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-lg"
                  value={newSegment.name}
                  onChange={e => setNewSegment(s => ({ ...s, name: e.target.value }))}
                  maxLength={40}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-800 mb-1">Description</label>
                <input
                  className="w-full border border-blue-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-base"
                  value={newSegment.description}
                  onChange={e => setNewSegment(s => ({ ...s, description: e.target.value }))}
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-800 mb-1">Criteria</label>
                <input
                  className="w-full border border-blue-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-base"
                  value={newSegment.criteria}
                  onChange={e => setNewSegment(s => ({ ...s, criteria: e.target.value }))}
                  maxLength={60}
                  placeholder="e.g. ready_to_buy, inactive_14_days"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-2">
              <button
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200"
                onClick={() => setCreating(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-40"
                onClick={handleCreateSegment}
                disabled={!newSegment.name.trim()}
              >
                <Save size={18} /> Create Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

