import { NextRequest, NextResponse } from 'next/server';
import { mockOrganizations, mockGrants, mockRiskScores } from '@/lib/mock-data';
import { generatePDFReport, ReportData } from '@/lib/pdf-generator';
import { supabase } from '@/lib/supabase';
import {
  validateRequest,
  addSecurityHeaders,
  auditLog,
  createAuditLog,
  canAccessOrg,
  reportGenerationRateLimit,
  runSecurityChecks,
  isValidFilePath,
  createErrorResponse,
} from '@/lib/security';
import { ReportGenerationRequestSchema } from '@/lib/validation';

/**
 * POST /api/report/generate
 * Generate a compliance report for an organization
 *
 * SECURITY REQUIREMENTS:
 * - Authentication: Required (Bearer token)
 * - Authorization: User must have 'report:generate' permission
 * - Rate Limiting: 10 requests per minute per user
 * - Input Validation: Strict schema validation with Zod
 * - Audit Logging: All attempts logged for compliance
 * - File Access: Path validation to prevent directory traversal
 *
 * Expected body:
 * {
 *   org_id: string,  // Must be alphanumeric with hyphens/underscores
 *   report_type: 'compliance_analysis' | 'risk_assessment' | 'donor_analysis',
 *   year?: number,   // Between 2000 and current year + 1
 *   options?: {
 *     include_recommendations?: boolean,
 *     include_visualizations?: boolean,
 *     format?: 'json' | 'pdf' | 'html'
 *   }
 * }
 *
 * Responses:
 * - 200: Report generated successfully
 * - 400: Invalid input data
 * - 401: Authentication required
 * - 403: Insufficient permissions or unauthorized org access
 * - 404: Organization not found
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ========================================================================
    // SECURITY STEP 1: Pre-flight security checks
    // ========================================================================
    const securityIssues = runSecurityChecks(request);
    if (securityIssues.length > 0) {
      console.warn('[SECURITY] Issues detected:', securityIssues);
      await auditLog({
        timestamp: new Date().toISOString(),
        action: 'report_generation_blocked',
        resource: 'api/report/generate',
        result: 'failure',
        details: { issues: securityIssues },
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    }

    // ========================================================================
    // SECURITY STEP 2: Validate request with authentication, permissions, rate limiting
    // ========================================================================
    const validation = await validateRequest(request, {
      schema: ReportGenerationRequestSchema,
      requireAuth: true,
      requiredPermission: 'report:generate',
      rateLimitKey: (req) => {
        // Rate limit by user ID if authenticated, otherwise by IP
        const authHeader = req.headers.get('authorization');
        return authHeader || req.ip || req.headers.get('x-forwarded-for') || 'anonymous';
      },
      rateLimitConfig: { windowMs: 60000, maxRequests: 10 },
    });

    if (!validation.success) {
      return validation.response;
    }

    const { data, context } = validation;
    const { org_id, report_type, year, options } = data;

    // ========================================================================
    // SECURITY STEP 3: Authorization - verify user can access this organization
    // ========================================================================
    if (!canAccessOrg(context, org_id)) {
      await auditLog(
        createAuditLog(request, context, 'unauthorized_org_access', `org/${org_id}`, 'failure', {
          requested_org: org_id,
          user_org: context.orgId,
        })
      );

      const response = createErrorResponse(
        'You do not have permission to generate reports for this organization',
        403,
        'FORBIDDEN_ORG_ACCESS'
      );
      return response;
    }

    // ========================================================================
    // SECURITY STEP 4: Verify organization exists
    // ========================================================================
    const organization = mockOrganizations.find(o => o.id === org_id);
    if (!organization) {
      await auditLog(
        createAuditLog(request, context, 'report_generation_failed', `org/${org_id}`, 'failure', {
          reason: 'organization_not_found',
          org_id,
        })
      );

      const response = createErrorResponse(
        `No organization found with ID: ${org_id}`,
        404,
        'ORG_NOT_FOUND'
      );
      return response;
    }

    // Simulate report generation time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get related data
    const orgGrants = mockGrants.filter(g => g.recipient_id === org_id);
    const orgRiskScore = mockRiskScores.find(r => r.org_id === org_id);

    // Calculate summary statistics
    const totalFunding = orgGrants.reduce((sum, grant) => sum + grant.amount, 0);
    const avgGrantSize = orgGrants.length > 0 ? totalFunding / orgGrants.length : 0;

    // Determine risk level based on score
    let riskLevel = 'low';
    if (orgRiskScore) {
      if (orgRiskScore.score > 70) riskLevel = 'high';
      else if (orgRiskScore.score > 40) riskLevel = 'medium';
    }

    // Generate recommendations based on risk factors
    const recommendations = [];
    if (orgRiskScore && orgRiskScore.dependency_ratio > 0.7) {
      recommendations.push('Diversify funding sources to reduce donor dependency risk');
    }
    if (orgRiskScore && orgRiskScore.transparency_index < 60) {
      recommendations.push('Improve transparency by publishing detailed financial reports');
    }
    if (orgGrants.length < 3) {
      recommendations.push('Expand donor base to ensure financial stability');
    }

    // Build report data
    const reportData: ReportData = {
      id: `report-${Date.now()}`,
      org_id,
      organization: {
        name: organization.name,
        ein: organization.ein,
        mission: organization.mission,
      },
      report_type,
      year: year || new Date().getFullYear(),
      generated_at: new Date().toISOString(),
      status: 'completed',
      format: options?.format || 'json',
      summary: {
        total_grants: orgGrants.length,
        total_funding: totalFunding,
        avg_grant_size: avgGrantSize,
        risk_level: riskLevel,
        risk_score: orgRiskScore?.score || null,
        dependency_ratio: orgRiskScore?.dependency_ratio || null,
        transparency_index: orgRiskScore?.transparency_index || null,
      },
      key_findings: [
        `Organization received ${orgGrants.length} grant(s) totaling $${totalFunding.toLocaleString()}`,
        `Overall compliance risk level: ${riskLevel}`,
        `Donor dependency ratio: ${((orgRiskScore?.dependency_ratio || 0) * 100).toFixed(1)}%`,
        `Transparency index: ${orgRiskScore?.transparency_index || 'N/A'}`,
      ],
      recommendations: options?.include_recommendations !== false ? recommendations : null,
      data: {
        grants: orgGrants,
        risk_score: orgRiskScore || null,
      },
    };

    // ========================================================================
    // SECURITY STEP 5: Handle PDF generation with secure file handling
    // ========================================================================
    if (options?.format === 'pdf') {
      try {
        // Generate PDF
        const pdfBuffer = await generatePDFReport(reportData);

        // Create secure filename (sanitize organization name)
        const sanitizedOrgName = organization.name
          .replace(/[^a-zA-Z0-9]/g, '_')
          .substring(0, 50); // Limit length
        const fileName = `${reportData.id}_${sanitizedOrgName}.pdf`;
        const filePath = `${org_id}/${fileName}`;

        // SECURITY: Validate file path to prevent directory traversal
        if (!isValidFilePath(filePath)) {
          throw new Error('Invalid file path detected');
        }

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('reports')
          .upload(filePath, pdfBuffer, {
            contentType: 'application/pdf',
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('Error uploading PDF to Supabase:', uploadError);
          await auditLog(
            createAuditLog(
              request,
              context,
              'report_upload_failed',
              `org/${org_id}`,
              'error',
              {
                error: uploadError.message,
                file_path: filePath,
              }
            )
          );
          throw new Error(`Failed to upload PDF: ${uploadError.message}`);
        }

        // Generate signed URL (valid for 1 hour)
        const { data: signedUrlData } = await supabase.storage
          .from('reports')
          .createSignedUrl(filePath, 3600);

        if (!signedUrlData?.signedUrl) {
          throw new Error('Failed to generate signed URL');
        }

        // Log successful report generation
        await auditLog(
          createAuditLog(
            request,
            context,
            'report_generated',
            `org/${org_id}`,
            'success',
            {
              report_id: reportData.id,
              report_type,
              format: 'pdf',
              file_path: filePath,
              duration_ms: Date.now() - startTime,
            }
          )
        );

        const response = NextResponse.json({
          success: true,
          data: {
            ...reportData,
            pdf_url: signedUrlData.signedUrl,
            file_path: filePath,
          },
          message: `Successfully generated PDF report for ${organization.name}`,
        });

        return addSecurityHeaders(response);
      } catch (pdfError) {
        console.error('Error generating/uploading PDF:', pdfError);

        await auditLog(
          createAuditLog(
            request,
            context,
            'report_generation_failed',
            `org/${org_id}`,
            'error',
            {
              error: pdfError instanceof Error ? pdfError.message : 'Unknown error',
              report_type,
              format: 'pdf',
            }
          )
        );

        const response = createErrorResponse(
          pdfError instanceof Error ? pdfError.message : 'Unknown PDF generation error',
          500,
          'PDF_GENERATION_ERROR'
        );
        return response;
      }
    }

    // ========================================================================
    // Return JSON format (default)
    // ========================================================================
    await auditLog(
      createAuditLog(request, context, 'report_generated', `org/${org_id}`, 'success', {
        report_id: reportData.id,
        report_type,
        format: 'json',
        duration_ms: Date.now() - startTime,
      })
    );

    const response = NextResponse.json({
      success: true,
      data: reportData,
      message: `Successfully generated ${report_type} report for ${organization.name}`,
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('[ERROR] Report generation failed:', error);

    // Log the error for audit trail
    await auditLog({
      timestamp: new Date().toISOString(),
      action: 'report_generation_error',
      resource: 'api/report/generate',
      result: 'error',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    const response = createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500,
      'INTERNAL_SERVER_ERROR'
    );

    return response;
  }
}
