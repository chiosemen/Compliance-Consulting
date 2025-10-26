# Compliance Consulting

A real-time compliance alert system for nonprofit organizations, built with Next.js and Supabase.

## Features

- **Real-time Alert Feed**: Live updates using Supabase Realtime subscriptions
- **Three Alert Trigger Conditions**:
  1. **DAF Ratio Increase**: Alerts when Donor-Advised Fund ratio increases >20% YoY
  2. **Top Donor Concentration**: Alerts when a single donor contributes >60% of total
  3. **Missing 990 Filings**: Alerts when Form 990 hasn't been filed for >18 months
- **Severity Levels**: Low, Medium, and High priority alerts
- **Mark as Read**: Track which alerts have been reviewed
- **RESTful API**: GET `/api/alerts` endpoint with filtering options

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Realtime)
- **Tailwind CSS** (Styling)
- **React** (Frontend components)

## Project Structure

```
├── app/
│   ├── api/
│   │   └── alerts/
│   │       └── route.ts          # GET & PATCH /api/alerts
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page with AlertFeed
├── components/
│   └── AlertFeed.tsx             # Alert feed component with Realtime
├── lib/
│   ├── supabase.ts               # Supabase client configuration
│   └── alertTriggers.ts          # Alert trigger condition logic
├── types/
│   └── alerts.ts                 # TypeScript type definitions
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema
└── package.json
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- npm or yarn package manager

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize
3. Copy your project URL and anon key from Settings > API

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run Database Migration

In your Supabase project dashboard:

1. Go to **SQL Editor**
2. Create a new query
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query

This creates the following tables:
- `organizations` - Nonprofit organization data
- `daf_data` - Donor-Advised Fund ratio data by year
- `donors` - Donor contribution data
- `filings_990` - Form 990 filing records
- `alerts` - Generated compliance alerts

### 6. Enable Realtime (Important!)

In Supabase dashboard:

1. Go to **Database** > **Replication**
2. Enable replication for the `alerts` table
3. This allows real-time updates to flow to the frontend

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

### GET /api/alerts

Fetch alerts with optional filtering.

**Query Parameters:**
- `organization_id` (optional): Filter by organization UUID
- `unread_only` (optional): Set to `true` to show only unread alerts
- `limit` (optional): Number of alerts to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```bash
curl http://localhost:3000/api/alerts?unread_only=true&limit=10
```

**Response:**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "alert_type": "daf_ratio_increase",
      "severity": "high",
      "title": "DAF Ratio Increased by 45.2% YoY",
      "description": "The DAF ratio increased from 15% (2022) to 21.8% (2023)...",
      "metadata": {
        "current_year": 2023,
        "current_ratio": 21.8,
        "previous_year": 2022,
        "previous_ratio": 15.0,
        "percentage_increase": 45.2
      },
      "is_read": false,
      "created_at": "2024-01-15T10:30:00Z",
      "organization": {
        "id": "uuid",
        "name": "Example Foundation",
        "ein": "12-3456789"
      }
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### PATCH /api/alerts

Mark an alert as read/unread.

**Request Body:**
```json
{
  "alert_id": "uuid",
  "is_read": true
}
```

**Response:**
```json
{
  "alert": {
    "id": "uuid",
    "is_read": true,
    ...
  }
}
```

## Alert Trigger Conditions

### 1. DAF Ratio Increase (>20% YoY)

**Function:** `checkDAFRatioIncrease(organizationId)`

Compares the two most recent years of DAF data and triggers if:
- The percentage increase exceeds 20%

**Severity Logic:**
- High: >50% increase
- Medium: 35-50% increase
- Low: 20-35% increase

**Metadata Included:**
- Current year and ratio
- Previous year and ratio
- Percentage increase

### 2. Top Donor Concentration (>60%)

**Function:** `checkTopDonorConcentration(organizationId, year?)`

Analyzes all donors for a given year and triggers if:
- Single largest donor contributes >60% of total contributions

**Severity Logic:**
- High: >80% concentration
- Medium: 70-80% concentration
- Low: 60-70% concentration

**Metadata Included:**
- Top donor name and amount
- Total contributions
- Percentage
- Donor count

### 3. Missing 990 Filing (>18 months)

**Function:** `checkMissing990Filing(organizationId)`

Checks the most recent 990 filing date and triggers if:
- Last filing was >18 months ago
- OR no filings exist

**Severity Logic:**
- High: >30 months overdue OR no filings
- Medium: 24-30 months overdue
- Low: 18-24 months overdue

**Metadata Included:**
- Last filing date
- Last tax year
- Months/days overdue

## Usage Example: Evaluating Alerts

The `evaluateAlertsForOrganization()` function runs all three checks:

```typescript
import { evaluateAlertsForOrganization } from '@/lib/alertTriggers';

// Run all checks for an organization
await evaluateAlertsForOrganization('org-uuid-here');
```

This function:
1. Runs all three trigger condition checks
2. Creates alerts if conditions are met
3. Prevents duplicate alerts (checks for alerts created within last 7 days)

## Development

### Adding Test Data

Use the Supabase SQL Editor to add test data:

```sql
-- Add organization
INSERT INTO organizations (name, ein)
VALUES ('Test Foundation', '12-3456789');

-- Add DAF data (will trigger alert if >20% increase)
INSERT INTO daf_data (organization_id, year, daf_ratio, total_contributions)
VALUES
  ('org-id', 2022, 15.0, 1000000),
  ('org-id', 2023, 22.0, 1200000);

-- Add donors (will trigger if top donor >60%)
INSERT INTO donors (organization_id, name, total_contribution, contribution_year)
VALUES
  ('org-id', 'Major Donor', 750000, 2023),
  ('org-id', 'Other Donor', 250000, 2023);

-- Add 990 filing (old date will trigger alert)
INSERT INTO filings_990 (organization_id, filing_date, tax_year)
VALUES ('org-id', '2021-06-01', 2020);
```

Then run:
```typescript
await evaluateAlertsForOrganization('org-id');
```

### Running in Production

```bash
npm run build
npm start
```

Or deploy to Vercel:

```bash
vercel deploy
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
