#!/bin/bash

# =================================================================
# Docker Helper Scripts for Expense Tracker Application
# =================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found!"
        if [ -f env.template ]; then
            print_status "Copying env.template to .env..."
            cp env.template .env
            print_success ".env file created from template"
            print_warning "Please review and update the .env file with your specific values"
        else
            print_error "No env.template found. Please create .env file manually."
            exit 1
        fi
    fi
}

# Development commands
dev_build() {
    print_status "Building development containers..."
    check_env_file
    docker-compose build
    print_success "Development build completed"
}

dev_up() {
    print_status "Starting development environment..."
    check_env_file
    docker-compose up -d
    print_success "Development environment started"
    echo ""
    print_status "Services:"
    echo "  📱 Frontend: http://localhost:3000"
    echo "  🚀 Backend API: http://localhost:5001/api"
    echo "  🗄️  MongoDB: localhost:27017"
    echo "  🔧 Mongo Express: http://localhost:8081 (admin/pass)"
}

dev_up_build() {
    print_status "Building and starting development environment..."
    check_env_file
    docker-compose up --build -d
    print_success "Development environment built and started"
}

dev_logs() {
    print_status "Showing development logs..."
    docker-compose logs -f
}

dev_down() {
    print_status "Stopping development environment..."
    docker-compose down
    print_success "Development environment stopped"
}

dev_clean() {
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up development environment..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Development environment cleaned"
    else
        print_status "Cleanup cancelled"
    fi
}

# Production commands
prod_build() {
    print_status "Building production containers..."
    check_env_file
    docker-compose -f docker-compose.prod.yml build
    print_success "Production build completed"
}

prod_up() {
    print_status "Starting production environment..."
    check_env_file
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Production environment started"
}

prod_down() {
    print_status "Stopping production environment..."
    docker-compose -f docker-compose.prod.yml down
    print_success "Production environment stopped"
}

# Utility commands
show_status() {
    print_status "Container status:"
    docker-compose ps
    echo ""
    print_status "Resource usage:"
    docker stats --no-stream
}

show_logs() {
    SERVICE=${1:-}
    if [ -z "$SERVICE" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $SERVICE..."
        docker-compose logs -f "$SERVICE"
    fi
}

restart_service() {
    SERVICE=${1:-}
    if [ -z "$SERVICE" ]; then
        print_error "Please specify a service name (client, server, mongo)"
        exit 1
    fi
    print_status "Restarting $SERVICE..."
    docker-compose restart "$SERVICE"
    print_success "$SERVICE restarted"
}

# Database operations
db_backup() {
    BACKUP_DIR="./backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/mongo_backup_$TIMESTAMP.gz"
    
    mkdir -p "$BACKUP_DIR"
    
    print_status "Creating database backup..."
    docker-compose exec mongo mongodump --authenticationDatabase admin -u admin -p SecurePassword123! --db expensetracker --archive | gzip > "$BACKUP_FILE"
    print_success "Database backup created: $BACKUP_FILE"
}

db_restore() {
    BACKUP_FILE=${1:-}
    if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
        print_error "Please specify a valid backup file"
        exit 1
    fi
    
    print_warning "This will restore the database from $BACKUP_FILE"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restoring database..."
        gunzip -c "$BACKUP_FILE" | docker-compose exec -T mongo mongorestore --authenticationDatabase admin -u admin -p SecurePassword123! --archive
        print_success "Database restored"
    fi
}

# Help function
show_help() {
    echo "Expense Tracker Docker Helper Scripts"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Development Commands:"
    echo "  dev:build       Build development containers"
    echo "  dev:up          Start development environment"
    echo "  dev:up:build    Build and start development environment"
    echo "  dev:logs        Show development logs"
    echo "  dev:down        Stop development environment"
    echo "  dev:clean       Clean up all containers and volumes"
    echo ""
    echo "Production Commands:"
    echo "  prod:build      Build production containers"
    echo "  prod:up         Start production environment"
    echo "  prod:down       Stop production environment"
    echo ""
    echo "Utility Commands:"
    echo "  status          Show container status and resource usage"
    echo "  logs [SERVICE]  Show logs (optional: specify service)"
    echo "  restart SERVICE Restart a specific service"
    echo ""
    echo "Database Commands:"
    echo "  db:backup       Create database backup"
    echo "  db:restore FILE Restore database from backup file"
    echo ""
    echo "Examples:"
    echo "  $0 dev:up:build    # Build and start development environment"
    echo "  $0 logs server     # Show server logs"
    echo "  $0 restart client  # Restart client service"
}

# Main command router
case "${1:-}" in
    "dev:build")
        dev_build
        ;;
    "dev:up")
        dev_up
        ;;
    "dev:up:build")
        dev_up_build
        ;;
    "dev:logs")
        dev_logs
        ;;
    "dev:down")
        dev_down
        ;;
    "dev:clean")
        dev_clean
        ;;
    "prod:build")
        prod_build
        ;;
    "prod:up")
        prod_up
        ;;
    "prod:down")
        prod_down
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "${2:-}"
        ;;
    "restart")
        restart_service "${2:-}"
        ;;
    "db:backup")
        db_backup
        ;;
    "db:restore")
        db_restore "${2:-}"
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 