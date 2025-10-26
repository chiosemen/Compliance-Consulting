'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/auth'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole | UserRole[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { hasRole } = useAuth()

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
