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
