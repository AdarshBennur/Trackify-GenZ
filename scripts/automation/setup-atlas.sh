#!/bin/bash

# =================================================================
# MongoDB Atlas Setup Script for Trackify-GenZ
# =================================================================

echo "🌐 MongoDB Atlas Setup for Trackify-GenZ"
echo "========================================"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists."
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Please edit .env manually."
        exit 1
    fi
fi

# Get MongoDB Atlas connection string
echo "📝 Please provide your MongoDB Atlas connection string:"
echo "mongodb+srv://aditrack:track999@tracker.pq6xgts.mongodb.net/expensetracker?retryWrites=true&w=majority&appName=tracker"
echo ""
read -p "MongoDB Atlas URI: " MONGO_URI

# Validate basic format
if [[ ! $MONGO_URI =~ ^mongodb\+srv:// ]]; then
    echo "❌ Invalid MongoDB Atlas URI format. Should start with mongodb+srv://"
    exit 1
fi

# Create .env file
echo "📄 Creating .env file..."

cat > .env << EOF
# =================================================================
# Trackify-GenZ Environment Configuration for MongoDB Atlas
# Generated on: $(date)
# =================================================================

# Application Environment
NODE_ENV=development
BUILD_TARGET=development

# Port Configuration
CLIENT_PORT=3000
SERVER_PORT=5001
MONGO_EXPRESS_PORT=8081

# MongoDB Atlas Configuration
MONGO_URI=${MONGO_URI}

# Local MongoDB Configuration (not used with Atlas)
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=SecurePassword123!
MONGO_DB_NAME=expensetracker

# MongoDB Express (Admin Interface - disabled for Atlas)
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=ExpenseAdmin123!

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-expense-tracker-change-in-production-make-it-at-least-32-characters
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
BCRYPT_ROUNDS=10

# Frontend Configuration
CLIENT_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5001/api

# Debug Configuration
DEBUG_AUTH=true
EOF

echo "✅ .env file created successfully!"
echo ""

# Ask about container restart
echo "🐳 Docker Container Management:"
echo "To apply the Atlas configuration, the containers need to be restarted."
echo ""
read -p "Do you want to restart the containers now? (Y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "⏸️  Containers not restarted. Run manually:"
    echo "   docker-compose down"
    echo "   docker-compose up"
else
    echo "🔄 Stopping current containers..."
    docker-compose down
    
    echo "🚀 Starting containers with Atlas configuration..."
    docker-compose up -d
    
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    echo "🏥 Checking service health..."
    docker-compose ps
fi

echo ""
echo "🧪 Testing Data Persistence:"
echo "Run this command to test Atlas connectivity:"
echo "   cd server && node testDataPersistence.js"
echo ""

echo "🔍 Verify Atlas Connection:"
echo "1. Check server logs: docker-compose logs server | grep -i mongo"
echo "2. Check Atlas dashboard: Browse Collections should show your data"
echo ""

echo "✅ MongoDB Atlas setup complete!"
echo "Your application will now store ALL data in your Atlas cluster! 🚀" 