

"use client";

import { Suspense } from "react";
import CampaignsPageContent from "./CampaignPageContent";

export const dynamic = "force-dynamic"; // ✅ Prevent prerendering (important for Netlify SSR)

export default function CampaignsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading campaigns...</div>}>
      <CampaignsPageContent />
    </Suspense>
  );
}
