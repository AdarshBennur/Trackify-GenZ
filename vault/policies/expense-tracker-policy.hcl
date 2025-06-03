# Vault Policy for Expense Tracker Application
# This policy defines what secrets the application can access

# Allow read access to application secrets
path "secret/data/expense-tracker/*" {
  capabilities = ["read"]
}

# Allow list access to see available secrets
path "secret/metadata/expense-tracker/*" {
  capabilities = ["list"]
}

# Allow access to database credentials
path "database/creds/expense-tracker-role" {
  capabilities = ["read"]
}

# Allow token renewal
path "auth/token/renew-self" {
  capabilities = ["update"]
}

# Allow token lookup
path "auth/token/lookup-self" {
  capabilities = ["read"]
} 