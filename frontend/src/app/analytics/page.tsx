"use client";

import { Suspense } from "react";
import AnalyticsPageContent from "./AnalyticsPageContent";

export const dynamic = "force-dynamic"; // ✅ Disable pre-rendering (good for Netlify SSR)

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading analytics...</div>}>
      <AnalyticsPageContent />
    </Suspense>
  );
}
