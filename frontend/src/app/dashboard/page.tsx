"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type Lead = { id: string; firstname: string; lastname: string; email: string };

function DashboardPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [recentMsgs, setRecentMsgs] = useState<any[]>([]);

  const [finance, setFinance] = useState<{ totals: { revenue: number; expenses: number }; revenue_series: { value: number }[]; expenses_series: { value: number }[] }>({ totals: { revenue: 0, expenses: 0 }, revenue_series: [], expenses_series: [] });
  const [metrics, setMetrics] = useState<{ bookedAppointments: number; conversionRate: number }>({ bookedAppointments: 0, conversionRate: 0 });
  const [series, setSeries] = useState<{ date: string; leads: number; outbound: number; inbound: number }[]>([]);

  // Next sends tile data
  const [nextSends, setNextSends] = useState<{ last24: number; next24: number }>({ last24: 0, next24: 0 });
  useEffect(() => {
    (async () => {
      try {
        if (!token) return;
        const res = await fetch('http://localhost:3001/dashboard/sequence-window', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        setNextSends({ last24: data?.sent_last_24h ?? 0, next24: data?.scheduled_next_24h ?? 0 });
      } catch {}
    })();
  }, [token]);
  // Load live dashboard data
  useEffect(() => {
    (async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const [sumRes, finRes, tsRes, recRes] = await Promise.all([
          fetch('http://localhost:3001/dashboard/summary', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/dashboard/finance?period=7d', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/dashboard/timeseries?period=7d', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/dashboard/recent-leads?limit=6', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (!sumRes.ok) throw new Error(await sumRes.text());
        if (!finRes.ok) throw new Error(await finRes.text());
        if (!tsRes.ok) throw new Error(await tsRes.text());
        const summary = await sumRes.json();
        const financeJson = await finRes.json();
        const tsJson = await tsRes.json();
        const recentJson = recRes.ok ? await recRes.json() : [];
        setMetrics({ bookedAppointments: summary.bookedAppointments ?? 0, conversionRate: summary.conversionRate ?? 0 });
        setFinance({ totals: financeJson.totals || { revenue: 0, expenses: 0 }, revenue_series: financeJson.revenue_series || [], expenses_series: financeJson.expenses_series || [] });
        setSeries(Array.isArray(tsJson?.series) ? tsJson.series : []);
        setLeads(Array.isArray(recentJson) ? recentJson : []);
      } catch (e) {
        setError((e as any)?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) return <div className="p-6 text-gray-600">Loading dashboard�</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div>
      {/* MiniCards Row */}
      <div className="flex gap-8 mb-8 flex-wrap">
        <MiniCard
          title="Revenue"
          value={formatCurrency(finance.totals.revenue)}
          gradientFrom="#a21caf"
          gradientTo="#c084fc"
          values={finance.revenue_series.map((s) => s.value)}
        />
        <MiniCard
          title="Expenses"
          value={formatCurrency(finance.totals.expenses)}
          gradientFrom="#2563eb"
          gradientTo="#60a5fa"
          values={finance.expenses_series.map((s) => s.value)}
        />
        <NextSendsCard last24={nextSends.last24} next24={nextSends.next24} />
      </div>
      {/* Right Vertical Metrics: Booked Appointments + Conversion Rate */}
      <div className="flex flex-col h-full gap-7 justify-center items-center md:items-start">
        <Metric
          title="Booked Appointments"
          icon={
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 text-purple-600 shadow">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <rect width="18" height="16" x="3" y="5" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" />
              </svg>
            </span>
          }
          value={metrics.bookedAppointments}
        />
        <Metric
          title="Conversion Rate"
          icon={
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-pink-100 text-pink-600 shadow">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M17 3v4a1 1 0 001 1h4" />
                <path d="M7 21H3a1 1 0 01-1-1v-4" />
                <path d="M21 12A9 9 0 117 3" />
              </svg>
            </span>
          }
          value={
            typeof metrics.conversionRate === "number"
              ? `${metrics.conversionRate.toFixed(1)}%`
              : "0.0%"
          }
        />
      </div>
      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <ChartCard title="Leads" subtitle="New leads over time">
          <Bars
            values={series.map((s) => s.leads)}
            labels={series.map((s) => s.date)}
            color="#2563eb"
            focus="leads"
          />
        </ChartCard>
        <ChartCard title="Outbound" subtitle="Outbound messages over time">
          <Bars
            values={series.map((s) => s.outbound)}
            labels={series.map((s) => s.date)}
            color="#7c3aed"
            focus="outbound"
          />
        </ChartCard>
        <ChartCard title="Inbound" subtitle="Inbound replies over time">
          <Bars
            values={series.map((s) => s.inbound)}
            labels={series.map((s) => s.date)}
            color="#16a34a"
            focus="inbound"
          />
        </ChartCard>
      </div>
      {/* 2 columns: Recent Activity and Latest Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Messages */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 relative overflow-hidden flex flex-col">
          <span className="absolute right-4 top-4 text-blue-50">
            <svg className="w-12 h-12 opacity-10" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" />
            </svg>
          </span>
          <div className="font-extrabold text-2xl text-gray-900 mb-4 tracking-tight">
            Recent Messages
          </div>
          {recentMsgs.length === 0 ? (
            <div className="text-gray-400 text-md py-10 text-center">
              No messages yet.
            </div>
          ) : (
            <ul className="divide-y">
              {recentMsgs.map((m, i) => (
                <li key={i} className="py-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 text-blue-800 flex items-center justify-center text-lg font-bold ring-2 ring-blue-200/60">
                    {(m.lead || "?")
                      .split(" ")
                      .map((x: string) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base text-gray-900 font-semibold truncate">
                      {m.lead}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {m.content}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap mt-2">
                    {new Date(m.at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Latest Leads */}
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <div className="font-extrabold text-2xl text-gray-900 mb-4 tracking-tight">
            Latest Leads
          </div>
          {loading ? (
            <div className="text-gray-400 py-10 text-center font-medium">
              Loading�
            </div>
          ) : error ? (
            <div className="text-red-600 py-10 text-center font-medium">
              {error}
            </div>
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
                    <td className="py-3 text-gray-800 font-semibold">
                      {l.firstname} {l.lastname}
                    </td>
                    <td className="py-3 text-gray-500">{l.email}</td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td
                      className="py-6 text-gray-400 text-lg text-center"
                      colSpan={2}
                    >
                      No leads yet.
                      <br /> <span className="text-xs">Connect your CRM and import.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

function Metric({
  title,
  value,
  icon
}: {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm px-8 py-7 flex items-center gap-6 min-w-[200px]">
      {icon && <span>{icon}</span>}
      <div>
        <div className="text-base text-gray-500 font-medium tracking-wide">{title}</div>
        <div className="text-3xl font-black text-gray-900 mt-1">{value}</div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col">
      <div>
        <div className="font-bold text-lg text-gray-900 mb-1">{title}</div>
        {subtitle && <div className="text-sm text-gray-500 mb-2">{subtitle}</div>}
      </div>
      <div className="h-32 flex-1 flex items-end">{children}</div>
    </div>
  );
}

function Bars({
  values,
  labels,
  color = "#2563eb",
  focus
}: {
  values: number[];
  labels?: string[];
  color?: string;
  focus?: "leads" | "outbound" | "inbound";
}) {
  const router = useRouter();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...values);
  const effectiveLen = Math.min(14, values.length);
  const barWidth = effectiveLen > 0 ? 100 / effectiveLen : 100;
  const sliceValues = values.slice(-14);
  const sliceLabels = (labels || []).slice(-sliceValues.length);
  return (
    <div className="w-full h-full flex items-end gap-1 relative">
      {sliceValues.map((v, i) => (
        <div
          key={i}
          className="rounded-md transition-all duration-300 cursor-pointer hover:opacity-100"
          style={{
            width: `${barWidth}%`,
            height: `${(v / Math.max(1, max)) * 100}%`,
            background: color,
            opacity: 0.9,
            minHeight: "10%"
          }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onClick={() => {
            const d = sliceLabels[i];
            if (d)
              router.push(
                `/analytics?date=${encodeURIComponent(d)}${
                  focus ? `&focus=${focus}` : ""
                }`
              );
          }}
          title={sliceLabels[i] ? `${sliceLabels[i]}: ${v}` : String(v)}
        />
      ))}
      {hover !== null && (
        <div className="absolute -top-2 translate-y-[-100%] left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded shadow">
            <div>{sliceLabels[hover] || ""}</div>
            <div className="font-semibold">{sliceValues[hover]}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(n || 0);
  } catch {
    return `$${Math.round(n || 0).toLocaleString()}`;
  }
}

function MiniCard({
  title,
  value,
  values,
  gradientFrom,
  gradientTo
}: {
  title: string;
  value: string | number;
  values: number[];
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-base text-gray-500 font-medium tracking-wide">
          {title}
        </div>
        <div className="text-2xl font-black text-gray-900">{value}</div>
      </div>
      <div className="h-12">
        <BarsGradient values={values} from={gradientFrom} to={gradientTo} />
      </div>
    </div>
  );
}

function NextSendsCard({ last24, next24 }: { last24: number; next24: number }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm px-6 py-5 min-w-[260px]">
      <div className="flex items-center justify-between mb-3">
        <div className="text-base text-gray-500 font-medium tracking-wide">Next Sends</div>
        <div className="text-xs text-gray-400">24h</div>
      </div>
      <div className="flex items-end gap-6">
        <div>
          <div className="text-sm text-gray-500">Sent</div>
          <div className="text-2xl font-black text-gray-900">{last24}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Scheduled</div>
          <div className="text-2xl font-black text-gray-900">{next24}</div>
        </div>
      </div>
    </div>
  )
}

function BarsGradient({
  values,
  from,
  to
}: {
  values: number[];
  from: string;
  to: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...values);
  const effectiveLen = Math.min(18, values.length);
  const barWidth = effectiveLen > 0 ? 100 / effectiveLen : 100;
  const sliceValues = values.slice(-effectiveLen);
  return (
    <div className="w-full h-full flex items-end gap-[6px]">
      {sliceValues.map((v, i) => (
        <div
          key={i}
          className="rounded-md transition-all duration-300"
          style={{
            width: `${barWidth}%`,
            height: `${(v / Math.max(1, max)) * 100}%`,
            background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
            opacity: hover === i ? 1 : 0.9,
            minHeight: "10%"
          }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          title={String(v)}
        />
      ))}
    </div>
  );
}

