
#!/usr/bin/env bash
set -euo pipefail
URL="${1:-https://example.vercel.app}"
code=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
[ "$code" = "200" ] && echo "✅ Healthy (200 OK)" || (echo "❌ Status $code"; exit 1)
