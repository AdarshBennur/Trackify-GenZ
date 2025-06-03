#!/bin/bash

# Trackify-GenZ Application Stop Script
# This script cleanly stops the application

echo "🛑 Stopping Trackify-GenZ Application..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Stop all containers
print_status "Stopping all containers..."
docker-compose down

# Remove orphaned containers
print_status "Cleaning up orphaned containers..."
docker-compose down --remove-orphans

# Optional: Remove volumes (uncomment if you want to reset database)
# print_warning "Removing volumes..."
# docker-compose down -v

print_status "Application stopped successfully!"
print_status "All containers have been stopped and cleaned up." 