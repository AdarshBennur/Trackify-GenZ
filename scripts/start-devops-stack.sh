#!/bin/bash

# ===================================================================================
# Expense Tracker DevOps Stack Startup Script
# This script starts all DevOps services using Docker Compose
# ===================================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker status..."
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    print_status "✅ Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command -v docker-compose >/dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_status "✅ Docker Compose is available"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p monitoring/grafana/provisioning/datasources
    mkdir -p monitoring/grafana/provisioning/dashboards
    mkdir -p monitoring/grafana/dashboards
    mkdir -p vault/data
    mkdir -p vault/policies
    mkdir -p vault/scripts
    mkdir -p nginx/conf.d
    print_status "✅ Directories created"
}

# Start the DevOps stack
start_stack() {
    print_header "🚀 Starting Expense Tracker DevOps Stack..."
    
    # Pull latest images
    print_status "Pulling latest Docker images..."
    docker-compose -f docker-compose.full.yml pull

    # Start services in order
    print_status "Starting infrastructure services..."
    docker-compose -f docker-compose.full.yml up -d vault vault-init prometheus node-exporter

    # Wait for Vault to be ready
    print_status "Waiting for Vault to be ready..."
    sleep 10

    # Start monitoring services
    print_status "Starting monitoring services..."
    docker-compose -f docker-compose.full.yml up -d grafana

    # Start database services
    print_status "Starting database services..."
    docker-compose -f docker-compose.full.yml up -d sonarqube-db

    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 15

    # Start application and code quality services
    print_status "Starting application and code quality services..."
    docker-compose -f docker-compose.full.yml up -d server client sonarqube

    # Start reverse proxy (optional)
    print_status "Starting reverse proxy..."
    docker-compose -f docker-compose.full.yml up -d nginx || print_warning "Nginx configuration may need adjustment"

    print_status "✅ All services started!"
}

# Show service status
show_status() {
    print_header "📊 Service Status:"
    docker-compose -f docker-compose.full.yml ps
}

# Show access URLs
show_urls() {
    print_header "🌐 Service URLs:"
    echo -e "${GREEN}Frontend:${NC}     http://localhost:3000"
    echo -e "${GREEN}Backend:${NC}      http://localhost:5001/api"
    echo -e "${GREEN}Prometheus:${NC}   http://localhost:9090"
    echo -e "${GREEN}Grafana:${NC}      http://localhost:3001 (admin/admin123)"
    echo -e "${GREEN}Vault:${NC}        http://localhost:8200 (root token: myroot)"
    echo -e "${GREEN}SonarQube:${NC}    http://localhost:9000 (admin/admin)"
    echo -e "${GREEN}Node Exporter:${NC} http://localhost:9100"
    echo ""
    print_warning "Note: Some services may take a few minutes to be fully ready"
}

# Main execution
main() {
    print_header "=== Expense Tracker DevOps Stack Startup ==="
    
    check_docker
    check_docker_compose
    create_directories
    start_stack
    
    echo ""
    show_status
    echo ""
    show_urls
    
    print_header "🎉 DevOps Stack Started Successfully!"
    print_status "To stop all services, run: docker-compose -f docker-compose.full.yml down"
    print_status "To view logs, run: docker-compose -f docker-compose.full.yml logs -f [service-name]"
}

# Run main function
main "$@" 