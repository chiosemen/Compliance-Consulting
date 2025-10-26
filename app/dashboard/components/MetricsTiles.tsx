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
