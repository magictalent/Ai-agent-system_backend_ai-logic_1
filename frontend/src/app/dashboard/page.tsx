"use client"

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type Lead = { id: string; firstname: string; lastname: string; email: string }

export default function Dashboard() {
  const { token } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [summary, setSummary] = useState({ newLeads: 0, activeConversations: 0, bookedAppointments: 0, conversionRate: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const [sRes, lRes] = await Promise.all([
          fetch('http://localhost:3001/dashboard/summary', { headers: { 'Authorization': `Bearer ${token || ''}` } }),
          fetch('http://localhost:3001/dashboard/recent-leads?limit=6', { headers: { 'Authorization': `Bearer ${token || ''}` } }),
        ])
        if (!sRes.ok) throw new Error(await sRes.text())
        if (!lRes.ok) throw new Error(await lRes.text())
        setSummary(await sRes.json())
        const leadsData = await lRes.json()
        // Map to UI shape
        setLeads((leadsData || []).map((r: any) => ({ id: r.id, firstname: r.first_name || '', lastname: r.last_name || '', email: r.email || '' })))
      } catch (e) {
        setError((e as any).message)
      } finally {
        setLoading(false)
      }
    }
    if (token) load()
  }, [token])

  const metrics = useMemo(() => ({
    newLeads: summary.newLeads,
    activeConversations: summary.activeConversations,
    bookedAppointments: summary.bookedAppointments,
    conversionRate: summary.conversionRate,
  }), [summary])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Metric title="New Leads" value={metrics.newLeads} />
        <Metric title="Active Conversations" value={metrics.activeConversations} />
        <Metric title="Booked Appointments" value={metrics.bookedAppointments} />
        <Metric title="Conversion rate" value={`${metrics.conversionRate.toFixed(1)}%`} />
      </div>

      {/* Leads over time (placeholder sparkline) */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="font-semibold text-gray-900 mb-2">Leads Over Time</div>
        <svg viewBox="0 0 300 80" className="w-full h-24">
          <polyline fill="none" stroke="#2563eb" strokeWidth="2"
            points="0,70 30,60 60,68 90,50 120,55 150,45 180,52 210,48 240,42 270,30 300,36" />
          {Array.from({ length: 11 }).map((_, i) => (
            <circle key={i} cx={i * 30} cy={70 - Math.sin(i) * 20 - 10} r="3" fill="#60a5fa" />
          ))}
        </svg>
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-lg border p-4">
        <div className="font-semibold text-gray-900 mb-3">Recent Leads</div>
        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Name</th>
                <th className="py-2">Status</th>
                <th className="py-2">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 6).map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="py-2 text-gray-800">{l.firstname} {l.lastname}</td>
                  <td className="py-2"><span className="px-2 py-1 rounded bg-gray-100 text-gray-700">New</span></td>
                  <td className="py-2 text-gray-500">—</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td className="py-3 text-gray-600" colSpan={3}>No leads yet. Connect your CRM and import.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  )
}
