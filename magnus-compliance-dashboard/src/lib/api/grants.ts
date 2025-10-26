import { supabase } from '../supabase';
import type { Grant, GrantInsert, GrantUpdate } from '@/types/database.types';

/**
 * Fetch grants with optional filters
 */
export async function getGrants(filters?: {
  donor_id?: string;
  recipient_id?: string;
  year?: number;
  min_amount?: number;
  confirmed?: boolean;
  limit?: number;
}) {
  let query = supabase
    .from('grants')
    .select(`
      *,
      donor:donors(id, name, type),
      recipient:organizations(id, name, ein)
    `);

  if (filters?.donor_id) {
    query = query.eq('donor_id', filters.donor_id);
  }

  if (filters?.recipient_id) {
    query = query.eq('recipient_id', filters.recipient_id);
  }

  if (filters?.year) {
    query = query.eq('year', filters.year);
  }

  if (filters?.min_amount !== undefined) {
    query = query.gte('amount', filters.min_amount);
  }

  if (filters?.confirmed !== undefined) {
    query = query.eq('confirmed', filters.confirmed);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query.order('year', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single grant by ID
 */
export async function getGrantById(id: string) {
  const { data, error } = await supabase
    .from('grants')
    .select(`
      *,
      donor:donors(id, name, type, sponsor),
      recipient:organizations(id, name, ein, mission)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get total grant amount by year
 */
export async function getGrantTotalsByYear(year: number) {
  const { data, error } = await supabase
    .from('grants')
    .select('amount')
    .eq('year', year);

  if (error) throw error;
  if (!data) return { year, total: 0, count: 0 };

  const total = data.reduce((sum, grant) => sum + Number(grant.amount), 0);
  return { year, total, count: data.length };
}

/**
 * Get top recipients by grant amount
 */
export async function getTopRecipients(limit = 10, year?: number) {
  let query = supabase
    .from('grants')
    .select(`
      recipient_id,
      amount,
      recipient:organizations(id, name, ein)
    `);

  if (year) {
    query = query.eq('year', year);
  }

  const { data, error } = await query;

  if (error) throw error;
  if (!data) return [];

  // Aggregate by recipient
  interface AggregatedRecipient {
    recipient: { id: string; name: string; ein: string | null };
    total_amount: number;
    grant_count: number;
  }

  const aggregated = data.reduce((acc: Record<string, AggregatedRecipient>, grant) => {
    const recipientId = grant.recipient_id;
    // Supabase returns recipient as an object when using the join syntax
    const recipient = grant.recipient as unknown as { id: string; name: string; ein: string | null } | null;

    if (!recipientId || !recipient) return acc;
    if (!acc[recipientId]) {
      acc[recipientId] = {
        recipient,
        total_amount: 0,
        grant_count: 0,
      };
    }
    acc[recipientId].total_amount += Number(grant.amount);
    acc[recipientId].grant_count += 1;
    return acc;
  }, {});

  return Object.values(aggregated)
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, limit);
}

/**
 * Create a new grant
 */
export async function createGrant(grant: GrantInsert) {
  const { data, error } = await supabase
    .from('grants')
    .insert(grant)
    .select()
    .single();

  if (error) throw error;
  return data as Grant;
}

/**
 * Update a grant
 */
export async function updateGrant(id: string, updates: GrantUpdate) {
  const { data, error } = await supabase
    .from('grants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Grant;
}

/**
 * Delete a grant
 */
export async function deleteGrant(id: string) {
  const { error } = await supabase
    .from('grants')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
