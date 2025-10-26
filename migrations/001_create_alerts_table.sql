-- Migration: Create alerts table
-- Phase 6: Alerts & Realtime Feed
-- Created: 2025-10-26

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on org_id for faster queries by organization
CREATE INDEX IF NOT EXISTS idx_alerts_org_id ON alerts(org_id);

-- Create index on created_at for sorting and filtering by date
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- Create index on severity for filtering by severity level
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);

-- Add constraint to ensure severity is one of the valid values
ALTER TABLE alerts ADD CONSTRAINT check_severity
    CHECK (severity IN ('low', 'medium', 'high', 'critical'));

-- Add comment to table
COMMENT ON TABLE alerts IS 'Stores system and compliance alerts for organizations';

-- Add comments to columns
COMMENT ON COLUMN alerts.id IS 'Unique identifier for the alert';
COMMENT ON COLUMN alerts.org_id IS 'Reference to the organization this alert belongs to';
COMMENT ON COLUMN alerts.type IS 'Type of alert (e.g., compliance_violation, deadline_approaching, etc.)';
COMMENT ON COLUMN alerts.message IS 'Human-readable alert message';
COMMENT ON COLUMN alerts.severity IS 'Alert severity level: low, medium, high, or critical';
COMMENT ON COLUMN alerts.created_at IS 'Timestamp when the alert was created';
