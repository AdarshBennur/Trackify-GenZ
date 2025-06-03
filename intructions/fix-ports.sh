#!/bin/bash

# Port Conflict Resolution Script for Trackify-GenZ
# This script identifies and resolves port conflicts before starting Docker Compose

set -e

echo "🔍 Port Conflict Resolution Tool"
echo "================================"

# Function to check if a port is in use
check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -i :$port >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use by:"
        lsof -i :$port
        
        # Ask user what to do
        echo ""
        echo "Options:"
        echo "1) Kill the process using port $port"
        echo "2) Use a different port for $service_name"
        echo "3) Exit and handle manually"
        
        read -p "Choose option (1-3): " choice
        
        case $choice in
            1)
                echo "🔥 Killing processes on port $port..."
                lsof -ti :$port | xargs kill -9 2>/dev/null || true
                sleep 2
                if lsof -i :$port >/dev/null 2>&1; then
                    echo "❌ Failed to free port $port"
                    return 1
                else
                    echo "✅ Port $port freed successfully"
                    return 0
                fi
                ;;
            2)
                suggest_alternative_port $port $service_name
                return 1
                ;;
            3)
                echo "❌ Exiting. Please resolve port conflicts manually."
                exit 1
                ;;
            *)
                echo "❌ Invalid choice. Exiting."
                exit 1
                ;;
        esac
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Function to suggest alternative ports
suggest_alternative_port() {
    local original_port=$1
    local service_name=$2
    
    echo "🔄 Suggesting alternative ports for $service_name:"
    
    case $service_name in
        "client")
            local alternatives=(3001 3002 3003 3004 3005)
            ;;
        "server")
            local alternatives=(5002 5003 5004 5005 5006)
            ;;
        "mongo")
            local alternatives=(27018 27019 27020 27021 27022)
            ;;
        "mongo-express")
            local alternatives=(8082 8083 8084 8085 8086)
            ;;
        *)
            local alternatives=($(($original_port + 1)) $(($original_port + 2)) $(($original_port + 3)))
            ;;
    esac
    
    for alt_port in "${alternatives[@]}"; do
        if ! lsof -i :$alt_port >/dev/null 2>&1; then
            echo "✅ Alternative port available: $alt_port"
            
            # Update .env file
            update_env_port $service_name $alt_port
            return 0
        fi
    done
    
    echo "❌ No alternative ports found in suggested range"
    return 1
}

# Function to update .env file with new port
update_env_port() {
    local service=$1
    local new_port=$2
    
    case $service in
        "client")
            update_or_add_env "CLIENT_PORT" $new_port
            ;;
        "server")
            update_or_add_env "SERVER_PORT" $new_port
            ;;
        "mongo")
            update_or_add_env "MONGO_PORT" $new_port
            ;;
        "mongo-express")
            update_or_add_env "MONGO_EXPRESS_PORT" $new_port
            ;;
    esac
    
    echo "📝 Updated .env file: $service now uses port $new_port"
}

# Function to update or add environment variable
update_or_add_env() {
    local var_name=$1
    local var_value=$2
    local env_file=".env"
    
    if [ ! -f "$env_file" ]; then
        echo "Creating .env file..."
        cp env.template .env
    fi
    
    if grep -q "^$var_name=" "$env_file"; then
        # Update existing variable
        sed -i.bak "s/^$var_name=.*/$var_name=$var_value/" "$env_file"
    else
        # Add new variable
        echo "$var_name=$var_value" >> "$env_file"
    fi
}

# Function to check Docker daemon
check_docker() {
    echo "🐳 Checking Docker daemon..."
    
    if ! docker info >/dev/null 2>&1; then
        echo "❌ Docker daemon is not running"
        echo "Please start Docker Desktop and try again"
        exit 1
    fi
    
    echo "✅ Docker daemon is running"
}

# Function to stop existing containers
stop_existing_containers() {
    echo "🛑 Stopping existing containers..."
    
    # Stop containers if they exist
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Remove any containers with our naming pattern
    docker ps -a --filter "name=trackify-" --format "table {{.Names}}" | grep -v NAMES | xargs -r docker rm -f 2>/dev/null || true
    
    echo "✅ Existing containers stopped"
}

# Main execution
main() {
    echo "🚀 Starting port conflict resolution..."
    
    # Check Docker first
    check_docker
    
    # Stop existing containers
    stop_existing_containers
    
    # Wait a moment for ports to be freed
    echo "⏳ Waiting for ports to be freed..."
    sleep 3
    
    # Check required ports
    echo "🔍 Checking required ports..."
    
    # Default ports from .env or defaults
    CLIENT_PORT=${CLIENT_PORT:-3000}
    SERVER_PORT=${SERVER_PORT:-5001}
    MONGO_PORT=${MONGO_PORT:-27017}
    MONGO_EXPRESS_PORT=${MONGO_EXPRESS_PORT:-8081}
    
    # Check each port
    check_port $CLIENT_PORT "client"
    check_port $SERVER_PORT "server"
    check_port $MONGO_PORT "mongo"
    check_port $MONGO_EXPRESS_PORT "mongo-express"
    
    echo ""
    echo "✅ All port conflicts resolved!"
    echo ""
    echo "🚀 Ready to start Docker Compose with:"
    echo "   Client: http://localhost:$CLIENT_PORT"
    echo "   Server: http://localhost:$SERVER_PORT/api"
    echo "   MongoDB: mongodb://localhost:$MONGO_PORT"
    echo "   Mongo Express: http://localhost:$MONGO_EXPRESS_PORT"
    echo ""
    
    read -p "Start Docker Compose now? (y/n): " start_now
    
    if [ "$start_now" = "y" ] || [ "$start_now" = "Y" ]; then
        echo "🐳 Starting Docker Compose..."
        docker-compose up --build -d
        
        echo ""
        echo "⏳ Waiting for services to start..."
        sleep 10
        
        echo "📊 Container status:"
        docker-compose ps
        
        echo ""
        echo "🔍 To check logs:"
        echo "   docker-compose logs -f"
        echo ""
        echo "🔧 To run authentication diagnostics:"
        echo "   node debug-auth.js"
    else
        echo "ℹ️  You can start manually with: docker-compose up --build -d"
    fi
}

# Run main function
main "$@" 