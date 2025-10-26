# Magnus Compliance Consulting - Database Schema

## Overview

This directory contains the Supabase database schema and migrations for the Magnus Compliance Consulting platform. The database is designed to track nonprofit organizations, donors, grants, DAF flows, and compliance risk scores.

## Schema Design

### Core Tables

#### 1. **organizations**
Stores nonprofit organization data.

| Column        | Type         | Description                          |
|---------------|--------------|--------------------------------------|
| id            | UUID         | Primary key                          |
| name          | TEXT         | Organization name                    |
| ein           | TEXT         | Employer Identification Number (unique) |
| mission       | TEXT         | Organization mission statement       |
| website       | TEXT         | Organization website URL             |
| year_founded  | INTEGER      | Year organization was founded        |
| created_at    | TIMESTAMPTZ  | Record creation timestamp            |
| updated_at    | TIMESTAMPTZ  | Record last update timestamp         |

**Indexes:** `ein`, `name`

---

#### 2. **donors**
Stores donor information (individuals, DAFs, foundations, etc.).

| Column          | Type    | Description                                    |
|-----------------|---------|------------------------------------------------|
| id              | UUID    | Primary key                                    |
| name            | TEXT    | Donor name                                     |
| type            | TEXT    | Donor type (individual, daf, foundation, etc.) |
| sponsor         | TEXT    | For DAFs: the sponsoring organization          |
| anonymity_flag  | BOOLEAN | Whether donor prefers anonymity                |
| created_at      | TIMESTAMPTZ | Record creation timestamp                  |
| updated_at      | TIMESTAMPTZ | Record last update timestamp               |

**Indexes:** `name`, `type`

**Constraints:** `type` must be one of: `individual`, `daf`, `foundation`, `corporate`, `other`

---

#### 3. **grants**
Stores grant/donation transactions.

| Column        | Type         | Description                          |
|---------------|--------------|--------------------------------------|
| id            | UUID         | Primary key                          |
| donor_id      | UUID         | Foreign key to donors                |
| recipient_id  | UUID         | Foreign key to organizations         |
| amount        | NUMERIC(15,2)| Grant amount (non-negative)          |
| year          | INTEGER      | Year of grant                        |
| confirmed     | BOOLEAN      | Whether grant is confirmed           |
| source_file   | TEXT         | Reference to source document         |
| created_at    | TIMESTAMPTZ  | Record creation timestamp            |
| updated_at    | TIMESTAMPTZ  | Record last update timestamp         |

**Indexes:** `donor_id`, `recipient_id`, `year`, `amount`

**Constraints:**
- `amount >= 0`
- Foreign key cascade deletes

---

#### 4. **dafflows**
Tracks Donor-Advised Fund flows and relationships.

| Column           | Type         | Description                              |
|------------------|--------------|------------------------------------------|
| id               | UUID         | Primary key                              |
| source_daf       | TEXT         | DAF account identifier                   |
| underlying_donor | TEXT         | The actual donor behind the DAF          |
| recipient_org    | UUID         | Foreign key to organizations             |
| inferred         | BOOLEAN      | Whether connection is inferred vs confirmed |
| confidence_score | NUMERIC(3,2) | Confidence score (0-1)                   |
| created_at       | TIMESTAMPTZ  | Record creation timestamp                |
| updated_at       | TIMESTAMPTZ  | Record last update timestamp             |

**Indexes:** `source_daf`, `recipient_org`, `confidence_score`

**Constraints:** `confidence_score` must be between 0 and 1

---

#### 5. **risk_scores**
Stores compliance risk analysis for organizations.

| Column              | Type         | Description                          |
|---------------------|--------------|--------------------------------------|
| id                  | UUID         | Primary key                          |
| org_id              | UUID         | Foreign key to organizations         |
| year                | INTEGER      | Year of risk assessment              |
| score               | NUMERIC(5,2) | Overall risk score (0-100)           |
| dependency_ratio    | NUMERIC(5,4) | Donor concentration ratio (0-1)      |
| transparency_index  | NUMERIC(5,2) | Transparency score (0-100)           |
| created_at          | TIMESTAMPTZ  | Record creation timestamp            |
| updated_at          | TIMESTAMPTZ  | Record last update timestamp         |

**Indexes:** `org_id`, `year`, `score`

**Constraints:**
- `score` between 0 and 100
- `dependency_ratio` between 0 and 1
- `transparency_index` between 0 and 100
- Unique constraint on `(org_id, year)` - one score per org per year

---

#### 6. **audit_log**
Tracks all data modifications for compliance and auditing.

| Column       | Type         | Description                          |
|--------------|--------------|--------------------------------------|
| id           | UUID         | Primary key                          |
| user_id      | UUID         | Reference to auth.users              |
| action       | TEXT         | Action type (INSERT, UPDATE, DELETE) |
| table_name   | TEXT         | Name of affected table               |
| record_id    | UUID         | ID of affected record                |
| before_state | JSONB        | Record state before change           |
| after_state  | JSONB        | Record state after change            |
| timestamp    | TIMESTAMPTZ  | When action occurred                 |

**Indexes:** `user_id`, `table_name`, `timestamp`, `record_id`

**Note:** This table is append-only for audit integrity.

---

## Relationships

```
organizations
    ├── grants (as recipient)
    ├── dafflows (as recipient)
    └── risk_scores

donors
    └── grants

grants
    ├── donor_id → donors
    └── recipient_id → organizations

dafflows
    └── recipient_org → organizations

risk_scores
    └── org_id → organizations
```

---

## Security

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Read Access:** Authenticated users can read from all tables
- **Write Access:** Authenticated users can write to most tables
- **Audit Log:** Insert-only access for authenticated users

### Recommendations for Production

1. **Implement role-based access control (RBAC)**
   - Create separate policies for admin, analyst, and viewer roles
   - Restrict write access to admin users only

2. **Add field-level encryption for sensitive data**
   - Encrypt EIN numbers
   - Encrypt donor PII

3. **Enable audit logging triggers**
   - Automatically log all INSERT/UPDATE/DELETE operations
   - Track user actions in audit_log table

---

## Migrations

### Running Migrations

If using Supabase CLI:

```bash
# Initialize Supabase
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.types.ts
```

### Manual Setup

If setting up manually in Supabase Dashboard:

1. Go to SQL Editor in your Supabase dashboard
2. Run the SQL from `migrations/20251026000001_initial_schema.sql`
3. Verify tables are created in the Table Editor

---

## Helper Functions

### Update Timestamp Trigger

Automatically updates `updated_at` column on UPDATE operations for all tables.

### Future Enhancements

Consider adding:
- Stored procedures for complex risk calculations
- Materialized views for performance optimization
- Additional triggers for data validation
- GraphQL API layer using PostgREST

---

## Usage Examples

See `/src/lib/api/` for TypeScript API helpers that provide type-safe database operations.

```typescript
import { getOrganizations, getGrantsByRecipient } from '@/lib/api';

// Fetch organizations
const orgs = await getOrganizations({ limit: 10 });

// Get grants for an org
const grants = await getGrants({ recipient_id: 'org-uuid' });
```
