#!/bin/bash

# Environment Setup Script
# This script helps set up environment variables for local development

set -e

echo "🔧 Setting up environment variables..."

# Check if .env.local already exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled."
        exit 0
    fi
fi

# Copy example file
if [ -f .env.example ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
else
    echo "❌ .env.example not found!"
    exit 1
fi

echo ""
echo "📝 Please edit .env.local and add your actual values:"
echo ""
echo "  1. Get Supabase credentials from: https://app.supabase.com"
echo "  2. Generate NEXTAUTH_SECRET: openssl rand -base64 32"
echo "  3. Update API URLs when deployed"
echo ""
echo "After updating, run: npm run dev"
echo ""
