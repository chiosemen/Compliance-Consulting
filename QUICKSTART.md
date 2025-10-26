# Quick Start Guide - MCC Platform

## 🎯 Phase 8: CI/CD + Deployment Configuration

This guide will help you quickly set up and deploy the MCC Platform.

---

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 18.x or higher installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] GitHub account with repository access
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Render account (sign up at https://render.com)
- [ ] Supabase account (sign up at https://supabase.com)

---

## 🚀 5-Minute Setup

### Step 1: Clone & Install (1 min)

```bash
# Clone repository
git clone <your-repo-url>
cd Compliance-Consulting

# Install dependencies (when package.json is ready)
npm install
```

### Step 2: Supabase Setup (2 min)

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details and wait for provisioning
4. Copy your credentials:
   - Project URL → Settings > API > Project URL
   - Anon Key → Settings > API > anon public
   - Service Role Key → Settings > API > service_role

### Step 3: Environment Setup (1 min)

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local  # or use your preferred editor
```

### Step 4: Deploy to Vercel (1 min)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Follow the prompts to link your project.

---

## 🔐 Environment Variables Setup

### For Vercel (Frontend)

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` | Production |

### For Render (Backend)

Add these in Render Dashboard → Your Service → Environment:

```
NODE_ENV=production
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
PORT=10000
CORS_ORIGIN=<your-vercel-app-url>
```

---

## 🔄 GitHub Actions Setup

### Required GitHub Secrets

Add these in: GitHub Repo → Settings → Secrets and variables → Actions

```bash
# Vercel
VERCEL_TOKEN              # Get from: vercel.com/account/tokens
VERCEL_ORG_ID            # From: vercel.com/<org>/settings
VERCEL_PROJECT_ID        # From: Project Settings → General

# Render
RENDER_DEPLOY_HOOK_URL   # From: Service → Settings → Deploy Hook

# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### How to Get These Secrets

#### Vercel Token
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a name and click "Create"
4. Copy the token (you won't see it again!)

#### Vercel IDs
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Get IDs from .vercel/project.json
cat .vercel/project.json
```

#### Render Deploy Hook
1. Go to your Render service dashboard
2. Settings → Build & Deploy
3. Scroll to "Deploy Hooks"
4. Click "Create Deploy Hook"
5. Copy the URL

---

## 📁 Project Structure

```
Compliance-Consulting/
├── .github/
│   └── workflows/
│       ├── ci.yml          # Continuous Integration
│       └── deploy.yml      # Production Deployment
├── scripts/
│   ├── deploy-vercel.sh    # Vercel deployment helper
│   ├── setup-env.sh        # Environment setup
│   └── check-deployment.sh # Health check script
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── vercel.json             # Vercel configuration
├── render.yaml             # Render configuration
├── docker-compose.yml      # Local development
├── Dockerfile.frontend     # Frontend container
├── Dockerfile.backend      # Backend container
├── DEPLOYMENT.md           # Detailed deployment guide
└── README.md               # Project overview
```

---

## 🎬 Deployment Workflow

### Automatic Deployment (Recommended)

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - Run tests and linting
   - Build the application
   - Deploy frontend to Vercel
   - Deploy backend to Render

3. **Monitor deployment:**
   - GitHub: Actions tab
   - Vercel: Dashboard → Deployments
   - Render: Service → Events

### Manual Deployment

#### Frontend (Vercel)
```bash
# Using script
./scripts/deploy-vercel.sh production

# Or using CLI directly
vercel --prod
```

#### Backend (Render)
```bash
# Trigger deploy hook
curl -X POST $RENDER_DEPLOY_HOOK_URL
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend is accessible at your Vercel URL
- [ ] Backend health endpoint responds: `<backend-url>/health`
- [ ] Database connection works (check logs)
- [ ] Environment variables are set correctly
- [ ] GitHub Actions workflow completed successfully
- [ ] No errors in deployment logs

### Quick Health Check
```bash
# Make script executable
chmod +x scripts/check-deployment.sh

# Run health check
./scripts/check-deployment.sh
```

---

## 🐛 Common Issues & Solutions

### Build Fails on Vercel
```
Error: Missing environment variables
```
**Solution**: Add all required env vars in Vercel dashboard

### Render Service Won't Start
```
Error: Cannot find module
```
**Solution**: Ensure `package.json` has correct start command

### Database Connection Failed
```
Error: Connection refused
```
**Solution**: Verify Supabase URL and keys are correct

### GitHub Actions Fails
```
Error: VERCEL_TOKEN not found
```
**Solution**: Add required secrets to GitHub repository

---

## 📊 Monitoring & Logs

### View Logs

**Vercel:**
```bash
vercel logs <deployment-url>
```

**Render:**
- Dashboard → Your Service → Logs

**Supabase:**
- Dashboard → Logs → Postgres Logs

### Set Up Alerts

1. **Vercel**: Dashboard → Settings → Notifications
2. **Render**: Service → Settings → Notifications
3. **Supabase**: Dashboard → Settings → Notifications

---

## 🚦 Next Steps

After successful deployment:

1. [ ] Configure custom domain (optional)
2. [ ] Set up monitoring and alerts
3. [ ] Configure database backups
4. [ ] Set up error tracking (Sentry, etc.)
5. [ ] Enable CDN caching
6. [ ] Configure email service
7. [ ] Set up analytics
8. [ ] Create staging environment

---

## 📞 Getting Help

- **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **GitHub Issues**: Open an issue in the repository
- **Vercel Support**: https://vercel.com/support
- **Render Support**: https://render.com/docs
- **Supabase Support**: https://supabase.com/docs

---

## 🎉 Success!

If you've completed all steps, your MCC Platform is now deployed!

**Your app should be live at:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

Congratulations! 🎊

---

**Last Updated**: 2025-10-26
