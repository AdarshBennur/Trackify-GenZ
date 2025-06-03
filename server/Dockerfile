# Multi-stage Dockerfile for Node.js Backend
# Base stage with common dependencies
FROM node:18-alpine AS base

# Install dumb-init and curl for proper signal handling and health checks
RUN apk add --no-cache dumb-init curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Production stage
FROM base AS production

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy source code
COPY --chown=nodeuser:nodejs . .

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1

# Start development server with nodemon and dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"] 