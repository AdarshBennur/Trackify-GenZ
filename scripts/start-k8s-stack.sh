#!/bin/bash

# ===================================================================================
# Expense Tracker Kubernetes DevOps Stack Deployment Script
# This script deploys all DevOps services to Kubernetes (Minikube/Docker Desktop)
# ===================================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if kubectl is available
check_kubectl() {
    print_status "Checking kubectl..."
    if ! command -v kubectl >/dev/null 2>&1; then
        print_error "kubectl is not installed. Please install kubectl and try again."
        exit 1
    fi
    print_status "✅ kubectl is available"
}

# Check if Kubernetes cluster is accessible
check_k8s_cluster() {
    print_status "Checking Kubernetes cluster..."
    if ! kubectl cluster-info >/dev/null 2>&1; then
        print_error "Cannot connect to Kubernetes cluster. Please ensure your cluster is running."
        exit 1
    fi
    print_status "✅ Kubernetes cluster is accessible"
}

# Create namespaces
create_namespaces() {
    print_status "Creating namespaces..."
    kubectl apply -f k8s/base/namespace.yaml
    print_status "✅ Namespaces created"
}

# Deploy infrastructure services
deploy_infrastructure() {
    print_header "🏗️ Deploying Infrastructure Services..."
    
    # Deploy Vault
    print_status "Deploying Vault..."
    kubectl apply -f k8s/base/vault-deployment.yaml
    
    # Wait for Vault to be ready
    print_status "Waiting for Vault to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/vault -n expense-tracker
}

# Deploy monitoring services
deploy_monitoring() {
    print_header "📊 Deploying Monitoring Services..."
    
    # Deploy Prometheus
    print_status "Deploying Prometheus..."
    kubectl apply -f k8s/monitoring/prometheus-deployment.yaml
    
    # Deploy Grafana
    print_status "Deploying Grafana..."
    kubectl apply -f k8s/monitoring/grafana-deployment.yaml
    
    # Wait for monitoring services
    print_status "Waiting for monitoring services to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n expense-tracker-monitoring
    kubectl wait --for=condition=available --timeout=300s deployment/grafana -n expense-tracker-monitoring
}

# Deploy code quality services
deploy_code_quality() {
    print_header "🔍 Deploying Code Quality Services..."
    
    # Deploy SonarQube
    print_status "Deploying SonarQube..."
    kubectl apply -f k8s/base/sonarqube-deployment.yaml
    
    # Wait for SonarQube database
    print_status "Waiting for SonarQube database..."
    kubectl wait --for=condition=available --timeout=300s deployment/sonarqube-db -n expense-tracker
    
    # Wait for SonarQube
    print_status "Waiting for SonarQube..."
    kubectl wait --for=condition=available --timeout=600s deployment/sonarqube -n expense-tracker
}

# Deploy application services
deploy_application() {
    print_header "🚀 Deploying Application Services..."
    
    # Deploy backend
    print_status "Deploying backend..."
    kubectl apply -f k8s/base/backend-deployment.yaml
    
    # Deploy frontend
    print_status "Deploying frontend..."
    kubectl apply -f k8s/base/frontend-deployment.yaml
    
    # Wait for application services
    print_status "Waiting for application services..."
    kubectl wait --for=condition=available --timeout=300s deployment/backend -n expense-tracker || print_warning "Backend deployment may need more time"
    kubectl wait --for=condition=available --timeout=300s deployment/frontend -n expense-tracker || print_warning "Frontend deployment may need more time"
}

# Show deployment status
show_status() {
    print_header "📊 Deployment Status:"
    echo ""
    print_status "Expense Tracker Namespace:"
    kubectl get pods -n expense-tracker
    echo ""
    print_status "Monitoring Namespace:"
    kubectl get pods -n expense-tracker-monitoring
    echo ""
    print_status "Services:"
    kubectl get svc -n expense-tracker
    kubectl get svc -n expense-tracker-monitoring
}

# Set up port forwarding
setup_port_forwarding() {
    print_header "🌐 Setting up Port Forwarding..."
    
    # Create port-forward scripts
    cat > scripts/port-forward-services.sh << 'EOF'
#!/bin/bash
# Port forwarding script for Kubernetes services

echo "🌐 Setting up port forwarding for all services..."

# Kill existing port-forwards
pkill -f "kubectl port-forward" || true

# Wait a moment
sleep 2

# Start port forwarding in background
kubectl port-forward -n expense-tracker svc/frontend-service 3000:3000 &
kubectl port-forward -n expense-tracker svc/backend-service 5001:5001 &
kubectl port-forward -n expense-tracker-monitoring svc/prometheus-service 9090:9090 &
kubectl port-forward -n expense-tracker-monitoring svc/grafana-service 3001:3000 &
kubectl port-forward -n expense-tracker svc/vault-service 8200:8200 &
kubectl port-forward -n expense-tracker svc/sonarqube-service 9000:9000 &

echo "✅ Port forwarding started for all services"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001/api"
echo "📊 Prometheus: http://localhost:9090"
echo "📈 Grafana: http://localhost:3001 (admin/admin123)"
echo "🔐 Vault: http://localhost:8200 (root token: myroot)"
echo "🔍 SonarQube: http://localhost:9000 (admin/admin)"
echo ""
echo "To stop port forwarding: pkill -f 'kubectl port-forward'"
EOF
    
    chmod +x scripts/port-forward-services.sh
    print_status "✅ Port forwarding script created: scripts/port-forward-services.sh"
}

# Show access information
show_access_info() {
    print_header "🌐 Access Information:"
    echo ""
    print_status "To access services, run the port forwarding script:"
    echo "  ./scripts/port-forward-services.sh"
    echo ""
    print_status "Or manually set up port forwarding:"
    echo "  kubectl port-forward -n expense-tracker svc/frontend-service 3000:3000"
    echo "  kubectl port-forward -n expense-tracker svc/backend-service 5001:5001"
    echo "  kubectl port-forward -n expense-tracker-monitoring svc/prometheus-service 9090:9090"
    echo "  kubectl port-forward -n expense-tracker-monitoring svc/grafana-service 3001:3000"
    echo "  kubectl port-forward -n expense-tracker svc/vault-service 8200:8200"
    echo "  kubectl port-forward -n expense-tracker svc/sonarqube-service 9000:9000"
    echo ""
    print_warning "Note: Services may take several minutes to be fully ready"
}

# Main execution
main() {
    print_header "=== Expense Tracker Kubernetes DevOps Stack Deployment ==="
    
    check_kubectl
    check_k8s_cluster
    create_namespaces
    deploy_infrastructure
    deploy_monitoring
    deploy_code_quality
    deploy_application
    
    echo ""
    show_status
    echo ""
    setup_port_forwarding
    echo ""
    show_access_info
    
    print_header "🎉 Kubernetes DevOps Stack Deployed Successfully!"
    print_status "To delete all services, run: kubectl delete namespace expense-tracker expense-tracker-monitoring"
}

# Run main function
main "$@" 