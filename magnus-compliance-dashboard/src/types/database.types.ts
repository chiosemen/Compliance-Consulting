// Magnus Compliance Consulting - Database Types
// Auto-generated types matching Supabase schema

export interface Organization {
  id: string;
  name: string;
  ein: string | null;
  mission: string | null;
  website: string | null;
  year_founded: number | null;
  created_at: string;
  updated_at: string;
}

export interface Donor {
  id: string;
  name: string;
  type: 'individual' | 'daf' | 'foundation' | 'corporate' | 'other' | null;
  sponsor: string | null;
  anonymity_flag: boolean;
  created_at: string;
  updated_at: string;
}

export interface Grant {
  id: string;
  donor_id: string | null;
  recipient_id: string | null;
  amount: number;
  year: number;
  confirmed: boolean;
  source_file: string | null;
  created_at: string;
  updated_at: string;
}

export interface DAFFlow {
  id: string;
  source_daf: string;
  underlying_donor: string | null;
  recipient_org: string | null;
  inferred: boolean;
  confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface RiskScore {
  id: string;
  org_id: string | null;
  year: number;
  score: number | null;
  dependency_ratio: number | null;
  transparency_index: number | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  timestamp: string;
}

// Insert types (without auto-generated fields)
export type OrganizationInsert = Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>> & { name: string };
export type DonorInsert = Partial<Omit<Donor, 'id' | 'created_at' | 'updated_at'>> & { name: string };
export type GrantInsert = Partial<Omit<Grant, 'id' | 'created_at' | 'updated_at'>> & { amount: number; year: number };
export type DAFFlowInsert = Partial<Omit<DAFFlow, 'id' | 'created_at' | 'updated_at'>> & { source_daf: string };
export type RiskScoreInsert = Partial<Omit<RiskScore, 'id' | 'created_at' | 'updated_at'>> & { year: number };
export type AuditLogInsert = Partial<Omit<AuditLog, 'id' | 'timestamp'>> & { action: string; table_name: string };

// Update types (all fields optional except id)
export type OrganizationUpdate = Partial<OrganizationInsert>;
export type DonorUpdate = Partial<DonorInsert>;
export type GrantUpdate = Partial<GrantInsert>;
export type DAFFlowUpdate = Partial<DAFFlowInsert>;
export type RiskScoreUpdate = Partial<RiskScoreInsert>;

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: OrganizationInsert;
        Update: OrganizationUpdate;
      };
      donors: {
        Row: Donor;
        Insert: DonorInsert;
        Update: DonorUpdate;
      };
      grants: {
        Row: Grant;
        Insert: GrantInsert;
        Update: GrantUpdate;
      };
      dafflows: {
        Row: DAFFlow;
        Insert: DAFFlowInsert;
        Update: DAFFlowUpdate;
      };
      risk_scores: {
        Row: RiskScore;
        Insert: RiskScoreInsert;
        Update: RiskScoreUpdate;
      };
      audit_log: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: never; // Audit log is append-only
      };
    };
  };
}
