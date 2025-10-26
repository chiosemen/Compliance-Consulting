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
