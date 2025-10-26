import { NextRequest, NextResponse } from 'next/server';
import { mockOrganizations } from '@/lib/mock-data';

/**
 * GET /api/orgs
 * Fetch all organizations with optional filtering
 * Query params: name (string), limit (number)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nameFilter = searchParams.get('name');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    let orgs = [...mockOrganizations];

    // Filter by name if provided
    if (nameFilter) {
      orgs = orgs.filter(org =>
        org.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Apply limit if provided
    if (limit && limit > 0) {
      orgs = orgs.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: orgs,
      count: orgs.length,
      message: 'Organizations fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organizations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
