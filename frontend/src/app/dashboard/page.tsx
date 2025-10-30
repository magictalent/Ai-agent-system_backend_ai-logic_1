"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { StatCard } from "@/components/StatCard";
import { HeroCard } from "@/components/HeroCard";
import { SatisfactionRateCard } from "@/components/SatisfactionRateCard";
import { ReferralTrackingCard } from "@/components/ReferralTrackingCard";

// Type Definitions
type Lead = { id: string; firstname: string; lastname: string; email: string };

function DashboardPage() {
  const { token, user } = useAuth(); // FIX: add user from context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [recentMsgs, setRecentMsgs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<{
    bookedAppointments: number;
    conversionRate: number;
  }>({ bookedAppointments: 0, conversionRate: 0 });

  const [series, setSeries] = useState<
    { date: string; leads: number; outbound: number; inbound: number }[]
  >([]);

  // Chart example data
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  // Graph example data (simple line)
  const [graphData, setGraphData] = useState<{ x: string; y: number }[]>([]);

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
      } catch { }
    })();
  }, [token]);

  // Load live dashboard data
  useEffect(() => {
    (async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const [sumRes, tsRes, recRes] = await Promise.all([
          fetch('http://localhost:3001/dashboard/summary', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/dashboard/timeseries?period=7d', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/dashboard/recent-leads?limit=6', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (!sumRes.ok) throw new Error(await sumRes.text());
        if (!tsRes.ok) throw new Error(await tsRes.text());
        const summary = await sumRes.json();
        const tsJson = await tsRes.json();
        const recentJson = recRes.ok ? await recRes.json() : [];
        setMetrics({ bookedAppointments: summary.bookedAppointments ?? 0, conversionRate: summary.conversionRate ?? 0 });
        setSeries(Array.isArray(tsJson?.series) ? tsJson.series : []);
        setLeads(Array.isArray(recentJson) ? recentJson : []);

        // For the "chart" (pie/donut) - aggregates outbound/inbound volume last 7 days
        const totalOutbound = (Array.isArray(tsJson?.series) ? tsJson.series : []).reduce((acc, s) => acc + (s.outbound ?? 0), 0);
        const totalInbound = (Array.isArray(tsJson?.series) ? tsJson.series : []).reduce((acc, s) => acc + (s.inbound ?? 0), 0);
        setChartData([
          { label: "Outbound", value: totalOutbound },
          { label: "Inbound", value: totalInbound }
        ]);
        // For the "graph" (line) - line values for leads over time
        setGraphData((Array.isArray(tsJson?.series) ? tsJson.series : []).map(s => ({ x: s.date, y: s.leads })));
      } catch (e) {
        setError((e as any)?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[40vh] text-blue-700">
        <span className="text-lg font-semibold animate-pulse">Loading dashboard...</span>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-[40vh] text-red-700">
        <span className="text-lg font-semibold">{error}</span>
      </div>
    );

  return (
    <main className="min-h-screen bg-white text-gray-900 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Today's Money"
          value="$53,000"
          percentage="+55%"
          icon={
            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          }
        />
        <StatCard
          title="Today's Users"
          value="2,300"
          percentage="+3%"
          icon={
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          }
        />
        <StatCard
          title="New Clients"
          value="+3,462"
          percentage="-2%"
          icon={
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9L16 12l-6 4.5z" />
            </svg>
          }
        />
        <StatCard
          title="Total Sales"
          value="$103,430"
          percentage="+5%"
          icon={
            <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <HeroCard
            name={user && "name" in user ? (user as any).name : "User"}
            message="Glad to see you again! Ask me anything."
            imageUrl="/images/jellyfish.png"
          />
        </div>
        <SatisfactionRateCard rate={95} description="Based on likes" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
          <p className="text-gray-600 text-sm">Sales Overview</p>
          <p className="text-green-600 text-sm mt-1">+5% more in 2021</p>
          {/* Sales Overview Graph */}
          <div className="h-48 mt-4">
            <LineGraph data={graphData} />
          </div>
        </div>
        <ReferralTrackingCard invited={145} bonus={1465} safetyScore={9.3} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActiveUsersCard
          users={32984}
          clicks="2.42M"
          sales="2,400$"
          items={320}
          series={series}
        />
      </div>
    </main>
  );
}

export default DashboardPage;

// UI Components

interface InfoCardProps {
  title: string;
  value: string | number;
  percentage?: string;
  icon?: React.ReactNode;
}

function InfoCard({ title, value, percentage, icon }: InfoCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center space-x-4">
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-gray-900 text-2xl font-bold mt-1">{value}</p>
        {percentage && <p className="text-green-600 text-sm">{percentage}</p>}
      </div>
    </div>
  );
}

interface NextSendsInfoCardProps {
  last24: number;
  next24: number;
}

function NextSendsInfoCard({ last24, next24 }: NextSendsInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between">
      <p className="text-gray-600 text-sm">Next Sends</p>
      <div className="flex items-end gap-6 mt-4">
        <div>
          <p className="text-gray-600 text-sm">Sent</p>
          <p className="text-gray-900 text-2xl font-bold mt-1">{last24}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Scheduled</p>
          <p className="text-gray-900 text-2xl font-bold mt-1">{next24}</p>
        </div>
      </div>
    </div>
  );
}

/** Minimal Pie chart (SVG, no external libs) */
function PieChart({ data }: { data: { label: string; value: number }[] }) {
  const colors = ["#8ec5fc", "#e0c3fc", "#a2d5f2", "#fcb9b2", "#b2a3fc", "#74ebd5"];
  const sum = Math.max(1, data.reduce((acc, d) => acc + d.value, 0));
  let startAngle = 0;

  // Create arcs for each value
  const paths = data.map((d, i) => {
    const val = d.value / sum;
    const angle = val * 360;
    const x1 = 50 + 50 * Math.cos((Math.PI / 180) * (startAngle - 90));
    const y1 = 50 + 50 * Math.sin((Math.PI / 180) * (startAngle - 90));
    const x2 = 50 + 50 * Math.cos((Math.PI / 180) * (startAngle + angle - 90));
    const y2 = 50 + 50 * Math.sin((Math.PI / 180) * (startAngle + angle - 90));
    const largeArcFlag = angle > 180 ? 1 : 0;
    const dPath = `
      M 50 50
      L ${x1} ${y1}
      A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}
      Z
    `;
    startAngle += angle;
    return (
      <path key={i} d={dPath} fill={colors[i % colors.length]} opacity={data.length > 1 ? 0.97 : 1}>
        <title>{`${d.label}: ${d.value}`}</title>
      </path>
    );
  });

  // Legend (show at bottom)
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg width={100} height={100} viewBox="0 0 100 100">{paths}</svg>
      <div className="flex flex-wrap gap-3 mt-2 text-xs justify-center">
        {data.map((d, i) => (
          <span key={i} className="flex items-center gap-1">
            <span
              style={{
                background: colors[i % colors.length],
                width: 14,
                height: 14,
                display: "inline-block",
                borderRadius: 3
              }}
            />
            <span className="text-blue-900 font-semibold">{d.label}</span>
            <span className="text-gray-500">{d.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Minimal Line chart (SVG, no external libs) */
function LineGraph({ data }: { data: { x: string; y: number }[] }) {
  // x - evenly distributed pts; y - normalized to [0,100]
  const points = data.slice(-14); // show last 14 pts
  const yVals = points.map(p => p.y);
  const yMin = Math.min(...yVals, 0);
  const yMax = Math.max(...yVals, 1);

  const getY = (y: number) =>
    90 - ((y - yMin) / Math.max(1, yMax - yMin)) * 70; // padding top/bottom

  const getX = (i: number) =>
    20 + (i * 60) / Math.max(1, points.length - 1);

  let svgPath = "";
  points.forEach((p, i) => {
    if (i === 0) svgPath = `M ${getX(i)} ${getY(p.y)}`;
    else svgPath += ` L ${getX(i)} ${getY(p.y)}`;
  });

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg width={100} height={100} viewBox="0 0 100 100">
        {/* Axes */}
        <line x1={20} y1={90} x2={80} y2={90} stroke="#e5e7eb" strokeWidth={2} />
        <line x1={20} y1={90} x2={20} y2={20} stroke="#e5e7eb" strokeWidth={2} />
        {/* Polyline */}
        <polyline
          points={points.map((p, i) => `${getX(i)},${getY(p.y)}`).join(" ")}
          fill="none"
          stroke="#8ec5fc"
          strokeWidth={3}
        />
        {/* Path w/shadow for visual pop */}
        <path
          d={svgPath}
          fill="none"
          stroke="#5151e5"
          strokeWidth={2}
          style={{ filter: "drop-shadow(0 1px 4px #a5b4fc44)" }}
        />
        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(p.y)}
            r={2.5}
            fill="#e0c3fc"
            stroke="#5151e5"
          >
            <title>{`${p.x}: ${p.y}`}</title>
          </circle>
        ))}
      </svg>
      {/* x-axis labels, show every 2nd label for clarity */}
      <div className="flex gap-2 mt-2 justify-center w-full text-xs text-gray-400">
        {points.map((p, i) =>
          i % 2 === 0 ? (
            <span style={{ minWidth: 20, textAlign: "center" }} key={i}>
              {p.x.length > 5 ? p.x.slice(5) : p.x}
            </span>
          ) : (
            <span style={{ minWidth: 20 }} key={i}></span>
          )
        )}
      </div>
    </div>
  );
}

function Bars({
  values,
  labels,
  color = "#2563eb",
  focus,
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
    <div className="w-full h-full flex items-end gap-1.5 relative">
      {sliceValues.map((v, i) => (
        <div
          key={i}
          className="rounded-lg cursor-pointer transition-all duration-300 hover:opacity-100"
          style={{
            width: `${barWidth}%`,
            height: `${(v / Math.max(1, max)) * 100}%`,
            background: color,
            opacity: hover === i ? 1 : 0.82,
            minHeight: "12%",
            boxShadow: hover === i ? "0 0 8px 1px #ddd" : undefined,
          }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onClick={() => {
            const d = sliceLabels[i];
            if (d)
              router.push(
                `/analytics?date=${encodeURIComponent(d)}${focus ? `&focus=${focus}` : ""}`
              );
          }}
          title={sliceLabels[i] ? `${sliceLabels[i]}: ${v}` : String(v)}
        />
      ))}
      {hover !== null && (
        <div className="pointer-events-none absolute -top-2 left-0 right-0 flex justify-center z-50">
          <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-white/10 animate-fade-in">
            <div>{sliceLabels[hover] || ""}</div>
            <div className="font-bold">{sliceValues[hover]}</div>
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
      maximumFractionDigits: 0,
    }).format(n || 0);
  } catch {
    return `$${Math.round(n || 0).toLocaleString()}`;
  }
}

interface ActiveUsersCardProps {
  users: number;
  clicks: string;
  sales: string;
  items: number;
  series: { date: string; leads: number; outbound: number; inbound: number }[];
}

function ActiveUsersCard({ users, clicks, sales, items, series }: ActiveUsersCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col">
      <p className="text-gray-600 text-sm mb-4">Active Users</p>
      <div className="h-36">
        <BarsGradient values={series.map(s => s.leads)} from="#8ec5fc" to="#e0c3fc" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <InfoCard title="Users" value={users} />
        <InfoCard title="Clicks" value={clicks} />
        <InfoCard title="Sales" value={sales} />
        <InfoCard title="Items" value={items} />
      </div>
    </div>
  );
}

function BarsGradient({
  values,
  from,
  to,
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
    <div className="w-full h-full flex items-end gap-[7px]">
      {sliceValues.map((v, i) => (
        <div
          key={i}
          className="rounded-lg transition-all duration-300"
          style={{
            width: `${barWidth}%`,
            height: `${(v / Math.max(1, max)) * 100}%`,
            background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
            opacity: hover === i ? 1 : 0.95,
            minHeight: "12%",
            boxShadow: hover === i ? "0 0 8px 1px #c7d2fe" : undefined,
          }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          title={String(v)}
        />
      ))}
    </div>
  );
}
