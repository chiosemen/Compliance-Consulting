#!/bin/bash
set -e
echo "▶︎ Building Frontend Drop-in (components + hooks + demo page)..."

mkdir -p app/mcc-demo app/hooks app/dashboard/components

# Hook
cat > app/hooks/useMetrics.ts <<'TS'
"use client";
import { useEffect, useState } from "react";
const API = process.env.NEXT_PUBLIC_API_BASE_URL || "";
export function useMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  async function fetchMetrics() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/metrics`);
      setMetrics(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }
  useEffect(() => { fetchMetrics(); }, []);
  return { metrics, loading, refetch: fetchMetrics };
}
TS

# Tiles
cat > app/dashboard/components/MetricsTiles.tsx <<'TSX'
"use client";
import { useMetrics } from "@/app/hooks/useMetrics";
export default function MetricsTiles() {
  const { metrics, loading } = useMetrics();
  if (loading) return <p>Loading dashboard…</p>;
  if (!metrics?.kpiSnap) return <p>No data.</p>;
  const k = metrics.kpiSnap;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-slate-800 rounded-xl text-center text-white">
        <h2 className="text-lg font-semibold">Total Orgs</h2>
        <p className="text-3xl font-bold">{k.total_orgs ?? 0}</p>
      </div>
      <div className="p-4 bg-slate-800 rounded-xl text-center text-white">
        <h2 className="text-lg font-semibold">Avg Score</h2>
        <p className="text-3xl font-bold">{(k.avg_score ?? 0).toFixed?.(1) ?? k.avg_score}</p>
      </div>
      <div className="p-4 bg-slate-800 rounded-xl text-center text-white">
        <h2 className="text-lg font-semibold">High-Risk (RED)</h2>
        <p className="text-3xl font-bold text-red-400">{k.red_pct ?? 0}%</p>
      </div>
    </div>
  );
}
TSX

# Chart (Recharts)
cat > app/dashboard/components/RiskCharts.tsx <<'TSX'
"use client";
import { useMetrics } from "@/app/hooks/useMetrics";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
export default function RiskCharts() {
  const { metrics, loading } = useMetrics();
  if (loading) return <p>Loading charts…</p>;
  const data = metrics?.volume || [];
  return (
    <div className="p-4 bg-slate-900 rounded-xl text-white mt-6">
      <h2 className="text-lg mb-2 font-semibold">Filings by Year</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis dataKey="tax_year" stroke="#ccc" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="filings_count" name="Total Filings" />
          <Bar dataKey="red_count" name="High Risk" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
TSX

# Demo page to prove end-to-end
cat > app/mcc-demo/page.tsx <<'TSX'
import MetricsTiles from "@/app/dashboard/components/MetricsTiles";
import RiskCharts from "@/app/dashboard/components/RiskCharts";
export const dynamic = "force-dynamic";
export default function MccDemo() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">MCC Analytics (Frontend Drop-in)</h1>
      <p className="text-slate-300">Powered by your Backend Microservice at NEXT_PUBLIC_API_BASE_URL.</p>
      <MetricsTiles />
      <RiskCharts />
    </main>
  );
}
TSX

# Ensure env example exists
grep -q NEXT_PUBLIC_API_BASE_URL .env.example 2>/dev/null || \
echo 'NEXT_PUBLIC_API_BASE_URL=https://YOUR-BACKEND.example.com' >> .env.example

echo "✅ Frontend drop-in created. Visit /mcc-demo after you set NEXT_PUBLIC_API_BASE_URL"
