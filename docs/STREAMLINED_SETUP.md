# 🚀 Trackify GenZ - Streamlined DevOps Setup

A streamlined deployment of the Trackify expense tracker with **exactly 7 essential services** for both Docker Compose and Kubernetes (Minikube).

## 📋 **Service Overview**

| Service | Purpose | Docker Port | K8s NodePort |
|---------|---------|-------------|--------------|
| **nginx** | Reverse Proxy & Load Balancer | 80, 443 | 30080 |
| **client** | React Frontend Application | 3000 | 30000 |
| **server** | Node.js Backend API | 5001 | 30001 |
| **grafana** | Monitoring Dashboards | 3001 | 30001 |
| **prometheus** | Metrics Collection & Storage | 9090 | 30090 |
| **sonarqube** | Code Quality Analysis | 9000 | 30900 |
| **vault** | Secrets Management | 8200 | 30200 |

## 🐳 **Docker Compose Setup**

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2+

### Quick Start
```bash
# Start the streamlined stack (7 services only)
docker-compose -f docker/docker-compose.streamlined.yml up -d

# Check status
docker-compose -f docker/docker-compose.streamlined.yml ps

# Stop the stack
docker-compose -f docker/docker-compose.streamlined.yml down
```

### Access URLs (Docker)
| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:5001/api | - |
| Nginx Proxy | http://localhost | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3001 | admin/admin123 |
| Vault | http://localhost:8200 | Token: myroot |
| SonarQube | http://localhost:9000 | admin/admin |

## ☸️ **Kubernetes (Minikube) Setup**

### Prerequisites
- Minikube installed
- kubectl installed
- Docker installed

### Quick Start
```bash
# Deploy to Kubernetes (automated script)
./scripts/start-k8s-streamlined.sh

# Manual deployment
minikube start --driver=docker --memory=8192 --cpus=4
kubectl apply -f k8s/streamlined/

# Check status
kubectl get pods -n trackify-streamlined
kubectl get services -n trackify-streamlined
```

### Access URLs (Kubernetes)
Replace `<MINIKUBE_IP>` with your Minikube IP (`minikube ip`):

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://\<MINIKUBE_IP\>:30000 | - |
| Backend API | http://\<MINIKUBE_IP\>:30001/api | - |
| Nginx Proxy | http://\<MINIKUBE_IP\>:30080 | - |
| Prometheus | http://\<MINIKUBE_IP\>:30090 | - |
| Grafana | http://\<MINIKUBE_IP\>:30001 | admin/admin123 |
| Vault | http://\<MINIKUBE_IP\>:30200 | Token: myroot |
| SonarQube | http://\<MINIKUBE_IP\>:30900 | admin/admin |

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                │
│                         :80, :443                       │
└─────────────────┬───────────────────┬───────────────────┘
                  │                   │
    ┌─────────────▼──────────┐  ┌─────▼──────────────────┐
    │     Client (React)     │  │   Server (Node.js)    │
    │         :3000          │  │       :5001           │
    └────────────────────────┘  └───────▲───────────────┘
                                        │
                              ┌─────────▼─────────┐
                              │   Prometheus      │
                              │      :9090        │
                              │   (Metrics)       │
                              └─────────▲─────────┘
                                        │
                              ┌─────────▼─────────┐
                              │     Grafana       │
                              │      :3001        │
                              │   (Dashboards)    │
                              └───────────────────┘

┌─────────────────┐    ┌─────────────────────────────────┐
│   SonarQube     │    │            Vault               │
│     :9000       │    │            :8200               │
│ (Code Quality)  │    │      (Secrets Management)      │
└─────────────────┘    └─────────────────────────────────┘
```

## 🔧 **Configuration Files**

### Docker Compose
- `docker/docker-compose.streamlined.yml` - Main compose file with 7 services
- `monitoring/prometheus/prometheus-streamlined.yml` - Prometheus config for Docker

### Kubernetes
- `k8s/streamlined/namespace.yml` - Namespace definition
- `k8s/streamlined/*-deployment.yml` - Individual service deployments
- `scripts/start-k8s-streamlined.sh` - Automated deployment script

## 📊 **Monitoring Setup**

### Prometheus Targets
- **trackify-server**: Metrics from Node.js application
- **prometheus**: Self-monitoring
- **grafana**: Grafana metrics
- **vault**: Vault telemetry (with authentication)
- **sonarqube**: Code quality metrics

### Grafana Configuration
- **Datasource**: Auto-configured Prometheus
- **Default Login**: admin/admin123
- **Dashboards**: Pre-configured for application monitoring

## 🔐 **Security Configuration**

### Vault (Development Mode)
- **Root Token**: `myroot`
- **Dev Mode**: Enabled for easy setup
- **Metrics**: Exposed on `/v1/sys/metrics`

### SonarQube
- **Default Login**: admin/admin
- **Database**: Embedded H2 (for simplicity)
- **Elasticsearch**: Bootstrap checks disabled

## 🛠️ **Useful Commands**

### Docker Compose
```bash
# View logs
docker-compose -f docker/docker-compose.streamlined.yml logs -f [service_name]

# Scale a service
docker-compose -f docker/docker-compose.streamlined.yml up -d --scale client=2

# Restart a service
docker-compose -f docker/docker-compose.streamlined.yml restart [service_name]

# Clean up everything
docker-compose -f docker/docker-compose.streamlined.yml down -v
```

### Kubernetes
```bash
# View pod logs
kubectl logs -f deployment/[deployment-name] -n trackify-streamlined

# Scale deployment
kubectl scale deployment [deployment-name] --replicas=2 -n trackify-streamlined

# Port forwarding to localhost
kubectl port-forward service/grafana-service 3001:3000 -n trackify-streamlined

# Delete everything
kubectl delete namespace trackify-streamlined
```

## 🐛 **Troubleshooting**

### Common Issues

1. **SonarQube not starting**
   ```bash
   # Check if vm.max_map_count is sufficient
   sysctl vm.max_map_count
   # If less than 262144, increase it:
   sudo sysctl -w vm.max_map_count=262144
   ```

2. **Vault authentication issues**
   ```bash
   # Use the dev root token
   export VAULT_TOKEN=myroot
   vault status
   ```

3. **Prometheus not scraping metrics**
   ```bash
   # Check if endpoints are reachable
   kubectl get endpoints -n trackify-streamlined
   ```

4. **Images not found in Minikube**
   ```bash
   # Build images in Minikube's Docker environment
   eval $(minikube docker-env)
   docker build -t trackify-genz-client:latest ./client
   docker build -t trackify-genz-server:latest ./server
   ```

## 🔄 **Switching Between Environments**

### From Docker Compose to Kubernetes
```bash
# Stop Docker Compose
docker-compose -f docker/docker-compose.streamlined.yml down

# Start Kubernetes
./scripts/start-k8s-streamlined.sh
```

### From Kubernetes to Docker Compose
```bash
# Stop Kubernetes
kubectl delete namespace trackify-streamlined

# Start Docker Compose
docker-compose -f docker/docker-compose.streamlined.yml up -d
```

## 📈 **Resource Requirements**

### Docker Compose
- **RAM**: ~4GB minimum, 6GB recommended
- **CPU**: 2 cores minimum, 4 cores recommended
- **Disk**: ~10GB for images and volumes

### Kubernetes (Minikube)
- **RAM**: ~8GB minimum (configured in script)
- **CPU**: 4 cores minimum (configured in script)
- **Disk**: ~15GB for images and persistent volumes

## 🎯 **Next Steps**

1. **Custom Configuration**: Modify configs in `monitoring/` directories
2. **Add Dashboards**: Import custom Grafana dashboards
3. **Vault Secrets**: Configure application secrets in Vault
4. **SonarQube Analysis**: Set up code quality gates and rules
5. **Scaling**: Increase replicas for production workloads

## 🆘 **Support**

For issues and questions:
1. Check the troubleshooting section above
2. Review logs using the provided commands
3. Ensure all prerequisites are met
4. Verify resource requirements are satisfied

---

**📋 Summary**: This streamlined setup provides exactly 7 essential DevOps services with both Docker Compose and Kubernetes support, focusing on simplicity and core functionality. 