import { supabase } from '../supabase';
import type { Organization, OrganizationInsert, OrganizationUpdate } from '@/types/database.types';

/**
 * Fetch all organizations with optional filters
 */
export async function getOrganizations(filters?: {
  name?: string;
  ein?: string;
  limit?: number;
}) {
  let query = supabase.from('organizations').select('*');

  if (filters?.name) {
    query = query.ilike('name', `%${filters.name}%`);
  }

  if (filters?.ein) {
    query = query.eq('ein', filters.ein);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query.order('name');

  if (error) throw error;
  return data as Organization[];
}

/**
 * Fetch a single organization by ID
 */
export async function getOrganizationById(id: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Organization;
}

/**
 * Fetch organization with related data (grants, risk scores)
 */
export async function getOrganizationWithRelations(id: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      grants!grants_recipient_id_fkey(
        id,
        amount,
        year,
        confirmed,
        donor:donors(id, name, type)
      ),
      risk_scores(
        id,
        year,
        score,
        dependency_ratio,
        transparency_index
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new organization
 */
export async function createOrganization(organization: OrganizationInsert) {
  const { data, error } = await supabase
    .from('organizations')
    .insert(organization)
    .select()
    .single();

  if (error) throw error;
  return data as Organization;
}

/**
 * Update an existing organization
 */
export async function updateOrganization(id: string, updates: OrganizationUpdate) {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Organization;
}

/**
 * Delete an organization
 */
export async function deleteOrganization(id: string) {
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Search organizations by name
 */
export async function searchOrganizations(searchTerm: string, limit = 10) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .limit(limit)
    .order('name');

  if (error) throw error;
  return data as Organization[];
}
