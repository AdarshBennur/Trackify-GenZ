#!/bin/bash
#
# Restoration Script for Trackify-GenZ Cleanup
# This script can restore files/folders removed during the MVP cleanup
#
# Usage:
#   ./scripts/restore_removed.sh [component]
#
# Components:
#   all           - Restore everything
#   k8s           - Restore Kubernetes configs
#   monitoring    - Restore Prometheus/Grafana
#   vault         - Restore HashiCorp Vault
#   ansible       - Restore Ansible playbooks
#   terraform     - Restore Terraform IaC
#   docs          - Restore removed documentation
#   scripts       - Restore removed scripts
#   server-tests  - Restore server test scripts
#   env           - Restore environment files (CAUTION!)
#

set -e

BACKUP_FILE="/tmp/backup-trackify-genz-20251129-1407.zip"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_EXTRACT="/tmp/trackify-restore-$$"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Trackify-GenZ Restoration Script${NC}"
echo "=================================="

# Check if backup exists
if [ ! -f "$BACKUP_FILE" ]; then
    if [ -f "$REPO_ROOT/backups/backup-trackify-genz-20251129-1407.zip" ]; then
        BACKUP_FILE="$REPO_ROOT/backups/backup-trackify-genz-20251129-1407.zip"
        echo -e "${YELLOW}Using backup from: $BACKUP_FILE${NC}"
    else
        echo -e "${RED}Error: Backup file not found!${NC}"
        echo "Expected: /tmp/backup-trackify-genz-20251129-1407.zip"
        echo "Or: $REPO_ROOT/backups/backup-trackify-genz-20251129-1407.zip"
        exit 1
    fi
fi

# Verify SHA256 (optional but recommended)
EXPECTED_SHA256="21742637cc53575e739be3f0f6d533e03599fd02e1247661b11f1a17038b1b76"
ACTUAL_SHA256=$(shasum -a 256 "$BACKUP_FILE" | awk '{print $1}')

if [ "$ACTUAL_SHA256" != "$EXPECTED_SHA256" ]; then
    echo -e "${YELLOW}Warning: SHA256 mismatch! Backup may be corrupted.${NC}"
    echo "Expected: $EXPECTED_SHA256"
    echo "Actual:   $ACTUAL_SHA256"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Function to extract and restore
restore_component() {
    local component=$1
    local path=$2
    
    echo -e "\n${GREEN}Restoring: $component${NC}"
    
    mkdir -p "$TEMP_EXTRACT"
    unzip -q "$BACKUP_FILE" "$path" -d "$TEMP_EXTRACT" 2>/dev/null || {
        echo -e "${RED}Failed to extract $component${NC}"
        return 1
    }
    
    cp -r "$TEMP_EXTRACT/$path" "$REPO_ROOT/" 2>/dev/null || {
        mkdir -p "$(dirname "$REPO_ROOT/$path")"
        cp -r "$TEMP_EXTRACT/$path" "$REPO_ROOT/$path"
    }
    
    echo -e "${GREEN}✓ Restored $component to $REPO_ROOT/$path${NC}"
    rm -rf "$TEMP_EXTRACT"
}

# Parse command
COMPONENT=${1:-help}

case $COMPONENT in
    k8s)
        restore_component "Kubernetes" "k8s"
        ;;
    monitoring)
        restore_component "Monitoring" "monitoring"
        ;;
    vault)
        restore_component "Vault" "vault"
        ;;
    ansible)
        restore_component "Ansible" "ansible"
        ;;
    terraform)
        restore_component "Terraform" "terraform"
        ;;
    docs)
        echo -e "\n${GREEN}Restoring removed documentation${NC}"
        cd "$REPO_ROOT"
        cp backups/docs/* docs/ 2>/dev/null && echo -e "${GREEN}✓ Restored docs${NC}"
        ;;
    scripts)
        restore_component "K8s Scripts" "scripts/start-k8s-stack.sh"
        restore_component "K8s Scripts" "scripts/start-k8s-streamlined.sh"
        restore_component "K8s Scripts" "scripts/start-docker-desktop-k8s.sh"
        ;;
    server-tests)
        echo -e "\n${GREEN}Restoring server test scripts${NC}"
        cd "$REPO_ROOT"
        cp backups/unused/*.js server/ 2>/dev/null && echo -e "${GREEN}✓ Restored server test scripts${NC}"
        ;;
    env)
        echo -e "${YELLOW}WARNING: This will restore environment files with credentials!${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd "$REPO_ROOT"
            cp backups/secrets/.env* . 2>/dev/null || true
            cp backups/secrets/.env* server/ 2>/dev/null || true
            echo -e "${GREEN}✓ Restored environment files${NC}"
        fi
        ;;
    all)
        echo -e "${YELLOW}This will restore ALL removed components${NC}"
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            restore_component "Kubernetes" "k8s"
            restore_component "Monitoring" "monitoring"
            restore_component "Vault" "vault"
            restore_component "Ansible" "ansible"
            restore_component "Terraform" "terraform"
            restore_component "Nginx" "nginx"
            restore_component "SonarQube" "sonarqube"
            echo -e "\n${GREEN}All components restored!${NC}"
        fi
        ;;
    help|*)
        echo "Usage: $0 [component]"
        echo ""
        echo "Available components:"
        echo "  k8s           - Restore Kubernetes configurations"
        echo "  monitoring    - Restore Prometheus/Grafana"
        echo "  vault         - Restore HashiCorp Vault"
        echo "  ansible       - Restore Ansible playbooks"
        echo "  terraform     - Restore Terraform IaC"
        echo "  docs          - Restore removed documentation"
        echo "  scripts       - Restore K8s scripts"
        echo "  server-tests  - Restore server test scripts"
        echo "  env           - Restore environment files (CAUTION!)"
        echo "  all           - Restore everything"
        echo ""
        echo "Example: $0 k8s"
        ;;
esac

echo -e "\n${GREEN}Done!${NC}"
