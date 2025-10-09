# Frontend Dockerfile for Driving School React App
FROM node:18-alpine

# Install tzdata for timezone support
RUN apk add --no-cache tzdata

# Set timezone to Vancouver
ENV TZ=America/Vancouver

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for dev server
ENV HOST=0.0.0.0
ENV WDS_SOCKET_HOST=localhost
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application in development mode with hot reloading
CMD ["npm", "start"]