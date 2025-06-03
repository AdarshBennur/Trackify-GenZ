# Docker Setup for Expense Tracker MERN Application

This guide explains how to run the full-stack expense tracker application using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or later)
- Docker Compose (version 2.0 or later)
- Amazon Linux 2023 EC2 instance (or any Linux system with Docker installed)

## Architecture

The application consists of three main services:

1. **Frontend (React)**: Served by Nginx on port 3000
2. **Backend (Node.js/Express)**: API server on port 5000
3. **Database (MongoDB)**: Database server on port 27017

## Quick Start

### 1. Clone and Navigate to Project

```bash
git clone <your-repo-url>
cd expense-tracker
```

### 2. Start All Services

```bash
docker compose up
```

Or run in detached mode:

```bash
docker compose up -d
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Database**: mongodb://localhost:27017/expenseDB

## Environment Variables

The application uses the following environment variables (configured in docker-compose.yml):

### Backend Environment
- `NODE_ENV=production`
- `PORT=5000`
- `MONGO_URI=mongodb://mongo:27017/expenseDB`
- `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production`
- `CLIENT_URL=http://localhost:3000`

### MongoDB Environment
- `MONGO_INITDB_ROOT_USERNAME=admin`
- `MONGO_INITDB_ROOT_PASSWORD=password123`
- `MONGO_INITDB_DATABASE=expenseDB`

⚠️ **Security Note**: Change the JWT_SECRET and MongoDB credentials before deploying to production!

## Docker Services Details

### Frontend Service (`client`)
- **Base Image**: nginx:alpine
- **Build**: Multi-stage build (Node.js → Nginx)
- **Port**: 3000:80
- **Features**:
  - Production-optimized React build
  - Gzip compression
  - React Router support
  - Security headers
  - Health checks

### Backend Service (`server`)
- **Base Image**: node:18-alpine
- **Port**: 5000:5000
- **Features**:
  - Non-root user for security
  - Health checks
  - Automatic restart
  - Waits for MongoDB to be ready

### Database Service (`mongo`)
- **Image**: mongo:7.0
- **Port**: 27017:27017
- **Features**:
  - Persistent data storage
  - Automatic database initialization
  - Health checks
  - Indexed collections

## Useful Commands

### Start Services
```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Start specific service
docker compose up mongo server
```

### Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ destroys data)
docker compose down -v
```

### View Logs
```bash
# All services
docker compose logs

# Specific service
docker compose logs server
docker compose logs client
docker compose logs mongo

# Follow logs
docker compose logs -f server
```

### Rebuild Services
```bash
# Rebuild all services
docker compose build

# Rebuild specific service
docker compose build server

# Rebuild and start
docker compose up --build
```

## Development Mode

For development with hot reload:

1. Update `docker-compose.yml` to mount source code:

```yaml
# Add to server service
volumes:
  - ./server:/app
  - /app/node_modules

# Add to client service for development
volumes:
  - ./client:/app
  - /app/node_modules
```

2. Change the client Dockerfile to use development server instead of Nginx.

## Production Deployment on EC2

### 1. Install Docker on Amazon Linux 2023

```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd expense-tracker

# Update security settings
# Change JWT_SECRET in docker-compose.yml
# Change MongoDB credentials

# Start application
docker compose up -d
```

### 3. Configure EC2 Security Groups

Allow inbound traffic on:
- Port 22 (SSH)
- Port 3000 (Frontend)
- Port 5000 (Backend API)
- Port 27017 (MongoDB - if external access needed)

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo lsof -i :3000
   sudo lsof -i :5000
   
   # Kill process if needed
   sudo kill -9 <PID>
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB logs
   docker compose logs mongo
   
   # Verify MongoDB is healthy
   docker compose ps
   ```

3. **Frontend Not Loading**
   ```bash
   # Check if build completed successfully
   docker compose logs client
   
   # Rebuild frontend
   docker compose build client
   ```

4. **Backend API Errors**
   ```bash
   # Check backend logs
   docker compose logs server
   
   # Verify environment variables
   docker compose exec server env
   ```

### Health Checks

Check service health:
```bash
# Overall status
docker compose ps

# Specific health checks
curl http://localhost:3000/health  # Frontend
curl http://localhost:5000/api/health  # Backend
```

### Reset Everything

If you need to start fresh:
```bash
# Stop and remove everything
docker compose down -v

# Remove images
docker compose down --rmi all

# Start fresh
docker compose up --build
```

## Data Persistence

MongoDB data is persisted in Docker volumes:
- `expense-tracker-mongo-data`: Database files
- `expense-tracker-mongo-config`: Configuration files

To backup data:
```bash
# Create backup
docker compose exec mongo mongodump --out /backup
docker cp expense-tracker-db:/backup ./mongodb-backup

# Restore backup
docker cp ./mongodb-backup expense-tracker-db:/backup
docker compose exec mongo mongorestore /backup
```

## Performance Tips

1. **Use Docker BuildKit** for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   docker compose build
   ```

2. **Optimize Images**: The Dockerfiles use multi-stage builds and alpine images for smaller sizes.

3. **Resource Limits**: Add resource limits in docker-compose.yml for production:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 512M
         cpus: '0.5'
   ```

## Security Considerations

1. **Change Default Passwords**: Update MongoDB credentials
2. **Use Secrets**: For production, use Docker secrets instead of environment variables
3. **Network Security**: Use custom networks to isolate services
4. **Regular Updates**: Keep base images updated
5. **Non-root Users**: All services run as non-root users where possible

## Support

For issues related to:
- Docker setup: Check this README and Docker logs
- Application bugs: Check the main README.md
- MongoDB issues: Check MongoDB logs and connection strings 