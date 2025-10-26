import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Note: For full server-side authentication in middleware, install @supabase/auth-helpers-nextjs
// This version relies primarily on client-side ProtectedRoute components
// Combined with database RLS policies for true security enforcement

export function middleware(req: NextRequest) {
  // Protected routes are handled by ProtectedRoute component on the client side
  // Database RLS policies provide the actual security enforcement
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/clients/:path*',
    '/assessments/:path*',
  ],
}
