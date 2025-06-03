# 🐳 Docker Setup Guide for Expense Tracker

## Overview

This guide covers the complete Docker-based DevOps setup for the Expense Tracker application, including development and production environments.

## 📁 Project Structure

```
expense-tracker/
├── 📁 client/                    # React Frontend
│   ├── Dockerfile               # Multi-stage build for React app
│   ├── nginx.conf               # Nginx configuration for production
│   ├── .dockerignore            # Files to exclude from Docker context
│   └── package.json             # Frontend dependencies
├── 📁 server/                    # Node.js Backend
│   ├── Dockerfile               # Multi-stage build for Node.js app
│   ├── .dockerignore            # Files to exclude from Docker context
│   └── package.json             # Backend dependencies
├── 📁 docker/                    # Docker configuration files
│   ├── docker-compose.yml       # Development environment
│   ├── docker-compose.prod.yml  # Production environment
│   ├── docker-compose.full.yml  # Full DevOps stack
│   └── docker-compose.atlas.yml # MongoDB Atlas configuration
├── 📁 scripts/                   # Script files
│   └── automation/              # Automation scripts
│       ├── docker-scripts.sh    # Docker helper scripts
│       ├── start-app.sh         # Quick start script
│       └── stop-app.sh          # Quick stop script
├── 📁 k8s/                      # Kubernetes configuration
│   ├── k8s-scripts.sh           # Kubernetes helper scripts
│   └── [k8s manifests]
├── 📁 config/                   # Configuration files
│   ├── env.example              # Environment template
│   └── docker.env              # Docker-specific env vars
├── 📁 docs/                     # Documentation
│   ├── DOCKER_SETUP.md         # This file
│   ├── DEVOPS_SETUP.md         # DevOps guide
│   └── [other docs]
├── 📁 .github/workflows/        # CI/CD Pipeline
│   └── ci-cd.yml               # GitHub Actions workflow
├── mongo-init.js               # MongoDB initialization script
├── .env                        # Environment variables
└── README.md                   # Main documentation
```

## 🚀 Quick Start

### 1. Prerequisites

- **Docker Desktop** or **Docker Engine** (20.10+)
- **Docker Compose** (2.0+)
- **Git**

### 2. Setup Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd expense-tracker

# Copy environment template
cp env.template .env

# Edit environment variables (optional)
nano .env
```

### 3. Start Development Environment

```bash
# Make scripts executable
chmod +x scripts/automation/docker-scripts.sh

# Build and start all services
./scripts/automation/docker-scripts.sh dev:up:build

# Or use Docker Compose directly
docker-compose -f docker/docker-compose.yml up --build
```

### 4. Access Services

- 🌐 **Frontend**: http://localhost:3000
- 🚀 **Backend API**: http://localhost:5001/api
- 🗄️ **MongoDB**: localhost:27017
- 🔧 **Mongo Express**: http://localhost:8081 (admin/ExpenseAdmin123!)

## 🛠 Available Commands

### Docker Helper Scripts

```bash
# Development Commands
./scripts/automation/docker-scripts.sh dev:build       # Build development containers
./scripts/automation/docker-scripts.sh dev:up          # Start development environment
./scripts/automation/docker-scripts.sh dev:up:build    # Build and start development environment
./scripts/automation/docker-scripts.sh dev:logs        # Show development logs
./scripts/automation/docker-scripts.sh dev:down        # Stop development environment
./scripts/automation/docker-scripts.sh dev:clean       # Clean up all containers and volumes

# Production Commands
./scripts/automation/docker-scripts.sh prod:build      # Build production containers
./scripts/automation/docker-scripts.sh prod:up         # Start production environment
./scripts/automation/docker-scripts.sh prod:down       # Stop production environment

# Utility Commands
./scripts/automation/docker-scripts.sh status          # Show container status and resource usage
./scripts/automation/docker-scripts.sh logs [SERVICE]  # Show logs (optional: specify service)
./scripts/automation/docker-scripts.sh restart SERVICE # Restart a specific service

# Database Commands
./scripts/automation/docker-scripts.sh db:backup       # Create database backup
./scripts/automation/docker-scripts.sh db:restore FILE # Restore database from backup
```

### Direct Docker Compose Commands

```bash
# Development
docker-compose -f docker/docker-compose.yml up --build           # Build and start all services
docker-compose -f docker/docker-compose.yml down                 # Stop all services
docker-compose -f docker/docker-compose.yml logs -f              # Follow logs
docker-compose -f docker/docker-compose.yml ps                   # Show container status

# Production
docker-compose -f docker/docker-compose.prod.yml up --build
docker-compose -f docker/docker-compose.prod.yml down
```

## 🏗 Architecture

### Development Environment

- **Hot Reload**: Enabled for both frontend and backend
- **Volume Mounts**: Source code mounted for live changes
- **Debug Mode**: All development dependencies included
- **Port Mapping**: Direct access to all services

### Production Environment

- **Multi-stage Builds**: Optimized for size and security
- **Nginx Reverse Proxy**: Load balancing and caching
- **Security Hardening**: Non-root users, limited resources
- **Health Checks**: Automated container health monitoring

## 🔧 Configuration

### Environment Variables

Key variables in `.env` file:

```bash
# Application Environment
NODE_ENV=development
BUILD_TARGET=development

# Port Configuration
CLIENT_PORT=3000
SERVER_PORT=5001
MONGO_EXPRESS_PORT=8081

# Database Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=SecurePassword123!
MONGO_DB_NAME=expensetracker

# Security
JWT_SECRET=your-super-secret-jwt-key
```

### Docker Compose Services

#### MongoDB Service
- **Image**: mongo:7.0
- **Authentication**: Enabled with root user
- **Persistence**: Data volumes for durability
- **Initialization**: Automatic database setup
- **Health Check**: Connection monitoring

#### Backend Service
- **Build**: Multi-stage Dockerfile
- **Dependencies**: Waits for MongoDB health
- **Environment**: Configurable via .env
- **Hot Reload**: Nodemon in development
- **Health Check**: API endpoint monitoring

#### Frontend Service
- **Build**: Multi-stage Dockerfile with Nginx
- **Dependencies**: Waits for backend health
- **Proxy**: API requests routed to backend
- **Hot Reload**: React dev server in development
- **Static Assets**: Optimized serving in production

#### Mongo Express (Optional)
- **Purpose**: Database administration interface
- **Access**: Web-based MongoDB management
- **Security**: Basic authentication enabled
- **Profile**: Only runs with `--profile admin`

## 🔍 Monitoring & Health Checks

### Built-in Health Checks

All services include health checks:

```bash
# Check individual service health
docker-compose ps

# Check application health endpoint
curl http://localhost:5001/api/health

# View detailed container stats
docker stats
```

### Log Management

```bash
# View all logs
./scripts/automation/docker-scripts.sh dev:logs

# View specific service logs
./scripts/automation/docker-scripts.sh logs server
./scripts/automation/docker-scripts.sh logs client
./scripts/automation/docker-scripts.sh logs mongo

# Follow logs in real-time
docker-compose logs -f [service-name]
```

## 🔐 Security Features

### Container Security
- **Non-root users** in production containers
- **Minimal base images** (Alpine Linux)
- **Security headers** via Nginx
- **Environment variable** protection

### Network Security
- **Isolated networks** for service communication
- **No unnecessary port exposure** in production
- **Reverse proxy** for external access
- **CORS configuration** for API security

### Database Security
- **Authentication enabled** by default
- **User roles** with minimal privileges
- **Connection encryption** support
- **Data persistence** with proper permissions

## 🚀 CI/CD Integration

### GitHub Actions Pipeline

The included CI/CD pipeline provides:

- **Code Quality Checks**: ESLint, security audits
- **Automated Testing**: Unit and integration tests
- **Docker Image Building**: Multi-platform builds
- **Security Scanning**: Vulnerability assessment
- **Deployment**: Staging and production environments
- **Performance Testing**: Lighthouse CI integration

### Pipeline Stages

1. **Code Quality & Security**
   - Dependency installation
   - Linting and code analysis
   - Security vulnerability scanning

2. **Docker Build & Test**
   - Multi-platform image builds
   - Container testing
   - Registry publishing

3. **Integration Testing**
   - End-to-end API tests
   - Database integration tests

4. **Deployment**
   - Staging deployment (develop branch)
   - Production deployment (main branch)
   - Notification and monitoring

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5001
lsof -i :27017

# Change ports in .env file
CLIENT_PORT=3001
SERVER_PORT=5002
```

#### Database Connection Issues
```bash
# Check MongoDB container
docker-compose ps mongo

# View MongoDB logs
docker-compose logs mongo

# Restart MongoDB service
./scripts/automation/docker-scripts.sh restart mongo
```

#### Permission Issues
```bash
# Fix script permissions
chmod +x scripts/automation/docker-scripts.sh

# Fix volume permissions (if needed)
sudo chown -R $USER:$USER ./
```

#### Build Issues
```bash
# Clean Docker cache
docker system prune -f

# Rebuild without cache
docker-compose build --no-cache

# Clean and rebuild everything
./scripts/automation/docker-scripts.sh dev:clean
./scripts/automation/docker-scripts.sh dev:up:build
```

### Performance Optimization

#### Development
- Use volume mounts for hot reload
- Enable BuildKit for faster builds
- Use multi-stage builds to reduce image size

#### Production
- Implement resource limits
- Enable gzip compression
- Use CDN for static assets
- Implement database indexing

## 📊 Monitoring & Observability

### Planned Integrations

- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Jaeger**: Distributed tracing
- **ELK Stack**: Centralized logging

### Health Endpoints

- `GET /api/health` - Application health status
- Docker health checks for all containers
- Automatic restart on failure

## 🚀 Production Deployment

### Prerequisites
- Production server with Docker
- Domain name and SSL certificates
- Environment-specific secrets

### Deployment Steps

1. **Prepare Environment**
   ```bash
   # Set production environment variables
   NODE_ENV=production
   BUILD_TARGET=production
   JWT_SECRET=<secure-production-secret>
   ```

2. **Deploy Application**
   ```bash
   # Production deployment
   ./scripts/automation/docker-scripts.sh prod:up
   ```

3. **Verify Deployment**
   ```bash
   # Check all services
   docker-compose -f docker-compose.prod.yml ps
   
   # Check health endpoints
   curl https://your-domain.com/api/health
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test with Docker: `./scripts/automation/docker-scripts.sh dev:up:build`
4. Run tests and linting
5. Submit pull request

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Ready to containerize your development workflow! 🚀** 