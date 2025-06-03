# 🚀 Expense Tracker Complete DevOps Setup

This document provides comprehensive setup instructions for the Expense Tracker application with a full DevOps stack including monitoring, security, and code quality tools.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Compose Setup](#docker-compose-setup)
- [Kubernetes Setup](#kubernetes-setup)
- [Service Details](#service-details)
- [Access Information](#access-information)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## 🔍 Overview

This DevOps stack includes:

### Application Services
- **Frontend**: React application (Port 3000)
- **Backend**: Node.js API server (Port 5001)

### Monitoring Services
- **Prometheus**: Metrics collection (Port 9090)
- **Grafana**: Visualization dashboards (Port 3001)
- **Node Exporter**: System metrics (Port 9100)

### Security Services
- **HashiCorp Vault**: Secrets management (Port 8200)

### Code Quality Services
- **SonarQube**: Code analysis (Port 9000)
- **PostgreSQL**: Database for SonarQube

### Infrastructure Services
- **Nginx**: Reverse proxy (Port 80/443)

## 📦 Prerequisites

### For Docker Compose
- Docker Desktop 4.0+
- Docker Compose 2.0+
- 8GB+ RAM
- 10GB+ free disk space

### For Kubernetes
- Docker Desktop with Kubernetes enabled, OR
- Minikube 1.25+
- kubectl CLI tool
- 12GB+ RAM
- 15GB+ free disk space

### System Requirements
```bash
# Check Docker version
docker --version
docker-compose --version

# Check Kubernetes (if using)
kubectl version --client
```

## ⚡ Quick Start

### Option 1: Docker Compose (Recommended for Development)

```bash
# 1. Clone and navigate to project
cd /path/to/Trackify-GenZ

# 2. Run the startup script
./scripts/start-devops-stack.sh

# 3. Wait for all services to start (3-5 minutes)
# 4. Access services at the URLs shown
```

### Option 2: Kubernetes

```bash
# 1. Ensure Kubernetes is running
kubectl cluster-info

# 2. Deploy the stack
./scripts/start-k8s-stack.sh

# 3. Set up port forwarding
./scripts/port-forward-services.sh

# 4. Access services at the forwarded ports
```

## 🐳 Docker Compose Setup

### Start All Services
```bash
# Start complete stack
docker-compose -f docker/docker-compose.full.yml up -d

# Start specific services
docker-compose -f docker/docker-compose.full.yml up -d prometheus grafana vault

# View logs
docker-compose -f docker/docker-compose.full.yml logs -f [service-name]

# Stop all services
docker-compose -f docker/docker-compose.full.yml down

# Remove all volumes (data loss!)
docker-compose -f docker/docker-compose.full.yml down -v
```

### Service Startup Order
1. **Infrastructure**: Vault, Prometheus, Node Exporter
2. **Monitoring**: Grafana
3. **Databases**: SonarQube PostgreSQL
4. **Applications**: Backend, Frontend, SonarQube
5. **Proxy**: Nginx (optional)

## ☸️ Kubernetes Setup

### Deploy All Services
```bash
# Create namespaces
kubectl apply -f k8s/base/namespace.yaml

# Deploy infrastructure
kubectl apply -f k8s/base/vault-deployment.yaml

# Deploy monitoring
kubectl apply -f k8s/monitoring/

# Deploy code quality
kubectl apply -f k8s/base/sonarqube-deployment.yaml

# Deploy applications
kubectl apply -f k8s/base/backend-deployment.yaml
kubectl apply -f k8s/base/frontend-deployment.yaml
```

### Port Forwarding
```bash
# Automated port forwarding
./scripts/port-forward-services.sh

# Manual port forwarding
kubectl port-forward -n expense-tracker svc/frontend-service 3000:3000 &
kubectl port-forward -n expense-tracker svc/backend-service 5001:5001 &
kubectl port-forward -n expense-tracker-monitoring svc/prometheus-service 9090:9090 &
kubectl port-forward -n expense-tracker-monitoring svc/grafana-service 3001:3000 &
kubectl port-forward -n expense-tracker svc/vault-service 8200:8200 &
kubectl port-forward -n expense-tracker svc/sonarqube-service 9000:9000 &
```

### Check Deployment Status
```bash
# Check all pods
kubectl get pods -n expense-tracker
kubectl get pods -n expense-tracker-monitoring

# Check services
kubectl get svc -n expense-tracker
kubectl get svc -n expense-tracker-monitoring

# View logs
kubectl logs -f deployment/backend -n expense-tracker
```

## 📊 Service Details

### Frontend (React App)
- **URL**: http://localhost:3000
- **Purpose**: User interface for expense tracking
- **Health Check**: `curl http://localhost:3000`

### Backend (Node.js API)
- **URL**: http://localhost:5001/api
- **Purpose**: RESTful API for business logic
- **Health Check**: `curl http://localhost:5001/api/health`
- **Metrics**: `curl http://localhost:5001/api/metrics`

### Prometheus
- **URL**: http://localhost:9090
- **Purpose**: Metrics collection and alerting
- **Configuration**: `monitoring/prometheus/prometheus.yml`
- **Targets**: All application and infrastructure services

### Grafana
- **URL**: http://localhost:3001
- **Credentials**: admin / admin123
- **Purpose**: Visualization and dashboards
- **Datasource**: Pre-configured Prometheus connection

### Vault
- **URL**: http://localhost:8200
- **Root Token**: myroot (development only)
- **Purpose**: Secrets management
- **Secrets Path**: `expense-tracker/*`

### SonarQube
- **URL**: http://localhost:9000
- **Credentials**: admin / admin (first login)
- **Purpose**: Code quality analysis
- **Database**: PostgreSQL (internal)

## 🌐 Access Information

| Service | URL | Credentials | Purpose |
|---------|-----|-------------|---------|
| Frontend | http://localhost:3000 | - | Main application |
| Backend API | http://localhost:5001/api | - | REST API |
| Prometheus | http://localhost:9090 | - | Metrics & monitoring |
| Grafana | http://localhost:3001 | admin/admin123 | Dashboards |
| Vault | http://localhost:8200 | root token: myroot | Secrets |
| SonarQube | http://localhost:9000 | admin/admin | Code quality |
| Node Exporter | http://localhost:9100 | - | System metrics |

## 🔧 Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check Docker resources
docker system df
docker system prune -f

# Check service logs
docker-compose -f docker/docker-compose.full.yml logs [service-name]

# Restart specific service
docker-compose -f docker/docker-compose.full.yml restart [service-name]
```

#### Port Conflicts
```bash
# Check what's using a port
lsof -i :3000
netstat -tulpn | grep :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)
```

#### Memory Issues
```bash
# Check Docker memory usage
docker stats

# Increase Docker Desktop memory allocation to 8GB+
# Restart Docker Desktop
```

#### Kubernetes Issues
```bash
# Check node resources
kubectl describe nodes

# Check pod events
kubectl describe pod [pod-name] -n [namespace]

# Force delete stuck pods
kubectl delete pod [pod-name] -n [namespace] --force --grace-period=0
```

### Health Checks
```bash
# Application health
curl http://localhost:3000
curl http://localhost:5001/api/health

# Service health
curl http://localhost:9090/-/healthy     # Prometheus
curl http://localhost:3001/api/health    # Grafana
curl http://localhost:8200/v1/sys/health # Vault
curl http://localhost:9000/api/system/status # SonarQube
```

## ⚙️ Advanced Configuration

### Environment Variables
Create a `.env` file in the project root:
```bash
# Application
NODE_ENV=development
CLIENT_PORT=3000
SERVER_PORT=5001

# Database
MONGO_URI=your_mongodb_connection_string

# Security
JWT_SECRET=your_jwt_secret
VAULT_TOKEN=myroot

# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin123
```

### Custom Prometheus Configuration
Edit `monitoring/prometheus/prometheus.yml` to add custom targets:
```yaml
scrape_configs:
  - job_name: 'custom-app'
    static_configs:
      - targets: ['your-app:port']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Custom Grafana Dashboards
Add dashboard JSON files to `monitoring/grafana/dashboards/`

### Vault Secrets
```bash
# Access Vault CLI (in running container)
docker exec -it trackify-vault vault kv put expense-tracker/database \
  mongo_uri="your_mongo_connection" \
  username="your_username" \
  password="your_password"
```

### SonarQube Project Setup
1. Access SonarQube at http://localhost:9000
2. Login with admin/admin
3. Create new project: "expense-tracker"
4. Generate token for CI/CD
5. Add `sonar-project.properties` to your project

## 📝 Maintenance

### Regular Tasks
```bash
# Update Docker images
docker-compose -f docker/docker-compose.full.yml pull
docker-compose -f docker/docker-compose.full.yml up -d

# Clean up unused resources
docker system prune -f
docker volume prune -f

# Backup Grafana dashboards
docker cp trackify-grafana:/var/lib/grafana ./backup/

# Backup Vault data (if using file backend)
docker cp trackify-vault:/vault/data ./backup/
```

### Monitoring
- Check Prometheus targets: http://localhost:9090/targets
- View Grafana dashboards: http://localhost:3001
- Monitor resource usage: `docker stats` or `kubectl top pods`

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: DevOps Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Start DevOps Stack
        run: ./scripts/start-devops-stack.sh
      - name: Run Tests
        run: npm test
      - name: SonarQube Analysis
        run: sonar-scanner
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Vault Documentation](https://www.vaultproject.io/docs)
- [SonarQube Documentation](https://docs.sonarqube.org/)

## 🆘 Support

For issues:
1. Check service logs: `docker-compose logs [service]`
2. Verify service health endpoints
3. Check resource usage: `docker stats`
4. Review this troubleshooting guide
5. Create GitHub issue with logs and environment details

---

**Happy DevOps! 🚀** 