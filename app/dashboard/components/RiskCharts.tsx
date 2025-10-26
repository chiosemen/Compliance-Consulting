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
