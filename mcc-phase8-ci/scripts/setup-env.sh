
#!/usr/bin/env bash
set -euo pipefail
[ -f .env.local ] || cp .env.example .env.local 2>/dev/null || touch .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=" >> .env.local
echo "✔ .env.local prepared. Edit values as needed."
