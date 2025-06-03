#!/bin/bash

# Streamlined Trackify Kubernetes Deployment Script
# This script deploys exactly 7 services: nginx, client, server, grafana, prometheus, sonarqube, vault

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Trackify Streamlined Kubernetes Setup    ${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if Minikube is running
if ! minikube status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Minikube is not running. Starting Minikube...${NC}"
    minikube start --driver=docker --memory=8192 --cpus=4
else
    echo -e "${GREEN}✅ Minikube is running${NC}"
fi

# Build Docker images for Minikube
echo -e "${YELLOW}🔧 Building Docker images...${NC}"
eval $(minikube docker-env)

# Build client image
echo -e "${BLUE}Building client image...${NC}"
docker build -t trackify-genz-client:latest ./client

# Build server image  
echo -e "${BLUE}Building server image...${NC}"
docker build -t trackify-genz-server:latest ./server

echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Deploy to Kubernetes
echo -e "${YELLOW}🚀 Deploying to Kubernetes...${NC}"

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

# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  🎉 Streamlined Stack Successfully Deployed! ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}📍 Minikube IP: ${YELLOW}$MINIKUBE_IP${NC}"
echo ""
echo -e "${GREEN}🌐 Access URLs:${NC}"
echo -e "   ${BLUE}Frontend (Client):${NC}     http://$MINIKUBE_IP:30000"
echo -e "   ${BLUE}Backend (Server):${NC}      http://$MINIKUBE_IP:30001"  
echo -e "   ${BLUE}Nginx (Reverse Proxy):${NC} http://$MINIKUBE_IP:30080"
echo -e "   ${BLUE}Prometheus:${NC}            http://$MINIKUBE_IP:30090"
echo -e "   ${BLUE}Grafana:${NC}               http://$MINIKUBE_IP:30001 (admin/admin123)"
echo -e "   ${BLUE}Vault:${NC}                 http://$MINIKUBE_IP:30200 (Token: myroot)"
echo -e "   ${BLUE}SonarQube:${NC}             http://$MINIKUBE_IP:30900 (admin/admin)"
echo ""
echo -e "${GREEN}🔧 Useful Commands:${NC}"
echo "   kubectl get pods -n trackify-streamlined"
echo "   kubectl get services -n trackify-streamlined"
echo "   kubectl logs -f deployment/client-deployment -n trackify-streamlined"
echo "   minikube dashboard"
echo ""
echo -e "${GREEN}🛑 To stop the stack:${NC}"
echo "   kubectl delete namespace trackify-streamlined"
echo "   minikube stop"

# Setup port forwarding (optional)
read -p "🔌 Do you want to set up port forwarding to localhost? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🔌 Setting up port forwarding...${NC}"
    echo -e "${BLUE}Use Ctrl+C to stop port forwarding${NC}"
    echo ""
    echo -e "${GREEN}Port forwarding active:${NC}"
    echo -e "   Frontend:    http://localhost:3000"
    echo -e "   Server:      http://localhost:5001"
    echo -e "   Nginx:       http://localhost:8080" 
    echo -e "   Prometheus:  http://localhost:9090"
    echo -e "   Grafana:     http://localhost:3001"
    echo -e "   Vault:       http://localhost:8200"
    echo -e "   SonarQube:   http://localhost:9000"
    echo ""
    
    # Run port forwarding in background
    kubectl port-forward service/client-service 3000:3000 -n trackify-streamlined &
    kubectl port-forward service/server-service 5001:5001 -n trackify-streamlined &
    kubectl port-forward service/nginx-service 8080:80 -n trackify-streamlined &
    kubectl port-forward service/prometheus-service 9090:9090 -n trackify-streamlined &
    kubectl port-forward service/grafana-service 3001:3000 -n trackify-streamlined &
    kubectl port-forward service/vault-service 8200:8200 -n trackify-streamlined &
    kubectl port-forward service/sonarqube-service 9000:9000 -n trackify-streamlined &
    
    # Wait for user to stop
    echo -e "${YELLOW}Press Ctrl+C to stop port forwarding and exit...${NC}"
    trap 'echo -e "\n${GREEN}Stopping port forwarding...${NC}"; kill $(jobs -p); exit 0' INT
    wait
fi

echo -e "${GREEN}🎉 Streamlined Kubernetes deployment completed!${NC}" 