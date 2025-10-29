import { renderHook, waitFor } from '@testing-library/react';
import { useMetrics, MetricsError, MetricsValidationError } from './useMetrics';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock AbortSignal.timeout for Node.js environments
if (!AbortSignal.timeout) {
  AbortSignal.timeout = (ms: number) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };
}

describe('useMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const validMetricsData = {
    totalAlerts: 42,
    criticalAlerts: 5,
    activeMonitors: 10,
    complianceScore: 85,
    recentActivity: [
      {
        id: '1',
        type: 'alert',
        message: 'Test alert',
        timestamp: '2025-01-01T00:00:00Z',
      },
    ],
  };

  it('should fetch metrics successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => validMetricsData,
    });

    const { result } = renderHook(() => useMetrics());

    expect(result.current.loading).toBe(true);
    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toEqual(validMetricsData);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle validation errors', async () => {
    const invalidData = {
      totalAlerts: 'not a number', // Invalid type
      criticalAlerts: 5,
      activeMonitors: 10,
      complianceScore: 85,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => invalidData,
    });

    const { result } = renderHook(() => useMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBeInstanceOf(MetricsValidationError);
    expect(result.current.error?.message).toBe('Metrics data validation failed');
  });

  it('should handle HTTP errors (non-ok responses)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({}),
    });

    const { result } = renderHook(() => useMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBeInstanceOf(MetricsError);
    expect(result.current.error?.message).toContain('404');
    expect(result.current.error?.statusCode).toBe(404);
  });

  it('should handle JSON parse errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });

    const { result } = renderHook(() => useMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBeInstanceOf(MetricsError);
    expect(result.current.error?.message).toBe('Failed to parse response JSON');
  });

  it('should retry on server errors (5xx)', async () => {
    // First two attempts fail with 500, third succeeds
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => validMetricsData,
      });

    const { result } = renderHook(() => useMetrics());

    // Fast-forward through retry delays
    await waitFor(
      async () => {
        jest.advanceTimersByTime(15000); // Advance past all retry delays
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toEqual(validMetricsData);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should fail after max retries', async () => {
    // All attempts fail with 500
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useMetrics());

    await waitFor(
      async () => {
        jest.advanceTimersByTime(30000); // Advance past all retry delays
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBeInstanceOf(MetricsError);
    expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));

    const { result } = renderHook(() => useMetrics());

    await waitFor(
      async () => {
        jest.advanceTimersByTime(30000);
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBeInstanceOf(MetricsError);
    expect(result.current.error?.message).toBe('Network error');
  });

  it('should support refetch functionality', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => validMetricsData,
    });

    const { result } = renderHook(() => useMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Trigger refetch
    result.current.refetch();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.current.metrics).toEqual(validMetricsData);
  });

  it('should clear error state on successful refetch', async () => {
    // First call fails, second succeeds
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => validMetricsData,
      });

    const { result } = renderHook(() => useMetrics());

    await waitFor(
      async () => {
        jest.advanceTimersByTime(30000);
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(MetricsError);

    // Refetch
    result.current.refetch();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toEqual(validMetricsData);
    expect(result.current.error).toBeNull();
  });

  it('should validate complianceScore range', async () => {
    const invalidData = {
      ...validMetricsData,
      complianceScore: 150, // Out of range (max 100)
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => invalidData,
    });

    const { result } = renderHook(() => useMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBeInstanceOf(MetricsValidationError);
  });

  it('should handle missing optional fields', async () => {
    const dataWithoutOptionalFields = {
      totalAlerts: 42,
      criticalAlerts: 5,
      activeMonitors: 10,
      complianceScore: 85,
      // recentActivity is optional
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => dataWithoutOptionalFields,
    });

    const { result } = renderHook(() => useMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toEqual(dataWithoutOptionalFields);
    expect(result.current.error).toBeNull();
  });
});
