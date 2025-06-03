#!/bin/bash

# MongoDB Atlas Setup Script for Trackify-GenZ
echo "🌐 Setting up Trackify-GenZ with MongoDB Atlas..."
echo "=================================================="

# Create .env file for Atlas
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
# REPLACE THIS with your actual MongoDB Atlas connection string
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/trackify?retryWrites=true&w=majority

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

echo "✅ Created .env file with Atlas template"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Get your MongoDB Atlas connection string:"
echo "   - Login to https://cloud.mongodb.com"
echo "   - Go to your cluster → Click 'Connect'"
echo "   - Choose 'Connect your application'"
echo "   - Copy the connection string"
echo ""
echo "2. Edit the .env file and replace MONGO_URI with your actual connection string"
echo "   Example: mongodb+srv://myuser:mypass@cluster0.abc123.mongodb.net/trackify?retryWrites=true&w=majority"
echo ""
echo "3. Make sure your Atlas cluster allows connections from anywhere (0.0.0.0/0)"
echo ""
echo "4. Run: docker-compose up --build"
echo ""
echo "📝 To edit .env file, run: nano .env" 