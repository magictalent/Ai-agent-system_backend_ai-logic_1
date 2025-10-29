"use client"

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'

type SeriesRow = { date: string; leads: number; outbound: number; inbound: number; appointments: number }

export default function AnalyticsPage() {
  const { token } = useAuth()
  const [period, setPeriod] = useState<'7d'|'30d'>('7d')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [series, setSeries] = useState<SeriesRow[]>([])
  const [totals, setTotals] = useState<{ leads: number; outbound: number; inbound: number }>({ leads: 0, outbound: 0, inbound: 0 })
  const [byChannel, setByChannel] = useState<any[]>([])
  const [byCampaign, setByCampaign] = useState<any[]>([])
  const search = useSearchParams()
  const router = useRouter()
  const focus = search.get('focus') || ''
  const dateParam = search.get('date') || ''

  useEffect(() => {
    if (!token) return
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const [tsRes, agRes] = await Promise.all([
          fetch(`http://localhost:3001/dashboard/timeseries?period=${period}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:3001/dashboard/analytics?period=${period}`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (!tsRes.ok) throw new Error(await tsRes.text())
        if (!agRes.ok) throw new Error(await agRes.text())
        const ts = await tsRes.json()
        const ag = await agRes.json()
        setSeries(Array.isArray(ts?.series) ? ts.series : [])
        setTotals(ag?.totals || { leads: 0, outbound: 0, inbound: 0 })
        setByChannel(ag?.by_channel || [])
        setByCampaign(ag?.by_campaign || [])
      } catch (e:any) {
        setError(e.message)
      } finally { setLoading(false) }
    }
    load()
  }, [token, period])

  const selected = useMemo(() => series.find(s => s.date === dateParam) || null, [series, dateParam])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-2">
          <button onClick={() => setPeriod('7d')} className={`px-3 py-1 rounded ${period==='7d'?'bg-blue-600 text-white':'bg-white border'}`}>Weekly</button>
          <button onClick={() => setPeriod('30d')} className={`px-3 py-1 rounded ${period==='30d'?'bg-blue-600 text-white':'bg-white border'}`}>Monthly</button>
        </div>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card title="Leads" value={totals.leads} />
        <Card title="Outbound" value={totals.outbound} />
        <Card title="Inbound" value={totals.inbound} />
      </div>

      {/* Selected day details */}
      {selected && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="font-semibold text-gray-900 mb-2">{selected.date}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Card title="Leads" value={selected.leads} />
            <Card title="Outbound" value={selected.outbound} />
            <Card title="Inbound" value={selected.inbound} />
            <Card title="Appointments" value={selected.appointments} />
          </div>
        </div>
      )}

      {/* Time series charts with tooltips + drill-down */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Chart title="Leads" values={series.map(s => s.leads)} labels={series.map(s => s.date)} color="#2563eb" onClick={(d) => router.push(`/analytics?date=${encodeURIComponent(d)}&focus=leads`)} highlight={focus==='leads'} />
        <Chart title="Outbound" values={series.map(s => s.outbound)} labels={series.map(s => s.date)} color="#7c3aed" onClick={(d) => router.push(`/analytics?date=${encodeURIComponent(d)}&focus=outbound`)} highlight={focus==='outbound'} />
        <Chart title="Inbound" values={series.map(s => s.inbound)} labels={series.map(s => s.date)} color="#16a34a" onClick={(d) => router.push(`/analytics?date=${encodeURIComponent(d)}&focus=inbound`)} highlight={focus==='inbound'} />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TableCard title="By Channel" columns={["Channel","Outbound","Inbound"]} rows={byChannel.map((r:any)=>[r.channel, r.outbound, r.inbound])} />
        <TableCard title="By Campaign" columns={["Campaign","Outbound","Inbound"]} rows={byCampaign.map((r:any)=>[r.campaign_id, r.outbound, r.inbound])} />
      </div>
    </div>
  )
}

function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  )
}

function Chart({ title, values, labels, color, onClick, highlight }: { title: string; values: number[]; labels?: string[]; color: string; onClick?: (date: string) => void; highlight?: boolean }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...values)
  const width = Math.max(1, Math.floor(100 / Math.max(1, values.length)))
  return (
    <div className={`bg-white rounded-lg border p-4 ${highlight ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}>
      <div className="font-semibold text-gray-900 mb-2">{title}</div>
      <div className="h-28 flex items-end gap-1 relative">
        {values.map((v, i) => (
          <div
            key={i}
            className="rounded-sm cursor-pointer transition-opacity"
            style={{ width: `${width}%`, height: `${(v / max) * 100}%`, background: color, opacity: hover===i ? 1 : 0.9 }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onClick && labels && onClick(labels[i])}
            title={labels?.[i] ? `${labels[i]}: ${v}` : String(v)}
          />
        ))}
        {hover !== null && (
          <div className="absolute -top-2 translate-y-[-100%] left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black/80 text-white text-xs px-2 py-1 rounded shadow">
              <div>{labels?.[hover] || ''}</div>
              <div className="font-semibold">{values[hover]}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TableCard({ title, columns, rows }: { title: string; columns: string[]; rows: (string|number)[][] }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="font-semibold text-gray-900 mb-3">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              {columns.map((c) => <th key={c} className="py-2 pr-4">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td className="py-3 text-gray-600" colSpan={columns.length}>No data</td></tr>
            )}
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t">
                {r.map((v, i) => <td key={i} className="py-2 pr-4 text-gray-800">{String(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
