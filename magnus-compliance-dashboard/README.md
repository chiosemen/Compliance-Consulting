# Magnus Compliance Dashboard

A secure, enterprise-grade compliance monitoring and reporting system built with Next.js, TypeScript, and Supabase.

## Table of Contents

- [Getting Started](#getting-started)
- [Security](#security)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun
- Supabase account (for database and storage)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd magnus-compliance-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Security

This application implements comprehensive security measures to protect sensitive compliance data and prevent unauthorized access.

### Security Architecture

#### 1. Authentication & Authorization

**Requirements:**
- All API endpoints require authentication via Bearer token
- Users must have specific permissions for each operation
- Role-Based Access Control (RBAC) enforced at multiple levels

**Implementation:**
- Authentication tokens validated on every request
- Security context extracted and validated
- Permission checks before data access
- Organization-level authorization (users can only access their own org)
- Admin role can access all organizations

**Example:**
```typescript
// Security context structure
interface SecurityContext {
  userId: string;
  orgId: string;
  roles: string[];        // e.g., ['user', 'admin']
  permissions: string[];  // e.g., ['report:generate', 'report:read']
  isAuthenticated: boolean;
}
```

#### 2. Input Validation

**Requirements:**
- All input data validated with Zod schemas
- Strict type checking and constraints
- Sanitization of user input to prevent injection attacks
- File path validation to prevent directory traversal

**Protected Against:**
- SQL Injection (via Supabase/PostgreSQL)
- NoSQL Injection
- Path Traversal
- XSS (Cross-Site Scripting)
- Command Injection
- LDAP Injection

**Example Validation:**
```typescript
// Organization ID must be alphanumeric with hyphens/underscores
org_id: z.string()
  .regex(/^[a-zA-Z0-9-_]+$/)
  .min(1)
  .max(100)

// Year must be realistic
year: z.number()
  .int()
  .min(2000)
  .max(new Date().getFullYear() + 1)
```

#### 3. Rate Limiting

**Requirements:**
- Prevent abuse and DoS attacks
- Per-user and per-IP rate limiting
- Different limits for different endpoints

**Implementation:**
- Report generation: 10 requests per minute per user
- In-memory rate limiting (use Redis in production)
- Automatic cleanup of expired entries
- Rate limit headers in responses

**Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1640000000
Retry-After: 45
```

#### 4. Security Headers

All responses include comprehensive security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME type sniffing |
| `X-XSS-Protection` | `1; mode=block` | Enable XSS filter |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Content-Security-Policy` | Strict policy | Control resource loading |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | Restrictive | Disable unnecessary features |

#### 5. Audit Logging

**Requirements:**
- All security-relevant actions logged
- Immutable audit trail for compliance
- Include user context and request details

**Logged Events:**
- Authentication attempts (success/failure)
- Authorization failures
- Report generation (success/failure)
- Data access attempts
- Rate limit violations
- Security check failures

**Log Structure:**
```typescript
interface AuditLogEntry {
  timestamp: string;
  userId?: string;
  orgId?: string;
  action: string;              // e.g., 'report_generated'
  resource: string;            // e.g., 'org/123'
  result: 'success' | 'failure' | 'error';
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}
```

#### 6. File Security

**Requirements:**
- Validate all file paths
- Prevent directory traversal
- Sanitize file names
- Signed URLs for temporary access

**Implementation:**
```typescript
// File path validation
function isValidFilePath(path: string): boolean {
  // Prevent directory traversal
  if (path.includes('..') || path.includes('~')) {
    return false;
  }

  // Only allow safe characters and extensions
  const safePathRegex = /^[a-zA-Z0-9/_-]+\.(pdf|json|html)$/;
  return safePathRegex.test(path);
}

// File name sanitization
const sanitizedName = orgName
  .replace(/[^a-zA-Z0-9]/g, '_')
  .substring(0, 50);
```

### Security Best Practices

#### For Developers

1. **Never disable security checks** - All security measures are there for a reason
2. **Validate all input** - Trust no user input, always validate with schemas
3. **Use parameterized queries** - Prevent SQL injection
4. **Sanitize output** - Prevent XSS attacks
5. **Keep dependencies updated** - Regular security updates
6. **Review audit logs** - Monitor for suspicious activity
7. **Test security** - Run security tests regularly

#### For Deployers

1. **Use HTTPS only** - Never deploy without TLS/SSL
2. **Set secure environment variables** - Never commit secrets
3. **Enable Supabase RLS** - Row Level Security policies
4. **Use Redis for rate limiting** - Production-grade rate limiting
5. **Set up monitoring** - Alert on security events
6. **Regular backups** - Secure and encrypted
7. **Incident response plan** - Be prepared

#### For API Consumers

1. **Secure token storage** - Never expose in client code
2. **Rotate tokens regularly** - Security best practice
3. **Handle errors properly** - Don't expose sensitive info
4. **Respect rate limits** - Implement exponential backoff
5. **Validate responses** - Don't trust API responses blindly

### Security Testing

Run security tests:
```bash
npm test -- src/app/api/report/generate/route.test.ts
```

Test coverage includes:
- ✅ Authentication enforcement
- ✅ Authorization checks
- ✅ Permission validation
- ✅ Input validation (Zod schemas)
- ✅ Rate limiting
- ✅ Audit logging
- ✅ Security headers
- ✅ File path security
- ✅ Error handling

### Vulnerability Disclosure

If you discover a security vulnerability, please email: security@example.com

**Do not:**
- Open public issues for security vulnerabilities
- Attempt to exploit vulnerabilities in production
- Share vulnerability details publicly before patch

**We will:**
- Acknowledge receipt within 24 hours
- Provide a fix within 7 days for critical issues
- Credit you in the security advisory (if desired)

## API Documentation

### Report Generation API

**Endpoint:** `POST /api/report/generate`

**Security Requirements:**
- Authentication: Required (Bearer token)
- Permission: `report:generate`
- Rate Limit: 10 requests/minute
- Organization Access: Must own org or be admin

**Request:**
```json
{
  "org_id": "string",
  "report_type": "compliance_analysis" | "risk_assessment" | "donor_analysis",
  "year": 2024,
  "options": {
    "include_recommendations": true,
    "include_visualizations": true,
    "format": "json" | "pdf" | "html"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "report-123",
    "org_id": "org-456",
    "report_type": "compliance_analysis",
    "status": "completed",
    "pdf_url": "https://...",
    "summary": { ... }
  },
  "message": "Successfully generated report"
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid input data |
| 401 | `UNAUTHORIZED` | Missing or invalid auth token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 403 | `FORBIDDEN_ORG_ACCESS` | Cannot access this organization |
| 404 | `ORG_NOT_FOUND` | Organization doesn't exist |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |

**Example cURL:**
```bash
curl -X POST https://api.example.com/api/report/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "org-123",
    "report_type": "compliance_analysis",
    "options": {
      "format": "pdf"
    }
  }'
```

## Development

### Project Structure
```
magnus-compliance-dashboard/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── report/
│   │           └── generate/
│   │               ├── route.ts       # Secured API endpoint
│   │               └── route.test.ts  # Security tests
│   └── lib/
│       ├── security.ts      # Security utilities
│       ├── validation.ts    # Zod schemas
│       ├── supabase.ts      # Supabase client
│       └── pdf-generator.ts # PDF generation
├── docs/
│   └── SECURITY.md          # Detailed security guide
└── README.md                # This file
```

### Adding New API Endpoints

When creating new API endpoints, always:

1. **Add authentication:**
```typescript
const validation = await validateRequest(request, {
  schema: YourSchema,
  requireAuth: true,
  requiredPermission: 'your:permission',
});
```

2. **Validate input:**
```typescript
const YourSchema = z.object({
  field: z.string().min(1).max(100),
});
```

3. **Check authorization:**
```typescript
if (!canAccessOrg(context, org_id)) {
  return forbiddenError();
}
```

4. **Add audit logging:**
```typescript
await auditLog(createAuditLog(
  request,
  context,
  'action_name',
  'resource',
  'success'
));
```

5. **Set security headers:**
```typescript
return addSecurityHeaders(response);
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Security Tests
```bash
npm test -- --grep "Security"
```

### Run Specific Test File
```bash
npm test -- src/app/api/report/generate/route.test.ts
```

### Watch Mode
```bash
npm test -- --watch
```

## Deployment

### Environment Variables

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting configured (Redis)
- [ ] Monitoring and alerts set up
- [ ] Backup strategy in place
- [ ] Security tests passing
- [ ] Audit logging configured
- [ ] Incident response plan ready

### Vercel Deployment

```bash
npm run build
vercel --prod
```

### Docker Deployment

```bash
docker build -t magnus-compliance-dashboard .
docker run -p 3000:3000 magnus-compliance-dashboard
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Zod Documentation](https://zod.dev)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Security Best Practices](./docs/SECURITY.md)

## License

Proprietary - All Rights Reserved

## Support

For questions or issues:
- Technical Support: support@example.com
- Security Issues: security@example.com
- Documentation: [docs/](./docs/)
