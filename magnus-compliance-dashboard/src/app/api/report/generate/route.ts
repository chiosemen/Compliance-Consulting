import { NextRequest, NextResponse } from 'next/server';
import { mockOrganizations, mockGrants, mockRiskScores } from '@/lib/mock-data';
import { generatePDFReport, ReportData } from '@/lib/pdf-generator';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/report/generate
 * Generate a compliance report for an organization
 *
 * Expected body:
 * {
 *   org_id: string,
 *   report_type: 'compliance_analysis' | 'risk_assessment' | 'donor_analysis',
 *   year?: number,
 *   options?: {
 *     include_recommendations?: boolean,
 *     include_visualizations?: boolean,
 *     format?: 'json' | 'pdf' | 'html'
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_id, report_type, year, options } = body;

    // Validate required fields
    if (!org_id || !report_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Both "org_id" and "report_type" are required',
        },
        { status: 400 }
      );
    }

    // Validate report type
    const validTypes = ['compliance_analysis', 'risk_assessment', 'donor_analysis'];
    if (!validTypes.includes(report_type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid report type',
          message: `Report type must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Check if organization exists
    const organization = mockOrganizations.find(o => o.id === org_id);
    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization not found',
          message: `No organization found with ID: ${org_id}`,
        },
        { status: 404 }
      );
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

    // Handle PDF generation and upload
    if (options?.format === 'pdf') {
      try {
        // Generate PDF
        const pdfBuffer = await generatePDFReport(reportData);

        // Create filename
        const fileName = `${reportData.id}_${organization.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        const filePath = `${org_id}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('reports')
          .upload(filePath, pdfBuffer, {
            contentType: 'application/pdf',
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('Error uploading PDF to Supabase:', uploadError);
          throw new Error(`Failed to upload PDF: ${uploadError.message}`);
        }

        // Generate signed URL (valid for 1 hour)
        const { data: signedUrlData } = await supabase.storage
          .from('reports')
          .createSignedUrl(filePath, 3600);

        if (!signedUrlData?.signedUrl) {
          throw new Error('Failed to generate signed URL');
        }

        return NextResponse.json({
          success: true,
          data: {
            ...reportData,
            pdf_url: signedUrlData.signedUrl,
            file_path: filePath,
          },
          message: `Successfully generated PDF report for ${organization.name}`,
        });
      } catch (pdfError) {
        console.error('Error generating/uploading PDF:', pdfError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to generate PDF',
            message: pdfError instanceof Error ? pdfError.message : 'Unknown PDF generation error',
          },
          { status: 500 }
        );
      }
    }

    // Return JSON format (default)
    return NextResponse.json({
      success: true,
      data: reportData,
      message: `Successfully generated ${report_type} report for ${organization.name}`,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
