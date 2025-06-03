#!/bin/bash

echo "Updating .env file with your MongoDB Atlas connection string..."

cat > .env << 'EOF'
# ===================================================================================
# Trackify-GenZ Environment Configuration for MongoDB Atlas
# ===================================================================================

# ================================
# APPLICATION CONFIGURATION
# ================================
NODE_ENV=development
BUILD_TARGET=development

# Port Configuration
CLIENT_PORT=3000
SERVER_PORT=5001

# ================================
# DATABASE CONFIGURATION - MONGODB ATLAS
# ================================
MONGO_URI=mongodb+srv://aditrack:track999@tracker.pq6xgts.mongodb.net/expensetracker?retryWrites=true&w=majority&appName=tracker

# ================================
# SECURITY CONFIGURATION
# ================================
JWT_SECRET=trackify-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
BCRYPT_ROUNDS=10

# ================================
# CLIENT CONFIGURATION
# ================================
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_ENV=development
CLIENT_URL=http://localhost:3000

# ================================
# DEBUGGING CONFIGURATION
# ================================
DEBUG_AUTH=true
LOG_LEVEL=info

# ================================
# DOCKER CONFIGURATION
# ================================
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1
EOF

echo "✅ Updated .env file with your MongoDB Atlas connection string"
echo "📊 Database: expensetracker"
echo "🌐 Cluster: tracker.pq6xgts.mongodb.net"
echo ""
echo "🚀 Ready to start the application with: docker-compose up --build" 