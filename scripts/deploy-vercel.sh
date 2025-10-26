#!/bin/bash

# Deploy to Vercel Script
# Usage: ./scripts/deploy-vercel.sh [production|preview]

set -e

ENVIRONMENT=${1:-preview}

echo "🚀 Deploying to Vercel ($ENVIRONMENT)..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login check
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Deploy
if [ "$ENVIRONMENT" = "production" ]; then
    echo "📦 Building for production..."
    npm run build

    echo "🚀 Deploying to production..."
    vercel --prod
else
    echo "🚀 Deploying preview..."
    vercel
fi

echo "✅ Deployment complete!"
