# 💰 Expense Tracker - Full-Stack Application

A premium, containerized full-stack web application for tracking personal expenses with elegant UI and comprehensive features. Built with modern DevOps practices and Docker containerization.

## ✨ Features

- **🔐 User Authentication:** Secure registration and login system with JWT
- **📊 Personalized Dashboard:** Visual representation of expense data with charts
- **💳 Expense Management:** Complete CRUD operations for expenses
- **🎯 Budget Planning:** Set and monitor spending limits with notifications
- **📱 Responsive Design:** Seamless experience across all devices
- **🛡️ Protected Routes:** Secure access to user data
- **🐳 Dockerized:** Complete containerization with development and production environments
- **🚀 DevOps Ready:** CI/CD pipelines, monitoring, and deployment automation

## 🛠 Tech Stack

### Frontend
- **React 18** with modern hooks and context
- **Tailwind CSS** for responsive styling
- **Framer Motion** for smooth animations
- **Recharts** for data visualization
- **Axios** for API communication

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT Authentication** for secure sessions
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

### DevOps & Infrastructure
- **Docker & Docker Compose** for containerization
- **Multi-stage builds** for optimized production images
- **Nginx** reverse proxy for production
- **Health checks** and dependency management
- **Volume persistence** for data storage
- **Environment-based configuration**

## 📁 Project Structure

The project has been organized into a clean, logical structure for better maintainability:

```
📦 Trackify-GenZ/
├── 📁 client/                    # React Frontend
├── 📁 server/                    # Node.js Backend  
├── 📁 scripts/                   # Automation scripts
│   └── automation/              # Docker and setup scripts
├── 📁 docker/                   # Docker configuration files
│   ├── docker-compose.yml      # Development environment
│   ├── docker-compose.prod.yml # Production environment
│   └── [other compose files]
├── 📁 k8s/                      # Kubernetes configurations
├── 📁 config/                   # Configuration files
│   ├── env.example             # Environment template
│   └── docker.env             # Docker-specific env vars
├── 📁 docs/                     # Documentation
│   ├── DOCKER_SETUP.md        # Docker setup guide
│   ├── DEVOPS_SETUP.md        # DevOps guide
│   └── [other documentation]
├── 📁 [other directories]       # nginx, monitoring, etc.
└── README.md                   # This file
```

## 🐳 Docker Setup (Recommended)

### Option 1: Docker (Recommended)

The easiest way to run the application is using Docker:

```bash
# Start all services (frontend, backend, database)
docker compose up

# Or run in background
docker compose up -d
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Database: mongodb://localhost:27017/expenseDB

For detailed Docker instructions, see [docs/DOCKER_README.md](docs/DOCKER_README.md).

> **📝 Note:** Project files have been reorganized for better maintainability. All documentation is now in the `docs/` folder, scripts are in `scripts/automation/`, and configuration files are in `config/`. See the [Project Structure](#-project-structure) section above for details.

### Option 2: Manual Setup

### Prerequisites
- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (2.0+)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   ```

2. **Setup environment variables**
   ```bash
   # Copy the template and update with your values
   cp env.template .env
   
   # Edit the .env file with your preferred editor
   nano .env  # or vim .env, code .env, etc.
   ```

3. **Start the application**
   ```bash
   # Build and start all services
   docker-compose up --build
   
   # Or use the helper script
   chmod +x scripts/automation/docker-scripts.sh
   ./scripts/automation/docker-scripts.sh dev:up:build
   ```

4. **Access the application**
   - 🌐 **Frontend:** http://localhost:3000
   - 🚀 **Backend API:** http://localhost:5001/api
   - 🗄️ **MongoDB:** localhost:27017
   - 🔧 **Mongo Express:** http://localhost:8081 (admin/ExpenseAdmin123!)

### 🔧 Docker Helper Scripts

Use the included helper script for common operations:

```bash
# Make script executable
chmod +x scripts/automation/docker-scripts.sh

# Development commands
./scripts/automation/docker-scripts.sh dev:up:build    # Build and start development environment
./scripts/automation/docker-scripts.sh dev:logs        # View logs from all services
./scripts/automation/docker-scripts.sh dev:down        # Stop all services
./scripts/automation/docker-scripts.sh dev:clean       # Clean up containers and volumes

# Production commands
./scripts/automation/docker-scripts.sh prod:build      # Build production containers
./scripts/automation/docker-scripts.sh prod:up         # Start production environment

# Utility commands
./scripts/automation/docker-scripts.sh status          # Show container status
./scripts/automation/docker-scripts.sh logs server     # Show logs for specific service
./scripts/automation/docker-scripts.sh restart client  # Restart specific service

# Database operations
./scripts/automation/docker-scripts.sh db:backup       # Create database backup
./scripts/automation/docker-scripts.sh db:restore FILE # Restore from backup
```

### 🏗 Docker Architecture

#### Development Environment
- **Hot reload** enabled for both frontend and backend
- **Volume mounts** for live code changes
- **Development dependencies** included
- **Debug-friendly** configurations

#### Production Environment
- **Multi-stage builds** for smaller images
- **Nginx reverse proxy** for load balancing
- **Security hardening** with non-root users
- **Resource limits** and health checks
- **SSL/TLS ready** configuration

### 📁 Container Structure

```
📦 Expense Tracker Containers
├── 🌐 Frontend (React + Nginx)
│   ├── Development: Hot reload on port 3000
│   └── Production: Optimized build with Nginx
├── 🚀 Backend (Node.js + Express)
│   ├── API endpoints on port 5001
│   ├── JWT authentication
│   └── MongoDB connection
├── 🗄️ Database (MongoDB)
│   ├── Persistent data volumes
│   ├── Authentication enabled
│   └── Automatic initialization
└── 🔧 Admin Tools
    └── Mongo Express (Optional)
```

### 🌍 Environment Variables

Key environment variables in `.env`:

```bash
# Application
NODE_ENV=development
BUILD_TARGET=development

# Ports
CLIENT_PORT=3000
SERVER_PORT=5001

# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=SecurePassword123!
MONGO_DB_NAME=expensetracker

# Security
JWT_SECRET=your-super-secret-jwt-key
```

## 🔧 Traditional Setup (Without Docker)

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- MongoDB Atlas account or local MongoDB

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```

2. **Setup environment**
   ```bash
   # Create server environment file
   cd server
   cp ../config/env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

## 🚀 DevOps & CI/CD

### 📋 Planned DevOps Implementation

The application is designed with comprehensive DevOps practices:

#### Infrastructure as Code (IaC)
- **Terraform** configurations for cloud infrastructure
- **Ansible** playbooks for server configuration
- **Kubernetes** manifests for container orchestration

#### CI/CD Pipeline
- **GitHub Actions** for automated testing and deployment
- **Docker Hub** for container registry
- **Multi-environment** deployments (dev, staging, prod)

#### Monitoring & Observability
- **Prometheus** for metrics collection
- **Grafana** for visualization dashboards
- **Health checks** and alerting

#### Security & Secrets Management
- **HashiCorp Vault** for secrets management
- **GitHub Secrets** for CI/CD variables
- **Security scanning** in CI pipeline

### 🔍 Health Monitoring

Built-in health checks for all services:

```bash
# Check application health
curl http://localhost:5001/api/health

# View container health status
docker-compose ps
```

### 📊 Performance Optimization

- **Multi-stage Docker builds** reduce image size
- **Nginx caching** for static assets
- **Database indexing** for optimal queries
- **Resource limits** prevent resource exhaustion

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Expense Management
- `GET /api/expenses` - Get user expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Additional Features
- Budget management (`/api/budgets`)
- Income tracking (`/api/incomes`)
- Goal setting (`/api/goals`)
- Reminders (`/api/reminders`)

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Password hashing** with bcrypt
- **CORS protection** for cross-origin requests
- **Environment variable** protection
- **Non-root containers** in production
- **Security headers** with Nginx

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting guide](#troubleshooting)
2. Review container logs: `./scripts/automation/docker-scripts.sh logs`
3. Create an issue on GitHub
4. Check the health endpoints

### Troubleshooting

**Port conflicts:**
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5001

# Stop conflicting processes or change ports in .env
```

**Database connection issues:**
```bash
# Check MongoDB container status
docker-compose ps mongo

# View MongoDB logs
docker-compose logs mongo
```

**Permission issues:**
```bash
# Make scripts executable
chmod +x scripts/automation/docker-scripts.sh

# Fix volume permissions (if needed)
sudo chown -R $USER:$USER ./
```

---

**Built with ❤️ for the developer community** 