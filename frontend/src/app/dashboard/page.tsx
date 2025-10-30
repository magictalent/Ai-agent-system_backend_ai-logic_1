"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/StatCard";
import { HeroCard } from "@/components/HeroCard";
import { SatisfactionRateCard } from "@/components/SatisfactionRateCard";
import { ReferralTrackingCard } from "@/components/ReferralTrackingCard";

/** --- Types --- */
type Lead = { id: string; firstname: string; lastname: string; email: string };

const CRM_LIST = [
  {
    name: "HubSpot",
    icon: (
      <img
        src="icons/hubspot.png"
        alt="HubSpot"
        width={38}
        height={38}
        className="w-9 h-9 object-contain"
        style={{ background: "linear-gradient(135deg, #112f47 60%, #49c7fb 100%)", borderRadius: "50%" }}
      />
    ),
  },
  {
    name: "Salesforce",
    icon: (
      <img
        src="icons/salesforce.png"
        alt="Salesforce"
        width={38}
        height={38}
        className="w-9 h-9 object-contain"
        style={{ background: "linear-gradient(135deg, #e0c3fc 60%, #8ec5fc 100%)", borderRadius: "50%" }}
      />
    ),
  },
  {
    name: "Pipedrive",
    icon: (
      <img
        src="icons/pipedrive.png"
        alt="Pipedrive"
        width={38}
        height={38}
        className="w-9 h-9 object-contain"
        style={{ background: "linear-gradient(135deg,#222D3A 50%,#63f7b8 100%)", borderRadius: "50%" }}
      />
    ),
  },
  {
    name: "Zoho",
    icon: (
      <img
        src="icons/zoho.png"
        alt="Zoho"
        width={38}
        height={38}
        className="w-9 h-9 object-contain"
        style={{ background: "linear-gradient(135deg, #e2e2e2 50%, #e97451 100%)", borderRadius: "50%" }}
      />
    ),
  },
];

function DashboardPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [topReplyRates, setTopReplyRates] = useState<Array<{ campaign_name: string; reply_rate: number; outbound_last_24h?: number; replies_last_24h?: number }>>([]);
  const [metrics, setMetrics] = useState<{ bookedAppointments: number; conversionRate: number; contactedLast24?: number }>({ bookedAppointments: 0, conversionRate: 0 });

  const [series, setSeries] = useState<
    { date: string; leads: number; outbound: number; inbound: number }[]
  >([]);

  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [graphData, setGraphData] = useState<{ x: string; y: number }[]>([]);
  const [nextSends, setNextSends] = useState<{ last24: number; next24: number }>({ last24: 0, next24: 0 });

  // Fetch async dashboard data (now refactored for clarity and error boundaries)
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("http://localhost:3001/dashboard/summary", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://localhost:3001/dashboard/timeseries?period=7d", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://localhost:3001/dashboard/recent-leads?limit=6", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([sumRes, tsRes, recRes]) => {
        if (!sumRes.ok) throw new Error(await sumRes.text());
        if (!tsRes.ok) throw new Error(await tsRes.text());
        const [summary, tsJson, recentJson] = await Promise.all([
          sumRes.json(),
          tsRes.json(),
          recRes.ok ? recRes.json() : [],
        ]);
        setMetrics({
          bookedAppointments: summary.bookedAppointments ?? 0,
          conversionRate: summary.conversionRate ?? 0,
        });
        setSeries(Array.isArray(tsJson?.series) ? tsJson.series : []);
        setLeads(Array.isArray(recentJson) ? recentJson : []);
        // Pie chart aggregates
        const totalOutbound = tsJson?.series?.reduce((a: number, s: any) => a + (s.outbound ?? 0), 0) ?? 0;
        const totalInbound = tsJson?.series?.reduce((a: number, s: any) => a + (s.inbound ?? 0), 0) ?? 0;
        setChartData([
          { label: "Outbound", value: totalOutbound },
          { label: "Inbound", value: totalInbound },
        ]);
        setGraphData(tsJson?.series?.map((s: any) => ({ x: s.date, y: s.leads })) ?? []);
      })
      .catch((e) => setError(e?.message ?? "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:3001/dashboard/sequence-window", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) =>
        setNextSends({ last24: data?.sent_last_24h ?? 0, next24: data?.scheduled_next_24h ?? 0 })
      );
  }, [token]);

  const userName = useMemo(
    () => (user && "name" in user ? (user as any).name : "Andi Jackson"),
    [user]
  );

  // Modern loading and error overlays
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-xl font-extrabold text-neutral-600 animate-pulse">
          <svg
            className="w-7 h-7 text-blue-600 mr-3 animate-spin inline-block"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-60"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 014 4h-4a8 8 0 01-8-8z"
            />
          </svg>
          Loading your dashboard...
        </span>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[40vh] bg-red-50">
        <span className="text-lg font-semibold text-red-700">?? {error}</span>
      </div>
    );

  // Demonstration: rotate CRMs for demo cards
  const activeUserCards = Array(4)
    .fill(null)
    .map((_, idx) => {
      const crm = CRM_LIST[idx % CRM_LIST.length];
      return (
        <ActiveUsersCard
          key={crm.name}
          crmName={crm.name}
          crmIcon={crm.icon}
          users={Math.floor(Math.random() * 1000) + 200}
          leads={32984}
          response="2.42M"
          sales="$2,400"
          items={320}
          series={series}
        />
      );
    });

  // --- MODERN UI ---
  return (
    <main className="min-h-screen bg-gradient-to-tr from-[#f8fafc] via-[#f3f6fa] to-[#e8f1ff] text-[#1A2236] p-6 sm:p-10 w-full">
      <div className="flex flex-wrap justify-between items-center mb-10 gap-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-purple-600 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          Dashboard Overview
        </h1>
        <button className="group flex items-center gap-2 bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-500 text-white rounded-xl py-2 px-6 font-semibold shadow-lg hover:scale-105 transition-all">
          <svg
            className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M2 12h20M12 2v20" />
          </svg>
          New Report
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 mb-7">
        <StatCard
          title="Total Leads"
          value={"53,000"}
          percentage="+55%"
          icon={
            <svg className="w-8 h-8 text-blue-500/90" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="13" className="stroke-current opacity-30" fill="none" />
              <path d="M14 8v5l4 2" className="stroke-current" />
            </svg>
          }
        />
        <StatCard
          title="Contacted (24h)"
          value={(metrics.contactedLast24 ?? 0).toString()}
          percentage=""
          icon={
            <svg className="w-8 h-8 text-green-500/90" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="12" className="stroke-current opacity-20" />
              <path d="M6 16l4 4 8-10" className="stroke-current" />
            </svg>
          }
        />
        <StatCard
          title="New Clients"
          value="+3,462"
          percentage="-2%"
          icon={
            <svg className="w-8 h-8 text-red-500/90" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 28 28">
              <rect x={4} y={4} width={20} height={20} rx={7} className="stroke-current opacity-25" />
              <path d="M10 10h8v8h-8z" fill="currentColor" />
            </svg>
          }
        />
        <StatCard
          title="Total Sales"
          value="$103,430"
          percentage="+5%"
          icon={
            <svg className="w-8 h-8 text-purple-500/90" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="12" className="stroke-current opacity-30" />
              <path d="M18 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="currentColor" />
            </svg>
          }
        />
      </div>
      {/* --- Modern Hero and Satisfaction Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 mb-7">
        <div className="lg:col-span-2">
          <HeroCard
            name={userName}
            message="Welcome back! How can I help you today?"
            imageUrl="/images/jellyfish.png"
            className="from-blue-50 via-white to-purple-100 bg-gradient-to-tr"
          />
        </div>
        <SatisfactionRateCard
          rate={95}
          description="Customer Satisfaction"
          className="bg-gradient-to-tr from-pink-100 via-blue-50 to-purple-50"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 mb-7">
        <div className="lg:col-span-2 bg-white/90 rounded-2xl p-8 shadow-xl relative overflow-hidden hover:shadow-2xl transition-shadow">
          <div className="absolute right-0 top-0 opacity-[0.04] pointer-events-none select-none">
            <svg width="200" height="140"><circle cx="160" cy="50" r="70" fill="url(#lgt)" />
              <defs>
                <radialGradient id="lgt" cx=".6" cy=".4" r=".7">
                  <stop stopColor="#89f7fe" />
                  <stop offset="0.65" stopColor="#66a6ff" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-gray-600 text-md font-medium">Leads Rate</p>
              <p className="text-green-700 text-xs mt-1 font-semibold">+5% more in Sep</p>
            </div>
            <div className="flex items-center gap-5">
              <NextSendsInfoCard last24={nextSends.last24} next24={nextSends.next24} />
            </div>
          </div>
          <div className="h-52 mt-4 flex items-center justify-center">
            <LineGraph data={graphData} />
          </div>
        </div>
        <ReferralTrackingCard invited={145} bonus={1465} safetyScore={9.3} className="bg-white/90" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 rounded-2xl">
        {activeUserCards}
      </div>
    </main>
  );
}

export default DashboardPage;

/** --- UI Components Modernized --- */

interface InfoCardProps {
  title: string;
  value: string | number;
  percentage?: string;
  icon?: React.ReactNode;
}

function InfoCard({ title, value, percentage, icon }: InfoCardProps) {
  return (
    <div className="bg-white/90 rounded-xl px-5 py-6 shadow flex items-center space-x-5 border border-gray-50">
      {icon && <div className="flex-shrink-0 rounded-lg bg-gradient-to-tr from-blue-50 via-transparent to-purple-50 p-2">{icon}</div>}
      <div>
        <p className="text-gray-500 font-medium text-xs uppercase">{title}</p>
        <p className="text-[#15193a] text-xl font-bold mt-0.5 tracking-tight">{value}</p>
        {percentage && (
          <p className={`text-sm mt-0.5 font-semibold ${percentage.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
            {percentage}
          </p>
        )}
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
    <div className="rounded-lg bg-gradient-to-tr from-blue-50 via-white to-blue-100 px-5 py-3 border border-blue-100 shadow-xs">
      <div className="flex flex-col gap-0.5">
        <label className="text-blue-800 text-xs font-semibold">Sent</label>
        <div className="text-lg font-extrabold text-blue-700">{last24}</div>
      </div>
      <div className="h-1" />
      <div className="flex flex-col gap-0.5">
        <label className="text-fuchsia-700 text-xs font-semibold">Scheduled</label>
        <div className="text-lg font-extrabold text-fuchsia-800">{next24}</div>
      </div>
    </div>
  );
}

/** --- Modern Pie Chart --- */
function PieChart({ data }: { data: { label: string; value: number }[] }) {
  const colors = [
    "url(#blueGrad)",
    "url(#purpleGrad)",
    "#a2d5f2",
    "#fcb9b2",
    "#b2a3fc",
    "#74ebd5",
  ];
  const sum = Math.max(1, data.reduce((acc, d) => acc + d.value, 0));
  let startAngle = 0;

  // Create arcs for each value with gradient fills
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
      <path
        key={i}
        d={dPath}
        fill={colors[i % colors.length]}
        opacity={data.length > 1 ? 0.95 : 1}
        style={{ transition: "fill 250ms" }}
      >
        <title>{`${d.label}: ${d.value}`}</title>
      </path>
    );
  });

  // Modern Legend
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="blueGrad" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop stopColor="#8ec5fc" />
            <stop offset="1" stopColor="#2196f3" />
          </linearGradient>
          <linearGradient id="purpleGrad" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop stopColor="#e0c3fc" />
            <stop offset="1" stopColor="#b721ff" />
          </linearGradient>
        </defs>
        {paths}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2 text-xs justify-center">
        {data.map((d, i) => (
          <span key={i} className="flex items-center gap-2 bg-white rounded pr-2 py-0.5 pl-0.5 shadow-sm">
            <span
              style={{
                background: i % 2 === 0 ? "linear-gradient(90deg,#8ec5fc,#2196f3)" : "linear-gradient(90deg,#e0c3fc,#b721ff)",
                width: 13,
                height: 13,
                borderRadius: 3,
                display: "inline-block"
              }}
            />
            <span className="font-bold text-blue-950">{d.label}</span>
            <span className="text-gray-500">{d.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** --- Modern Line Chart --- */
function LineGraph({ data }: { data: { x: string; y: number }[] }) {
  const points = data.slice(-14);
  const yVals = points.map((p) => p.y);
  const yMin = Math.min(...yVals, 0);
  const yMax = Math.max(...yVals, 1);

  const getY = (y: number) => 90 - ((y - yMin) / Math.max(1, yMax - yMin)) * 70;
  const getX = (i: number) => 20 + (i * 60) / Math.max(1, points.length - 1);

  let svgPath = "";
  points.forEach((p, i) => {
    if (i === 0) svgPath = `M ${getX(i)} ${getY(p.y)}`;
    else svgPath += ` L ${getX(i)} ${getY(p.y)}`;
  });

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg width={110} height={110} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="leadLiner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#8ec5fc" />
            <stop offset="1" stopColor="#b721ff" />
          </linearGradient>
        </defs>
        {/* Axes */}
        <line x1={20} y1={90} x2={80} y2={90} stroke="#e5e7eb" strokeWidth={1.5} />
        <line x1={20} y1={90} x2={20} y2={20} stroke="#e5e7eb" strokeWidth={1.5} />
        {/* Polyline with gradient */}
        <polyline
          points={points.map((p, i) => `${getX(i)},${getY(p.y)}`).join(" ")}
          fill="none"
          stroke="url(#leadLiner)"
          strokeWidth={3.4}
        />
        <path
          d={svgPath}
          fill="none"
          stroke="#374151"
          strokeWidth={1.2}
          style={{ filter: "drop-shadow(0 2px 8px #8ec5fc33)" }}
        />
        {/* Dots + animation */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(p.y)}
            r={3}
            fill="#fff"
            stroke="#b721ff"
            strokeWidth={1.7}
            className="hover:scale-125 transition-transform"
          >
            <title>{`${p.x}: ${p.y}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex gap-2 mt-2 justify-center w-full text-[11px] text-gray-400 font-bold">
        {points.map((p, i) =>
          i % 2 === 0 ? (
            <span style={{ minWidth: 17, textAlign: "center" }} key={i}>
              {p.x.length > 5 ? p.x.slice(5) : p.x}
            </span>
          ) : (
            <span style={{ minWidth: 17 }} key={i}></span>
          )
        )}
      </div>
    </div>
  );
}

/** --- Modern Bars --- */
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
    <div className="w-full h-full flex items-end gap-2 relative">
      {sliceValues.map((v, i) => (
        <div
          key={i}
          className="rounded-xl cursor-pointer transition-transform duration-300 hover:scale-105"
          style={{
            width: `${barWidth}%`,
            height: `${(v / Math.max(1, max)) * 100}%`,
            background:
              "linear-gradient(180deg, #a7c6fd 10%, #8ec5fc 90%)",
            opacity: hover === i ? 1 : 0.90,
            minHeight: "10%",
            boxShadow: hover === i ? "0 2px 16px 2px #8ec5fc44" : undefined,
            border: hover === i ? "1.5px solid #8ec5fc" : undefined,
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
        <div className="pointer-events-none absolute -top-6 left-0 right-0 flex justify-center z-50 transition-all">
          <div className="bg-gradient-to-tr from-blue-700 via-purple-900 to-fuchsia-600 text-white text-xs px-4 py-2 rounded-2xl shadow-xl border border-blue-300 animate-fade-in-dark font-medium">
            <div>{sliceLabels[hover] || ""}</div>
            <div className="font-bold text-xl">{sliceValues[hover]}</div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  clicks?: string;
  sales?: string;
  leads: number;
  response: string;
  items: number;
  series: { date: string; leads: number; outbound: number; inbound: number }[];
  crmName?: string;
  crmIcon?: React.ReactNode;
}

function ActiveUsersCard({
  users,
  leads,
  response,
  items,
  series,
  crmName,
  crmIcon,
}: ActiveUsersCardProps) {
  return (
    <div className="bg-white/95 rounded-2xl px-6 py-7 shadow-lg flex flex-col relative border border-blue-100 hover:shadow-2xl transition-shadow duration-300 group overflow-hidden">
      {(crmName || crmIcon) && (
        <div className="absolute left-7 top-6 flex items-center gap-2 z-20">
          {crmIcon && <div>{crmIcon}</div>}
          {crmName && (
            <span className="font-bold text-base text-gray-700 tracking-tight drop-shadow">
              {crmName}
            </span>
          )}
        </div>
      )}
      <div className="pt-8" />
      <div className="h-32 w-full">
        <BarsGradient values={series.map((s) => s.leads)} from="#8ec5fc" to="#e0c3fc" />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-6">
        <InfoCard title="Users" value={users} />
        <InfoCard title="Leads" value={leads} />
        <InfoCard title="Responses" value={response} />
        <InfoCard title="Items" value={items} />
      </div>
    </div>
  );
}

/** --- Modern Bar Gradient --- */
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
    <div className="w-full h-full flex items-end gap-[8px]">
      {sliceValues.map((v, i) => (
        <div
          key={i}
          className="rounded-md transition-all duration-300"
          style={{
            width: `${barWidth}%`,
            height: `${(v / Math.max(1, max)) * 100}%`,
            background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
            opacity: hover === i ? 1 : 0.88,
            minHeight: "10%",
            boxShadow: hover === i ? "0 2px 14px 2px #b721ff33" : undefined,
            border: hover === i ? "1.2px solid #b721ff" : undefined,
          }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          title={String(v)}
        />
      ))}
    </div>
  );
}






