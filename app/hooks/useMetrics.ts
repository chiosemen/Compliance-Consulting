"use client";
import { useEffect, useState } from "react";
import { z } from "zod";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Zod schema for runtime validation
const MetricsSchema = z.object({
  totalAlerts: z.number(),
  criticalAlerts: z.number(),
  activeMonitors: z.number(),
  complianceScore: z.number().min(0).max(100),
  recentActivity: z.array(z.object({
    id: z.string(),
    type: z.string(),
    message: z.string(),
    timestamp: z.string(),
  })).optional(),
});

// TypeScript type inferred from Zod schema
export type Metrics = z.infer<typeof MetricsSchema>;

// Error types for better error handling
export class MetricsError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public cause?: unknown
  ) {
    super(message);
    this.name = "MetricsError";
  }
}

export class MetricsValidationError extends MetricsError {
  constructor(message: string, public validationErrors: z.ZodError) {
    super(message);
    this.name = "MetricsValidationError";
  }
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch with retry and exponential backoff
async function fetchWithRetry(
  url: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // If successful or non-retryable error, return
      if (response.ok || response.status < 500) {
        return response;
      }

      // Server error, will retry
      lastError = new MetricsError(
        `Server error: ${response.status} ${response.statusText}`,
        response.status
      );
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        lastError = new MetricsError("Request timeout", undefined, error);
      } else if (error instanceof Error && error.name === "AbortError") {
        lastError = new MetricsError("Request aborted", undefined, error);
      } else {
        lastError = new MetricsError(
          "Network error",
          undefined,
          error
        );
      }
    }

    // Calculate delay with exponential backoff
    if (attempt < config.maxRetries) {
      const delayMs = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelayMs
      );
      await sleep(delayMs);
    }
  }

  throw lastError || new MetricsError("Failed to fetch metrics after retries");
}

export interface UseMetricsReturn {
  metrics: Metrics | null;
  loading: boolean;
  error: MetricsError | null;
  refetch: () => Promise<void>;
}

export function useMetrics(): UseMetricsReturn {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<MetricsError | null>(null);

  async function fetchMetrics() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithRetry(`${API}/api/metrics`);

      // Check response status
      if (!res.ok) {
        throw new MetricsError(
          `Failed to fetch metrics: ${res.status} ${res.statusText}`,
          res.status
        );
      }

      // Parse JSON
      let data: unknown;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new MetricsError(
          "Failed to parse response JSON",
          res.status,
          parseError
        );
      }

      // Validate with Zod schema
      const validationResult = MetricsSchema.safeParse(data);
      if (!validationResult.success) {
        throw new MetricsValidationError(
          "Metrics data validation failed",
          validationResult.error
        );
      }

      setMetrics(validationResult.data);
      setError(null);
    } catch (e) {
      const metricsError = e instanceof MetricsError
        ? e
        : new MetricsError("Unknown error occurred", undefined, e);

      setError(metricsError);
      setMetrics(null);
      console.error("Failed to fetch metrics:", metricsError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, loading, error, refetch: fetchMetrics };
}
