/**
 * Security utilities tests
 * These tests demonstrate the security features work correctly
 */

import {
  rateLimit,
  isValidFilePath,
  runSecurityChecks,
  hasPermission,
  canAccessOrg,
  sanitizeInput,
  isValidOrgId,
  SecurityContext,
} from './security';

describe('Security Utilities', () => {
  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const limiter = rateLimit({ windowMs: 60000, maxRequests: 5 });

      const result1 = limiter('test-user');
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);

      const result2 = limiter('test-user');
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests exceeding limit', () => {
      const limiter = rateLimit({ windowMs: 60000, maxRequests: 3 });

      // Use up the limit
      limiter('test-user-2');
      limiter('test-user-2');
      limiter('test-user-2');

      // Should be blocked
      const result = limiter('test-user-2');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after time window', () => {
      const limiter = rateLimit({ windowMs: 100, maxRequests: 2 });

      limiter('test-user-3');
      limiter('test-user-3');

      // Wait for window to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const result = limiter('test-user-3');
          expect(result.allowed).toBe(true);
          resolve();
        }, 150);
      });
    });

    it('should track different users separately', () => {
      const limiter = rateLimit({ windowMs: 60000, maxRequests: 2 });

      limiter('user-a');
      limiter('user-a');

      // User A is at limit
      const resultA = limiter('user-a');
      expect(resultA.allowed).toBe(false);

      // User B should still have requests available
      const resultB = limiter('user-b');
      expect(resultB.allowed).toBe(true);
    });
  });

  describe('File Path Validation', () => {
    it('should accept valid file paths', () => {
      expect(isValidFilePath('org123/report-456.pdf')).toBe(true);
      expect(isValidFilePath('org_abc/analysis_2024.json')).toBe(true);
      expect(isValidFilePath('test/report.html')).toBe(true);
    });

    it('should reject directory traversal attempts', () => {
      expect(isValidFilePath('../etc/passwd')).toBe(false);
      expect(isValidFilePath('../../secret.pdf')).toBe(false);
      expect(isValidFilePath('org/../../hack.pdf')).toBe(false);
    });

    it('should reject paths with home directory', () => {
      expect(isValidFilePath('~/secret.pdf')).toBe(false);
      expect(isValidFilePath('org/~/file.pdf')).toBe(false);
    });

    it('should reject invalid file extensions', () => {
      expect(isValidFilePath('org123/malicious.exe')).toBe(false);
      expect(isValidFilePath('org123/script.sh')).toBe(false);
      expect(isValidFilePath('org123/file.js')).toBe(false);
    });

    it('should reject special characters', () => {
      expect(isValidFilePath('org$/report.pdf')).toBe(false);
      expect(isValidFilePath('org|cmd/file.pdf')).toBe(false);
      expect(isValidFilePath('org;rm/file.pdf')).toBe(false);
    });
  });

  describe('Organization ID Validation', () => {
    it('should accept valid organization IDs', () => {
      expect(isValidOrgId('org-123')).toBe(true);
      expect(isValidOrgId('ORG_ABC')).toBe(true);
      expect(isValidOrgId('org-test-123')).toBe(true);
      expect(isValidOrgId('123abc')).toBe(true);
    });

    it('should accept UUID format', () => {
      expect(isValidOrgId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('should reject invalid characters', () => {
      expect(isValidOrgId('org$123')).toBe(false);
      expect(isValidOrgId('org.123')).toBe(false);
      expect(isValidOrgId('org@123')).toBe(false);
      expect(isValidOrgId('org/123')).toBe(false);
    });

    it('should reject excessively long IDs', () => {
      expect(isValidOrgId('a'.repeat(51))).toBe(false);
      expect(isValidOrgId('a'.repeat(100))).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isValidOrgId('')).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('<b>bold</b>')).toBe('bbold/b');
    });

    it('should remove quotes', () => {
      expect(sanitizeInput('test"quote')).toBe('testquote');
      expect(sanitizeInput("test'single")).toBe('testsingle');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
      expect(sanitizeInput('\n\ttest\n\t')).toBe('test');
    });

    it('should limit length', () => {
      const longString = 'a'.repeat(2000);
      const result = sanitizeInput(longString);
      expect(result.length).toBe(1000);
    });

    it('should handle normal text correctly', () => {
      expect(sanitizeInput('Normal text 123')).toBe('Normal text 123');
    });
  });

  describe('Permission Checks', () => {
    const authenticatedContext: SecurityContext = {
      isAuthenticated: true,
      userId: 'user-123',
      orgId: 'org-456',
      roles: ['user'],
      permissions: ['report:read', 'report:generate'],
    };

    const unauthenticatedContext: SecurityContext = {
      isAuthenticated: false,
    };

    it('should allow users with correct permission', () => {
      expect(hasPermission(authenticatedContext, 'report:read')).toBe(true);
      expect(hasPermission(authenticatedContext, 'report:generate')).toBe(true);
    });

    it('should deny users without permission', () => {
      expect(hasPermission(authenticatedContext, 'report:delete')).toBe(false);
      expect(hasPermission(authenticatedContext, 'user:manage')).toBe(false);
    });

    it('should deny unauthenticated users', () => {
      expect(hasPermission(unauthenticatedContext, 'report:read')).toBe(false);
    });
  });

  describe('Organization Access Control', () => {
    const userContext: SecurityContext = {
      isAuthenticated: true,
      userId: 'user-123',
      orgId: 'org-456',
      roles: ['user'],
      permissions: ['report:read'],
    };

    const adminContext: SecurityContext = {
      isAuthenticated: true,
      userId: 'admin-123',
      orgId: 'org-789',
      roles: ['admin'],
      permissions: ['report:read'],
    };

    it('should allow access to own organization', () => {
      expect(canAccessOrg(userContext, 'org-456')).toBe(true);
    });

    it('should deny access to other organizations', () => {
      expect(canAccessOrg(userContext, 'org-999')).toBe(false);
    });

    it('should allow admin to access all organizations', () => {
      expect(canAccessOrg(adminContext, 'org-456')).toBe(true);
      expect(canAccessOrg(adminContext, 'org-999')).toBe(true);
      expect(canAccessOrg(adminContext, 'any-org')).toBe(true);
    });

    it('should deny unauthenticated users', () => {
      const unauthContext: SecurityContext = { isAuthenticated: false };
      expect(canAccessOrg(unauthContext, 'org-456')).toBe(false);
    });
  });

  describe('Security Checks', () => {
    it('should detect suspicious headers', () => {
      const mockRequest = {
        headers: {
          has: (name: string) => name === 'x-forwarded-host',
          get: (name: string) => name === 'content-type' ? 'application/json' : null,
        },
        method: 'POST',
      } as any;

      const issues = runSecurityChecks(mockRequest);
      expect(issues).toContain('Suspicious header detected: x-forwarded-host');
    });

    it('should detect missing content-type for POST', () => {
      const mockRequest = {
        headers: {
          has: () => false,
          get: (name: string) => name === 'content-length' ? '100' : null,
        },
        method: 'POST',
      } as any;

      const issues = runSecurityChecks(mockRequest);
      expect(issues).toContain('Invalid or missing content-type header');
    });

    it('should detect large payloads', () => {
      const mockRequest = {
        headers: {
          has: () => false,
          get: (name: string) => {
            if (name === 'content-type') return 'application/json';
            if (name === 'content-length') return '20000000'; // 20MB
            return null;
          },
        },
        method: 'POST',
      } as any;

      const issues = runSecurityChecks(mockRequest);
      expect(issues).toContain('Request body too large (>10MB)');
    });

    it('should pass for valid requests', () => {
      const mockRequest = {
        headers: {
          has: () => false,
          get: (name: string) => {
            if (name === 'content-type') return 'application/json';
            if (name === 'content-length') return '1000';
            return null;
          },
        },
        method: 'POST',
      } as any;

      const issues = runSecurityChecks(mockRequest);
      expect(issues.length).toBe(0);
    });
  });
});
