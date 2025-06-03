#!/bin/sh
# Health check script for the client

# Check if the React app is responding
if curl -f http://localhost:3000/ >/dev/null 2>&1; then
  echo "✅ Client is healthy and serving content"
  exit 0
else
  echo "❌ Client is not responding"
  exit 1
fi 