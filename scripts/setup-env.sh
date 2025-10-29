#!/usr/bin/env bash

################################################################################
# Idempotent Environment Setup Script
#
# This script safely manages .env files without creating duplicate entries.
# It can be run multiple times safely - it will only update values or add
# missing keys, never create duplicates.
#
# Usage:
#   ./scripts/setup-env.sh [env_file]
#
# Examples:
#   ./scripts/setup-env.sh               # Uses .env by default
#   ./scripts/setup-env.sh .env.local    # Specify custom file
#
################################################################################

set -euo pipefail

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly ENV_EXAMPLE="${PROJECT_ROOT}/.env.example"
readonly DEFAULT_ENV_FILE="${PROJECT_ROOT}/.env"

################################################################################
# Logging Functions
################################################################################

log_info() {
    echo -e "${BLUE}ℹ${NC} $*"
}

log_success() {
    echo -e "${GREEN}✓${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $*"
}

log_error() {
    echo -e "${RED}✗${NC} $*" >&2
}

################################################################################
# Core Functions
################################################################################

# Check if a key exists in the env file
# Args: $1 = key, $2 = env_file
key_exists() {
    local key="$1"
    local env_file="$2"

    if [[ ! -f "$env_file" ]]; then
        return 1
    fi

    # Match lines that start with the key followed by = (ignoring whitespace and comments)
    grep -q "^[[:space:]]*${key}[[:space:]]*=" "$env_file" 2>/dev/null
}

# Get the value of a key from env file
# Args: $1 = key, $2 = env_file
get_value() {
    local key="$1"
    local env_file="$2"

    if [[ ! -f "$env_file" ]]; then
        echo ""
        return
    fi

    # Extract value after the = sign, handling quotes
    grep "^[[:space:]]*${key}[[:space:]]*=" "$env_file" 2>/dev/null | \
        head -n 1 | \
        sed "s/^[[:space:]]*${key}[[:space:]]*=[[:space:]]*//" | \
        sed 's/^["'\'']//' | \
        sed 's/["'\'']$//'
}

# Set or update a key in the env file (idempotent)
# Args: $1 = key, $2 = value, $3 = env_file, $4 = comment (optional)
set_env_var() {
    local key="$1"
    local value="$2"
    local env_file="$3"
    local comment="${4:-}"

    # Validate key name
    if [[ ! "$key" =~ ^[A-Z_][A-Z0-9_]*$ ]]; then
        log_error "Invalid key name: $key (must be uppercase with underscores)"
        return 1
    fi

    # Create file if it doesn't exist
    if [[ ! -f "$env_file" ]]; then
        touch "$env_file"
        log_info "Created $env_file"
    fi

    # Create a temporary file
    local temp_file
    temp_file=$(mktemp)

    # Check if key already exists
    if key_exists "$key" "$env_file"; then
        local current_value
        current_value=$(get_value "$key" "$env_file")

        if [[ "$current_value" == "$value" ]]; then
            log_info "$key already set to correct value"
            rm -f "$temp_file"
            return 0
        fi

        # Update existing key
        # Use awk to replace only the first occurrence
        awk -v key="$key" -v value="$value" '
            !replaced && $0 ~ "^[[:space:]]*" key "[[:space:]]*=" {
                print key "=" value
                replaced = 1
                next
            }
            { print }
        ' "$env_file" > "$temp_file"

        log_success "Updated $key in $env_file"
    else
        # Add new key
        cp "$env_file" "$temp_file"

        # Add comment if provided
        if [[ -n "$comment" ]]; then
            echo "" >> "$temp_file"
            echo "# $comment" >> "$temp_file"
        fi

        echo "${key}=${value}" >> "$temp_file"
        log_success "Added $key to $env_file"
    fi

    # Replace original file with updated version
    mv "$temp_file" "$env_file"
    chmod 600 "$env_file"
}

# Remove duplicate keys, keeping the first occurrence
# Args: $1 = env_file
deduplicate_env_file() {
    local env_file="$1"

    if [[ ! -f "$env_file" ]]; then
        log_warning "File $env_file does not exist, skipping deduplication"
        return 0
    fi

    local temp_file
    temp_file=$(mktemp)

    # Use awk to keep only the first occurrence of each key
    # Compatible with BSD awk (macOS) and GNU awk (Linux)
    awk '
        # Skip empty lines and comments
        /^[[:space:]]*$/ || /^[[:space:]]*#/ {
            print
            next
        }

        # Extract key from KEY=VALUE lines
        /^[[:space:]]*[A-Z_][A-Z0-9_]*[[:space:]]*=/ {
            # Extract key using sub() instead of match() for BSD awk compatibility
            line = $0
            key = line
            sub(/^[[:space:]]*/, "", key)
            sub(/[[:space:]]*=.*$/, "", key)

            if (!(key in seen)) {
                seen[key] = 1
                print
            } else {
                printf "# DUPLICATE REMOVED: %s\n", $0
            }
            next
        }

        # Print any other lines as-is
        { print }
    ' "$env_file" > "$temp_file"

    # Check if any duplicates were found
    if grep -q "# DUPLICATE REMOVED:" "$temp_file"; then
        log_warning "Removed duplicate keys from $env_file"
        mv "$temp_file" "$env_file"
        chmod 600 "$env_file"
    else
        log_info "No duplicate keys found in $env_file"
        rm -f "$temp_file"
    fi
}

# Copy from example file if target doesn't exist
# Args: $1 = env_file
initialize_from_example() {
    local env_file="$1"

    if [[ -f "$env_file" ]]; then
        log_info "$env_file already exists"
        return 0
    fi

    if [[ -f "$ENV_EXAMPLE" ]]; then
        cp "$ENV_EXAMPLE" "$env_file"
        chmod 600 "$env_file"
        log_success "Created $env_file from $ENV_EXAMPLE"
    else
        touch "$env_file"
        chmod 600 "$env_file"
        log_success "Created empty $env_file"
    fi
}

# Ensure required keys exist with default values
# Args: $1 = env_file
ensure_required_keys() {
    local env_file="$1"

    log_info "Ensuring required environment variables..."

    # Define required keys with default values and comments
    local -A required_keys=(
        ["NEXT_PUBLIC_API_BASE_URL"]="https://your-api.example.com|Base URL for API endpoints"
        ["NEXT_PUBLIC_SUPABASE_URL"]="https://your-project.supabase.co|Supabase project URL"
        ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]="your-anon-key|Supabase anonymous key"
    )

    for key in "${!required_keys[@]}"; do
        IFS='|' read -r default_value comment <<< "${required_keys[$key]}"

        if ! key_exists "$key" "$env_file"; then
            set_env_var "$key" "$default_value" "$env_file" "$comment"
        else
            local current_value
            current_value=$(get_value "$key" "$env_file")

            if [[ -z "$current_value" ]]; then
                set_env_var "$key" "$default_value" "$env_file" "$comment"
            fi
        fi
    done
}

# Validate env file format
# Args: $1 = env_file
validate_env_file() {
    local env_file="$1"
    local errors=0

    log_info "Validating $env_file..."

    if [[ ! -f "$env_file" ]]; then
        log_error "File does not exist: $env_file"
        return 1
    fi

    # Check for common issues
    local line_num=0
    while IFS= read -r line || [[ -n "$line" ]]; do
        ((line_num++))

        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

        # Check for valid format
        if ! [[ "$line" =~ ^[[:space:]]*[A-Z_][A-Z0-9_]*[[:space:]]*= ]]; then
            log_warning "Line $line_num: Invalid format: $line"
            ((errors++))
        fi

        # Check for unquoted spaces in values (potential issue)
        if [[ "$line" =~ =[[:space:]]*[^\"\']*[[:space:]]+[^\"\']*$ ]]; then
            log_warning "Line $line_num: Value contains spaces without quotes: $line"
        fi
    done < "$env_file"

    if [[ $errors -gt 0 ]]; then
        log_warning "Found $errors potential issues in $env_file"
        return 1
    fi

    log_success "Validation passed"
    return 0
}

# Display current configuration (masked sensitive values)
# Args: $1 = env_file
display_config() {
    local env_file="$1"

    if [[ ! -f "$env_file" ]]; then
        log_warning "File does not exist: $env_file"
        return
    fi

    echo ""
    echo "Current configuration in $env_file:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    while IFS= read -r line || [[ -n "$line" ]]; do
        # Skip empty lines
        [[ -z "$line" ]] && continue

        # Print comments as-is
        if [[ "$line" =~ ^[[:space:]]*# ]]; then
            echo -e "${BLUE}$line${NC}"
            continue
        fi

        # Mask sensitive values
        if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)[[:space:]]*=[[:space:]]*(.+)$ ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"

            # Mask keys containing sensitive keywords
            if [[ "$key" =~ (SECRET|KEY|PASSWORD|TOKEN|PRIVATE) ]]; then
                local masked_value="${value:0:4}****${value: -4}"
                echo -e "${GREEN}${key}${NC}=${YELLOW}${masked_value}${NC}"
            else
                echo -e "${GREEN}${key}${NC}=${value}"
            fi
        else
            echo "$line"
        fi
    done < "$env_file"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

################################################################################
# Main Function
################################################################################

main() {
    local env_file="${1:-$DEFAULT_ENV_FILE}"

    echo ""
    log_info "Starting idempotent environment setup"
    log_info "Target file: $env_file"
    echo ""

    # Step 1: Initialize from example if needed
    initialize_from_example "$env_file"

    # Step 2: Remove any existing duplicates
    deduplicate_env_file "$env_file"

    # Step 3: Ensure required keys exist
    ensure_required_keys "$env_file"

    # Step 4: Validate the final result
    if validate_env_file "$env_file"; then
        log_success "Environment setup completed successfully!"
    else
        log_warning "Setup completed with warnings. Please review the file."
    fi

    # Step 5: Display current configuration
    display_config "$env_file"

    echo ""
    log_info "You can safely run this script multiple times - it's idempotent!"
    log_info "Edit $env_file to customize your configuration"
    echo ""
}

################################################################################
# Entry Point
################################################################################

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
