'use client';

import { useMetrics } from '@/lib/hooks/useMetrics';

/**
 * Example dashboard component that uses the useMetrics hook
 * Automatically refreshes KPI data every 60 seconds
 */
export default function MetricsDashboard() {
  const { data, loading, error, refresh, lastFetched } = useMetrics({
    autoRefresh: true,
    refreshInterval: 60000, // 60 seconds
  });

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          <p className="mt-4 text-sm text-gray-600">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Metrics</h3>
        <p className="text-red-700">{error.message}</p>
        <button
          onClick={refresh}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh info */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">KPI Dashboard</h2>
        <div className="flex items-center gap-4">
          {lastFetched && (
            <span className="text-sm text-gray-500">
              Last updated: {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Organizations */}
        <MetricCard
          title="Total Organizations"
          value={data.organizations.total}
          icon="🏢"
        />

        {/* Grants */}
        <MetricCard
          title="Total Grants"
          value={data.grants.total}
          icon="💰"
        />

        {/* Funding */}
        <MetricCard
          title="Total Funding"
          value={`$${(data.grants.totalFunding / 1000000).toFixed(1)}M`}
          icon="💵"
        />

        {/* Average Risk */}
        <MetricCard
          title="Average Risk Score"
          value={data.risk.averageScore.toFixed(1)}
          icon="⚠️"
          badge={getRiskBadge(data.risk.averageScore)}
        />
      </div>

      {/* Risk Distribution */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {data.risk.distribution.low}
            </div>
            <div className="text-sm text-gray-600 mt-1">Low Risk</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {data.risk.distribution.medium}
            </div>
            <div className="text-sm text-gray-600 mt-1">Medium Risk</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {data.risk.distribution.high}
            </div>
            <div className="text-sm text-gray-600 mt-1">High Risk</div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4">Grant Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Grant Size</span>
              <span className="font-semibold">
                ${(data.grants.averageGrantSize / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Largest Grant</span>
              <span className="font-semibold">
                ${(data.grants.largestGrant / 1000).toFixed(0)}K
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Transparency Index</span>
              <span className="font-semibold">{data.transparency.averageIndex.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Reports</span>
              <span className="font-semibold">
                {data.reports.completed} / {data.reports.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-sm text-gray-500">
        Dashboard auto-refreshes every 60 seconds
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  badge?: React.ReactNode;
}

function MetricCard({ title, value, icon, badge }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {badge && <div className="mt-2">{badge}</div>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

function getRiskBadge(score: number) {
  if (score < 40) {
    return (
      <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
        Low Risk
      </span>
    );
  }
  if (score < 70) {
    return (
      <span className="inline-block px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
        Medium Risk
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
      High Risk
    </span>
  );
}
