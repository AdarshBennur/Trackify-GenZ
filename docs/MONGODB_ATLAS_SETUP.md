# 🌐 MongoDB Atlas Configuration Guide for Trackify-GenZ

## Current Status
Your application is **successfully storing ALL data types**, but currently using a **local MongoDB container** instead of your **MongoDB Atlas cluster**.

## Data Types Confirmed Working ✅
- 👤 **User Credentials** (registration, login, profiles)
- 💰 **Expenses** (creation, retrieval, updates)
- 💵 **Income** (creation, retrieval, updates)
- 📈 **Budgets** (creation, utilization tracking)
- 🎯 **Goals** (creation, progress updates)
- ⏰ **Reminders** (creation, completion status)

---

## 🔧 Switch to MongoDB Atlas

### Step 1: Get Your MongoDB Atlas Connection String

1. **Log in to MongoDB Atlas** (https://cloud.mongodb.com)
2. **Go to your cluster** → Click "Connect"
3. **Choose "Connect your application"**
4. **Copy the connection string** - it should look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
   ```

### Step 2: Configure Network Access

1. **In Atlas Dashboard** → Go to "Network Access"
2. **Add IP Address** → Select "Allow access from anywhere" (`0.0.0.0/0`)
   - This is needed for Docker containers to connect
3. **Confirm** the changes

### Step 3: Create Environment File

Create a `.env` file in your project root:

```bash
# Copy this to .env file
NODE_ENV=development
BUILD_TARGET=development

# Port Configuration
CLIENT_PORT=3000
SERVER_PORT=5001

# MongoDB Atlas Configuration - REPLACE WITH YOUR CONNECTION STRING
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/expensetracker?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-expense-tracker-change-in-production
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
BCRYPT_ROUNDS=10

# Frontend Configuration
CLIENT_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5001/api

# Debug Configuration
DEBUG_AUTH=true
```

### Step 4: Update Docker Compose Command

**Option A: Using Environment File**
```bash
# Stop current containers
docker-compose down

# Start with Atlas configuration
docker-compose up
```

**Option B: Using Atlas-specific Override**
```bash
# Stop current containers
docker-compose down

# Start with Atlas override (skips local MongoDB)
docker-compose -f docker-compose.yml -f docker-compose.atlas.yml up
```

---

## 🧪 Testing Atlas Connection

After switching to Atlas, run this test:

```bash
cd server
node testDataPersistence.js
```

This will verify that all data types are being stored in your Atlas cluster.

---

## 🔍 Verify Atlas Connection

### Check Server Logs
```bash
docker-compose logs server | grep -i mongo
```

**Expected Output (Atlas):**
```
MongoDB URI configured: mongodb+srv://...@cluster0.xxxxx.mongodb.net/...
MongoDB Connected: cluster0-shard-00-02.xxxxx.mongodb.net
```

**Current Output (Local):**
```
MongoDB URI configured: mongodb://admin:...@mongo:27017/...
MongoDB Connected: mongo
```

### Check Atlas Dashboard
1. Go to your **Atlas cluster dashboard**
2. Click **"Browse Collections"**
3. You should see these collections:
   - `users`
   - `expenses` 
   - `incomes`
   - `budgets`
   - `goals`
   - `reminders`
   - `currencies`

---

## ⚠️ Important Notes

### Data Migration
- **Current data** is in the local container and **will be lost** when switching to Atlas
- If you want to **preserve existing data**, you'll need to export from local and import to Atlas
- For testing purposes, you can start fresh with Atlas

### Security
- **Never commit** your `.env` file with real credentials
- Use **strong passwords** for your Atlas database user
- Consider **IP whitelisting** in production instead of allowing all IPs

### Troubleshooting
If connection fails:
1. **Double-check** the connection string format
2. **Verify** network access settings in Atlas
3. **Ensure** database user has read/write permissions
4. **Check** Docker logs for detailed error messages

---

## 🎯 Quick Setup Commands

```bash
# 1. Create .env file with your Atlas connection string
cp env.template .env
# Edit .env file with your Atlas connection string

# 2. Stop current containers
docker-compose down

# 3. Start with Atlas configuration
docker-compose up

# 4. Test data persistence
cd server && node testDataPersistence.js

# 5. Verify in Atlas dashboard
# Go to Atlas → Browse Collections
```

---

## ✅ Success Indicators

After successful Atlas setup, you should see:

1. **Server logs** showing Atlas connection
2. **All tests passing** in testDataPersistence.js
3. **Data visible** in Atlas Browse Collections
4. **Application working** normally at http://localhost:3000

Your application will then store **ALL user data directly in your MongoDB Atlas cluster**! 🚀 