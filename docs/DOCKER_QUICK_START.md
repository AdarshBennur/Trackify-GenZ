# 🚀 Trackify-GenZ Docker Quick Start Guide

This guide will help you run the Trackify-GenZ application smoothly using Docker Desktop.

## ✅ Prerequisites

- **Docker Desktop** installed and running
- **MongoDB Atlas** account with the connection string configured
- At least **4GB RAM** available for Docker

## 🎯 Quick Start

### Option 1: Use the Startup Script (Recommended)
```bash
# Start the application
./scripts/automation/start-app.sh

# Stop the application
./scripts/automation/stop-app.sh
```

### Option 2: Manual Docker Compose
```bash
# Start the application
docker-compose up --build

# Stop the application (in another terminal)
docker-compose down
```

## 📋 What's Included

- **Frontend (React)**: http://localhost:3000
- **Backend (Node.js)**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health
- **MongoDB Atlas**: Connected automatically

## 🛡️ Health Monitoring

Both containers include health checks:
- **Server**: Checks API and database connectivity
- **Client**: Checks React app availability
- **Auto-restart**: Containers restart automatically if they fail

## 🎯 Container Features

### Server Container
- ✅ MongoDB Atlas integration
- ✅ Automatic retry on connection failures
- ✅ Hot reload for development
- ✅ Health monitoring
- ✅ Security (non-root user)
- ✅ Memory management (1GB limit)

### Client Container
- ✅ React development server
- ✅ Hot reload for development
- ✅ Health monitoring
- ✅ Security (non-root user)
- ✅ Memory management (1GB limit)

## 🔧 Configuration

Key environment variables in `.env`:
```bash
NODE_ENV=development
CLIENT_PORT=3000
SERVER_PORT=5001
MONGO_URI=mongodb+srv://...  # Your Atlas connection string
JWT_SECRET=supersecretjwtkey123456789
REACT_APP_API_URL=http://localhost:5001/api
```

## 🚨 Troubleshooting

### Container Won't Start
```bash
# Check Docker status
docker info

# View container logs
docker-compose logs server
docker-compose logs client

# Restart fresh
docker-compose down --remove-orphans
docker-compose up --build
```

### Database Connection Issues
- Verify your MongoDB Atlas connection string
- Check if your IP is whitelisted in Atlas
- Ensure the database credentials are correct

### Port Conflicts
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5001

# Change ports in .env file if needed
CLIENT_PORT=3001
SERVER_PORT=5002
```

## 📊 Monitoring in Docker Desktop

1. Open Docker Desktop
2. Go to "Containers" tab
3. View your `trackify-genz` containers
4. Check logs and health status
5. Click on port numbers to open in browser

## 🔄 Development Workflow

1. **Start Development**: `./scripts/automation/start-app.sh`
2. **Make Changes**: Edit code (auto-reloads)
3. **View Logs**: Check Docker Desktop or `docker-compose logs`
4. **Stop Development**: `./scripts/automation/stop-app.sh`

## 📈 Performance Tips

- **Memory**: Each container is limited to 1GB RAM
- **CPU**: Containers share available CPU cores
- **Storage**: Hot reload uses bind mounts for fast development
- **Network**: Optimized MTU settings for better performance

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Both containers show "healthy" in Docker Desktop
- ✅ Frontend loads at http://localhost:3000
- ✅ API responds at http://localhost:5001/api/health
- ✅ You can login and perform CRUD operations
- ✅ No error messages in container logs

---

**Happy coding! 🎨✨** 