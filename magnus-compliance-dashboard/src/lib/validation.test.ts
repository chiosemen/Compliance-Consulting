/**
 * Validation schemas tests
 * These tests verify that input validation works correctly
 */

import {
  ReportGenerationRequestSchema,
  OrganizationIdSchema,
  ReportOptionsSchema,
  GrantAmountSchema,
  EINSchema,
  sanitizeString,
  formatValidationErrors,
} from './validation';
import { z } from 'zod';

describe('Validation Schemas', () => {
  describe('ReportGenerationRequestSchema', () => {
    it('should accept valid request data', () => {
      const validData = {
        org_id: 'org-123',
        report_type: 'compliance_analysis' as const,
        year: 2024,
        options: {
          include_recommendations: true,
          format: 'json' as const,
        },
      };

      const result = ReportGenerationRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing org_id', () => {
      const invalidData = {
        report_type: 'compliance_analysis',
      };

      const result = ReportGenerationRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid report_type', () => {
      const invalidData = {
        org_id: 'org-123',
        report_type: 'invalid_type',
      };

      const result = ReportGenerationRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject year before 2000', () => {
      const invalidData = {
        org_id: 'org-123',
        report_type: 'compliance_analysis',
        year: 1999,
      };

      const result = ReportGenerationRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject future years', () => {
      const futureYear = new Date().getFullYear() + 5;
      const invalidData = {
        org_id: 'org-123',
        report_type: 'compliance_analysis',
        year: futureYear,
      };

      const result = ReportGenerationRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject org_id with special characters', () => {
      const invalidData = {
        org_id: '../../../etc/passwd',
        report_type: 'compliance_analysis',
      };

      const result = ReportGenerationRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject extra fields (strict mode)', () => {
      const invalidData = {
        org_id: 'org-123',
        report_type: 'compliance_analysis',
        extra_field: 'should not be here',
      };

      const result = ReportGenerationRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('OrganizationIdSchema', () => {
    it('should accept valid IDs', () => {
      expect(OrganizationIdSchema.safeParse('org-123').success).toBe(true);
      expect(OrganizationIdSchema.safeParse('ORG_ABC').success).toBe(true);
      expect(OrganizationIdSchema.safeParse('org123').success).toBe(true);
    });

    it('should reject empty strings', () => {
      expect(OrganizationIdSchema.safeParse('').success).toBe(false);
    });

    it('should reject special characters', () => {
      expect(OrganizationIdSchema.safeParse('org$123').success).toBe(false);
      expect(OrganizationIdSchema.safeParse('org.123').success).toBe(false);
      expect(OrganizationIdSchema.safeParse('org/123').success).toBe(false);
    });

    it('should reject overly long IDs', () => {
      const longId = 'a'.repeat(101);
      expect(OrganizationIdSchema.safeParse(longId).success).toBe(false);
    });
  });

  describe('ReportOptionsSchema', () => {
    it('should use default values', () => {
      const result = ReportOptionsSchema.safeParse({});

      if (result.success) {
        expect(result.data.include_recommendations).toBe(true);
        expect(result.data.include_visualizations).toBe(true);
        expect(result.data.format).toBe('json');
      }
    });

    it('should accept valid options', () => {
      const validOptions = {
        include_recommendations: false,
        include_visualizations: true,
        format: 'pdf' as const,
      };

      const result = ReportOptionsSchema.safeParse(validOptions);
      expect(result.success).toBe(true);
    });

    it('should reject invalid format', () => {
      const invalidOptions = {
        format: 'invalid_format',
      };

      const result = ReportOptionsSchema.safeParse(invalidOptions);
      expect(result.success).toBe(false);
    });

    it('should reject extra fields (strict mode)', () => {
      const invalidOptions = {
        format: 'json',
        extra_field: 'not allowed',
      };

      const result = ReportOptionsSchema.safeParse(invalidOptions);
      expect(result.success).toBe(false);
    });
  });

  describe('GrantAmountSchema', () => {
    it('should accept positive numbers', () => {
      expect(GrantAmountSchema.safeParse(1000).success).toBe(true);
      expect(GrantAmountSchema.safeParse(0.01).success).toBe(true);
      expect(GrantAmountSchema.safeParse(999999.99).success).toBe(true);
    });

    it('should reject negative numbers', () => {
      expect(GrantAmountSchema.safeParse(-100).success).toBe(false);
    });

    it('should reject zero', () => {
      expect(GrantAmountSchema.safeParse(0).success).toBe(false);
    });

    it('should reject infinity', () => {
      expect(GrantAmountSchema.safeParse(Infinity).success).toBe(false);
    });

    it('should reject NaN', () => {
      expect(GrantAmountSchema.safeParse(NaN).success).toBe(false);
    });
  });

  describe('EINSchema', () => {
    it('should accept valid EIN format', () => {
      expect(EINSchema.safeParse('12-3456789').success).toBe(true);
      expect(EINSchema.safeParse('99-9999999').success).toBe(true);
    });

    it('should accept undefined (optional)', () => {
      expect(EINSchema.safeParse(undefined).success).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(EINSchema.safeParse('123456789').success).toBe(false);
      expect(EINSchema.safeParse('12-345678').success).toBe(false);
      expect(EINSchema.safeParse('1-3456789').success).toBe(false);
    });

    it('should reject letters', () => {
      expect(EINSchema.safeParse('AB-1234567').success).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove control characters', () => {
      const input = 'test\x00\x01\x02string';
      const result = sanitizeString(input);
      expect(result).toBe('teststring');
    });

    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeString(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should trim whitespace', () => {
      const input = '  test string  ';
      const result = sanitizeString(input);
      expect(result).toBe('test string');
    });

    it('should preserve normal text', () => {
      const input = 'Normal text 123';
      const result = sanitizeString(input);
      expect(result).toBe('Normal text 123');
    });
  });

  describe('formatValidationErrors', () => {
    it('should format Zod errors correctly', () => {
      const schema = z.object({
        name: z.string().min(5),
        age: z.number().positive(),
      });

      const result = schema.safeParse({ name: 'Hi', age: -5 });

      if (!result.success) {
        const formatted = formatValidationErrors(result.error);

        expect(formatted).toHaveProperty('name');
        expect(formatted).toHaveProperty('age');
        expect(Array.isArray(formatted.name)).toBe(true);
        expect(Array.isArray(formatted.age)).toBe(true);
      }
    });

    it('should group multiple errors for same field', () => {
      const schema = z.object({
        email: z.string().email().min(5),
      });

      const result = schema.safeParse({ email: 'x' });

      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted.email.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const result = ReportGenerationRequestSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should handle undefined values', () => {
      const result = ReportGenerationRequestSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should handle empty objects', () => {
      const result = ReportGenerationRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should handle wrong types', () => {
      const result = ReportGenerationRequestSchema.safeParse('not an object');
      expect(result.success).toBe(false);
    });
  });
});
