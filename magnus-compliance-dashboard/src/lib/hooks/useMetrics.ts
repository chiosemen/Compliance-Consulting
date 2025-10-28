'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface MetricsData {
  organizations: {
    total: number;
  };
  grants: {
    total: number;
    totalFunding: number;
    averageGrantSize: number;
    largestGrant: number;
  };
  risk: {
    averageScore: number;
    distribution: {
      low: number;
      medium: number;
      high: number;
    };
  };
  transparency: {
    averageIndex: number;
  };
  reports: {
    total: number;
    completed: number;
  };
  lastUpdated: string;
}

export interface MetricsResponse {
  success: boolean;
  data?: MetricsData;
  error?: string;
  message?: string;
}

export interface UseMetricsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  onError?: (error: Error) => void;
}

export interface UseMetricsReturn {
  data: MetricsData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastFetched: Date | null;
}

/**
 * Custom hook to fetch and auto-refresh KPI metrics
 *
 * @param options - Configuration options
 * @param options.autoRefresh - Enable auto-refresh (default: true)
 * @param options.refreshInterval - Refresh interval in milliseconds (default: 60000ms = 60s)
 * @param options.onError - Error callback handler
 *
 * @example
 * ```tsx
 * const { data, loading, error, refresh } = useMetrics({
 *   autoRefresh: true,
 *   refreshInterval: 60000
 * });
 * ```
 */
export function useMetrics(options: UseMetricsOptions = {}): UseMetricsReturn {
  const {
    autoRefresh = true,
    refreshInterval = 60000, // 60 seconds default
    onError,
  } = options;

  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/metrics');

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const result: MetricsResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch metrics');
      }

      if (mountedRef.current) {
        setData(result.data);
        setLastFetched(new Date());
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');

      if (mountedRef.current) {
        setError(error);
      }

      if (onError) {
        onError(error);
      }

      console.error('Error fetching metrics:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [onError]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchMetrics();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchMetrics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchMetrics,
    lastFetched,
  };
}
