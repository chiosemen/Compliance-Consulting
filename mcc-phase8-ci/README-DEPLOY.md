
# Phase 8 — CI/CD: GitHub Actions + Vercel

## Setup
1) Vercel → Create project, link repo.
2) Copy IDs to GitHub → Settings → Secrets → Actions:
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID

## Workflows
- .github/workflows/ci.yml — lint, typecheck, build on push/PR.
- .github/workflows/deploy.yml — PR preview deploys, main → prod.

## Scripts
- scripts/setup-env.sh
- scripts/deploy-vercel.sh [preview|production]
- scripts/check-deployment.sh <url>

## Local Dev
npm i && cp .env.example .env.local && npm run dev
