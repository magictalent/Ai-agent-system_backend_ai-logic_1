"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Campaign, CreateCampaignData } from "@/types/campaign";
import { API_BASE } from "@/lib/api";
import CampaignForm from "@/components/CampaignForm";
import CampaignCard from "@/components/CampaignCard";
import { FaChevronRight, FaUserCircle } from "react-icons/fa";

export default function CampaignsCreatePageContent() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Description" },
    { label: "Industry" },
    { label: "Channel" },
    { label: "Completed" },
  ];

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError("");
      if (!token) {
        setError("Missing user token. Please re-login.");
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const list: Campaign[] = await res.json();
      setCampaigns(list);
      const editId = searchParams?.get("edit");
      if (editId) {
        const found = list.find((c) => c.id === editId);
        if (found) setEditing(found);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, searchParams]);

  const handleCreate = async (data: CreateCampaignData, opts?: { startNow?: boolean }) => {
    try {
      let clientId = data.client_id;
      if (!clientId && (data.industry || data.client_name)) {
        const clientBody = {
          name: data.client_name || data.name || 'My Business',
          email: `${Date.now()}@local`,
          industry: data.industry || '',
          crm_provider: 'mock',
        } as any;
        const add = await fetch(`${API_BASE}/clients/add`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(clientBody)
        });
        if (add.ok) {
          const createdClient = await add.json();
          clientId = createdClient?.id || clientId;
        }
      }
      const payload: any = {
        name: data.name,
        description: data.description,
        channel: data.channel,
        tone: data.tone,
        client_id: clientId,
      };
      if (!payload.client_id) delete payload.client_id;
      const res = await fetch(`${API_BASE}/campaigns/add`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setCampaigns((prev) => [created, ...prev]);
      if (opts?.startNow && created?.id) await handleStart(created.id);
      if (created?.id) {
        router.push(`/campaigns?open=${created.id}`);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to create campaign");
      throw e;
    }
  };

  const handleUpdate = async (patch: CreateCampaignData) => {
    if (!editing) return;
    try {
      const payload: any = { ...patch };
      if (!payload.client_id) delete payload.client_id;
      const res = await fetch(`${API_BASE}/campaigns/${editing.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditing(null);
    } catch (e: any) {
      setError(e?.message || "Failed to update campaign");
      throw e;
    }
  };

  // Action helpers
  const handleStart = async (campaignId: string) => {
    try {
      const res = await fetch(`${API_BASE}/campaigns/${campaignId}/start`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error('Failed to start campaign')
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'active' as const } : c))
      // Optionally enqueue sequences immediately with tone preference
      const camp = campaigns.find(c => c.id === campaignId)
      if (camp) {
        try {
          await fetch(`${API_BASE}/sequences/start-all`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId: camp.client_id, campaignId: camp.id, channel: 'email', tone: (camp as any).tone || 'friendly' })
          })
        } catch {}
      }
    } catch (e: any) { setError(e?.message || 'Failed to start') }
  }
  const handlePause = async (campaignId: string) => {
    try { const res = await fetch(`${API_BASE}/campaigns/${campaignId}/pause`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }); if (!res.ok) throw new Error('Failed to pause campaign'); setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'paused' as const } : c)) } catch (e: any) { setError(e?.message || 'Failed to pause') }
  }
  const handleStop = async (campaignId: string) => {
    try { const res = await fetch(`${API_BASE}/campaigns/${campaignId}/stop`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }); if (!res.ok) throw new Error('Failed to stop campaign'); setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'completed' as const } : c)) } catch (e: any) { setError(e?.message || 'Failed to stop') }
  }
  const handleDelete = async (campaignId: string) => {
    try { if (!confirm('Delete this campaign?')) return; const res = await fetch(`${API_BASE}/campaigns/${campaignId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }); if (!res.ok) throw new Error(await res.text()); setCampaigns(prev => prev.filter(c => c.id !== campaignId)) } catch (e: any) { setError(e?.message || 'Failed to delete') }
  }

  if (!user)
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-zinc-900">
        <div className="p-8 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="text-slate-700 font-semibold text-lg flex items-center gap-3">
            <FaUserCircle className="w-8 h-8 text-gray-400" />
            Please log in
          </div>
        </div>
      </section>
    );

  // Modern progress bar component
  function StepProgressBar({ steps, currentStep }: { steps: { label: string }[]; currentStep: number }) {
    return (
      <div className="w-full max-w-3xl flex flex-col items-center mt-8 mb-16 relative">
        <div className="flex w-full justify-between items-center relative z-10">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex-1 flex flex-col items-center">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold relative transition-all duration-300
                  ${idx < currentStep
                    ? "bg-violet-500 text-white ring-4 ring-violet-200/70 shadow-lg scale-110"
                    : idx === currentStep
                    ? "bg-gradient-to-br from-violet-400 to-blue-400 text-white ring-4 ring-blue-200/60 shadow-lg scale-105"
                    : "bg-slate-100 text-slate-400 border-2 border-slate-200"
                  }`}
              >
                {idx + 1}
                {idx < steps.length - 1 && (
                  <span className="absolute -right-20 w-12 h-1 top-1/2 -translate-y-1/2">
                    <span className={`block w-full h-full rounded-lg transition-all duration-300 ${idx < currentStep ? 'bg-violet-400' : 'bg-slate-200'}`} />
                  </span>
                )}
              </div>
              <span
                className={`mt-3 text-xs font-semibold tracking-wider uppercase text-center min-w-[70px] max-w-[90px]
                  ${idx === currentStep ? "text-violet-600" : idx < currentStep ? "text-violet-400" : "text-zinc-400"}`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f7f8fa] to-[#ebedfa] flex flex-col">
      {/* Modern header bar */}
      <header className="w-full px-8 pt-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-2 text-sm font-medium tracking-wide text-zinc-400">
            <span className="hover:underline cursor-pointer transition">Dashboard</span>
            <FaChevronRight className="inline-block text-xs" />
            <span className="hover:underline cursor-pointer transition">Campaigns</span>
            <FaChevronRight className="inline-block text-xs" />
            <span className="text-violet-600 font-bold">New Campaign</span>
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden md:flex flex-col text-right leading-tight">
            <span className="font-semibold text-zinc-700">{user.firstName || "Anonymous"}</span>
            <span className="text-xs text-violet-500 opacity-70">{user.email}</span>
          </div>
          <span className="bg-gradient-to-br from-blue-400 to-violet-500 p-[2px] rounded-full">
            <FaUserCircle className="w-11 h-11 text-violet-700 bg-white shadow-lg rounded-full" />
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pt-6 pb-12">
        <StepProgressBar steps={steps} currentStep={currentStep} />

        {/* Card for Create/Edit */}
        <div className="w-full max-w-2xl bg-white/80 shadow-2xl rounded-3xl px-10 py-10 mx-auto relative z-20 border border-zinc-200 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900/90 mb-1">Create New Campaign</h2>
              <div className="text-xs text-violet-600 font-medium">Fill in your campaign's product details</div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-violet-400/90 mb-1 tracking-widest">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              <div className="w-32 h-2 rounded-xl overflow-hidden bg-violet-100/40">
                <div
                  className="h-2 bg-gradient-to-r from-blue-400 to-violet-500 rounded-xl transition-all duration-300"
                  style={{ width: `${Math.round(((currentStep + 1) / steps.length) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <CampaignForm
            mode={editing ? "edit" : "create"}
            initial={
              editing
                ? { name: editing.name, description: editing.description, channel: editing.channel, tone: (editing as any).tone }
                : undefined
            }
            onSubmit={async (data, opts) => {
              if (editing) await handleUpdate(data);
              else await handleCreate(data, opts);
            }}
            onCancel={() => setEditing(null)}
            bgClass="bg-transparent"
            inputClass="text-zinc-800 border border-zinc-200 focus:ring-2 focus:ring-violet-400 rounded-lg transition-all"
            labelClass="text-violet-600/90"
            buttonClass="bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-md py-2 px-6 rounded-lg font-bold hover:scale-[1.04] hover:shadow-lg transition"
            visibleSections={{
              basics: currentStep === 0,
              industryTone: currentStep === 1,
              channel: currentStep === 2,
              startNow: currentStep === 3,
            }}
            hideSubmit={currentStep !== 3}
          />
          {/* Wizard controls */}
          <div className="mt-7 flex justify-between">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              className={`px-5 py-2 font-semibold rounded-xl border border-zinc-200 shadow-sm
                ${currentStep === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-slate-100 to-violet-50 text-zinc-700 hover:bg-violet-100/60 hover:text-violet-700 transition"
                }`}
            >Back</button>
            <button
              onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
              className={`px-5 py-2 font-semibold rounded-xl shadow-sm
                ${currentStep === steps.length - 1
                  ? "bg-gray-100 text-gray-400 border border-zinc-200 cursor-not-allowed"
                  : "bg-gradient-to-br from-violet-500 to-blue-400 text-white border border-violet-300 hover:scale-105 hover:shadow-lg transition"
                }`}
              disabled={currentStep === steps.length - 1}
            >Next</button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="w-full max-w-2xl mt-8 p-4 bg-red-50/80 border border-red-200 text-red-700 rounded-xl shadow">{error}</div>
        )}

      </main>
    </div>
  );
}



