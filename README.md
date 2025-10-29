# Compliance Consulting

A comprehensive compliance management system for nonprofit organizations, featuring real-time monitoring, risk assessment, and automated report generation.

## Overview

This project provides a complete compliance platform with:
- **Real-time Alerts & Monitoring**: Track compliance events, deadlines, and violations
- **Risk Scoring & Assessment**: Automated risk calculation and donor analysis
- **Report Generation**: PDF, JSON, and HTML compliance reports
- **Security-Hardened APIs**: Multi-layer security with authentication, rate limiting, and audit logging
- **Metrics Dashboard**: Real-time compliance metrics with error handling and retry logic

## Project Structure

```
Compliance-Consulting/
├── app/
│   └── hooks/
│       ├── useMetrics.ts           # Hardened metrics hook with Zod validation
│       └── useMetrics.test.tsx     # Comprehensive test suite
├── magnus-compliance-dashboard/    # Main Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   └── api/
│   │   │       └── report/
│   │   │           └── generate/
│   │   │               └── route.ts  # Secure report generation API
│   │   └── lib/
│   │       ├── security.ts         # Security utilities (auth, rate limiting)
│   │       └── validation.ts       # Zod schemas for validation
│   ├── supabase/                   # Database setup and migrations
│   └── README.md                   # Dashboard documentation
├── scripts/
│   ├── setup-env.sh                # Idempotent environment setup
│   └── README.md                   # Script documentation
├── migrations/                     # Database migrations
├── schema/                         # Database schema docs
└── types/                          # TypeScript definitions
```

## Recent Security Enhancements

### 1. Hardened Metrics Hook
**Location**: [app/hooks/useMetrics.ts](app/hooks/useMetrics.ts)

Features:
- **Zod Schema Validation**: Runtime type checking for API responses
- **Retry Logic**: Exponential backoff (1s → 2s → 4s, max 3 retries)
- **Error Handling**: Custom error classes (MetricsError, MetricsValidationError)
- **TypeScript Types**: Strict typing with inferred types from Zod
- **Timeout Protection**: 10-second request timeout with AbortSignal

```typescript
// Usage
const { data, isLoading, error, refetch } = useMetrics();
```

### 2. Secure Report Generation API
**Location**: [magnus-compliance-dashboard/src/app/api/report/generate/route.ts](magnus-compliance-dashboard/src/app/api/report/generate/route.ts)

Five layers of security:
1. **Pre-flight Security Checks**: Suspicious header detection
2. **Authentication & Authorization**: Bearer token validation
3. **Organization Access Control**: RBAC with permission checks
4. **Input Validation**: Zod schema validation with sanitization
5. **Secure File Handling**: Path traversal prevention

Rate limiting: 10 requests per minute per user

### 3. Security Infrastructure
**Location**: [magnus-compliance-dashboard/src/lib/security.ts](magnus-compliance-dashboard/src/lib/security.ts)

Utilities:
- `validateRequest()`: Comprehensive request validation middleware
- `rateLimit()`: In-memory rate limiting (Redis-ready)
- `getSecurityContext()`: Extract user authentication context
- `hasPermission()`: RBAC permission checks
- `auditLog()`: Security event logging
- `addSecurityHeaders()`: 6 security headers (CSP, X-Frame-Options, etc.)
- `isValidFilePath()`: Path traversal prevention

### 4. Validation Schemas
**Location**: [magnus-compliance-dashboard/src/lib/validation.ts](magnus-compliance-dashboard/src/lib/validation.ts)

Schemas:
- `ReportGenerationRequestSchema`: Validate report generation requests
- `OrganizationIdSchema`: Validate organization IDs
- `sanitizeString()`: Remove control characters and HTML tags
- Input length limits and regex validation

### 5. Idempotent Environment Setup
**Location**: [scripts/setup-env.sh](scripts/setup-env.sh)

Features:
- Safe to run multiple times (no duplicate keys)
- BSD-compatible awk for macOS support
- Automatic deduplication of existing files
- Color-coded output for status messages
- Validation of required environment variables

```bash
# Run setup
./scripts/setup-env.sh

# Lint scripts
npm run lint:scripts
```

## Database Schema

### Alerts Table
PostgreSQL table for real-time compliance notifications:

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  type TEXT NOT NULL,  -- compliance_violation, deadline_approaching, etc.
  message TEXT NOT NULL,
  severity TEXT NOT NULL,  -- low, medium, high, critical
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migrations

Apply migrations:
```bash
psql -U your_username -d your_database -f migrations/001_create_alerts_table.sql
```

Rollback:
```bash
psql -U your_username -d your_database -f migrations/001_create_alerts_table_down.sql
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chiosemen/Compliance-Consulting.git
cd Compliance-Consulting
```

2. Install dependencies:
```bash
npm install
cd magnus-compliance-dashboard
npm install
```

3. Set up environment variables:
```bash
./scripts/setup-env.sh
```

4. Run database migrations:
```bash
psql -U your_username -d your_database -f migrations/001_create_alerts_table.sql
```

5. Start the development server:
```bash
cd magnus-compliance-dashboard
npm run dev
```

### Testing

Run all tests:
```bash
npm test
```

Run specific test suites:
```bash
npm test -- app/hooks/useMetrics.test.tsx
npm test -- magnus-compliance-dashboard/src/app/api/report/generate/route.test.ts
```

Lint bash scripts:
```bash
npm run lint:scripts
```

### Security Testing

Test security features:
```bash
cd magnus-compliance-dashboard
node test-security-demo.js
```

## API Documentation

### POST /api/report/generate

Generate compliance reports with security enforcement.

**Authentication**: Required (Bearer token)

**Rate Limit**: 10 requests per minute

**Request Body**:
```json
{
  "org_id": "org_123",
  "report_type": "compliance_analysis",
  "year": 2024,
  "options": {
    "include_recommendations": true,
    "include_visualizations": true,
    "format": "pdf"
  }
}
```

**Response**:
```json
{
  "success": true,
  "report": {
    "id": "report_456",
    "org_id": "org_123",
    "report_type": "compliance_analysis",
    "generated_at": "2024-01-15T10:30:00Z",
    "file_url": "https://storage.example.com/reports/org_123/report.pdf"
  }
}
```

**Security Headers**:
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()

## Documentation

- [Dashboard README](magnus-compliance-dashboard/README.md): Complete dashboard documentation with security details
- [Security Implementation](magnus-compliance-dashboard/docs/SECURITY.md): Security best practices (674 lines)
- [Script Documentation](scripts/README.md): Environment setup script guide
- [Database Schema](schema/alerts.md): Detailed schema documentation

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Lint scripts: `npm run lint:scripts`
5. Commit with descriptive messages
6. Push and create a pull request

## Security

This project implements multiple layers of security:
- Authentication & authorization (Bearer tokens)
- Rate limiting (10 req/min)
- Input validation (Zod schemas)
- Output sanitization
- Audit logging
- Security headers
- Path traversal prevention
- XSS protection

For security issues, please contact the maintainers directly.

## License

MIT License - See LICENSE file for details

## Recent Changes

- **2025-01**: Hardened metrics hook with Zod validation and retry logic
- **2025-01**: Secured report generation API with 5-layer security
- **2025-01**: Added comprehensive security infrastructure (security.ts, validation.ts)
- **2025-01**: Created idempotent environment setup script
- **2025-01**: Added extensive test suites and security documentation
