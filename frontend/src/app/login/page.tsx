"use client";

import { Suspense } from "react";
import LoginPageContent from "./LoginPageContent";

export const dynamic = "force-dynamic"; // Disable prerendering (important for Netlify SSR)

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading login...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
