# Environment Setup Script Documentation

## Overview

The `setup-env.sh` script provides an **idempotent** way to manage environment variables in `.env` files. It can be run multiple times safely without creating duplicate keys or corrupting your configuration.

## Key Features

### 1. Idempotent Operations
- Running the script multiple times produces the same result
- No duplicate keys are ever created
- Existing values are preserved unless explicitly updated

### 2. Automatic Deduplication
- Detects and removes duplicate keys
- Keeps the first occurrence, comments out duplicates
- Safe cleanup of manually edited files

### 3. Smart Value Management
- Only updates values that have changed
- Preserves existing non-empty values
- Adds missing required keys with defaults

### 4. Validation
- Checks file format and syntax
- Warns about potential issues
- Ensures proper key naming conventions

### 5. Security Features
- Sets proper file permissions (600)
- Masks sensitive values in output
- Safe handling of secrets and tokens

## Usage

### Basic Usage

```bash
# Setup default .env file
npm run setup:env

# Or directly:
./scripts/setup-env.sh
```

### Custom Environment File

```bash
# Setup .env.local
./scripts/setup-env.sh .env.local

# Setup .env.production
./scripts/setup-env.sh .env.production

# Setup any custom file
./scripts/setup-env.sh .env.test
```

### Linting Scripts

Validate bash script syntax:

```bash
npm run lint:scripts
```

## Script Functions

### Core Functions

#### `set_env_var(key, value, env_file, comment)`

Sets or updates an environment variable idempotently.

**Parameters:**
- `key`: Variable name (must be uppercase with underscores)
- `value`: Variable value
- `env_file`: Path to .env file
- `comment`: Optional comment to add above the variable

**Behavior:**
- If key doesn't exist: adds it with optional comment
- If key exists with same value: does nothing
- If key exists with different value: updates it
- Always maintains idempotency

**Example:**
```bash
set_env_var "API_URL" "https://api.example.com" ".env" "API base URL"
```

#### `key_exists(key, env_file)`

Checks if a key exists in the environment file.

**Returns:**
- 0 (success) if key exists
- 1 (failure) if key doesn't exist

**Example:**
```bash
if key_exists "API_URL" ".env"; then
    echo "API_URL is configured"
fi
```

#### `get_value(key, env_file)`

Gets the current value of a key from the environment file.

**Returns:**
- The value as a string
- Empty string if key doesn't exist

**Example:**
```bash
current_url=$(get_value "API_URL" ".env")
echo "Current API URL: $current_url"
```

#### `deduplicate_env_file(env_file)`

Removes duplicate keys, keeping the first occurrence.

**Behavior:**
- Scans file for duplicate keys
- Keeps first occurrence of each key
- Comments out duplicates for reference
- Safe to run on any .env file

**Example:**
```bash
deduplicate_env_file ".env.local"
```

#### `validate_env_file(env_file)`

Validates the format and syntax of an environment file.

**Checks:**
- Valid key naming (uppercase, underscores)
- Proper KEY=VALUE format
- Warns about unquoted spaces
- Identifies potential issues

**Example:**
```bash
if validate_env_file ".env"; then
    echo "File is valid"
fi
```

## Configuration

### Required Environment Variables

The script ensures these variables exist with default values:

| Variable | Default Value | Description |
|----------|--------------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-api.example.com` | Base URL for API endpoints |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | Supabase anonymous key |

### Customizing Required Keys

Edit the `ensure_required_keys()` function in the script:

```bash
# Define required keys with default values and comments
local -A required_keys=(
    ["YOUR_KEY"]="default-value|Description here"
    ["ANOTHER_KEY"]="another-default|Another description"
)
```

Format: `["KEY_NAME"]="default_value|Description text"`

## Examples

### Example 1: Initial Setup

```bash
$ ./scripts/setup-env.sh

ℹ Starting idempotent environment setup
ℹ Target file: .env

✓ Created .env from .env.example
ℹ No duplicate keys found in .env
ℹ Ensuring required environment variables...
✓ Added NEXT_PUBLIC_SUPABASE_URL to .env
✓ Added NEXT_PUBLIC_SUPABASE_ANON_KEY to .env
✓ Environment setup completed successfully!
```

### Example 2: Running Again (Idempotent)

```bash
$ ./scripts/setup-env.sh

ℹ Starting idempotent environment setup
ℹ Target file: .env

ℹ .env already exists
ℹ No duplicate keys found in .env
ℹ Ensuring required environment variables...
✓ Validation passed
✓ Environment setup completed successfully!
```

### Example 3: Fixing Duplicates

Create a file with duplicates:

```bash
$ cat .env
API_URL=https://api1.example.com
DATABASE_URL=postgres://localhost
API_URL=https://api2.example.com
```

Run the script:

```bash
$ ./scripts/setup-env.sh

⚠ Removed duplicate keys from .env
```

Result:

```bash
$ cat .env
API_URL=https://api1.example.com
DATABASE_URL=postgres://localhost
# DUPLICATE REMOVED: API_URL=https://api2.example.com
```

### Example 4: Updating Values Programmatically

You can source the script and use its functions:

```bash
#!/usr/bin/env bash
source scripts/setup-env.sh

# Update API URL
set_env_var "NEXT_PUBLIC_API_BASE_URL" "https://production-api.com" ".env"

# Add a new key
set_env_var "NEW_FEATURE_FLAG" "enabled" ".env" "Enable new feature"

# Check if key exists
if key_exists "DEBUG_MODE" ".env"; then
    current_value=$(get_value "DEBUG_MODE" ".env")
    echo "Debug mode is: $current_value"
fi
```

## Output Display

The script provides colored output for better readability:

- **Blue (ℹ)**: Informational messages
- **Green (✓)**: Success messages
- **Yellow (⚠)**: Warnings
- **Red (✗)**: Errors

### Sensitive Value Masking

Keys containing sensitive keywords are automatically masked in output:

**Keywords**: SECRET, KEY, PASSWORD, TOKEN, PRIVATE

**Example:**
```
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
SUPABASE_SERVICE_KEY=sbp_****key
DATABASE_PASSWORD=pass****word
```

## Best Practices

### 1. Use Version Control

Add to `.gitignore`:
```gitignore
.env
.env.local
.env.*.local
.env.test
```

Keep in version control:
```
.env.example
scripts/setup-env.sh
scripts/README.md
```

### 2. CI/CD Integration

In your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Setup environment
  run: |
    ./scripts/setup-env.sh .env.production
    # Override with CI secrets
    echo "NEXT_PUBLIC_API_BASE_URL=${{ secrets.API_URL }}" >> .env.production
```

### 3. Local Development

1. Clone repository
2. Run setup script: `npm run setup:env`
3. Edit `.env` with your values
4. Run the script again to validate

### 4. Team Onboarding

Add to your project README:

```markdown
## Getting Started

1. Clone the repository
2. Run `npm run setup:env` to create your .env file
3. Edit `.env` with your credentials
4. Run `npm run dev` to start development
```

## Troubleshooting

### Issue: Duplicate Keys Keep Appearing

**Cause**: Manual editing or concatenation of env files

**Solution**: Run the script to deduplicate
```bash
./scripts/setup-env.sh .env
```

### Issue: Permission Denied

**Cause**: Script not executable

**Solution**: Make script executable
```bash
chmod +x scripts/setup-env.sh
```

### Issue: Values Not Updating

**Cause**: Script preserves non-empty values by design

**Solution**: Manually edit the value or delete the key first

### Issue: awk Syntax Errors

**Cause**: Old version of awk or incompatible awk variant

**Solution**: The script is compatible with both BSD awk (macOS) and GNU awk (Linux). If issues persist, install GNU awk:

**macOS:**
```bash
brew install gawk
```

**Linux:**
```bash
sudo apt-get install gawk  # Debian/Ubuntu
sudo yum install gawk      # RedHat/CentOS
```

## Testing

### Unit Testing Functions

Test individual functions:

```bash
# Source the script
source scripts/setup-env.sh

# Test key_exists
key_exists "PATH" ".env" && echo "PATH exists"

# Test get_value
value=$(get_value "PATH" ".env")
echo "PATH value: $value"

# Test set_env_var
set_env_var "TEST_KEY" "test_value" ".env.test"
```

### Integration Testing

Test the complete flow:

```bash
# Create test file with duplicates
cat > .env.test << EOF
KEY1=value1
KEY2=value2
KEY1=duplicate
EOF

# Run script
./scripts/setup-env.sh .env.test

# Verify deduplication
grep "KEY1" .env.test

# Clean up
rm .env.test
```

### Idempotency Testing

Verify idempotent behavior:

```bash
# Run script 3 times
./scripts/setup-env.sh .env.test
hash1=$(md5sum .env.test | awk '{print $1}')

./scripts/setup-env.sh .env.test
hash2=$(md5sum .env.test | awk '{print $1}')

./scripts/setup-env.sh .env.test
hash3=$(md5sum .env.test | awk '{print $1}')

# All hashes should be identical
if [[ "$hash1" == "$hash2" ]] && [[ "$hash2" == "$hash3" ]]; then
    echo "✓ Idempotency verified"
else
    echo "✗ Idempotency check failed"
fi
```

## Advanced Usage

### Custom Validation Rules

Add custom validation in the `validate_env_file()` function:

```bash
# Check for required production keys
if [[ "$env_file" == *"production"* ]]; then
    if ! key_exists "DATABASE_URL" "$env_file"; then
        log_error "DATABASE_URL required in production"
        return 1
    fi
fi
```

### Conditional Key Management

```bash
# Only add key in production environments
if [[ "$ENVIRONMENT" == "production" ]]; then
    set_env_var "ENABLE_ANALYTICS" "true" "$env_file"
fi
```

### Backup Before Changes

```bash
# Add at the start of main()
if [[ -f "$env_file" ]]; then
    cp "$env_file" "${env_file}.backup.$(date +%Y%m%d_%H%M%S)"
    log_info "Created backup of $env_file"
fi
```

## API Reference

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Validation error or file not found |

### Environment Variables

The script respects these environment variables:

- `ENV_FILE`: Override default .env file path
- `SKIP_VALIDATION`: Set to "true" to skip validation step

## Maintenance

### Linting

Run before committing changes:

```bash
npm run lint:scripts
```

Or manually:

```bash
bash -n scripts/setup-env.sh
shellcheck scripts/setup-env.sh  # If shellcheck is installed
```

### Code Style

- Use bash built-ins when possible
- Follow Google Shell Style Guide
- Add comments for complex logic
- Use meaningful function and variable names

## License

Part of the Compliance Consulting project.

## Support

For issues or questions:
1. Check this documentation
2. Review the inline script comments
3. Test with `.env.test` first
4. Create an issue in the project repository
