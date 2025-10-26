# Compliance Consulting - Setup Guide

## Phase 7: Admin & Access Control

This application implements a comprehensive role-based access control (RBAC) system with three user roles: **Owner**, **Analyst**, and **Client**.

## Features

- **Row-Level Security (RLS)**: All database tables are protected with Supabase RLS policies
- **Role-Based Access Control**: Three distinct roles with different permissions
- **Admin User Management**: Owners can manage user roles through the /admin/users page
- **Route Guards**: Frontend and middleware-based route protection
- **Type Safety**: Full TypeScript support

## User Roles

### Owner
- Full access to all features
- Can manage user roles (promote/demote users)
- Can create, read, update, and delete all resources
- Access to the Admin panel at `/admin/users`

### Analyst
- Can view all clients and assessments
- Can create and update clients and assessments
- Can update assessments assigned to them
- Cannot delete resources or manage user roles

### Client
- Can only view clients and assessments assigned to them
- Read-only access to their assigned resources
- Cannot create, update, or delete any resources

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project

## Installation

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env.local` file:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Database Migrations

In your Supabase project dashboard:

1. Go to the SQL Editor
2. Run the migrations in order:

#### Step 1: Run `supabase/migrations/001_initial_schema.sql`
This creates:
- User roles enum (owner, analyst, client)
- Profiles table
- Clients table
- Assessments table
- Automatic profile creation trigger
- Timestamp update triggers

#### Step 2: Run `supabase/migrations/002_enable_rls.sql`
This enables Row-Level Security and creates policies for:
- Profiles (view own, owners view all, role management)
- Clients (role-based viewing and management)
- Assessments (role-based viewing and assignment)

### 4. Create Your First Owner Account

After running migrations:

1. Start the development server:
```bash
npm run dev
```

2. Register a new account at http://localhost:3000/register
3. The account will be created with the default 'client' role
4. In Supabase dashboard, go to Table Editor > profiles
5. Find your user and change the role from 'client' to 'owner'

Alternatively, run this SQL in Supabase SQL Editor (replace the email):

```sql
UPDATE profiles
SET role = 'owner'
WHERE email = 'your-email@example.com';
```

## Usage

### Access the Application

1. **Home Page**: http://localhost:3000
2. **Login**: http://localhost:3000/login
3. **Register**: http://localhost:3000/register
4. **Dashboard**: http://localhost:3000/dashboard
5. **Admin Users**: http://localhost:3000/admin/users (Owner only)

### Managing User Roles

1. Log in as an Owner
2. Navigate to http://localhost:3000/admin/users
3. View all users and their current roles
4. Use the dropdown to change any user's role
5. Changes take effect immediately

### Route Protection

Routes are protected at multiple levels:

1. **Component Level**: Using `<ProtectedRoute>` component
2. **Hook Level**: Using `useRequireAuth()` hook
3. **Context Level**: Using `useAuth()` context and `hasRole()` function
4. **UI Level**: Using `<RoleGuard>` component to conditionally show/hide UI elements

## Project Structure

```
/app
  /admin
    /users          # Admin user management page (Owner only)
      page.tsx
  /dashboard        # Main dashboard (All authenticated users)
    page.tsx
  /login           # Login page
    page.tsx
  /register        # Registration page
    page.tsx
  /unauthorized    # 403 page
    page.tsx
  layout.tsx       # Root layout with AuthProvider
  page.tsx         # Home page
  globals.css      # Global styles

/components
  ProtectedRoute.tsx   # Route protection wrapper
  RoleGuard.tsx        # Conditional rendering based on role

/contexts
  AuthContext.tsx      # Authentication context and hooks

/hooks
  useRequireAuth.ts    # Auth requirement hook

/lib
  /api
    profiles.ts        # Profile management API
  /supabase
    client.ts          # Supabase client instance
    database.types.ts  # Database type definitions

/supabase
  /migrations
    001_initial_schema.sql  # Database schema
    002_enable_rls.sql      # RLS policies

/types
  auth.ts             # Auth type definitions

middleware.ts         # Route middleware
```

## Database Schema

### profiles
- `id`: UUID (references auth.users)
- `email`: TEXT
- `full_name`: TEXT
- `role`: user_role enum (owner, analyst, client)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### clients
- `id`: UUID
- `name`: TEXT
- `industry`: TEXT
- `contact_email`: TEXT
- `created_by`: UUID (references profiles)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### assessments
- `id`: UUID
- `client_id`: UUID (references clients)
- `title`: TEXT
- `description`: TEXT
- `status`: TEXT (draft, in_progress, completed)
- `assigned_to`: UUID (references profiles)
- `created_by`: UUID (references profiles)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## RLS Policies Summary

### Profiles Table
- Users can view their own profile
- Owners and Analysts can view all profiles
- Users can update their own profile (except role)
- Owners can update any profile including roles

### Clients Table
- Owners and Analysts can view all clients
- Clients can view clients assigned to them (via assessments)
- Owners and Analysts can create/update clients
- Only Owners can delete clients

### Assessments Table
- Owners and Analysts can view all assessments
- Clients can view assessments assigned to them
- Owners and Analysts can create/update assessments
- Analysts can update assessments assigned to them
- Only Owners can delete assessments

## Testing Access Control

### Test as Owner
1. Create an account and promote to Owner (see step 4 above)
2. Access `/admin/users` - should work
3. View all users and change roles
4. Create/edit/delete any resource

### Test as Analyst
1. Create a second account
2. Log in as Owner and change the second account to 'analyst'
3. Log in as the analyst
4. Should see dashboard but not `/admin/users`
5. Can view and manage clients/assessments

### Test as Client
1. Create a third account (default role is 'client')
2. Log in as the client
3. Should see dashboard with limited options
4. Can only view assigned assessments
5. Cannot access `/admin/users` (redirects to /unauthorized)

## Security Notes

1. **RLS is enabled** on all tables - database is protected even if frontend is bypassed
2. **Role checks** happen both frontend (UX) and backend (security)
3. **Automatic profile creation** on user signup via database trigger
4. **Type safety** throughout the application with TypeScript
5. **Environment variables** keep sensitive data secure

## Troubleshooting

### "User not authorized" errors
- Verify RLS policies are created correctly
- Check that your user has the correct role in the profiles table
- Ensure you're logged in

### Cannot access admin pages
- Confirm your role is 'owner' in the profiles table
- Clear browser cache and cookies
- Check browser console for errors

### Database connection errors
- Verify `.env.local` has correct Supabase credentials
- Check Supabase project is active
- Ensure anon key has proper permissions

## Next Steps

After setting up access control, you can:

1. Build out the Clients management page
2. Create the Assessments management system
3. Add reporting and analytics features
4. Implement email notifications
5. Add audit logging for compliance tracking

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Support

For issues or questions:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review Next.js documentation: https://nextjs.org/docs
3. Check the application logs in browser console and terminal
