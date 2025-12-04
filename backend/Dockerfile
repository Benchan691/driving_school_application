# Backend Dockerfile for Driving School API (Development)
FROM node:22-alpine

# Add metadata
LABEL maintainer="Driving School"
LABEL description="Development backend for Driving School API"

# Install tzdata and dumb-init for better signal handling
RUN apk add --no-cache tzdata dumb-init

# Set timezone to Vancouver
ENV TZ=America/Vancouver

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for nodemon)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p uploads logs && \
    chown -R node:node /app

# Switch to non-root user for development
USER node

# Expose port
EXPOSE 5002

# Health check with improved timeout
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application in development mode with hot reloading
CMD ["npm", "run", "dev"]


