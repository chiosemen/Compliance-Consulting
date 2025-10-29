# setup-env.sh Usage Examples

## Quick Start

### First Time Setup

```bash
# Clone the repository
git clone <repository-url>
cd Compliance-Consulting

# Run the idempotent setup script
npm run setup:env

# Edit the generated .env file with your actual values
nano .env

# Verify the configuration
npm run setup:env
```

## Common Scenarios

### Scenario 1: New Developer Onboarding

```bash
# 1. Clone and navigate to project
git clone <repository-url>
cd Compliance-Consulting

# 2. Run setup script
npm run setup:env

# Output:
# ℹ Starting idempotent environment setup
# ℹ Target file: .env
# ✓ Created .env from .env.example
# ✓ Added NEXT_PUBLIC_SUPABASE_URL to .env
# ✓ Added NEXT_PUBLIC_SUPABASE_ANON_KEY to .env
# ✓ Environment setup completed successfully!

# 3. Update with your credentials
cat >> .env << EOF
NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-key
EOF

# 4. Run again to verify (idempotent - no changes needed)
npm run setup:env
```

### Scenario 2: Fixing Duplicate Keys

You accidentally added duplicate keys:

```bash
# Your .env file:
$ cat .env
NEXT_PUBLIC_API_BASE_URL=https://api1.example.com
NEXT_PUBLIC_SUPABASE_URL=https://project1.supabase.co
NEXT_PUBLIC_API_BASE_URL=https://api2.example.com
NEXT_PUBLIC_SUPABASE_URL=https://project2.supabase.co

# Run the setup script
$ npm run setup:env

# Output:
# ⚠ Removed duplicate keys from .env
# ✓ Environment setup completed successfully!

# Result:
$ cat .env
NEXT_PUBLIC_API_BASE_URL=https://api1.example.com
NEXT_PUBLIC_SUPABASE_URL=https://project1.supabase.co
# DUPLICATE REMOVED: NEXT_PUBLIC_API_BASE_URL=https://api2.example.com
# DUPLICATE REMOVED: NEXT_PUBLIC_SUPABASE_URL=https://project2.supabase.co
```

### Scenario 3: Multiple Environment Files

```bash
# Setup local development
./scripts/setup-env.sh .env.local

# Setup staging
./scripts/setup-env.sh .env.staging

# Setup production
./scripts/setup-env.sh .env.production

# Each file gets the required keys with defaults
# You can then customize each file for its environment
```

### Scenario 4: CI/CD Integration

**GitHub Actions Example:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Setup environment
        run: |
          # Create .env.production from script
          npm run setup:env .env.production

          # Override with CI secrets
          echo "NEXT_PUBLIC_API_BASE_URL=${{ secrets.PROD_API_URL }}" >> .env.production
          echo "NEXT_PUBLIC_SUPABASE_URL=${{ secrets.PROD_SUPABASE_URL }}" >> .env.production
          echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.PROD_SUPABASE_KEY }}" >> .env.production

          # Verify no duplicates (idempotent check)
          npm run setup:env .env.production

      - name: Build
        run: npm run build

      - name: Deploy
        run: npm run deploy
```

### Scenario 5: Programmatic Updates

Create a custom script that uses the setup functions:

```bash
#!/usr/bin/env bash
# scripts/update-feature-flags.sh

# Source the setup script to use its functions
source "$(dirname "$0")/setup-env.sh"

# Update feature flags based on environment
ENVIRONMENT="${1:-development}"
ENV_FILE=".env.${ENVIRONMENT}"

log_info "Updating feature flags for $ENVIRONMENT"

# Set feature flags
set_env_var "FEATURE_NEW_DASHBOARD" "enabled" "$ENV_FILE" "New dashboard feature"
set_env_var "FEATURE_ADVANCED_REPORTS" "disabled" "$ENV_FILE" "Advanced reports (beta)"
set_env_var "FEATURE_API_V2" "enabled" "$ENV_FILE" "API v2 endpoints"

# Validate
validate_env_file "$ENV_FILE"

log_success "Feature flags updated for $ENVIRONMENT"
```

Usage:
```bash
chmod +x scripts/update-feature-flags.sh
./scripts/update-feature-flags.sh production
```

### Scenario 6: Pre-commit Hook

Ensure no duplicate keys before committing:

```bash
# .git/hooks/pre-commit
#!/usr/bin/env bash

echo "Checking environment files for duplicates..."

for env_file in .env .env.local .env.*.local; do
    if [[ -f "$env_file" ]]; then
        echo "Checking $env_file..."

        # Run setup script in check mode
        if ! ./scripts/setup-env.sh "$env_file" > /dev/null 2>&1; then
            echo "❌ Environment file $env_file has issues"
            echo "Run: ./scripts/setup-env.sh $env_file"
            exit 1
        fi
    fi
done

echo "✅ All environment files are valid"
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### Scenario 7: Docker Integration

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Setup environment during build
RUN npm run setup:env

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./.env:/app/.env:ro
    environment:
      - NODE_ENV=production
    command: >
      sh -c "
        npm run setup:env &&
        npm start
      "
```

### Scenario 8: Testing Different Configurations

```bash
# Test with minimal config
cat > .env.minimal << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
EOF

npm run setup:env .env.minimal
# Script adds missing required keys

# Test with custom config
cat > .env.custom << EOF
NEXT_PUBLIC_API_BASE_URL=https://api.staging.example.com
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-key
CUSTOM_FEATURE_FLAG=enabled
EOF

npm run setup:env .env.custom
# Script validates and preserves custom keys

# Test with duplicates
cat > .env.duplicates << EOF
KEY1=value1
KEY2=value2
KEY1=duplicate1
KEY3=value3
KEY1=duplicate2
EOF

npm run setup:env .env.duplicates
# Script removes duplicates, keeping first occurrence
```

## Verifying Idempotency

Run this test to verify idempotent behavior:

```bash
#!/usr/bin/env bash

echo "Testing idempotency..."

# Create initial file
./scripts/setup-env.sh .env.test

# Get checksum
hash1=$(md5 -q .env.test 2>/dev/null || md5sum .env.test | awk '{print $1}')

# Run again
./scripts/setup-env.sh .env.test
hash2=$(md5 -q .env.test 2>/dev/null || md5sum .env.test | awk '{print $1}')

# Run third time
./scripts/setup-env.sh .env.test
hash3=$(md5 -q .env.test 2>/dev/null || md5sum .env.test | awk '{print $1}')

# Compare
if [[ "$hash1" == "$hash2" ]] && [[ "$hash2" == "$hash3" ]]; then
    echo "✅ Idempotency test PASSED"
    echo "   All three runs produced identical output"
else
    echo "❌ Idempotency test FAILED"
    echo "   Run 1: $hash1"
    echo "   Run 2: $hash2"
    echo "   Run 3: $hash3"
fi

# Cleanup
rm -f .env.test
```

## Advanced Usage: Sourcing Functions

You can source the script to use its functions in other scripts:

```bash
#!/usr/bin/env bash

# Source the setup script
source scripts/setup-env.sh

# Use functions directly
ENV_FILE=".env.local"

# Check if a key exists
if key_exists "DATABASE_URL" "$ENV_FILE"; then
    echo "Database is configured"
else
    echo "Database not configured"
fi

# Get current value
api_url=$(get_value "NEXT_PUBLIC_API_BASE_URL" "$ENV_FILE")
echo "Current API: $api_url"

# Update value
set_env_var "NEXT_PUBLIC_API_BASE_URL" "https://new-api.example.com" "$ENV_FILE"

# Deduplicate
deduplicate_env_file "$ENV_FILE"

# Validate
if validate_env_file "$ENV_FILE"; then
    echo "Configuration is valid"
fi
```

## Troubleshooting Examples

### Problem: Script doesn't run

```bash
# Solution: Make it executable
chmod +x scripts/setup-env.sh

# Or use bash directly
bash scripts/setup-env.sh
```

### Problem: Values keep getting reset

```bash
# The script preserves existing non-empty values
# Check if your value is actually set:
grep "YOUR_KEY" .env

# If it shows YOUR_KEY=, the value is empty
# Edit manually:
echo "YOUR_KEY=your-actual-value" >> .env

# Then verify:
npm run setup:env
```

### Problem: Can't find the script

```bash
# Make sure you're in the project root
pwd

# Should show: /path/to/Compliance-Consulting

# If not, navigate there:
cd /path/to/Compliance-Consulting

# Then run:
npm run setup:env
```

## Best Practices from Examples

1. **Always run after cloning** - First command after `git clone`
2. **Run before committing** - Validate your .env files
3. **Use in CI/CD** - Ensure consistent environment setup
4. **Run periodically** - Catch and fix duplicates early
5. **Test with .env.test** - Don't risk your actual .env file
6. **Source for reuse** - Use functions in custom scripts
7. **Document custom keys** - Add comments to required_keys array

## Summary

The `setup-env.sh` script is designed to be:
- **Safe**: Won't break existing configs
- **Idempotent**: Same result every time
- **Flexible**: Works with any .env file
- **Validated**: Catches common mistakes
- **Documented**: Clear output and logging

Run it freely - it's designed to help, not harm!
