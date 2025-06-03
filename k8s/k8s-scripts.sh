#!/bin/bash

# Kubernetes Management Script for Expense Tracker
# Supports Minikube, Docker Desktop, and cloud Kubernetes clusters

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="expense-tracker"
APP_NAME="expense-tracker"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command_exists kubectl; then
        log_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    if ! command_exists docker; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    log_success "All dependencies are available."
}

# Setup Minikube
setup_minikube() {
    log_info "Setting up Minikube..."
    
    if ! command_exists minikube; then
        log_error "Minikube is not installed. Please install Minikube first."
        log_info "Visit: https://minikube.sigs.k8s.io/docs/start/"
        exit 1
    fi
    
    # Start Minikube with specific configuration
    log_info "Starting Minikube cluster..."
    minikube start \
        --driver=docker \
        --memory=4096 \
        --cpus=2 \
        --kubernetes-version=v1.28.0 \
        --addons=ingress,dashboard,metrics-server
    
    # Enable required addons
    minikube addons enable ingress
    minikube addons enable dashboard
    minikube addons enable metrics-server
    
    # Configure Docker environment
    eval $(minikube docker-env)
    
    log_success "Minikube cluster is ready!"
}

# Build Docker images in Minikube
build_images() {
    log_info "Building Docker images..."
    
    # Configure Docker to use Minikube's Docker daemon
    eval $(minikube docker-env)
    
    # Build backend image
    log_info "Building backend image..."
    docker build -t expense-tracker-server:latest -f server/Dockerfile ./server
    
    # Build frontend image
    log_info "Building frontend image..."
    docker build -t expense-tracker-client:latest -f client/Dockerfile ./client
    
    log_success "Docker images built successfully!"
}

# Create namespace
create_namespace() {
    log_info "Creating Kubernetes namespace..."
    kubectl apply -f k8s/base/namespace.yaml
    log_success "Namespace created."
}

# Deploy secrets and configmaps
deploy_secrets() {
    log_info "Deploying secrets and configmaps..."
    
    # Create secrets from template (you should populate these with real values)
    kubectl apply -f k8s/secrets/configmaps.yaml
    
    # Create actual secrets (base64 encoded)
    kubectl create secret generic mongodb-secret \
        --from-literal=username=admin \
        --from-literal=password=SecurePassword123! \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    
    kubectl create secret generic backend-secret \
        --from-literal=mongo-uri="mongodb://admin:SecurePassword123!@mongodb-service:27017/expensetracker?authSource=admin" \
        --from-literal=jwt-secret="your-super-secret-jwt-key-for-expense-tracker-change-in-production-make-it-at-least-32-characters" \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log_success "Secrets and configmaps deployed."
}

# Deploy application
deploy_app() {
    log_info "Deploying application..."
    
    # Deploy MongoDB
    kubectl apply -f k8s/base/mongodb-deployment.yaml
    
    # Wait for MongoDB to be ready
    log_info "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=ready pod -l component=database -n $NAMESPACE --timeout=300s
    
    # Deploy backend
    kubectl apply -f k8s/base/backend-deployment.yaml
    
    # Wait for backend to be ready
    log_info "Waiting for backend to be ready..."
    kubectl wait --for=condition=ready pod -l component=backend -n $NAMESPACE --timeout=300s
    
    # Deploy frontend
    kubectl apply -f k8s/base/frontend-deployment.yaml
    
    # Wait for frontend to be ready
    log_info "Waiting for frontend to be ready..."
    kubectl wait --for=condition=ready pod -l component=frontend -n $NAMESPACE --timeout=300s
    
    # Deploy ingress
    kubectl apply -f k8s/base/ingress.yaml
    
    log_success "Application deployed successfully!"
}

# Deploy monitoring stack
deploy_monitoring() {
    log_info "Deploying monitoring stack..."
    
    # Create monitoring namespace
    kubectl create namespace expense-tracker-monitoring --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy Prometheus using Helm
    if command_exists helm; then
        helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
        helm repo update
        
        helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
            --namespace expense-tracker-monitoring \
            --values monitoring/prometheus/values.yml \
            --create-namespace
    else
        log_warning "Helm not found. Please install Helm to deploy monitoring stack."
    fi
    
    log_success "Monitoring stack deployed."
}

# Get application URLs
get_urls() {
    log_info "Getting application URLs..."
    
    if command_exists minikube; then
        # Get Minikube IP
        MINIKUBE_IP=$(minikube ip)
        
        echo ""
        log_success "Application URLs:"
        echo "  Frontend: http://$MINIKUBE_IP"
        echo "  Backend API: http://$MINIKUBE_IP/api"
        echo "  Kubernetes Dashboard: $(minikube dashboard --url)"
        echo ""
        
        # Port forwarding for services
        log_info "Setting up port forwarding..."
        kubectl port-forward service/frontend-service 3000:3000 -n $NAMESPACE &
        kubectl port-forward service/backend-service 5001:5001 -n $NAMESPACE &
        
        echo ""
        log_success "Port forwarding active:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend API: http://localhost:5001/api"
        echo ""
    fi
}

# Show status
status() {
    log_info "Checking application status..."
    
    echo ""
    echo "=== Namespaces ==="
    kubectl get namespaces | grep expense-tracker
    
    echo ""
    echo "=== Pods ==="
    kubectl get pods -n $NAMESPACE
    
    echo ""
    echo "=== Services ==="
    kubectl get services -n $NAMESPACE
    
    echo ""
    echo "=== Ingress ==="
    kubectl get ingress -n $NAMESPACE
    
    echo ""
    echo "=== PVCs ==="
    kubectl get pvc -n $NAMESPACE
}

# View logs
logs() {
    component=${1:-"all"}
    
    case $component in
        "backend"|"api")
            kubectl logs -l component=backend -n $NAMESPACE --tail=100 -f
            ;;
        "frontend"|"ui")
            kubectl logs -l component=frontend -n $NAMESPACE --tail=100 -f
            ;;
        "mongodb"|"db")
            kubectl logs -l component=database -n $NAMESPACE --tail=100 -f
            ;;
        "all")
            kubectl logs -l app=expense-tracker -n $NAMESPACE --tail=50
            ;;
        *)
            log_error "Invalid component. Use: backend, frontend, mongodb, or all"
            ;;
    esac
}

# Scale application
scale() {
    component=$1
    replicas=$2
    
    if [[ -z "$component" || -z "$replicas" ]]; then
        log_error "Usage: $0 scale <component> <replicas>"
        log_info "Components: backend, frontend"
        exit 1
    fi
    
    case $component in
        "backend")
            kubectl scale deployment backend --replicas=$replicas -n $NAMESPACE
            ;;
        "frontend")
            kubectl scale deployment frontend --replicas=$replicas -n $NAMESPACE
            ;;
        *)
            log_error "Invalid component. Use: backend or frontend"
            ;;
    esac
    
    log_success "Scaled $component to $replicas replicas"
}

# Cleanup
cleanup() {
    log_warning "This will delete all resources. Are you sure? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log_info "Cleaning up resources..."
        
        kubectl delete namespace $NAMESPACE --ignore-not-found=true
        kubectl delete namespace expense-tracker-dev --ignore-not-found=true
        kubectl delete namespace expense-tracker-monitoring --ignore-not-found=true
        
        log_success "Cleanup completed."
    else
        log_info "Cleanup cancelled."
    fi
}

# Stop Minikube
stop_minikube() {
    if command_exists minikube; then
        log_info "Stopping Minikube..."
        minikube stop
        log_success "Minikube stopped."
    fi
}

# Main function
main() {
    case "${1:-}" in
        "setup"|"init")
            check_dependencies
            setup_minikube
            build_images
            create_namespace
            deploy_secrets
            deploy_app
            get_urls
            ;;
        "build")
            build_images
            ;;
        "deploy")
            create_namespace
            deploy_secrets
            deploy_app
            ;;
        "monitoring")
            deploy_monitoring
            ;;
        "status")
            status
            ;;
        "logs")
            logs "${2:-all}"
            ;;
        "scale")
            scale "$2" "$3"
            ;;
        "urls")
            get_urls
            ;;
        "cleanup")
            cleanup
            ;;
        "stop")
            stop_minikube
            ;;
        *)
            echo "Kubernetes Management Script for Expense Tracker"
            echo ""
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  setup       - Setup Minikube and deploy complete application"
            echo "  build       - Build Docker images"
            echo "  deploy      - Deploy application to Kubernetes"
            echo "  monitoring  - Deploy monitoring stack (Prometheus/Grafana)"
            echo "  status      - Show application status"
            echo "  logs <comp> - View logs (backend, frontend, mongodb, all)"
            echo "  scale <comp> <num> - Scale component (backend, frontend)"
            echo "  urls        - Get application URLs"
            echo "  cleanup     - Delete all resources"
            echo "  stop        - Stop Minikube"
            echo ""
            echo "Examples:"
            echo "  $0 setup"
            echo "  $0 logs backend"
            echo "  $0 scale frontend 3"
            ;;
    esac
}

# Run main function with all arguments
main "$@" 