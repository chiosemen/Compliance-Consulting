#!/bin/bash

# Deployment Health Check Script
# Usage: ./scripts/check-deployment.sh

set -e

echo "🏥 Checking deployment health..."
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check Frontend
if [ -n "$NEXT_PUBLIC_APP_URL" ]; then
    echo "🌐 Checking frontend at $NEXT_PUBLIC_APP_URL..."
    if curl -f -s -o /dev/null "$NEXT_PUBLIC_APP_URL"; then
        echo "✅ Frontend is up!"
    else
        echo "❌ Frontend is down!"
    fi
else
    echo "⚠️  NEXT_PUBLIC_APP_URL not set, skipping frontend check"
fi

echo ""

# Check Backend
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
    echo "🔌 Checking backend at $NEXT_PUBLIC_API_URL/health..."
    if curl -f -s -o /dev/null "$NEXT_PUBLIC_API_URL/health"; then
        echo "✅ Backend is up!"
    else
        echo "❌ Backend is down!"
    fi
else
    echo "⚠️  NEXT_PUBLIC_API_URL not set, skipping backend check"
fi

echo ""

# Check Supabase
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "💾 Checking Supabase at $NEXT_PUBLIC_SUPABASE_URL..."
    if curl -f -s -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" > /dev/null; then
        echo "✅ Supabase is up!"
    else
        echo "❌ Supabase connection failed!"
    fi
else
    echo "⚠️  Supabase credentials not set, skipping database check"
fi

echo ""
echo "🎉 Health check complete!"
