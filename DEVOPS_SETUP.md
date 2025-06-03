# 🚀 Complete DevOps Setup Guide - Expense Tracker

This guide provides a complete DevOps implementation for the Expense Tracker application, including Infrastructure as Code, CI/CD pipelines, monitoring, security, and testing.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Components](#components)
5. [Monitoring & Observability](#monitoring--observability)
6. [Security](#security)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## 🏗️ Overview

This DevOps setup includes:

- **Infrastructure as Code (IaC)**: Terraform for AWS EKS
- **Configuration Management**: Ansible for server configuration
- **Container Orchestration**: Kubernetes with Minikube for local development
- **CI/CD Pipeline**: GitHub Actions with multi-stage deployment
- **Monitoring**: Prometheus & Grafana stack
- **Security**: HashiCorp Vault for secrets management
- **Code Quality**: SonarQube integration
- **Testing**: Jest, Postman/Newman, Integration tests
- **Container Registry**: DockerHub integration

## 🛠️ Prerequisites

### Required Tools

```bash
# Core tools
- Docker (v20.10+)
- Docker Compose (v2.0+)
- kubectl (v1.26+)
- Minikube (v1.30+)
- Helm (v3.10+)

# Infrastructure tools
- Terraform (v1.0+)
- Ansible (v2.9+)
```

## 🚀 Quick Start

### 1. Local Development with Docker

```bash
# Start with Docker Compose (Development)
./docker-scripts.sh dev:up:build

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5001/api
```

### 2. Kubernetes with Minikube

```bash
# Setup complete Kubernetes environment
./k8s-scripts.sh setup

# Check status
./k8s-scripts.sh status

# View logs
./k8s-scripts.sh logs backend
```

## 📊 Monitoring & Observability

### Metrics Collection

**Application Metrics:**
- Request rate and latency
- Error rates and status codes
- Database connection pools
- Memory and CPU usage

**Infrastructure Metrics:**
- Kubernetes cluster health
- Node resource utilization
- Pod restart counts
- Network traffic

## 🔒 Security

### Secret Management

```bash
# Initialize Vault (development)
vault server -config=vault/config/vault.hcl

# Create secrets
vault kv put secret/expense-tracker \
    mongo-uri="mongodb://admin:password@mongodb:27017/expensetracker" \
    jwt-secret="your-secure-jwt-secret"
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
cd server && npm test
cd client && npm test

# Integration tests with Postman
cd testing/postman
newman run expense-tracker-api.postman_collection.json \
    --env-var base_url=http://localhost:5001/api
```

## 🐛 Troubleshooting

### Common Issues

**1. Minikube Not Starting**
```bash
# Delete and restart
minikube delete
minikube start --driver=docker --memory=4096
```

**2. Pods Stuck in Pending**
```bash
# Check node resources
kubectl describe nodes

# Check PVC status
kubectl get pvc -n expense-tracker
``` 