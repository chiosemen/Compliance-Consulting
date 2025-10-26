import { supabase } from '../supabase';
import type { RiskScore, RiskScoreInsert, RiskScoreUpdate } from '@/types/database.types';

/**
 * Get risk scores with optional filters
 */
export async function getRiskScores(filters?: {
  org_id?: string;
  year?: number;
  min_score?: number;
  max_score?: number;
  limit?: number;
}) {
  let query = supabase
    .from('risk_scores')
    .select(`
      *,
      organization:organizations(id, name, ein)
    `);

  if (filters?.org_id) {
    query = query.eq('org_id', filters.org_id);
  }

  if (filters?.year) {
    query = query.eq('year', filters.year);
  }

  if (filters?.min_score !== undefined) {
    query = query.gte('score', filters.min_score);
  }

  if (filters?.max_score !== undefined) {
    query = query.lte('score', filters.max_score);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query.order('year', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get risk score for a specific organization and year
 */
export async function getRiskScoreByOrgAndYear(org_id: string, year: number) {
  const { data, error } = await supabase
    .from('risk_scores')
    .select(`
      *,
      organization:organizations(id, name, ein, mission)
    `)
    .eq('org_id', org_id)
    .eq('year', year)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get risk score history for an organization
 */
export async function getRiskScoreHistory(org_id: string) {
  const { data, error } = await supabase
    .from('risk_scores')
    .select('*')
    .eq('org_id', org_id)
    .order('year', { ascending: true });

  if (error) throw error;
  return data as RiskScore[];
}

/**
 * Get high-risk organizations
 */
export async function getHighRiskOrganizations(
  threshold = 70,
  year?: number,
  limit = 20
) {
  let query = supabase
    .from('risk_scores')
    .select(`
      *,
      organization:organizations(id, name, ein)
    `)
    .gte('score', threshold);

  if (year) {
    query = query.eq('year', year);
  }

  const { data, error } = await query
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Calculate average risk score by year
 */
export async function getAverageRiskScoreByYear(year: number) {
  const { data, error } = await supabase
    .from('risk_scores')
    .select('score')
    .eq('year', year);

  if (error) throw error;

  if (data.length === 0) return { year, average: 0, count: 0 };

  const sum = data.reduce((acc, record) => acc + Number(record.score || 0), 0);
  const average = sum / data.length;

  return { year, average, count: data.length };
}

/**
 * Create a new risk score
 */
export async function createRiskScore(riskScore: RiskScoreInsert) {
  const { data, error } = await supabase
    .from('risk_scores')
    .insert(riskScore)
    .select()
    .single();

  if (error) throw error;
  return data as RiskScore;
}

/**
 * Update a risk score
 */
export async function updateRiskScore(id: string, updates: RiskScoreUpdate) {
  const { data, error } = await supabase
    .from('risk_scores')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as RiskScore;
}

/**
 * Upsert risk score (create or update based on org_id and year)
 */
export async function upsertRiskScore(
  org_id: string,
  year: number,
  scoreData: Omit<RiskScoreInsert, 'org_id' | 'year'>
) {
  const { data, error } = await supabase
    .from('risk_scores')
    .upsert({ org_id, year, ...scoreData }, { onConflict: 'org_id,year' })
    .select()
    .single();

  if (error) throw error;
  return data as RiskScore;
}

/**
 * Delete a risk score
 */
export async function deleteRiskScore(id: string) {
  const { error } = await supabase
    .from('risk_scores')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
