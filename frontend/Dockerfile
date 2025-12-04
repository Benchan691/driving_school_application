# Frontend Dockerfile for Driving School React App (Development)
FROM node:22-alpine

# Add metadata
LABEL maintainer="Driving School"
LABEL description="Development frontend for Driving School React App"

# Install tzdata and dumb-init
RUN apk add --no-cache tzdata dumb-init

# Set timezone to Vancouver
ENV TZ=America/Vancouver

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Set environment variables for dev server
ENV HOST=0.0.0.0
ENV WDS_SOCKET_HOST=localhost
ENV WDS_SOCKET_PORT=80
ENV WDS_SOCKET_PATH=/ws
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

# Change ownership to node user
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check with improved configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application in development mode with hot reloading
CMD ["npm", "start"]