'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { RoleGuard } from '@/components/RoleGuard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Compliance Consulting</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {profile?.email}
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {profile?.role}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Welcome back, {profile?.full_name || 'User'}
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RoleGuard allowedRoles="owner">
            <Link
              href="/admin/users"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-gray-600">
                Manage user roles and permissions
              </p>
            </Link>
          </RoleGuard>

          <RoleGuard allowedRoles={['owner', 'analyst']}>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-3xl mb-4">🏢</div>
              <h3 className="text-lg font-semibold mb-2">Clients</h3>
              <p className="text-gray-600">
                View and manage client information
              </p>
            </div>
          </RoleGuard>

          <RoleGuard allowedRoles={['owner', 'analyst']}>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">Assessments</h3>
              <p className="text-gray-600">
                Create and manage assessments
              </p>
            </div>
          </RoleGuard>

          <RoleGuard allowedRoles="client">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">My Assessments</h3>
              <p className="text-gray-600">
                View assessments assigned to you
              </p>
            </div>
          </RoleGuard>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-gray-600">
              Manage your account settings
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">Reports</h3>
            <p className="text-gray-600">
              View reports and analytics
            </p>
          </div>
        </div>

        {/* Role Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Your Access Level</h3>
          <p className="text-blue-800">
            {profile?.role === 'owner' &&
              'As an Owner, you have full access to all features including user management.'}
            {profile?.role === 'analyst' &&
              'As an Analyst, you can view and manage all clients and assessments.'}
            {profile?.role === 'client' &&
              'As a Client, you can view assessments assigned to you.'}
          </p>
        </div>
      </div>
    </div>
  )
}
