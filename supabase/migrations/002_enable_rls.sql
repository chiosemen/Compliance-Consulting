-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- PROFILES TABLE RLS POLICIES
-- ==============================================

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Policy: Owners and Analysts can view all profiles
CREATE POLICY "Owners and Analysts can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'analyst')
        )
    );

-- Policy: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Policy: Only owners can update any profile including roles
CREATE POLICY "Owners can update any profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'owner'
        )
    );

-- Policy: Profiles are automatically created via trigger
CREATE POLICY "Enable insert for authenticated users only"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ==============================================
-- CLIENTS TABLE RLS POLICIES
-- ==============================================

-- Policy: Owners and Analysts can view all clients
CREATE POLICY "Owners and Analysts can view all clients"
    ON clients FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'analyst')
        )
    );

-- Policy: Clients can view clients they have access to (via assessments)
CREATE POLICY "Clients can view their assigned clients"
    ON clients FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN assessments a ON a.client_id = clients.id
            WHERE p.id = auth.uid()
            AND p.role = 'client'
            AND a.assigned_to = auth.uid()
        )
    );

-- Policy: Owners and Analysts can insert clients
CREATE POLICY "Owners and Analysts can insert clients"
    ON clients FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'analyst')
        )
    );

-- Policy: Owners and Analysts can update clients
CREATE POLICY "Owners and Analysts can update clients"
    ON clients FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'analyst')
        )
    );

-- Policy: Only owners can delete clients
CREATE POLICY "Owners can delete clients"
    ON clients FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'owner'
        )
    );

-- ==============================================
-- ASSESSMENTS TABLE RLS POLICIES
-- ==============================================

-- Policy: Owners and Analysts can view all assessments
CREATE POLICY "Owners and Analysts can view all assessments"
    ON assessments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'analyst')
        )
    );

-- Policy: Clients can view assessments assigned to them
CREATE POLICY "Clients can view assigned assessments"
    ON assessments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'client'
        )
        AND assigned_to = auth.uid()
    );

-- Policy: Owners and Analysts can insert assessments
CREATE POLICY "Owners and Analysts can insert assessments"
    ON assessments FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'analyst')
        )
    );

-- Policy: Owners and Analysts can update assessments
CREATE POLICY "Owners and Analysts can update assessments"
    ON assessments FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'analyst')
        )
    );

-- Policy: Analysts can update assessments assigned to them
CREATE POLICY "Analysts can update assigned assessments"
    ON assessments FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'analyst'
        )
        AND assigned_to = auth.uid()
    );

-- Policy: Only owners can delete assessments
CREATE POLICY "Owners can delete assessments"
    ON assessments FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'owner'
        )
    );
