import { NextResponse } from 'next/server';
import {
  mockOrganizations,
  mockGrants,
  mockRiskScores,
  mockReports,
} from '@/lib/mock-data';

/**
 * GET /api/metrics
 * Returns aggregated KPI metrics for the dashboard
 * Used for real-time monitoring and auto-refresh displays
 */
export async function GET() {
  try {
    // Calculate metrics
    const totalOrganizations = mockOrganizations.length;
    const totalGrants = mockGrants.length;
    const totalFunding = mockGrants.reduce((sum, grant) => sum + grant.amount, 0);

    // Risk score calculations
    const averageRiskScore =
      mockRiskScores.reduce((sum, risk) => sum + risk.score, 0) /
      mockRiskScores.length;

    const riskDistribution = {
      low: mockRiskScores.filter((r) => r.score < 40).length,
      medium: mockRiskScores.filter((r) => r.score >= 40 && r.score < 70).length,
      high: mockRiskScores.filter((r) => r.score >= 70).length,
    };

    // Transparency metrics
    const averageTransparency =
      mockRiskScores.reduce((sum, risk) => sum + risk.transparency_index, 0) /
      mockRiskScores.length;

    // Reports metrics
    const totalReports = mockReports.length;
    const completedReports = mockReports.filter((r) => r.status === 'completed').length;

    // Funding metrics
    const averageGrantSize = totalFunding / totalGrants;
    const largestGrant = Math.max(...mockGrants.map((g) => g.amount));

    return NextResponse.json({
      success: true,
      data: {
        organizations: {
          total: totalOrganizations,
        },
        grants: {
          total: totalGrants,
          totalFunding,
          averageGrantSize: Math.round(averageGrantSize),
          largestGrant,
        },
        risk: {
          averageScore: Math.round(averageRiskScore * 10) / 10,
          distribution: riskDistribution,
        },
        transparency: {
          averageIndex: Math.round(averageTransparency * 10) / 10,
        },
        reports: {
          total: totalReports,
          completed: completedReports,
        },
        lastUpdated: new Date().toISOString(),
      },
      message: 'Metrics fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
