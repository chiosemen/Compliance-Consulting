import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Alert } from '@/types/alerts';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organization_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    let query = supabase
      .from('alerts')
      .select(`
        *,
        organization:organizations(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by organization if specified
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    // Filter by unread status if specified
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: alerts, error, count } = await query;

    if (error) {
      console.error('Error fetching alerts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch alerts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      alerts: alerts as Alert[],
      total: count || alerts?.length || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alert_id, is_read } = body;

    if (!alert_id) {
      return NextResponse.json(
        { error: 'alert_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('alerts')
      .update({ is_read })
      .eq('id', alert_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating alert:', error);
      return NextResponse.json(
        { error: 'Failed to update alert', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ alert: data });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
