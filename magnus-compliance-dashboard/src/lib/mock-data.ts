// Mock data for API responses
// This will be replaced with real Supabase data later

export const mockOrganizations = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Community Health Foundation',
    ein: '12-3456789',
    mission: 'Providing healthcare access to underserved communities',
    website: 'https://communityhealthfoundation.org',
    year_founded: 2015,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-10-01').toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Education Access Initiative',
    ein: '98-7654321',
    mission: 'Improving educational outcomes for low-income students',
    website: 'https://educationaccess.org',
    year_founded: 2018,
    created_at: new Date('2024-02-01').toISOString(),
    updated_at: new Date('2024-09-15').toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Environmental Justice Coalition',
    ein: '45-6789012',
    mission: 'Advocating for environmental protection and climate action',
    website: 'https://envjustice.org',
    year_founded: 2020,
    created_at: new Date('2024-03-01').toISOString(),
    updated_at: new Date('2024-10-10').toISOString(),
  },
];

export const mockGrants = [
  {
    id: 'grant-001',
    donor_id: 'donor-001',
    recipient_id: '550e8400-e29b-41d4-a716-446655440001',
    amount: 250000,
    year: 2024,
    confirmed: true,
    source_file: 'irs_990_2024.pdf',
  },
  {
    id: 'grant-002',
    donor_id: 'donor-002',
    recipient_id: '550e8400-e29b-41d4-a716-446655440001',
    amount: 100000,
    year: 2024,
    confirmed: true,
    source_file: 'foundation_report_2024.pdf',
  },
  {
    id: 'grant-003',
    donor_id: 'donor-001',
    recipient_id: '550e8400-e29b-41d4-a716-446655440002',
    amount: 500000,
    year: 2024,
    confirmed: true,
    source_file: 'irs_990_2024.pdf',
  },
];

export const mockRiskScores = [
  {
    id: 'risk-001',
    org_id: '550e8400-e29b-41d4-a716-446655440001',
    year: 2024,
    score: 35.5,
    dependency_ratio: 0.42,
    transparency_index: 78.5,
  },
  {
    id: 'risk-002',
    org_id: '550e8400-e29b-41d4-a716-446655440002',
    year: 2024,
    score: 68.2,
    dependency_ratio: 0.85,
    transparency_index: 45.3,
  },
  {
    id: 'risk-003',
    org_id: '550e8400-e29b-41d4-a716-446655440003',
    year: 2024,
    score: 22.8,
    dependency_ratio: 0.15,
    transparency_index: 92.1,
  },
];

export const mockReports = [
  {
    id: 'report-001',
    org_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Community Health Foundation - 2024 Compliance Report',
    type: 'compliance_analysis',
    generated_at: new Date('2024-10-20').toISOString(),
    status: 'completed',
    summary: {
      total_grants: 2,
      total_funding: 350000,
      risk_level: 'low',
      key_findings: [
        'Diversified funding sources',
        'Strong transparency practices',
        'Moderate donor concentration',
      ],
    },
    data: {
      organization: mockOrganizations[0],
      grants: mockGrants.filter(g => g.recipient_id === '550e8400-e29b-41d4-a716-446655440001'),
      risk_score: mockRiskScores[0],
    },
  },
  {
    id: 'report-002',
    org_id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Education Access Initiative - 2024 Compliance Report',
    type: 'compliance_analysis',
    generated_at: new Date('2024-10-21').toISOString(),
    status: 'completed',
    summary: {
      total_grants: 1,
      total_funding: 500000,
      risk_level: 'high',
      key_findings: [
        'High donor concentration risk',
        'Single major funding source',
        'Transparency improvements needed',
      ],
    },
    data: {
      organization: mockOrganizations[1],
      grants: mockGrants.filter(g => g.recipient_id === '550e8400-e29b-41d4-a716-446655440002'),
      risk_score: mockRiskScores[1],
    },
  },
];

export const mockDonors = [
  {
    id: 'donor-001',
    name: 'Smith Family Foundation',
    type: 'foundation',
    sponsor: null,
    anonymity_flag: false,
  },
  {
    id: 'donor-002',
    name: 'Fidelity Charitable',
    type: 'daf',
    sponsor: 'Fidelity Investments',
    anonymity_flag: false,
  },
];

// Helper function to get organization with related data
export function getOrganizationWithRelations(orgId: string) {
  const organization = mockOrganizations.find(o => o.id === orgId);
  if (!organization) return null;

  const grants = mockGrants.filter(g => g.recipient_id === orgId);
  const riskScores = mockRiskScores.filter(r => r.org_id === orgId);

  return {
    ...organization,
    grants: grants.map(grant => ({
      ...grant,
      donor: mockDonors.find(d => d.id === grant.donor_id),
    })),
    risk_scores: riskScores,
  };
}
