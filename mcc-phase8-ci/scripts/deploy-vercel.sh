
#!/usr/bin/env bash
set -euo pipefail
ENV="${1:-preview}" # preview|production
: "${VERCEL_TOKEN:?Missing VERCEL_TOKEN}"
if [ "$ENV" = "production" ]; then
  npx vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
  npx vercel build --token="$VERCEL_TOKEN"
  npx vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN"
else
  npx vercel pull --yes --environment=preview --token="$VERCEL_TOKEN"
  npx vercel build --token="$VERCEL_TOKEN"
  npx vercel deploy --prebuilt --token="$VERCEL_TOKEN"
fi
