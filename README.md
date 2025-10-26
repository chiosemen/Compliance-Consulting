# Compliance Consulting Platform

A comprehensive compliance and risk assessment management system with role-based access control.

## Features

- **Role-Based Access Control (RBAC)**: Three user roles with distinct permissions
  - **Owner**: Full admin access, user management
  - **Analyst**: Client and assessment management
  - **Client**: View-only access to assigned assessments

- **Row-Level Security (RLS)**: Database-enforced security policies
- **User Management**: Admin panel for managing user roles
- **Type-Safe**: Full TypeScript implementation
- **Modern Stack**: Next.js 14, React 18, Supabase, Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Supabase credentials.

4. Run database migrations (see [SETUP.md](SETUP.md))

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Visit http://localhost:3000

## Documentation

- **[SETUP.md](SETUP.md)**: Complete setup instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Technical architecture details

## Project Structure

```
/app                    # Next.js app directory
  /admin/users         # User management (Owner only)
  /dashboard           # Main dashboard
  /login              # Authentication
  /register           # Registration
/components            # React components
  ProtectedRoute.tsx  # Route protection
  RoleGuard.tsx       # Role-based UI guards
/contexts              # React contexts
  AuthContext.tsx     # Authentication state
/lib                   # Utilities and APIs
  /api               # API functions
  /supabase          # Supabase client
/supabase              # Database migrations
  /migrations        # SQL migration files
/types                 # TypeScript type definitions
```

## Security

Security is implemented at multiple layers:

1. **UI Layer**: RoleGuard components for UX
2. **Route Protection**: ProtectedRoute components
3. **Client-Side Auth**: useRequireAuth hooks
4. **Database RLS**: Supabase Row-Level Security policies (critical layer)

The database RLS policies ensure security even if the frontend is bypassed.

## User Roles

| Role | Permissions |
|------|-------------|
| Owner | Full access, user management, all CRUD operations |
| Analyst | View all, create/update resources, manage assigned assessments |
| Client | View only assigned resources, read-only access |

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Row-Level Security

## License

Private - All rights reserved

## Support

For detailed setup instructions, see [SETUP.md](SETUP.md).

For architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md).
