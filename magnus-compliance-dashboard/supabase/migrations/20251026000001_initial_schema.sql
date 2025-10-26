-- Magnus Compliance Consulting Database Schema
-- Initial migration: Create all core tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ORGANIZATIONS TABLE
-- Stores nonprofit organization data
-- =====================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    ein TEXT UNIQUE, -- Employer Identification Number
    mission TEXT,
    website TEXT,
    year_founded INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_ein ON organizations(ein);
CREATE INDEX idx_organizations_name ON organizations(name);

-- =====================================================
-- DONORS TABLE
-- Stores donor information (individuals, DAFs, foundations)
-- =====================================================
CREATE TABLE donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('individual', 'daf', 'foundation', 'corporate', 'other')),
    sponsor TEXT, -- For DAFs: the sponsoring organization
    anonymity_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donors_name ON donors(name);
CREATE INDEX idx_donors_type ON donors(type);

-- =====================================================
-- GRANTS TABLE
-- Stores grant/donation transactions
-- =====================================================
CREATE TABLE grants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    year INTEGER NOT NULL,
    confirmed BOOLEAN DEFAULT FALSE,
    source_file TEXT, -- Reference to the source document
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grants_donor ON grants(donor_id);
CREATE INDEX idx_grants_recipient ON grants(recipient_id);
CREATE INDEX idx_grants_year ON grants(year);
CREATE INDEX idx_grants_amount ON grants(amount);

-- =====================================================
-- DAF FLOWS TABLE
-- Tracks Donor-Advised Fund flows and relationships
-- =====================================================
CREATE TABLE dafflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_daf TEXT NOT NULL, -- DAF account identifier
    underlying_donor TEXT, -- The actual donor behind the DAF
    recipient_org UUID REFERENCES organizations(id) ON DELETE CASCADE,
    inferred BOOLEAN DEFAULT FALSE, -- Whether the connection is inferred vs confirmed
    confidence_score NUMERIC(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dafflows_source ON dafflows(source_daf);
CREATE INDEX idx_dafflows_recipient ON dafflows(recipient_org);
CREATE INDEX idx_dafflows_confidence ON dafflows(confidence_score);

-- =====================================================
-- RISK SCORES TABLE
-- Stores compliance risk analysis for organizations
-- =====================================================
CREATE TABLE risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    score NUMERIC(5, 2) CHECK (score >= 0 AND score <= 100), -- Overall risk score 0-100
    dependency_ratio NUMERIC(5, 4) CHECK (dependency_ratio >= 0 AND dependency_ratio <= 1), -- Donor concentration
    transparency_index NUMERIC(5, 2) CHECK (transparency_index >= 0 AND transparency_index <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, year) -- One risk score per org per year
);

CREATE INDEX idx_risk_scores_org ON risk_scores(org_id);
CREATE INDEX idx_risk_scores_year ON risk_scores(year);
CREATE INDEX idx_risk_scores_score ON risk_scores(score);

-- =====================================================
-- AUDIT LOG TABLE
-- Tracks all data modifications for compliance
-- =====================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Reference to auth.users (Supabase auth)
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name TEXT NOT NULL,
    record_id UUID,
    before_state JSONB,
    after_state JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON donors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grants_updated_at BEFORE UPDATE ON grants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dafflows_updated_at BEFORE UPDATE ON dafflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_scores_updated_at BEFORE UPDATE ON risk_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dafflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Public read access for authenticated users (adjust as needed)
CREATE POLICY "Allow authenticated read access" ON organizations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access" ON donors
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access" ON grants
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access" ON dafflows
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access" ON risk_scores
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access" ON audit_log
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin write access (add specific admin role checks as needed)
CREATE POLICY "Allow authenticated write access" ON organizations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write access" ON donors
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write access" ON grants
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write access" ON dafflows
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write access" ON risk_scores
    FOR ALL USING (auth.role() = 'authenticated');

-- Audit log is insert-only for all authenticated users
CREATE POLICY "Allow authenticated insert access" ON audit_log
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
