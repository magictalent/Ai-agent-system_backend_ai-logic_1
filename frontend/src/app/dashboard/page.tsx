"use client"

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Script from 'next/script'

type Lead = { id: string; firstname: string; lastname: string; email: string }

// TypeScript fix for custom elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': any
    }
  }
}

// DotLottie Player Component
const DotLottiePlayer = (props: React.HTMLAttributes<HTMLElement> & Record<string, any>) => {
  return <dotlottie-player {...props} />
}

export default function Dashboard() {
  const { token } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [summary, setSummary] = useState({ newLeads: 0, activeConversations: 0, bookedAppointments: 0, conversionRate: 0 })
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')
  const [series, setSeries] = useState<{ date: string; leads: number; outbound: number; inbound: number; appointments: number }[]>([])
  const [recentMsgs, setRecentMsgs] = useState<{ lead: string; content: string; at: string }[]>([])

  // Track dotlottie script loaded status
  const [lottieReady, setLottieReady] = useState(false)

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

  // Improved top bar layout + polish
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf0fe] via-white to-[#f5eaff] py-10 px-2 md:px-8">
      <Script
        src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.js"
        strategy="afterInteractive"
        onLoad={() => setLottieReady(true)}
      />
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col-reverse gap-5 md:flex-row md:items-center md:justify-between md:gap-10 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 drop-shadow-sm">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-base font-medium">Track your growth & engagement</p>
          </div>
          <div className="flex items-center gap-2 bg-white/90 border border-blue-100 shadow rounded-2xl px-2 py-1">
            <button
              onClick={() => setPeriod('7d')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition focus:outline-none ${
                period === '7d'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition focus:outline-none ${
                period === '30d'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              Monthly
            </button>
          </div>
        </header>
        {/* Main grid with metrics & Lottie */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14 items-center">
          {/* Left Vertical Metrics */}
          <div className="flex flex-col h-full gap-7 justify-center items-center md:items-end">
            <Metric
              title="New Leads"
              icon={
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 shadow">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-8 8a8 8 0 0116 0v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1a8 8 0 018-8z" /></svg>
                </span>
              }
              value={metrics.newLeads}
            />
            <Metric
              title="Active Conversations"
              icon={
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 text-green-600 shadow">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2"></path><path d="M15 14v4l4-4-4-4v4z"></path></svg>
                </span>
              }
              value={metrics.activeConversations}
            />
          </div>
          {/* Center Lottie, ensure ALWAYS animated */}
          <div className="flex items-center justify-center h-full px-2">
            <div className="rounded-2xl bg-gradient-to-br from-blue-100/90 via-white to-violet-100/90 shadow-2xl flex items-center justify-center overflow-hidden" style={{ width: 250, height: 250 }}>
              {lottieReady ? (
                <DotLottiePlayer
                  src="https://lottie.host/39959db3-dd81-47b0-9e30-5c0216bbec3f/z2N6fbQG4F.lottie"
                  background="transparent"
                  speed="1"
                  style={{
                    width: 218,
                    height: 218,
                  }}
                  // Fixes: force autoplay even if props not honored
                  loop
                  autoplay
                />
              ) : (
                <div className="w-[218px] h-[218px] flex items-center justify-center text-gray-300 text-2xl animate-pulse">Loading...</div>
              )}
            </div>
          </div>
          {/* Right Vertical Metrics: Booked Appointments + Conversion Rate */}
          <div className="flex flex-col h-full gap-7 justify-center items-center md:items-start">
            <Metric
              title="Booked Appointments"
              icon={
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 text-purple-600 shadow">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width="18" height="16" x="3" y="5" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/></svg>
                </span>
              }
              value={metrics.bookedAppointments}
            />
            <Metric
              title="Conversion Rate"
              icon={
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-pink-100 text-pink-600 shadow">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 3v4a1 1 0 001 1h4"/><path d="M7 21H3a1 1 0 01-1-1v-4"/><path d="M21 12A9 9 0 117 3" /></svg>
                </span>
              }
              value={`${metrics.conversionRate.toFixed(1)}%`}
            />
          </div>
        </div>
        {/* Charts section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <ChartCard title="Leads" subtitle="New leads over time">
            <Bars values={series.map(s => s.leads)} color="#2563eb" />
          </ChartCard>
          <ChartCard title="Outbound" subtitle="Outbound messages over time">
            <Bars values={series.map(s => s.outbound)} color="#7c3aed" />
          </ChartCard>
          <ChartCard title="Inbound" subtitle="Inbound replies over time">
            <Bars values={series.map(s => s.inbound)} color="#16a34a" />
          </ChartCard>
        </div>
        {/* 2 columns: Recent Activity and Latest Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Messages */}
          <div className="bg-white rounded-2xl border shadow-sm p-8 relative overflow-hidden flex flex-col">
            <span className="absolute right-4 top-4 text-blue-50">
              <svg className="w-12 h-12 opacity-10" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" /></svg>
            </span>
            <div className="font-extrabold text-2xl text-gray-900 mb-4 tracking-tight">Recent Messages</div>
            {recentMsgs.length === 0 ? (
              <div className="text-gray-400 text-md py-10 text-center">No messages yet.</div>
            ) : (
              <ul className="divide-y">
                {recentMsgs.map((m, i) => (
                  <li key={i} className="py-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 text-blue-800 flex items-center justify-center text-lg font-bold ring-2 ring-blue-200/60">{(m.lead||'?').split(' ').map((x:string)=>x[0]).join('').slice(0,2)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base text-gray-900 font-semibold truncate">{m.lead}</div>
                      <div className="text-xs text-gray-600 mt-1 truncate">{m.content}</div>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap mt-2">{new Date(m.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Latest Leads */}
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <div className="font-extrabold text-2xl text-gray-900 mb-4 tracking-tight">Latest Leads</div>
            {loading ? (
              <div className="text-gray-400 py-10 text-center font-medium">Loading…</div>
            ) : error ? (
              <div className="text-red-600 py-10 text-center font-medium">{error}</div>
            ) : (
              <table className="w-full text-base">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 font-bold">Name</th>
                    <th className="py-2 font-bold">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 6).map((l) => (
                    <tr key={l.id} className="border-t hover:bg-blue-50 transition">
                      <td className="py-3 text-gray-800 font-semibold">{l.firstname} {l.lastname}</td>
                      <td className="py-3 text-gray-500">{l.email}</td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td className="py-6 text-gray-400 text-lg text-center" colSpan={2}>
                        No leads yet.<br/> <span className="text-xs">Connect your CRM and import.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({
  title,
  value,
  icon
}: {
  title: string
  value: number | string
  icon?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm px-8 py-7 flex items-center gap-6 min-w-[200px]">
      {icon && <span>{icon}</span>}
      <div>
        <div className="text-base text-gray-500 font-medium tracking-wide">{title}</div>
        <div className="text-3xl font-black text-gray-900 mt-1">{value}</div>
      </div>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col">
      <div>
        <div className="font-bold text-lg text-gray-900 mb-1">{title}</div>
        {subtitle && <div className="text-sm text-gray-500 mb-2">{subtitle}</div>}
      </div>
      <div className="h-32 flex-1 flex items-end">{children}</div>
    </div>
  )
}

function Bars({ values, color = '#2563eb' }: { values: number[]; color?: string }) {
  const max = Math.max(1, ...values)
  // Fit up to 14 bars, fill available width.
  const effectiveLen = Math.min(14, values.length)
  const barWidth = effectiveLen > 0 ? 100 / effectiveLen : 100
  return (
    <div className="w-full h-full flex items-end gap-1 relative">
      {values.slice(-14).map((v, i) => (
        <div
          key={i}
          className="rounded-md transition-all duration-500"
          style={{
            width: `${barWidth}%`,
            height: `${(v / max) * 100}%`,
            background: color,
            opacity: 0.90,
            minHeight: '10%',
          }}
        />
      ))}
    </div>
  )
}
