import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationWithRelations } from '@/lib/mock-data';

/**
 * GET /api/orgs/[id]
 * Fetch a single organization by ID with related data (grants, risk scores)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const organization = getOrganizationWithRelations(id);

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization not found',
          message: `No organization found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization,
      message: 'Organization fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organization',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
