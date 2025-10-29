/**
 * Validation schemas for API requests
 *
 * This module provides Zod schemas for validating and type-checking
 * API request data to ensure data integrity and security.
 */

import { z } from 'zod';

// ============================================================================
// Report Generation Schemas
// ============================================================================

/**
 * Valid report types
 */
export const ReportTypeSchema = z.enum([
  'compliance_analysis',
  'risk_assessment',
  'donor_analysis',
]);

/**
 * Valid report formats
 */
export const ReportFormatSchema = z.enum(['json', 'pdf', 'html']);

/**
 * Report generation options schema
 */
export const ReportOptionsSchema = z
  .object({
    include_recommendations: z.boolean().optional().default(true),
    include_visualizations: z.boolean().optional().default(true),
    format: ReportFormatSchema.optional().default('json'),
    sections: z
      .array(
        z.enum(['summary', 'grants', 'risk_analysis', 'recommendations', 'compliance_status'])
      )
      .optional(),
    date_range: z
      .object({
        start: z.string().datetime().optional(),
        end: z.string().datetime().optional(),
      })
      .optional(),
  })
  .strict();

/**
 * Report generation request schema
 */
export const ReportGenerationRequestSchema = z
  .object({
    org_id: z
      .string()
      .min(1, 'Organization ID is required')
      .max(100, 'Organization ID too long')
      .regex(
        /^[a-zA-Z0-9-_]+$/,
        'Organization ID must contain only alphanumeric characters, hyphens, and underscores'
      ),
    report_type: ReportTypeSchema,
    year: z
      .number()
      .int()
      .min(2000, 'Year must be 2000 or later')
      .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
      .optional(),
    options: ReportOptionsSchema.optional(),
  })
  .strict();

export type ReportGenerationRequest = z.infer<typeof ReportGenerationRequestSchema>;
export type ReportOptions = z.infer<typeof ReportOptionsSchema>;
export type ReportType = z.infer<typeof ReportTypeSchema>;
export type ReportFormat = z.infer<typeof ReportFormatSchema>;

// ============================================================================
// Organization Schemas
// ============================================================================

/**
 * Organization ID schema
 */
export const OrganizationIdSchema = z
  .string()
  .min(1, 'Organization ID is required')
  .max(100)
  .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid organization ID format');

/**
 * EIN (Employer Identification Number) schema
 */
export const EINSchema = z
  .string()
  .regex(/^\d{2}-\d{7}$/, 'EIN must be in format XX-XXXXXXX')
  .optional();

/**
 * Organization creation/update schema
 */
export const OrganizationSchema = z
  .object({
    id: OrganizationIdSchema.optional(),
    name: z.string().min(1).max(200),
    ein: EINSchema,
    mission: z.string().max(1000).optional(),
    website: z.string().url().optional().or(z.literal('')),
    email: z.string().email().optional(),
    phone: z
      .string()
      .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number')
      .optional(),
    address: z
      .object({
        street: z.string().max(200).optional(),
        city: z.string().max(100).optional(),
        state: z.string().length(2).optional(),
        zip: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
        country: z.string().length(2).default('US'),
      })
      .optional(),
  })
  .strict();

export type Organization = z.infer<typeof OrganizationSchema>;

// ============================================================================
// Grant Schemas
// ============================================================================

/**
 * Grant amount schema (must be positive)
 */
export const GrantAmountSchema = z.number().positive('Grant amount must be positive').finite();

/**
 * Grant status schema
 */
export const GrantStatusSchema = z.enum(['pending', 'approved', 'disbursed', 'completed', 'cancelled']);

/**
 * Grant schema
 */
export const GrantSchema = z
  .object({
    id: z.string().optional(),
    donor_id: z.string(),
    recipient_id: OrganizationIdSchema,
    amount: GrantAmountSchema,
    currency: z.string().length(3).default('USD'),
    status: GrantStatusSchema,
    purpose: z.string().max(500).optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    conditions: z.array(z.string()).optional(),
  })
  .strict()
  .refine((data) => {
    // Validate that end_date is after start_date
    if (data.start_date && data.end_date) {
      return new Date(data.end_date) > new Date(data.start_date);
    }
    return true;
  }, 'End date must be after start date');

export type Grant = z.infer<typeof GrantSchema>;
export type GrantStatus = z.infer<typeof GrantStatusSchema>;

// ============================================================================
// Query Parameter Schemas
// ============================================================================

/**
 * Pagination schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().optional(),
});

/**
 * Sort order schema
 */
export const SortOrderSchema = z.enum(['asc', 'desc']).default('asc');

/**
 * Date range schema
 */
export const DateRangeSchema = z
  .object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  })
  .refine((data) => new Date(data.end) > new Date(data.start), 'End date must be after start date');

export type Pagination = z.infer<typeof PaginationSchema>;
export type SortOrder = z.infer<typeof SortOrderSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;

// ============================================================================
// Filter Schemas
// ============================================================================

/**
 * Report filters schema
 */
export const ReportFiltersSchema = z
  .object({
    org_id: OrganizationIdSchema.optional(),
    report_type: ReportTypeSchema.optional(),
    year: z.number().int().min(2000).max(new Date().getFullYear() + 1).optional(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
    date_range: DateRangeSchema.optional(),
  })
  .strict();

export type ReportFilters = z.infer<typeof ReportFiltersSchema>;

// ============================================================================
// Bulk Operations Schemas
// ============================================================================

/**
 * Bulk report generation schema
 */
export const BulkReportGenerationSchema = z
  .object({
    org_ids: z.array(OrganizationIdSchema).min(1).max(50),
    report_type: ReportTypeSchema,
    year: z.number().int().min(2000).max(new Date().getFullYear() + 1).optional(),
    options: ReportOptionsSchema.optional(),
  })
  .strict();

export type BulkReportGeneration = z.infer<typeof BulkReportGenerationSchema>;

// ============================================================================
// Webhook/Callback Schemas
// ============================================================================

/**
 * Webhook configuration schema
 */
export const WebhookConfigSchema = z
  .object({
    url: z.string().url(),
    events: z.array(z.enum(['report.generated', 'report.failed', 'report.deleted'])),
    secret: z.string().min(32).max(128).optional(),
    active: z.boolean().default(true),
  })
  .strict();

export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate and parse request data
 */
export function validateRequestData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Validate query parameters from URL
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    const existing = params[key];
    if (existing) {
      params[key] = Array.isArray(existing) ? [...existing, value] : [existing as string, value];
    } else {
      params[key] = value;
    }
  });

  return validateRequestData(schema, params);
}

/**
 * Format validation errors for API response
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.errors) {
    const path = issue.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}

// ============================================================================
// Custom Validators
// ============================================================================

/**
 * Validate file size (in bytes)
 */
export const fileSizeValidator = (maxSizeBytes: number) =>
  z.number().max(maxSizeBytes, `File size must not exceed ${maxSizeBytes / (1024 * 1024)}MB`);

/**
 * Validate MIME type
 */
export const mimeTypeValidator = (allowedTypes: string[]) =>
  z.string().refine((type) => allowedTypes.includes(type), {
    message: `File type must be one of: ${allowedTypes.join(', ')}`,
  });

/**
 * Validate URL domain
 */
export const domainValidator = (allowedDomains: string[]) =>
  z.string().url().refine(
    (url) => {
      try {
        const { hostname } = new URL(url);
        return allowedDomains.some((domain) => hostname.endsWith(domain));
      } catch {
        return false;
      }
    },
    { message: `URL must be from allowed domains: ${allowedDomains.join(', ')}` }
  );

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Sanitize object keys and string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeString(key);
    sanitized[sanitizedKey as keyof T] =
      typeof value === 'string' ? (sanitizeString(value) as T[keyof T]) : (value as T[keyof T]);
  }

  return sanitized;
}

// ============================================================================
// Test Data Generators (for development/testing only)
// ============================================================================

/**
 * Generate valid test data for schemas
 * WARNING: Only use in development/testing!
 */
export const testDataGenerators = {
  reportRequest: (): ReportGenerationRequest => ({
    org_id: 'test-org-123',
    report_type: 'compliance_analysis',
    year: new Date().getFullYear(),
    options: {
      include_recommendations: true,
      include_visualizations: true,
      format: 'json',
    },
  }),

  organization: (): Organization => ({
    name: 'Test Organization',
    ein: '12-3456789',
    mission: 'Test mission statement',
    website: 'https://example.org',
    email: 'contact@example.org',
  }),

  grant: (): Grant => ({
    donor_id: 'donor-123',
    recipient_id: 'org-456',
    amount: 50000,
    currency: 'USD',
    status: 'approved',
    purpose: 'General support',
  }),
};
