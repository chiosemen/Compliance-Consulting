import AlertFeed from '@/components/AlertFeed';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Compliance Consulting
        </h1>
        <p className="text-gray-600">
          Monitor compliance alerts for nonprofit organizations in real-time
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <AlertFeed />
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">
          Alert Trigger Conditions
        </h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">📈</span>
            <div>
              <strong>DAF Ratio Increase:</strong> Triggers when the Donor-Advised Fund ratio increases by more than 20% year-over-year
            </div>
          </li>
          <li className="flex items-start">
            <span className="mr-2">👤</span>
            <div>
              <strong>Top Donor Concentration:</strong> Triggers when a single donor contributes more than 60% of total contributions
            </div>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📄</span>
            <div>
              <strong>Missing 990 Filings:</strong> Triggers when Form 990 has not been filed for more than 18 months
            </div>
          </li>
        </ul>
      </div>
    </main>
  );
}
