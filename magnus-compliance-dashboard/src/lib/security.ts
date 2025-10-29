/**
 * Security utilities for API routes
 *
 * This module provides security functions for:
 * - Authentication and authorization
 * - Rate limiting
 * - Input validation
 * - Security headers
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface SecurityContext {
  userId?: string;
  orgId?: string;
  roles?: string[];
  permissions?: string[];
  isAuthenticated: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface AuditLogEntry {
  timestamp: string;
  userId?: string;
  orgId?: string;
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'error';
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// Rate Limiting
// ============================================================================

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per time window
 */
export function rateLimit(config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }) {
  return (identifier: string): { allowed: boolean; remaining: number; resetAt: number } => {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // Clean expired entries periodically
    if (rateLimitStore.size > 10000) {
      for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetAt < now) {
          rateLimitStore.delete(key);
        }
      }
    }

    if (!record || record.resetAt < now) {
      // New window
      const resetAt = now + config.windowMs;
      rateLimitStore.set(identifier, { count: 1, resetAt });
      return { allowed: true, remaining: config.maxRequests - 1, resetAt };
    }

    // Existing window
    if (record.count >= config.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }

    record.count++;
    return { allowed: true, remaining: config.maxRequests - record.count, resetAt: record.resetAt };
  };
}

// Default rate limiter for report generation (10 requests per minute)
export const reportGenerationRateLimit = rateLimit({ windowMs: 60000, maxRequests: 10 });

// ============================================================================
// Authentication & Authorization
// ============================================================================

/**
 * Extract security context from request
 * In production, integrate with your auth provider (Supabase Auth, Auth0, etc.)
 */
export async function getSecurityContext(request: NextRequest): Promise<SecurityContext> {
  // Extract auth token from Authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthenticated: false };
  }

  const token = authHeader.substring(7);

  // TODO: Validate token with your auth provider
  // For now, this is a placeholder implementation
  // In production, use Supabase Auth or similar:
  // const { data: { user }, error } = await supabase.auth.getUser(token);

  try {
    // Placeholder: decode JWT or validate session
    // Replace with actual auth validation
    if (token === 'invalid') {
      return { isAuthenticated: false };
    }

    // Return mock context - replace with real user data
    return {
      isAuthenticated: true,
      userId: 'user-placeholder',
      orgId: 'org-placeholder',
      roles: ['user'],
      permissions: ['report:generate', 'report:read'],
    };
  } catch (error) {
    console.error('Error validating auth token:', error);
    return { isAuthenticated: false };
  }
}

/**
 * Check if user has required permission
 */
export function hasPermission(context: SecurityContext, permission: string): boolean {
  if (!context.isAuthenticated) {
    return false;
  }

  return context.permissions?.includes(permission) || false;
}

/**
 * Check if user can access organization resources
 */
export function canAccessOrg(context: SecurityContext, orgId: string): boolean {
  if (!context.isAuthenticated) {
    return false;
  }

  // Admin can access all organizations
  if (context.roles?.includes('admin')) {
    return true;
  }

  // User can only access their own organization
  return context.orgId === orgId;
}

// ============================================================================
// Input Validation
// ============================================================================

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate organization ID format
 */
export function isValidOrgId(orgId: string): boolean {
  // Must be UUID format or alphanumeric with hyphens
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const alphanumericRegex = /^[a-zA-Z0-9-_]{1,50}$/;

  return uuidRegex.test(orgId) || alphanumericRegex.test(orgId);
}

/**
 * Validate file path to prevent directory traversal
 */
export function isValidFilePath(path: string): boolean {
  // Prevent directory traversal
  if (path.includes('..') || path.includes('~')) {
    return false;
  }

  // Only allow safe characters
  const safePathRegex = /^[a-zA-Z0-9/_-]+\.(pdf|json|html)$/;
  return safePathRegex.test(path);
}

// ============================================================================
// Security Headers
// ============================================================================

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return response;
}

// ============================================================================
// Audit Logging
// ============================================================================

/**
 * Log security-relevant actions for audit trail
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  const logEntry = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  // In production, send to logging service (Datadog, CloudWatch, etc.)
  console.log('[AUDIT]', JSON.stringify(logEntry));

  // TODO: Persist to database or logging service
  // await supabase.from('audit_logs').insert(logEntry);
}

/**
 * Create audit log from request
 */
export function createAuditLog(
  request: NextRequest,
  context: SecurityContext,
  action: string,
  resource: string,
  result: 'success' | 'failure' | 'error',
  details?: Record<string, unknown>
): AuditLogEntry {
  return {
    timestamp: new Date().toISOString(),
    userId: context.userId,
    orgId: context.orgId,
    action,
    resource,
    result,
    details,
    ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

// ============================================================================
// Error Responses
// ============================================================================

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number,
  code?: string,
  details?: Record<string, unknown>
): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: code || `ERROR_${status}`,
        details,
      },
    },
    { status }
  );

  return addSecurityHeaders(response);
}

/**
 * Unauthorized error (401)
 */
export function unauthorizedError(message = 'Authentication required'): NextResponse {
  return createErrorResponse(message, 401, 'UNAUTHORIZED');
}

/**
 * Forbidden error (403)
 */
export function forbiddenError(message = 'Insufficient permissions'): NextResponse {
  return createErrorResponse(message, 403, 'FORBIDDEN');
}

/**
 * Rate limit error (429)
 */
export function rateLimitError(resetAt: number): NextResponse {
  const response = createErrorResponse(
    'Too many requests. Please try again later.',
    429,
    'RATE_LIMIT_EXCEEDED',
    { resetAt }
  );

  response.headers.set('Retry-After', Math.ceil((resetAt - Date.now()) / 1000).toString());

  return response;
}

/**
 * Validation error (400)
 */
export function validationError(message: string, errors?: z.ZodError): NextResponse {
  return createErrorResponse(
    message,
    400,
    'VALIDATION_ERROR',
    errors ? { validationErrors: errors.errors } : undefined
  );
}

// ============================================================================
// Request Validation Middleware
// ============================================================================

export interface ValidateRequestOptions<T> {
  schema: z.ZodSchema<T>;
  requireAuth?: boolean;
  requiredPermission?: string;
  rateLimitKey?: (request: NextRequest) => string;
  rateLimitConfig?: RateLimitConfig;
}

/**
 * Comprehensive request validation middleware
 */
export async function validateRequest<T>(
  request: NextRequest,
  options: ValidateRequestOptions<T>
): Promise<
  | { success: true; data: T; context: SecurityContext }
  | { success: false; response: NextResponse }
> {
  // 1. Check authentication if required
  const context = await getSecurityContext(request);

  if (options.requireAuth && !context.isAuthenticated) {
    await auditLog(
      createAuditLog(request, context, 'access_attempt', 'api', 'failure', {
        reason: 'unauthenticated',
      })
    );
    return { success: false, response: unauthorizedError() };
  }

  // 2. Check permissions if specified
  if (options.requiredPermission && !hasPermission(context, options.requiredPermission)) {
    await auditLog(
      createAuditLog(request, context, 'access_attempt', 'api', 'failure', {
        reason: 'insufficient_permissions',
        required: options.requiredPermission,
      })
    );
    return { success: false, response: forbiddenError() };
  }

  // 3. Check rate limit if configured
  if (options.rateLimitKey && options.rateLimitConfig) {
    const identifier = options.rateLimitKey(request);
    const limiter = rateLimit(options.rateLimitConfig);
    const { allowed, resetAt } = limiter(identifier);

    if (!allowed) {
      await auditLog(
        createAuditLog(request, context, 'rate_limit_exceeded', 'api', 'failure', {
          identifier,
        })
      );
      return { success: false, response: rateLimitError(resetAt) };
    }
  }

  // 4. Validate request body
  try {
    const body = await request.json();
    const validatedData = options.schema.parse(body);

    return { success: true, data: validatedData, context };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, response: validationError('Invalid request data', error) };
    }

    return { success: false, response: createErrorResponse('Invalid JSON', 400) };
  }
}

// ============================================================================
// Security Checklist
// ============================================================================

/**
 * Run security checks on the request
 * Returns issues found, empty array if all checks pass
 */
export function runSecurityChecks(request: NextRequest): string[] {
  const issues: string[] = [];

  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
  for (const header of suspiciousHeaders) {
    if (request.headers.has(header)) {
      issues.push(`Suspicious header detected: ${header}`);
    }
  }

  // Check content-type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      issues.push('Invalid or missing content-type header');
    }
  }

  // Check for excessively large bodies (DOS protection)
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    // 10MB limit
    issues.push('Request body too large (>10MB)');
  }

  return issues;
}
