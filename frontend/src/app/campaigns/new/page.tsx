"use client";

import { Suspense } from "react";
import CampaignsCreatePageContent from "./CampaignCreatePageContent";

export const dynamic = "force-dynamic"; // ✅ Disable pre-rendering for Netlify SSR

export default function CampaignsCreatePage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading new campaign...</div>}>
      <CampaignsCreatePageContent />
    </Suspense>
  );
}
