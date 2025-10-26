# Compliance-Consulting

A comprehensive compliance management system for organizations.

## Phase 6: Alerts & Realtime Feed

### Alerts Table

The alerts system provides realtime notifications for compliance events, deadlines, and system updates.

**Database Schema**: PostgreSQL

**Table**: `alerts`
- `id` (UUID): Unique identifier
- `org_id` (UUID): Organization reference
- `type` (TEXT): Alert type (compliance_violation, deadline_approaching, etc.)
- `message` (TEXT): Human-readable alert message
- `severity` (TEXT): Alert severity (low, medium, high, critical)
- `created_at` (TIMESTAMPTZ): Creation timestamp

### Directory Structure

```
/migrations/          # Database migration files
  001_create_alerts_table.sql       # Create alerts table
  001_create_alerts_table_down.sql  # Rollback migration

/schema/             # Database schema documentation
  alerts.md          # Alerts table documentation

/types/              # TypeScript type definitions
  alerts.ts          # Alert types and interfaces
```

### Running Migrations

To apply the alerts table migration, run:

```sql
-- Using psql
psql -U your_username -d your_database -f migrations/001_create_alerts_table.sql

-- Or using your preferred migration tool
```

To rollback:

```sql
psql -U your_username -d your_database -f migrations/001_create_alerts_table_down.sql
```

### Documentation

See [schema/alerts.md](schema/alerts.md) for detailed schema documentation, example queries, and usage patterns.
