"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AutomationPage() {
  const { token } = useAuth();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const runNow = async () => {
    if (!token) { setStatus("Missing session"); return; }
    setLoading(true); setStatus("");
    try {
      const res = await fetch("http://localhost:3001/automation/run", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Run failed");
      setStatus(`Enqueued ${data?.enqueued ?? 0} leads across clients.`);
    } catch (e: any) {
      setStatus(e?.message || "Run failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Automation</h1>
      <p className="text-gray-600 mb-6">Sync CRM leads and enqueue first-touch outreach automatically.</p>

      <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-gray-800">Run Now</div>
            <div className="text-sm text-gray-500">Fetch leads for your clients and enqueue sequences.</div>
          </div>
          <button
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            onClick={runNow}
            disabled={loading}
          >
            {loading ? "Running…" : "Run"}
          </button>
        </div>
        {status && <div className="mt-4 text-sm text-gray-700">{status}</div>}
      </div>
    </div>
  );
}
