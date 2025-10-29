# Security Best Practices Guide

## Table of Contents

1. [Overview](#overview)
2. [Security Architecture](#security-architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Input Validation](#input-validation)
5. [Rate Limiting](#rate-limiting)
6. [Audit Logging](#audit-logging)
7. [File Security](#file-security)
8. [Production Deployment](#production-deployment)
9. [Incident Response](#incident-response)
10. [Security Checklist](#security-checklist)

## Overview

This document provides comprehensive security guidelines for the Magnus Compliance Dashboard. Following these practices is **mandatory** for all contributors and deployers.

### Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimum necessary access
3. **Fail Securely** - Secure defaults, explicit grants
4. **Complete Mediation** - Check every access
5. **Audit Everything** - Comprehensive logging
6. **Assume Breach** - Plan for compromise

## Security Architecture

### Multi-Layer Security Model

```
┌─────────────────────────────────────────────┐
│ Layer 1: Network Security                   │
│ - HTTPS/TLS encryption                      │
│ - WAF (Web Application Firewall)           │
│ - DDoS protection                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Layer 2: Authentication                     │
│ - Bearer token validation                   │
│ - Session management                        │
│ - Multi-factor authentication (MFA)        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Layer 3: Authorization                      │
│ - Role-Based Access Control (RBAC)         │
│ - Permission checks                         │
│ - Organization-level isolation              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Layer 4: Input Validation                   │
│ - Zod schema validation                     │
│ - Input sanitization                        │
│ - Type checking                             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Layer 5: Business Logic                     │
│ - Secure operations                         │
│ - Audit logging                             │
│ - Error handling                            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Layer 6: Data Security                      │
│ - Row Level Security (RLS)                  │
│ - Encryption at rest                        │
│ - Signed URLs for temporary access          │
└─────────────────────────────────────────────┘
```

## Authentication & Authorization

### Authentication Flow

1. **Client sends request** with Bearer token:
   ```
   Authorization: Bearer <token>
   ```

2. **Server validates token** using auth provider (Supabase Auth, Auth0, etc.)

3. **Security context created** with user identity and permissions

4. **Token refresh** before expiration

### Implementing Authentication

```typescript
// In your API route
import { validateRequest } from '@/lib/security';
import { YourSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const validation = await validateRequest(request, {
    schema: YourSchema,
    requireAuth: true,
    requiredPermission: 'your:permission',
  });

  if (!validation.success) {
    return validation.response; // 401 or 403
  }

  const { data, context } = validation;
  // context contains: userId, orgId, roles, permissions
}
```

### Permission System

Define permissions with naming convention: `resource:action`

**Examples:**
- `report:generate` - Generate reports
- `report:read` - View reports
- `report:delete` - Delete reports
- `org:admin` - Full organization access
- `user:manage` - Manage users

### Role Hierarchy

```
admin
  ├── Full system access
  ├── All permissions
  └── Can access all organizations

manager
  ├── Organization-wide access
  ├── report:*, user:read
  └── Can manage their organization

user
  ├── Limited access
  ├── report:read, report:generate
  └── Can only access their own data
```

## Input Validation

### Validation Strategy

**Always validate:**
1. Data type
2. Format/pattern
3. Length/size
4. Range/bounds
5. Business rules

### Using Zod Schemas

```typescript
import { z } from 'zod';

// Define strict schema
const OrganizationSchema = z.object({
  id: z.string()
    .regex(/^[a-zA-Z0-9-_]+$/)
    .min(1)
    .max(100),
  name: z.string()
    .min(1)
    .max(200),
  ein: z.string()
    .regex(/^\d{2}-\d{7}$/)
    .optional(),
}).strict(); // Reject unknown fields

// Use in API
const result = OrganizationSchema.safeParse(data);
if (!result.success) {
  return validationError('Invalid data', result.error);
}
```

### Common Validation Patterns

#### Organization ID
```typescript
z.string()
  .regex(/^[a-zA-Z0-9-_]+$/)
  .min(1)
  .max(100)
```

#### Year
```typescript
z.number()
  .int()
  .min(2000)
  .max(new Date().getFullYear() + 1)
```

#### Email
```typescript
z.string()
  .email()
  .max(255)
  .toLowerCase()
```

#### Phone
```typescript
z.string()
  .regex(/^\+?[\d\s-()]+$/)
  .min(10)
  .max(20)
```

#### URL
```typescript
z.string()
  .url()
  .refine(url => {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' &&
           allowedDomains.includes(hostname);
  })
```

### Sanitization

```typescript
import { sanitizeString } from '@/lib/validation';

// Remove control characters and potential XSS
const clean = sanitizeString(userInput);

// Additional sanitization for specific contexts
const safePath = path
  .replace(/\.\./g, '')  // Remove directory traversal
  .replace(/[^a-zA-Z0-9/_-]/g, '_'); // Safe characters only
```

## Rate Limiting

### Configuration

```typescript
// Report generation: 10 requests per minute
const reportRateLimit = rateLimit({
  windowMs: 60000,
  maxRequests: 10,
});

// API endpoint rate limits
const rateLimits = {
  'report:generate': { windowMs: 60000, maxRequests: 10 },
  'report:read': { windowMs: 60000, maxRequests: 100 },
  'user:login': { windowMs: 900000, maxRequests: 5 }, // 5 per 15 minutes
};
```

### Production Setup

**Use Redis for distributed rate limiting:**

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export function redisRateLimit(config: RateLimitConfig) {
  return async (identifier: string) => {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();

    // Use Redis sorted set for time-windowed counting
    await redis.zadd(key, now, `${now}`);
    await redis.zremrangebyscore(key, 0, now - config.windowMs);
    await redis.expire(key, Math.ceil(config.windowMs / 1000));

    const count = await redis.zcard(key);
    const allowed = count <= config.maxRequests;

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - count),
      resetAt: now + config.windowMs,
    };
  };
}
```

### Rate Limit Response Headers

Always include:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1640000000
Retry-After: 45  // When rate limited
```

## Audit Logging

### What to Log

**✅ Always log:**
- Authentication attempts (success/failure)
- Authorization failures
- Data access (CRUD operations)
- Administrative actions
- Security events (rate limits, suspicious activity)
- Configuration changes
- Error conditions

**❌ Never log:**
- Passwords or secrets
- Full authentication tokens
- Credit card numbers
- Social Security Numbers
- Personal health information (PHI)

### Log Structure

```typescript
interface AuditLogEntry {
  // Core fields
  timestamp: string;           // ISO 8601
  action: string;             // What happened
  resource: string;           // What was accessed
  result: 'success' | 'failure' | 'error';

  // User context
  userId?: string;
  orgId?: string;
  roles?: string[];

  // Request context
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;

  // Details
  details?: {
    // Action-specific data
    // NO sensitive data here
  };
}
```

### Logging Best Practices

1. **Use structured logging:**
```typescript
await auditLog({
  timestamp: new Date().toISOString(),
  action: 'report_generated',
  resource: `org/${orgId}/report/${reportId}`,
  result: 'success',
  userId: context.userId,
  orgId: context.orgId,
  details: {
    report_type: 'compliance_analysis',
    format: 'pdf',
    duration_ms: 1234,
  },
});
```

2. **Log to persistent storage:**
```typescript
// Send to logging service
await supabase.from('audit_logs').insert(logEntry);

// Also send to monitoring (Datadog, CloudWatch, etc.)
logger.info('audit', logEntry);
```

3. **Include correlation IDs:**
```typescript
const requestId = request.headers.get('x-request-id') ||
                  crypto.randomUUID();

// Include in all logs for this request
details: {
  requestId,
  ...otherDetails
}
```

## File Security

### Path Traversal Prevention

```typescript
function isValidFilePath(path: string): boolean {
  // Prevent directory traversal
  if (path.includes('..') || path.includes('~')) {
    return false;
  }

  // Prevent absolute paths
  if (path.startsWith('/')) {
    return false;
  }

  // Only allow safe characters and extensions
  const safePathRegex = /^[a-zA-Z0-9/_-]+\.(pdf|json|html)$/;
  return safePathRegex.test(path);
}

// Usage
const filePath = `${orgId}/${fileName}`;
if (!isValidFilePath(filePath)) {
  throw new Error('Invalid file path');
}
```

### File Name Sanitization

```typescript
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Only safe characters
    .replace(/\.{2,}/g, '.')           // No consecutive dots
    .substring(0, 255);                // Limit length
}
```

### Secure File Upload

```typescript
// Validate file before upload
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}

const allowedTypes = ['application/pdf', 'application/json'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// Upload with metadata
await supabase.storage
  .from('reports')
  .upload(filePath, file, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false, // Prevent overwriting
  });
```

### Signed URLs

```typescript
// Generate time-limited signed URL
const { data: signedUrlData } = await supabase.storage
  .from('reports')
  .createSignedUrl(filePath, 3600); // 1 hour

// Include expiration in response
return {
  url: signedUrlData.signedUrl,
  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
};
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] **Environment Variables**
  - [ ] All secrets in secure vault (not in code)
  - [ ] Different values per environment
  - [ ] No default/placeholder values in production

- [ ] **Authentication**
  - [ ] Production auth provider configured
  - [ ] Token expiration set appropriately
  - [ ] Refresh token rotation enabled
  - [ ] MFA enabled for admin accounts

- [ ] **Database**
  - [ ] Row Level Security (RLS) policies enabled
  - [ ] Connection pooling configured
  - [ ] Backup strategy in place
  - [ ] Encryption at rest enabled

- [ ] **Storage**
  - [ ] Bucket policies configured
  - [ ] Signed URLs required
  - [ ] Encryption enabled
  - [ ] Lifecycle policies set

- [ ] **Rate Limiting**
  - [ ] Redis configured for distributed limiting
  - [ ] Appropriate limits set per endpoint
  - [ ] Monitoring for rate limit hits

- [ ] **Monitoring**
  - [ ] Error tracking (Sentry, etc.)
  - [ ] Performance monitoring (APM)
  - [ ] Security event alerts
  - [ ] Uptime monitoring

- [ ] **Security Headers**
  - [ ] HTTPS enforced
  - [ ] HSTS enabled
  - [ ] CSP configured
  - [ ] Security headers verified

- [ ] **Audit Logging**
  - [ ] Persistent storage configured
  - [ ] Log retention policy set
  - [ ] Log analysis tools configured
  - [ ] Alerting on suspicious activity

### Environment-Specific Configuration

**Development:**
```env
ENVIRONMENT=development
LOG_LEVEL=debug
RATE_LIMIT_ENABLED=false
AUTH_REQUIRED=false  # Optional for local dev
```

**Staging:**
```env
ENVIRONMENT=staging
LOG_LEVEL=info
RATE_LIMIT_ENABLED=true
AUTH_REQUIRED=true
```

**Production:**
```env
ENVIRONMENT=production
LOG_LEVEL=warn
RATE_LIMIT_ENABLED=true
AUTH_REQUIRED=true
ENFORCE_HTTPS=true
```

## Incident Response

### Incident Response Plan

#### 1. Detection
- Monitor security alerts
- Review audit logs
- User reports
- Automated scanning

#### 2. Containment
```bash
# Immediate actions for security incident

# 1. Rotate compromised credentials
./scripts/rotate-secrets.sh

# 2. Revoke suspicious sessions
node scripts/revoke-sessions.js --user-id=<id>

# 3. Enable extra logging
export LOG_LEVEL=debug

# 4. Block suspicious IPs (if DDoS)
./scripts/block-ips.sh --ips=<comma-separated-ips>
```

#### 3. Investigation
- Collect logs (with timestamps)
- Identify affected systems
- Determine scope and impact
- Preserve evidence

#### 4. Eradication
- Remove malicious code
- Patch vulnerabilities
- Update access controls
- Reset compromised accounts

#### 5. Recovery
- Restore from backups (if needed)
- Verify system integrity
- Monitor for recurrence
- Gradual re-enablement

#### 6. Post-Incident
- Document incident
- Update security measures
- Train team on lessons learned
- Notify affected parties (if required)

### Emergency Contacts

```
Security Team Lead: security@example.com
On-Call Engineer: oncall@example.com
Incident Hotline: +1-XXX-XXX-XXXX
```

## Security Checklist

### Development Phase

- [ ] All inputs validated with Zod schemas
- [ ] Authentication required for all protected routes
- [ ] Authorization checks before data access
- [ ] Audit logging for security events
- [ ] Security headers on all responses
- [ ] Rate limiting configured
- [ ] File paths validated
- [ ] Error messages don't leak sensitive info
- [ ] Security tests written and passing

### Code Review Phase

- [ ] No hardcoded secrets or credentials
- [ ] No commented-out security checks
- [ ] Proper error handling (no stack traces in production)
- [ ] SQL queries parameterized
- [ ] User input sanitized
- [ ] Output encoding prevents XSS
- [ ] CSRF protection (where applicable)
- [ ] Dependencies up to date (no known vulnerabilities)

### Testing Phase

- [ ] Security tests passing
- [ ] Penetration testing completed
- [ ] Vulnerability scanning done
- [ ] Rate limiting tested
- [ ] Authentication bypass attempts blocked
- [ ] Authorization bypass attempts blocked
- [ ] Input validation tested with edge cases
- [ ] File upload security tested

### Deployment Phase

- [ ] HTTPS/TLS configured correctly
- [ ] Environment variables secure
- [ ] Database security configured (RLS)
- [ ] Storage security configured
- [ ] Monitoring and alerting active
- [ ] Backup strategy verified
- [ ] Incident response plan ready
- [ ] Security documentation updated

### Post-Deployment

- [ ] Monitor security alerts
- [ ] Review audit logs regularly
- [ ] Update dependencies monthly
- [ ] Security scan quarterly
- [ ] Penetration test annually
- [ ] Incident response drill annually
- [ ] Security training for team ongoing

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Next.js Security Best Practices](https://nextjs.org/docs/pages/building-your-application/configuring/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)

---

**Last Updated:** 2025-01-28
**Version:** 1.0.0
**Maintained By:** Security Team
