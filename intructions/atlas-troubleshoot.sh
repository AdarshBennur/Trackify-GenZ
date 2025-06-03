 

echo "🔍 MongoDB Atlas Connection Troubleshooter"
echo "=========================================="

echo ""
echo "📡 Getting your current public IP address..."
CURRENT_IP=$(curl -s ifconfig.me)
echo "🌐 Your current IP: $CURRENT_IP"

echo ""
echo "🔧 ATLAS NETWORK ACCESS CHECKLIST:"
echo "1. Login to MongoDB Atlas: https://cloud.mongodb.com"
echo "2. Go to 'Network Access' in the left sidebar"
echo "3. Make sure one of these IPs is whitelisted:"
echo "   - 0.0.0.0/0 (Allow access from anywhere) - RECOMMENDED for development"
echo "   - $CURRENT_IP/32 (Your current IP address)"

echo ""
echo "⏳ Testing MongoDB Atlas connection..."
cd server && node test-atlas-connection.js
TEST_RESULT=$?

echo ""
if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ MongoDB Atlas connection successful!"
    echo "🚀 Ready to start Docker containers..."
    echo ""
    echo "Run: docker-compose up --build"
else
    echo "❌ MongoDB Atlas connection failed."
    echo ""
    echo "🛠️  TROUBLESHOOTING STEPS:"
    echo "1. Check Network Access in Atlas Dashboard"
    echo "2. Wait 1-2 minutes after changing network settings"
    echo "3. Verify your connection string is correct"
    echo "4. Check if your Atlas cluster is running (not paused)"
    echo ""
    echo "🔄 After fixing, run this script again: ./atlas-troubleshoot.sh"
fi

echo ""
echo "📋 ATLAS DASHBOARD QUICK LINKS:"
echo "- Main Dashboard: https://cloud.mongodb.com"
echo "- Network Access: https://cloud.mongodb.com/v2#/security/network/whitelist"
echo "- Database Access: https://cloud.mongodb.com/v2#/security/database/users"