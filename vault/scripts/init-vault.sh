#!/bin/bash

# Initialize Vault for Expense Tracker Application
# This script sets up secrets and policies for the application

echo "🔐 Initializing Vault for Expense Tracker..."

# Wait for Vault to be available
until vault status > /dev/null 2>&1; do
    echo "⏳ Waiting for Vault to be available..."
    sleep 5
done

echo "✅ Vault is available"

# Enable kv secrets engine if not already enabled
vault secrets enable -path=expense-tracker kv-v2 || echo "ℹ️  KV secrets engine already enabled"

# Create secrets for the application
echo "📝 Creating application secrets..."

# Database secrets
vault kv put expense-tracker/database \
    mongo_uri="${MONGO_URI:-mongodb://localhost:27017/expense_tracker}" \
    mongo_username="${MONGO_USERNAME:-admin}" \
    mongo_password="${MONGO_PASSWORD:-secretpassword}"

# JWT secrets
vault kv put expense-tracker/jwt \
    secret="${JWT_SECRET:-supersecretjwtkey123456789}" \
    expire="${JWT_EXPIRE:-30d}" \
    cookie_expire="${JWT_COOKIE_EXPIRE:-30}"

# API keys and external services
vault kv put expense-tracker/api-keys \
    prometheus_username="prometheus" \
    prometheus_password="prometheus" \
    grafana_admin_user="admin" \
    grafana_admin_password="admin123"

# Email configuration (for notifications)
vault kv put expense-tracker/email \
    smtp_host="${SMTP_HOST:-smtp.gmail.com}" \
    smtp_port="${SMTP_PORT:-587}" \
    smtp_user="${SMTP_USER:-noreply@expensetracker.com}" \
    smtp_password="${SMTP_PASSWORD:-emailpassword}"

# Encryption keys
vault kv put expense-tracker/encryption \
    data_encryption_key="$(openssl rand -base64 32)" \
    backup_encryption_key="$(openssl rand -base64 32)"

echo "📋 Creating Vault policies..."

# Create policy for the expense tracker application
cat > /tmp/expense-tracker-policy.hcl << EOF
# Policy for Expense Tracker Application
path "expense-tracker/data/*" {
  capabilities = ["read", "list"]
}

path "expense-tracker/metadata/*" {
  capabilities = ["read", "list"]
}

# Allow the application to read its own secrets
path "expense-tracker/data/database" {
  capabilities = ["read"]
}

path "expense-tracker/data/jwt" {
  capabilities = ["read"]
}

path "expense-tracker/data/api-keys" {
  capabilities = ["read"]
}

path "expense-tracker/data/email" {
  capabilities = ["read"]
}

path "expense-tracker/data/encryption" {
  capabilities = ["read"]
}
EOF

vault policy write expense-tracker /tmp/expense-tracker-policy.hcl

# Create policy for DevOps tools
cat > /tmp/devops-policy.hcl << EOF
# Policy for DevOps Tools (Prometheus, Grafana, etc.)
path "expense-tracker/data/api-keys" {
  capabilities = ["read"]
}

path "sys/metrics" {
  capabilities = ["read"]
}

path "sys/health" {
  capabilities = ["read"]
}
EOF

vault policy write devops /tmp/devops-policy.hcl

echo "🔑 Creating application tokens..."

# Create a token for the application
APP_TOKEN=$(vault token create \
    -policy=expense-tracker \
    -ttl=72h \
    -renewable=true \
    -display-name="expense-tracker-app" \
    -format=json | jq -r .auth.client_token)

# Create a token for DevOps tools
DEVOPS_TOKEN=$(vault token create \
    -policy=devops \
    -ttl=168h \
    -renewable=true \
    -display-name="devops-tools" \
    -format=json | jq -r .auth.client_token)

echo "📊 Creating sample monitoring secrets..."

# SonarQube configuration
vault kv put expense-tracker/sonarqube \
    admin_user="admin" \
    admin_password="admin123" \
    token="squ_$(openssl rand -hex 20)" \
    project_key="expense-tracker" \
    quality_gate="Sonar way"

# Grafana datasources
vault kv put expense-tracker/grafana \
    prometheus_url="http://prometheus:9090" \
    admin_user="admin" \
    admin_password="admin123"

echo "✅ Vault initialization complete!"
echo ""
echo "🔐 Important tokens (save these securely):"
echo "📱 Application Token: ${APP_TOKEN}"
echo "🛠️  DevOps Token: ${DEVOPS_TOKEN}"
echo ""
echo "📝 Available secrets paths:"
echo "  - expense-tracker/database"
echo "  - expense-tracker/jwt"
echo "  - expense-tracker/api-keys"
echo "  - expense-tracker/email"
echo "  - expense-tracker/encryption"
echo "  - expense-tracker/sonarqube"
echo "  - expense-tracker/grafana"
echo ""
echo "🌐 Vault UI: http://localhost:8200"
echo "🔑 Root Token: ${VAULT_TOKEN}"

# Clean up temporary files
rm -f /tmp/expense-tracker-policy.hcl /tmp/devops-policy.hcl

echo "🎉 Vault setup completed successfully!" 