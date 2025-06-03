#!/bin/bash
# test-docker-setup.sh - Test script for expense tracker Docker setup

set -e

echo "🐳 Testing Expense Tracker Docker Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test Docker installation
echo -e "${BLUE}1. Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is installed: $(docker --version)${NC}"
else
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi

# Test Docker Compose installation
echo -e "${BLUE}2. Checking Docker Compose installation...${NC}"
if command -v docker compose &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose is installed: $(docker compose version)${NC}"
else
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi

# Test Docker daemon
echo -e "${BLUE}3. Checking Docker daemon...${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}✓ Docker daemon is running${NC}"
else
    echo -e "${RED}✗ Docker daemon is not running${NC}"
    exit 1
fi

# Check if ports are available
echo -e "${BLUE}4. Checking port availability...${NC}"
check_port() {
    local port=$1
    local service=$2
    if lsof -i:$port &> /dev/null; then
        echo -e "${YELLOW}⚠ Port $port is already in use (needed for $service)${NC}"
        echo "   You may need to stop the conflicting service first"
    else
        echo -e "${GREEN}✓ Port $port is available for $service${NC}"
    fi
}

check_port 3000 "Frontend"
check_port 5000 "Backend"
check_port 27017 "MongoDB"

# Test building the application
echo -e "${BLUE}5. Testing Docker build...${NC}"
if docker compose build --no-cache; then
    echo -e "${GREEN}✓ Docker build completed successfully${NC}"
else
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

# Start the application
echo -e "${BLUE}6. Starting application...${NC}"
docker compose up -d

# Wait for services to be ready
echo -e "${BLUE}7. Waiting for services to be ready...${NC}"
sleep 30

# Test service health
echo -e "${BLUE}8. Testing service health...${NC}"

# Test MongoDB
echo -n "   MongoDB: "
if docker compose exec mongo mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
fi

# Test Backend API
echo -n "   Backend API: "
if curl -s http://localhost:5000/api/health &> /dev/null; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
fi

# Test Frontend
echo -n "   Frontend: "
if curl -s http://localhost:3000/health &> /dev/null; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
fi

# Show running containers
echo -e "${BLUE}9. Container status:${NC}"
docker compose ps

# Show logs summary
echo -e "${BLUE}10. Recent logs:${NC}"
docker compose logs --tail=5

echo ""
echo -e "${GREEN}🎉 Docker setup test completed!${NC}"
echo -e "${BLUE}Access your application at:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000/api"
echo "   Database: mongodb://localhost:27017/expenseDB"
echo ""
echo -e "${YELLOW}To stop the application: ${NC}docker compose down"
echo -e "${YELLOW}To view logs: ${NC}docker compose logs -f" 