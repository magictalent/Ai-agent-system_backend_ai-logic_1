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
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')
  const [series, setSeries] = useState<{ date: string; leads: number; outbound: number; inbound: number; appointments: number }[]>([])
  const [recentMsgs, setRecentMsgs] = useState<{ lead: string; content: string; at: string }[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const [sRes, lRes, tRes, cRes] = await Promise.all([
          fetch('http://localhost:3001/dashboard/summary', { headers: { 'Authorization': `Bearer ${token || ''}` } }),
          fetch('http://localhost:3001/dashboard/recent-leads?limit=6', { headers: { 'Authorization': `Bearer ${token || ''}` } }),
          fetch(`http://localhost:3001/dashboard/timeseries?period=${period}`, { headers: { 'Authorization': `Bearer ${token || ''}` } }),
          fetch('http://localhost:3001/messages/conversations', { headers: { 'Authorization': `Bearer ${token || ''}` } }),
        ])
        if (!sRes.ok) throw new Error(await sRes.text())
        if (!lRes.ok) throw new Error(await lRes.text())
        if (!tRes.ok) throw new Error(await tRes.text())
        setSummary(await sRes.json())
        const leadsData = await lRes.json()
        // Map to UI shape
        setLeads((leadsData || []).map((r: any) => ({ id: r.id, firstname: r.first_name || '', lastname: r.last_name || '', email: r.email || '' })))
        const ts = await tRes.json()
        setSeries(Array.isArray(ts?.series) ? ts.series : [])
        const convs = await cRes.json()
        const last = (Array.isArray(convs) ? convs : []).map((c: any) => {
          const m = (c.messages || [])[c.messages.length - 1]
          return m ? { lead: c.lead_name || c.lead_email || c.lead_id, content: m.content, at: m.created_at } : null
        }).filter(Boolean) as any[]
        last.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        setRecentMsgs(last.slice(0, 4))
      } catch (e) {
        setError((e as any).message)
      } finally {
        setLoading(false)
      }
    }
    if (token) load()
  }, [token, period])

  const metrics = useMemo(() => ({
    newLeads: summary.newLeads,
    activeConversations: summary.activeConversations,
    bookedAppointments: summary.bookedAppointments,
    conversionRate: summary.conversionRate,
  }), [summary])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setPeriod('7d')} className={`px-3 py-1 rounded ${period==='7d'?'bg-blue-600 text-white':'bg-white border'}`}>Weekly</button>
          <button onClick={() => setPeriod('30d')} className={`px-3 py-1 rounded ${period==='30d'?'bg-blue-600 text-white':'bg-white border'}`}>Monthly</button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Metric title="New Leads" value={metrics.newLeads} />
        <Metric title="Active Conversations" value={metrics.activeConversations} />
        <Metric title="Booked Appointments" value={metrics.bookedAppointments} />
        <Metric title="Conversion rate" value={`${metrics.conversionRate.toFixed(1)}%`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Leads">
          <Bars values={series.map(s => s.leads)} color="#2563eb" />
        </ChartCard>
        <ChartCard title="Outbound">
          <Bars values={series.map(s => s.outbound)} color="#7c3aed" />
        </ChartCard>
        <ChartCard title="Inbound">
          <Bars values={series.map(s => s.inbound)} color="#16a34a" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Messages */}
        <div className="bg-white rounded-lg border p-4">
          <div className="font-semibold text-gray-900 mb-3">Recent Messages</div>
          {recentMsgs.length === 0 ? (
            <div className="text-gray-600 text-sm">No messages yet.</div>
          ) : (
            <ul className="divide-y">
              {recentMsgs.map((m, i) => (
                <li key={i} className="py-2 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">{(m.lead||'?').split(' ').map((x:string)=>x[0]).join('').slice(0,2)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{m.lead}</div>
                    <div className="text-xs text-gray-600 truncate">{m.content}</div>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(m.at).toLocaleTimeString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Latest Leads */}
        <div className="bg-white rounded-lg border p-4">
          <div className="font-semibold text-gray-900 mb-3">Latest Leads</div>
          {loading ? (
            <div className="text-gray-600">Loading…</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 6).map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="py-2 text-gray-800">{l.firstname} {l.lastname}</td>
                    <td className="py-2 text-gray-500">{l.email}</td>
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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="font-semibold text-gray-900 mb-2">{title}</div>
      <div className="h-28 flex items-end">{children}</div>
    </div>
  )
}

function Bars({ values, color = '#2563eb' }: { values: number[]; color?: string }) {
  const max = Math.max(1, ...values)
  const width = Math.max(1, Math.floor(100 / Math.max(1, values.length)))
  return (
    <div className="w-full h-full flex items-end gap-1">
      {values.map((v, i) => (
        <div key={i} className="rounded-sm" style={{ width: `${width}%`, height: `${(v / max) * 100}%`, background: color, opacity: 0.9 }} />
      ))}
    </div>
  )
}
