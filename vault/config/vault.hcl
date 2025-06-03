# HashiCorp Vault Configuration for Expense Tracker
# Development Configuration - NOT for production use

# Storage backend
storage "file" {
  path = "/vault/data"
}

# Network listener
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

# Enable UI
ui = true

# Development mode (automatically unseals vault)
# Only use this for development/testing
disable_mlock = true

# Logging
log_level = "INFO"

# Cluster configuration
cluster_name = "expense-tracker-vault"

# Default lease TTL
default_lease_ttl = "1h"
max_lease_ttl = "24h"

api_addr = "http://0.0.0.0:8200"
cluster_addr = "https://0.0.0.0:8201"
pid_file = "/tmp/pidfile"

raw_storage_endpoint = true

# Telemetry for monitoring
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname = true
} 