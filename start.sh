#!/bin/bash

# start.sh - Script to start the Trackify-GenZ application on Replit

echo "Starting Trackify-GenZ application..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
  echo "Installing dependencies..."
  npm run install-all
fi

# Check if we're running in Replit environment
if [ -n "$REPL_ID" ] || [ -n "$REPL_OWNER" ]; then
  echo "Detected Replit environment"
  
  # Check for required environment variables
  if [ -z "$MONGO_URI" ]; then
    echo "⚠️ MONGO_URI is not set. Please add it to Replit Secrets."
    echo "See REPLIT_SETUP.md for instructions."
  fi
  
  if [ -z "$JWT_SECRET" ]; then
    echo "⚠️ JWT_SECRET is not set. Please add it to Replit Secrets."
    echo "See REPLIT_SETUP.md for instructions."
  fi
  
  echo "Setting NODE_ENV to production if not set"
  export NODE_ENV=${NODE_ENV:-production}
  
  echo "Setting PORT to 3000 if not set"
  export PORT=${PORT:-3000}
  
  echo "Starting server in production mode..."
  npm start
else
  # If not in Replit, assume development environment
  echo "Starting in development mode (client + server)..."
  npm run dev
fi 