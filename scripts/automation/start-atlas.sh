#!/bin/bash

echo "🚀 Starting Trackify-GenZ with MongoDB Atlas Configuration"
echo "========================================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found! Creating from template..."
    cp env.template .env
    echo "✅ .env file created. Please update MONGO_URI with your Atlas connection string."
    exit 1
fi

# Check if MONGO_URI is set in .env
if ! grep -q "MONGO_URI=mongodb+srv://" .env; then
    echo "❌ MongoDB Atlas URI not found in .env file!"
    echo "💡 Please add your Atlas connection string to .env file:"
    echo "   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database"
    exit 1
fi

# Display configuration info
echo "📋 Current Configuration:"
echo "   NODE_ENV: $(grep NODE_ENV .env | cut -d'=' -f2)"
echo "   CLIENT_PORT: $(grep CLIENT_PORT .env | cut -d'=' -f2)"
echo "   SERVER_PORT: $(grep SERVER_PORT .env | cut -d'=' -f2)"
echo ""

# Test MongoDB Atlas connection first
echo "🧪 Testing MongoDB Atlas connection..."
cd server
if node test-atlas-connection.js; then
    echo "✅ MongoDB Atlas connection successful!"
    cd ..
else
    echo "❌ MongoDB Atlas connection failed!"
    echo "💡 Please check your connection string and network connectivity."
    cd ..
    exit 1
fi

echo ""
echo "🐳 Starting Docker containers with Atlas configuration..."
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start with Atlas-specific configuration (no local MongoDB)
echo "▶️  Starting services with MongoDB Atlas..."
echo "🚀 Starting Expense Tracker with MongoDB Atlas..."
docker-compose -f ../../docker/docker-compose.yml -f ../../docker/docker-compose.atlas.yml up --build

echo ""
echo "🎉 Application started successfully!"
echo "   Frontend: http://localhost:$(grep CLIENT_PORT .env | cut -d'=' -f2)"
echo "   Backend API: http://localhost:$(grep SERVER_PORT .env | cut -d'=' -f2)/api"
echo "   Health Check: http://localhost:$(grep SERVER_PORT .env | cut -d'=' -f2)/api/health" 