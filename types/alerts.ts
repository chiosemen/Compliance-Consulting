export type AlertType = 'daf_ratio_increase' | 'top_donor_concentration' | 'missing_990';
export type AlertSeverity = 'low' | 'medium' | 'high';

export interface Organization {
  id: string;
  name: string;
  ein: string;
  created_at: string;
  updated_at: string;
}

export interface DAFData {
  id: string;
  organization_id: string;
  year: number;
  daf_ratio: number;
  total_contributions: number;
  created_at: string;
}

export interface Donor {
  id: string;
  organization_id: string;
  name: string;
  total_contribution: number;
  contribution_year: number;
  created_at: string;
}

export interface Filing990 {
  id: string;
  organization_id: string;
  filing_date: string;
  tax_year: number;
  status: string;
  created_at: string;
}

export interface Alert {
  id: string;
  organization_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  organization?: Organization;
}

export interface AlertTriggerResult {
  shouldTrigger: boolean;
  severity: AlertSeverity;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}
