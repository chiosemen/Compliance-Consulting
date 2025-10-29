# useMetrics Hook - Production-Ready Implementation

## Overview

The `useMetrics` hook has been hardened with comprehensive error handling, TypeScript typing, runtime validation with Zod, and automatic retry logic with exponential backoff.

## Features

### 1. **Strong TypeScript Typing**
- Fully typed return values and internal state
- Type-safe metrics data structure
- Exported types for consumer usage

### 2. **Runtime Validation with Zod**
- Schema-based validation ensures data integrity
- Validates all required fields and types
- Enforces constraints (e.g., complianceScore must be 0-100)
- Graceful handling of optional fields

### 3. **Comprehensive Error Handling**
- Custom error classes (`MetricsError`, `MetricsValidationError`)
- HTTP status code tracking
- JSON parsing error detection
- Network error handling
- Clear error messages for debugging

### 4. **Retry Logic with Exponential Backoff**
- Automatic retry on server errors (5xx)
- Exponential backoff algorithm (1s, 2s, 4s)
- Configurable retry parameters
- 10-second request timeout
- Maximum 3 retry attempts

### 5. **Production-Ready Error States**
- Exposes error state to consumers
- Proper error logging
- State management during retries
- Loading indicators

## Usage

### Basic Usage

```typescript
import { useMetrics } from '@/app/hooks/useMetrics';

function Dashboard() {
  const { metrics, loading, error, refetch } = useMetrics();

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        {error.statusCode && <p>Status Code: {error.statusCode}</p>}
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (!metrics) {
    return <div>No metrics available</div>;
  }

  return (
    <div>
      <h2>Metrics Dashboard</h2>
      <p>Total Alerts: {metrics.totalAlerts}</p>
      <p>Critical Alerts: {metrics.criticalAlerts}</p>
      <p>Active Monitors: {metrics.activeMonitors}</p>
      <p>Compliance Score: {metrics.complianceScore}%</p>

      {metrics.recentActivity && (
        <ul>
          {metrics.recentActivity.map(activity => (
            <li key={activity.id}>{activity.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Advanced Error Handling

```typescript
import { useMetrics, MetricsError, MetricsValidationError } from '@/app/hooks/useMetrics';

function AdvancedDashboard() {
  const { metrics, loading, error, refetch } = useMetrics();

  if (error) {
    if (error instanceof MetricsValidationError) {
      // Handle validation errors specifically
      console.error('Validation errors:', error.validationErrors);
      return <div>Data format error. Please contact support.</div>;
    }

    if (error.statusCode === 404) {
      return <div>Metrics endpoint not found.</div>;
    }

    if (error.statusCode && error.statusCode >= 500) {
      return (
        <div>
          <p>Server error. Retrying automatically...</p>
          <button onClick={refetch}>Retry Now</button>
        </div>
      );
    }

    // Network or unknown errors
    return (
      <div>
        <p>Connection error: {error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  // ... rest of component
}
```

### Manual Refetch

```typescript
function RefreshableMetrics() {
  const { metrics, loading, error, refetch } = useMetrics();

  return (
    <div>
      <button
        onClick={() => refetch()}
        disabled={loading}
      >
        {loading ? 'Refreshing...' : 'Refresh Metrics'}
      </button>
      {/* ... render metrics */}
    </div>
  );
}
```

## Type Definitions

### Metrics Type

```typescript
type Metrics = {
  totalAlerts: number;
  criticalAlerts: number;
  activeMonitors: number;
  complianceScore: number; // 0-100
  recentActivity?: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
};
```

### Return Type

```typescript
interface UseMetricsReturn {
  metrics: Metrics | null;
  loading: boolean;
  error: MetricsError | null;
  refetch: () => Promise<void>;
}
```

## Error Types

### MetricsError

Base error class for all metrics-related errors.

```typescript
class MetricsError extends Error {
  name: "MetricsError";
  statusCode?: number;
  cause?: unknown;
}
```

### MetricsValidationError

Specific error for Zod validation failures.

```typescript
class MetricsValidationError extends MetricsError {
  name: "MetricsValidationError";
  validationErrors: z.ZodError;
}
```

## Configuration

The hook uses sensible defaults but can be modified in the source code:

### Retry Configuration

```typescript
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,              // Number of retry attempts
  initialDelayMs: 1000,       // Initial retry delay (1s)
  maxDelayMs: 10000,          // Maximum retry delay (10s)
  backoffMultiplier: 2,       // Exponential multiplier
};
```

### Request Timeout

```typescript
fetch(url, {
  signal: AbortSignal.timeout(10000), // 10 second timeout
});
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test app/hooks/useMetrics.test.tsx
```

### Test Coverage

The test suite includes:
- ✅ Successful data fetching
- ✅ Validation error handling
- ✅ HTTP error handling (4xx, 5xx)
- ✅ JSON parse errors
- ✅ Retry logic on server errors
- ✅ Max retries exceeded
- ✅ Network errors
- ✅ Refetch functionality
- ✅ Error state clearing on successful refetch
- ✅ ComplianceScore range validation
- ✅ Optional field handling

### Setting Up Testing Dependencies

If testing dependencies aren't installed, run:

```bash
npm install --save-dev \
  jest@29.7.0 \
  jest-environment-jsdom@29.7.0 \
  @testing-library/react@14.0.0 \
  @testing-library/jest-dom@6.1.4 \
  @types/jest@29.5.8 \
  ts-jest@29.1.1
```

## API Endpoint Requirements

The hook expects the `/api/metrics` endpoint to return JSON matching this schema:

```json
{
  "totalAlerts": 42,
  "criticalAlerts": 5,
  "activeMonitors": 10,
  "complianceScore": 85,
  "recentActivity": [
    {
      "id": "1",
      "type": "alert",
      "message": "New compliance alert",
      "timestamp": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Required Fields
- `totalAlerts` (number)
- `criticalAlerts` (number)
- `activeMonitors` (number)
- `complianceScore` (number, 0-100)

### Optional Fields
- `recentActivity` (array of activity objects)

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.com
```

If not set, defaults to empty string (relative URLs).

## Benefits Over Original Implementation

### Before
```typescript
// ❌ No type safety
const [metrics, setMetrics] = useState<any>(null);

// ❌ Silent error swallowing
catch (e) { console.error(e); }

// ❌ No response validation
setMetrics(await res.json());

// ❌ No retries on failure
const res = await fetch(`${API}/api/metrics`);
```

### After
```typescript
// ✅ Full type safety
const [metrics, setMetrics] = useState<Metrics | null>(null);

// ✅ Detailed error reporting
const [error, setError] = useState<MetricsError | null>(null);

// ✅ Runtime validation
const validationResult = MetricsSchema.safeParse(data);

// ✅ Automatic retries with backoff
const res = await fetchWithRetry(`${API}/api/metrics`);
```

## Best Practices

1. **Always check the error state** before rendering metrics
2. **Provide user feedback** during loading states
3. **Offer retry mechanisms** for failed requests
4. **Log errors** to your monitoring service
5. **Handle validation errors** separately from network errors
6. **Test error scenarios** in development

## Troubleshooting

### Issue: Validation Errors in Production

**Cause**: API response doesn't match expected schema

**Solution**: Check API response structure and update Zod schema if needed

### Issue: Constant Retries

**Cause**: API returning 5xx errors

**Solution**: Check server health, logs, and increase retry delays if needed

### Issue: Timeout Errors

**Cause**: API takes longer than 10 seconds

**Solution**: Optimize API performance or increase timeout duration

## License

Part of the Compliance Consulting project.
