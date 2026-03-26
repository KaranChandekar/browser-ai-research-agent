"use client";

import dynamic from "next/dynamic";

const ResearchApp = dynamic(() => import("@/components/research-app"), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground text-sm">Loading...</div>
    </main>
  ),
});

export default function Home() {
  return <ResearchApp />;
}
