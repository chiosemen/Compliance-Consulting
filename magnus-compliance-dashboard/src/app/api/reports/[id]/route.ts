import { NextRequest, NextResponse } from 'next/server';
import { mockReports } from '@/lib/mock-data';

/**
 * GET /api/reports/[id]
 * Fetch a compliance report by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const report = mockReports.find(r => r.id === id);

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report not found',
          message: `No report found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
