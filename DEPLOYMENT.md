# Deployment Guide - MCC Platform

## Overview

This document describes the deployment architecture and process for the Medical Compliance Consulting (MCC) platform.

### Architecture

- **Frontend**: Next.js application deployed on Vercel
- **Backend**: Node.js API deployed on Render
- **Database**: PostgreSQL managed by Supabase
- **CI/CD**: GitHub Actions

---

## Prerequisites

1. **Accounts Required**:
   - [Vercel Account](https://vercel.com)
   - [Render Account](https://render.com)
   - [Supabase Account](https://supabase.com)
   - GitHub repository access

2. **CLI Tools** (for local deployment):
   - Node.js 18.x or higher
   - npm or yarn
   - Vercel CLI: `npm install -g vercel`

---

## Environment Variables

### Required Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com

# Authentication
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here
```

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## Supabase Setup

### 1. Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for database provisioning

### 2. Get API Keys

1. Navigate to Settings > API
2. Copy the following:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## Vercel Deployment (Frontend)

### Option 1: Vercel Dashboard (Recommended)

1. **Import Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `./` (or your frontend directory)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables**:
   - Add all variables from `.env.example`
   - Mark `NEXT_PUBLIC_*` variables as exposed to client

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or deploy with environment variables
vercel --prod \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Environment Variables in Vercel

Set these in Vercel Dashboard → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

---

## Render Deployment (Backend)

### 1. Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `mcc-backend-api`
   - **Environment**: Node
   - **Region**: Oregon (or closest to your users)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free or Starter

### 2. Environment Variables

Add in Render Dashboard → Environment:

```
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=10000
CORS_ORIGIN=https://your-app.vercel.app
```

### 3. Auto-Deploy from GitHub

Render will automatically deploy when you push to the `main` branch.

### 4. Get Deploy Hook (for CI/CD)

1. Settings → Build & Deploy
2. Copy the "Deploy Hook URL"
3. Add to GitHub Secrets as `RENDER_DEPLOY_HOOK_URL`

---

## GitHub Actions CI/CD

### Required GitHub Secrets

Add these in GitHub Repository → Settings → Secrets and variables → Actions:

```
VERCEL_TOKEN              # From Vercel Account Settings → Tokens
VERCEL_ORG_ID            # From Vercel Project Settings
VERCEL_PROJECT_ID        # From Vercel Project Settings
RENDER_DEPLOY_HOOK_URL   # From Render Service Settings
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Workflows

1. **`ci.yml`**: Runs on all pushes - builds the application
2. **`deploy.yml`**: Runs on main branch - deploys to production

### Manual Deployment Trigger

```bash
# Trigger via GitHub CLI
gh workflow run deploy.yml

# Or use the GitHub Actions tab in your repository
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Database migrations are up to date
- [ ] All environment variables are configured
- [ ] Application builds successfully locally
- [ ] Tests pass (if applicable)

### Supabase

- [ ] Project created
- [ ] Database schema migrated
- [ ] Row Level Security (RLS) policies configured
- [ ] API keys copied to environment variables

### Vercel

- [ ] Repository imported
- [ ] Environment variables set
- [ ] Build completes successfully
- [ ] Domain configured (optional)

### Render

- [ ] Web service created
- [ ] Environment variables set
- [ ] Health check endpoint configured
- [ ] Deploy hook URL added to GitHub secrets

### GitHub Actions

- [ ] Secrets configured in repository
- [ ] Workflows triggered on push to main
- [ ] Build and deploy steps passing

---

## Post-Deployment

### 1. Verify Deployments

**Frontend**:
```bash
curl https://your-app.vercel.app
```

**Backend**:
```bash
curl https://your-backend.onrender.com/health
```

### 2. Monitor Logs

- **Vercel**: Dashboard → Project → Deployments → View Function Logs
- **Render**: Dashboard → Service → Logs
- **Supabase**: Dashboard → Database → Logs

### 3. Set Up Custom Domain (Optional)

**Vercel**:
1. Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

**Render**:
1. Settings → Custom Domain
2. Add your domain
3. Update DNS records

---

## Rollback Procedures

### Vercel Rollback

1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Render Rollback

1. Manual Deploys → Deploy History
2. Select previous deployment
3. Click "Rollback to this version"

### Database Rollback

```bash
# Using Supabase CLI
supabase db reset --linked
```

---

## Troubleshooting

### Build Failures

**Vercel**:
- Check build logs in deployment details
- Verify all environment variables are set
- Ensure dependencies are in `package.json`

**Render**:
- Check build logs in service dashboard
- Verify Node.js version compatibility
- Check for missing environment variables

### Runtime Errors

1. **Check Logs**: Always start with application logs
2. **Environment Variables**: Verify all required vars are set
3. **Database Connection**: Test Supabase connectivity
4. **CORS Issues**: Update CORS_ORIGIN in backend

### Database Issues

```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"

# Check database health
supabase status
```

---

## Performance Optimization

### Vercel

- Enable Edge Functions for API routes
- Configure caching headers
- Use Image Optimization
- Enable Analytics

### Render

- Upgrade to paid plan for always-on instances
- Enable persistent disk for uploads
- Configure health check endpoint
- Use Redis for caching (optional)

### Supabase

- Create database indexes for frequently queried fields
- Enable connection pooling
- Use prepared statements
- Monitor query performance

---

## Security Best Practices

1. **Never commit** `.env` files to git
2. **Rotate secrets** regularly
3. **Use service role key** only in backend
4. **Enable RLS** on all Supabase tables
5. **Set up CORS** properly
6. **Use HTTPS** for all endpoints
7. **Enable 2FA** on all deployment accounts

---

## Monitoring & Alerts

### Vercel

- Set up deployment notifications
- Enable Web Analytics
- Configure custom alerts

### Render

- Enable health checks
- Set up failure notifications
- Monitor resource usage

### Supabase

- Monitor database performance
- Set up query alerts
- Track API usage

---

## Cost Estimation

### Free Tier Limits

- **Vercel**: 100GB bandwidth, 100 hours build time/month
- **Render**: 750 hours/month, sleeps after 15 min inactivity
- **Supabase**: 500MB database, 2GB file storage, 5GB bandwidth

### Paid Plans (Starting)

- **Vercel Pro**: $20/month
- **Render Starter**: $7/month per service
- **Supabase Pro**: $25/month

---

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod

# Run database migrations
supabase db push

# View Supabase logs
supabase logs
```

---

**Last Updated**: 2025-10-26
