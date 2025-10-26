-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ein TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create DAF (Donor-Advised Fund) data table
CREATE TABLE IF NOT EXISTS daf_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  daf_ratio DECIMAL(5,2) NOT NULL, -- Percentage
  total_contributions DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, year)
);

-- Create donors table
CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_contribution DECIMAL(15,2) NOT NULL,
  contribution_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create 990 filings table
CREATE TABLE IF NOT EXISTS filings_990 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  filing_date DATE NOT NULL,
  tax_year INTEGER NOT NULL,
  status TEXT DEFAULT 'filed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, tax_year)
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'daf_ratio_increase', 'top_donor_concentration', 'missing_990'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB, -- Store additional context
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_daf_data_org_year ON daf_data(organization_id, year);
CREATE INDEX idx_donors_org_year ON donors(organization_id, contribution_year);
CREATE INDEX idx_filings_org_date ON filings_990(organization_id, filing_date);
CREATE INDEX idx_alerts_org_created ON alerts(organization_id, created_at DESC);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- Enable Row Level Security (optional, for multi-tenant scenarios)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daf_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE filings_990 ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create policies (basic - allow all for now, customize based on your auth needs)
CREATE POLICY "Allow all operations on organizations" ON organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on daf_data" ON daf_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on donors" ON donors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on filings_990" ON filings_990 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on alerts" ON alerts FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
