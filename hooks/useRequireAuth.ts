'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/auth'

export function useRequireAuth(requiredRoles?: UserRole | UserRole[]) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // If no user, redirect to login
      if (!user) {
        router.push('/login')
        return
      }

      // If required roles are specified, check if user has permission
      if (requiredRoles && profile) {
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
        if (!roles.includes(profile.role)) {
          router.push('/unauthorized')
          return
        }
      }
    }
  }, [user, profile, loading, requiredRoles, router])

  return { user, profile, loading }
}
