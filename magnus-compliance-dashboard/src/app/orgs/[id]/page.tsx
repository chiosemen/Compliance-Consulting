'use client';

import { useState, useEffect, useCallback } from 'react';
import ReportModal from '@/components/ReportModal';
import { useParams } from 'next/navigation';

interface Organization {
  id: string;
  name: string;
  ein?: string;
  mission?: string;
  website?: string;
  year_founded?: number;
}

interface Grant {
  id: string;
  amount: number;
  year: number;
}

interface RiskScore {
  score: number;
  dependency_ratio: number;
  transparency_index: number;
  year: number;
}

export default function OrgPage() {
  const params = useParams();
  const id = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<
    'compliance_analysis' | 'risk_assessment' | 'donor_analysis'
  >('compliance_analysis');

  const fetchOrganization = useCallback(async () => {
    try {
      const response = await fetch(`/api/orgs/${id}`);
      const result = await response.json();

      if (result.success) {
        setOrganization(result.data.organization);
        setGrants(result.data.grants || []);
        setRiskScore(result.data.risk_score);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const handleGenerateReport = (
    type: 'compliance_analysis' | 'risk_assessment' | 'donor_analysis'
  ) => {
    setSelectedReportType(type);
    setShowReportModal(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Organization not found</p>
        </div>
      </div>
    );
  }

  const totalFunding = grants.reduce((sum, grant) => sum + grant.amount, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {organization.name}
        </h1>
        {organization.ein && (
          <p className="text-slate-600">EIN: {organization.ein}</p>
        )}
      </div>

      {/* Report Generation Buttons */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Generate Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleGenerateReport('compliance_analysis')}
            className="flex flex-col items-start p-4 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
          >
            <svg
              className="w-8 h-8 text-sky-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="font-semibold text-slate-900">Compliance Analysis</h3>
            <p className="text-sm text-slate-600 mt-1">
              Full compliance review and analysis
            </p>
          </button>

          <button
            onClick={() => handleGenerateReport('risk_assessment')}
            className="flex flex-col items-start p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
          >
            <svg
              className="w-8 h-8 text-amber-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="font-semibold text-slate-900">Risk Assessment</h3>
            <p className="text-sm text-slate-600 mt-1">
              Detailed risk scoring and metrics
            </p>
          </button>

          <button
            onClick={() => handleGenerateReport('donor_analysis')}
            className="flex flex-col items-start p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
          >
            <svg
              className="w-8 h-8 text-purple-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="font-semibold text-slate-900">Donor Analysis</h3>
            <p className="text-sm text-slate-600 mt-1">
              Donor dependency and funding sources
            </p>
          </button>
        </div>
      </div>

      {/* Organization Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Organization Details */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Organization Details
          </h2>
          <div className="space-y-3">
            {organization.mission && (
              <div>
                <p className="text-sm text-slate-600 font-medium">Mission</p>
                <p className="text-slate-900">{organization.mission}</p>
              </div>
            )}
            {organization.website && (
              <div>
                <p className="text-sm text-slate-600 font-medium">Website</p>
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline"
                >
                  {organization.website}
                </a>
              </div>
            )}
            {organization.year_founded && (
              <div>
                <p className="text-sm text-slate-600 font-medium">Founded</p>
                <p className="text-slate-900">{organization.year_founded}</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Financial Summary
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Grants</p>
              <p className="text-2xl font-bold text-slate-900">{grants.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Funding</p>
              <p className="text-2xl font-bold text-slate-900">
                ${totalFunding.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Score */}
      {riskScore && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Risk Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 font-medium">Risk Score</p>
              <p className="text-3xl font-bold text-slate-900">
                {riskScore.score.toFixed(1)}
                <span className="text-base text-slate-600">/100</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">
                Donor Dependency
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {(riskScore.dependency_ratio * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">
                Transparency Index
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {riskScore.transparency_index.toFixed(1)}
                <span className="text-base text-slate-600">/100</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grants List */}
      {grants.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Recent Grants
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">
                    Year
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">
                    Grant ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {grants.map((grant) => (
                  <tr key={grant.id} className="border-b border-slate-100">
                    <td className="py-3 px-4 text-slate-900">{grant.year}</td>
                    <td className="py-3 px-4 text-slate-900">
                      ${grant.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-sm">
                      {grant.id.substring(0, 20)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        orgId={id}
        orgName={organization.name}
        reportType={selectedReportType}
      />
    </div>
  );
}
