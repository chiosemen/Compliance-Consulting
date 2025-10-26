-- Rollback Migration: Drop alerts table
-- Phase 6: Alerts & Realtime Feed
-- Created: 2025-10-26

-- Drop indexes
DROP INDEX IF EXISTS idx_alerts_severity;
DROP INDEX IF EXISTS idx_alerts_created_at;
DROP INDEX IF EXISTS idx_alerts_org_id;

-- Drop table
DROP TABLE IF EXISTS alerts;
