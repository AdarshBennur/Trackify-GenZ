#!/bin/bash

# Trackify Docker Desktop Kubernetes Deployment Script
# This script deploys to Docker Desktop's built-in Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Trackify Docker Desktop Kubernetes Setup ${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if Docker Desktop Kubernetes is enabled
if ! kubectl cluster-info --context docker-desktop &> /dev/null; then
    echo -e "${RED}❌ Docker Desktop Kubernetes is not enabled!${NC}"
    echo -e "${YELLOW}Please enable Kubernetes in Docker Desktop:${NC}"
    echo "1. Open Docker Desktop"
    echo "2. Go to Settings ⚙️"
    echo "3. Click 'Kubernetes'"
    echo "4. Check 'Enable Kubernetes' ✅"
    echo "5. Click 'Apply & Restart'"
    echo ""
    echo -e "${YELLOW}After enabling, run this script again.${NC}"
    exit 1
fi

# Switch to docker-desktop context
kubectl config use-context docker-desktop

echo -e "${GREEN}✅ Docker Desktop Kubernetes is running${NC}"

# Build Docker images (they'll be available to Docker Desktop K8s)
echo -e "${YELLOW}🔧 Building Docker images...${NC}"

# Build client image
echo -e "${BLUE}Building client image...${NC}"
docker build -t trackify-genz-client:latest ./client

# Build server image  
echo -e "${BLUE}Building server image...${NC}"
docker build -t trackify-genz-server:latest ./server

echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Deploy to Kubernetes
echo -e "${YELLOW}🚀 Deploying to Docker Desktop Kubernetes...${NC}"

# Create namespace
kubectl apply -f k8s/streamlined/namespace.yml

# Deploy all services
kubectl apply -f k8s/streamlined/

# Wait for deployments to be ready
echo -e "${YELLOW}⏳ Waiting for deployments to be ready...${NC}"

deployments=("client-deployment" "server-deployment" "nginx-deployment" "prometheus-deployment" "grafana-deployment" "vault-deployment" "sonarqube-deployment")

for deployment in "${deployments[@]}"; do
    echo -e "${BLUE}Waiting for $deployment...${NC}"
    kubectl wait --for=condition=available --timeout=300s deployment/$deployment -n trackify-streamlined
done

echo -e "${GREEN}✅ All deployments are ready!${NC}"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  🎉 Docker Desktop K8s Stack Deployed!   ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${GREEN}🌐 Access URLs (with port-forwarding):${NC}"
echo -e "   ${BLUE}Frontend:${NC}    http://localhost:3000"
echo -e "   ${BLUE}Backend:${NC}     http://localhost:5001"
echo -e "   ${BLUE}Nginx:${NC}       http://localhost:8080"
echo -e "   ${BLUE}Prometheus:${NC}  http://localhost:9090"
echo -e "   ${BLUE}Grafana:${NC}     http://localhost:3001 (admin/admin123)"
echo -e "   ${BLUE}Vault:${NC}       http://localhost:8200 (Token: myroot)"
echo -e "   ${BLUE}SonarQube:${NC}   http://localhost:9000 (admin/admin)"
echo ""
echo -e "${GREEN}👀 View in Docker Desktop:${NC}"
echo "   • Open Docker Desktop"
echo "   • Click 'Containers' to see all pods"
echo "   • Each pod will show as a container"
echo "   • You'll see the 'trackify-streamlined' namespace"
echo ""
echo -e "${GREEN}🔧 Useful Commands:${NC}"
echo "   kubectl get pods -n trackify-streamlined"
echo "   kubectl get services -n trackify-streamlined"
echo "   kubectl logs -f deployment/client-deployment -n trackify-streamlined"
echo ""

# Setup port forwarding automatically
echo -e "${YELLOW}🔌 Setting up port forwarding...${NC}"
echo -e "${BLUE}Services will be available on localhost${NC}"

# Run port forwarding in background
kubectl port-forward service/client-service 3000:3000 -n trackify-streamlined &
kubectl port-forward service/server-service 5001:5001 -n trackify-streamlined &
kubectl port-forward service/nginx-service 8080:80 -n trackify-streamlined &
kubectl port-forward service/prometheus-service 9090:9090 -n trackify-streamlined &
kubectl port-forward service/grafana-service 3001:3000 -n trackify-streamlined &
kubectl port-forward service/vault-service 8200:8200 -n trackify-streamlined &
kubectl port-forward service/sonarqube-service 9000:9000 -n trackify-streamlined &

echo ""
echo -e "${GREEN}✅ Port forwarding active!${NC}"
echo -e "${GREEN}✅ Services visible in Docker Desktop!${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop port forwarding and exit...${NC}"
echo -e "${GREEN}🛑 To stop the stack: kubectl delete namespace trackify-streamlined${NC}"

# Wait for user to stop
trap 'echo -e "\n${GREEN}Stopping port forwarding...${NC}"; kill $(jobs -p); exit 0' INT
wait 