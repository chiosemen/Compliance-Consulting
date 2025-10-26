# Alerts Table Schema

## Overview
The `alerts` table stores system and compliance alerts for organizations, providing a realtime feed of important notifications.

## Table: `alerts`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the alert |
| `org_id` | UUID | NOT NULL | Reference to the organization this alert belongs to |
| `type` | TEXT | NOT NULL | Type of alert (e.g., compliance_violation, deadline_approaching, system_notification) |
| `message` | TEXT | NOT NULL | Human-readable alert message |
| `severity` | TEXT | NOT NULL, CHECK constraint | Alert severity level: 'low', 'medium', 'high', or 'critical' |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when the alert was created |

### Indexes

1. **idx_alerts_org_id**: Index on `org_id` for faster queries by organization
2. **idx_alerts_created_at**: Index on `created_at` (DESC) for sorting and filtering by date
3. **idx_alerts_severity**: Index on `severity` for filtering by severity level

### Constraints

- **check_severity**: Ensures severity is one of: 'low', 'medium', 'high', 'critical'

## Alert Types

Common alert types include:
- `compliance_violation`: A compliance rule has been violated
- `deadline_approaching`: An important deadline is approaching
- `deadline_missed`: A deadline has been missed
- `document_expiring`: A compliance document is expiring soon
- `audit_required`: An audit is required
- `policy_update`: A policy has been updated
- `system_notification`: General system notification

## Severity Levels

- **low**: Informational alerts that don't require immediate action
- **medium**: Alerts that should be addressed soon
- **high**: Important alerts requiring prompt attention
- **critical**: Urgent alerts requiring immediate action

## Example Queries

### Insert a new alert
```sql
INSERT INTO alerts (org_id, type, message, severity)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'compliance_violation',
    'GDPR compliance check failed for data retention policy',
    'high'
);
```

### Get all critical alerts for an organization
```sql
SELECT * FROM alerts
WHERE org_id = '123e4567-e89b-12d3-a456-426614174000'
  AND severity = 'critical'
ORDER BY created_at DESC;
```

### Get recent alerts (last 7 days)
```sql
SELECT * FROM alerts
WHERE org_id = '123e4567-e89b-12d3-a456-426614174000'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Count alerts by severity
```sql
SELECT severity, COUNT(*) as count
FROM alerts
WHERE org_id = '123e4567-e89b-12d3-a456-426614174000'
GROUP BY severity
ORDER BY
    CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;
```

## Migration Files

- **Up**: `migrations/001_create_alerts_table.sql`
- **Down**: `migrations/001_create_alerts_table_down.sql`

## Future Enhancements

Potential additions for future phases:
- `read_at` TIMESTAMPTZ: Track when alerts are read
- `resolved_at` TIMESTAMPTZ: Track when alerts are resolved
- `user_id` UUID: Track which user the alert is assigned to
- `metadata` JSONB: Store additional alert-specific data
- `link` TEXT: URL to relevant page or resource
