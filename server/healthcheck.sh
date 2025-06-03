#!/bin/sh
# Health check script for the server

# Check if the server is responding
curl -f http://localhost:5001/api/health || exit 1

# Check if MongoDB Atlas connection is working
if [ "$(curl -s http://localhost:5001/api/health | grep -o 'connected')" = "connected" ]; then
  echo "✅ Server and database are healthy"
  exit 0
else
  echo "❌ Database connection issue"
  exit 1
fi 