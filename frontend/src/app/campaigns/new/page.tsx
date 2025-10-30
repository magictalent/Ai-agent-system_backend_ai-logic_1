"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Campaign, CreateCampaignData } from "@/types/campaign";
import CampaignForm from "@/components/CampaignForm";
import CampaignCard from "@/components/CampaignCard";
import { FaChevronRight, FaUserCircle } from "react-icons/fa";

export default function CampaignsCreatePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const searchParams = useSearchParams();

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError("");
      if (!token) {
        setError("Missing user token. Please re-login.");
        setLoading(false);
        return;
      }
      const res = await fetch("http://localhost:3001/campaigns", {
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
      // Omit client_id if not provided
      const payload: any = { ...data };
      if (!payload.client_id) delete payload.client_id;
      const res = await fetch("http://localhost:3001/campaigns/add", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setCampaigns((prev) => [created, ...prev]);
      if (opts?.startNow && created?.id) await handleStart(created.id);
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
      const res = await fetch(`http://localhost:3001/campaigns/${editing.id}`, {
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

  // Actions available on this page
  const handleStart = async (campaignId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/campaigns/${campaignId}/start`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error('Failed to start campaign')
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'active' as const } : c))
      // Optionally enqueue sequences immediately with tone preference
      const camp = campaigns.find(c => c.id === campaignId)
      if (camp) {
        try {
          await fetch('http://localhost:3001/sequences/start-all', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId: camp.client_id, campaignId: camp.id, channel: 'email', tone: (camp as any).tone || 'friendly' })
          })
        } catch {}
      }
    } catch (e: any) { setError(e?.message || 'Failed to start') }
  }
  const handlePause = async (campaignId: string) => {
    try { const res = await fetch(`http://localhost:3001/campaigns/${campaignId}/pause`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }); if (!res.ok) throw new Error('Failed to pause campaign'); setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'paused' as const } : c)) } catch (e: any) { setError(e?.message || 'Failed to pause') }
  }
  const handleStop = async (campaignId: string) => {
    try { const res = await fetch(`http://localhost:3001/campaigns/${campaignId}/stop`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }); if (!res.ok) throw new Error('Failed to stop campaign'); setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'completed' as const } : c)) } catch (e: any) { setError(e?.message || 'Failed to stop') }
  }
  const handleDelete = async (campaignId: string) => {
    try { if (!confirm('Delete this campaign?')) return; const res = await fetch(`http://localhost:3001/campaigns/${campaignId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }); if (!res.ok) throw new Error(await res.text()); setCampaigns(prev => prev.filter(c => c.id !== campaignId)) } catch (e: any) { setError(e?.message || 'Failed to delete') }
  }

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-gray-200 text-xl">Please log in</div>
      </div>
    );

  // --- Progress data ---
  const steps = [
    { label: "1. Parameters" },
    { label: "2. Hooks" },
    { label: "3. Social" },
    { label: "4. Pricing" },
  ];
  // If CampaignForm uses steps, you can use state to track currentStep, else just static for style
  const currentStep = 0;

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <header className="w-full px-8 pt-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* <span className="text-gray-400 font-semibold text-xs tracking-wider flex items-center gap-1">
            <span className="hover:underline cursor-pointer">Dashboard</span>
            <FaChevronRight className="inline-block text-xs" />
            <span className="hover:underline cursor-pointer">Campaigns</span>
            <FaChevronRight className="inline-block text-xs" />
            <span className="text-blue-400">New Campaign</span>
          </span> */}
        </div>
        <div className="flex gap-4 items-center">
          {/* <div className="flex flex-col text-right leading-tight">
            <span className="font-semibold text-white">{user.name || "Anonymous"}</span>
            <span className="text-xs text-blue-200 opacity-70">{user.email}</span>
          </div> */}
          {/* <span className="bg-gradient-to-br from-blue-500 to-violet-500 p-[2px] rounded-full">
            <FaUserCircle className="w-12 h-12 text-white bg-[#232254] rounded-full" />
          </span> */}
          {/* <button className="ml-2 px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded-lg font-bold shadow">
            Preview
          </button> */}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Progress */}
        <div className="w-full max-w-3xl flex flex-col items-center mt-6 mb-12">
          <div className="flex w-full justify-between items-center mb-4">
            {steps.map((step, idx) => (
              <div key={step.label} className="flex-1 flex flex-col items-center">
                <div
                  className={`rounded-full w-9 h-9 grid place-items-center text-lg font-bold 
                        ${idx <= currentStep ? "bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-lg" : "bg-slate-600 text-slate-300"}`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold 
                        ${idx === currentStep
                      ? "text-blue-300"
                      : idx < currentStep
                        ? "text-blue-400"
                        : "text-slate-400"
                    }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          {/* Connecting lines */}
          <div className="absolute w-full h-0.5 top-[34px] left-0 z-0 flex">
            {steps.map((_, idx) =>
              idx !== steps.length - 1 ? (
                <div
                  key={idx}
                  className={`flex-1 h-0.5 ${idx < currentStep ? "bg-blue-400" : "bg-slate-700"}`}
                />
              ) : null
            )}
          </div>
        </div>

        {/* Card for Create/Edit */}
        <div className="w-full max-w-2xl  border shadow-2xl rounded-xl px-10 py-10 mx-auto relative z-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-extrabold leading-tight tracking-tight text-black">Product Information</h2>
              <div className="text-xs text-blue-400 font-medium mt-1">Please fill campaign product data</div>
            </div>
            <div>
              {/* Progress bar */}
              <span className="text-xs font-bold text-violet-300">50%</span>
              <div className="w-24 h-2 rounded-xl overflow-hidden mt-1">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: "50%" }} />
              </div>
            </div>
          </div>
          {/* Actual campaign form */}
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
            inputClass="text-black  border border-[#343c89] focus:ring-2 focus:ring-violet-400"
            labelClass="text-blue-200"
            buttonClass="bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md py-2 px-6 rounded-lg font-bold hover:opacity-90"
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="w-full max-w-5xl mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Existing campaigns list to browse/edit */}
        {/* <div className="w-full max-w-5xl mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-bold">Existing Campaigns</h3>
            <span className="text-xs text-blue-300">Click ••• to Edit</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#181e48] border border-[#2a2c5e] rounded-xl p-6 animate-pulse h-40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  highlighted={editing?.id === campaign.id}
                  onEdit={(c) => setEditing(c)}
                  onStart={handleStart}
                  onPause={handlePause}
                  onStop={handleStop}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div> */}
      </main>
    </div>
  );
}
