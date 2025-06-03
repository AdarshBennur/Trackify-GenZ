#!/bin/bash

# Trackify-GenZ Application Startup Script
# This script ensures a clean startup of the application

echo "🚀 Starting Trackify-GenZ Application..."

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

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

print_status "Docker is running"

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp env.example .env
    print_status ".env file created"
fi

# Stop any running containers
print_status "Stopping any existing containers..."
docker-compose down > /dev/null 2>&1

# Remove orphaned containers
print_status "Cleaning up orphaned containers..."
docker-compose down --remove-orphans > /dev/null 2>&1

# Build and start the application
print_status "Building and starting the application..."
print_warning "This may take a few moments for the first time..."

if docker-compose up --build; then
    print_status "Application started successfully!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:5001/api"
    print_status "Health Check: http://localhost:5001/api/health"
else
    print_error "Failed to start the application. Check the logs above for details."
    exit 1
fi 