/**
 * Alert severity levels
 */
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Common alert types
 */
export type AlertType =
  | 'compliance_violation'
  | 'deadline_approaching'
  | 'deadline_missed'
  | 'document_expiring'
  | 'audit_required'
  | 'policy_update'
  | 'system_notification';

/**
 * Alert database record
 */
export interface Alert {
  id: string;
  org_id: string;
  type: string;
  message: string;
  severity: AlertSeverity;
  created_at: Date;
}

/**
 * Input type for creating a new alert
 */
export interface CreateAlertInput {
  org_id: string;
  type: string;
  message: string;
  severity: AlertSeverity;
}

/**
 * Input type for updating an alert
 */
export interface UpdateAlertInput {
  type?: string;
  message?: string;
  severity?: AlertSeverity;
}

/**
 * Query filters for alerts
 */
export interface AlertFilters {
  org_id?: string;
  type?: string;
  severity?: AlertSeverity;
  created_after?: Date;
  created_before?: Date;
}

/**
 * Alert statistics by severity
 */
export interface AlertStats {
  severity: AlertSeverity;
  count: number;
}
