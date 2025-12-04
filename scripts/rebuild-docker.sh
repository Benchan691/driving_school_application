#!/bin/bash

# Docker Rebuild Script for Driving School Application
# This script helps rebuild Docker containers with the updated configuration

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

print_error() {
    echo -e "${RED}✗ ${NC}$1"
}

# Function to check if Docker is running
check_docker() {
    print_info "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to get environment
get_environment() {
    echo ""
    echo "Select environment to rebuild:"
    echo "  1) Development (default)"
    echo "  2) Production"
    echo ""
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        2)
            ENVIRONMENT="production"
            COMPOSE_FILE="docker-compose.prod.yml"
            ;;
        *)
            ENVIRONMENT="development"
            COMPOSE_FILE="docker-compose.yml"
            ;;
    esac
}

# Function to stop containers
stop_containers() {
    print_info "Stopping existing containers for ${ENVIRONMENT}..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose down
    fi
    
    print_success "Containers stopped"
}

# Function to clean up
cleanup() {
    echo ""
    read -p "Do you want to remove unused Docker resources? (y/N): " cleanup_choice
    
    if [[ $cleanup_choice =~ ^[Yy]$ ]]; then
        print_info "Cleaning up Docker resources..."
        docker system prune -f
        print_success "Cleanup complete"
    fi
}

# Function to rebuild images
rebuild_images() {
    print_info "Rebuilding Docker images for ${ENVIRONMENT}..."
    print_warning "This may take several minutes..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml build --no-cache
    else
        docker-compose build --no-cache
    fi
    
    print_success "Images rebuilt successfully"
}

# Function to start containers
start_containers() {
    print_info "Starting containers for ${ENVIRONMENT}..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    print_success "Containers started"
}

# Function to show status
show_status() {
    echo ""
    print_info "Container Status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    print_info "Checking health status..."
    sleep 5  # Wait for health checks to run
    
    # Check health of each container
    for container in $(docker ps --format "{{.Names}}" | grep driving_school); do
        health=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "no healthcheck")
        if [ "$health" = "healthy" ]; then
            print_success "$container: healthy"
        elif [ "$health" = "no healthcheck" ]; then
            print_info "$container: no healthcheck configured"
        else
            print_warning "$container: $health"
        fi
    done
}

# Function to show logs
show_logs() {
    echo ""
    read -p "Do you want to view logs? (y/N): " log_choice
    
    if [[ $log_choice =~ ^[Yy]$ ]]; then
        if [ "$ENVIRONMENT" = "production" ]; then
            docker-compose -f docker-compose.prod.yml logs -f
        else
            docker-compose logs -f
        fi
    fi
}

# Main script
main() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║   Docker Rebuild Script                ║"
    echo "║   Driving School Application           ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    
    # Navigate to project root
    cd "$(dirname "$0")/.."
    
    # Check Docker
    check_docker
    
    # Get environment choice
    get_environment
    
    echo ""
    print_warning "You are about to rebuild the ${ENVIRONMENT} environment"
    print_warning "This will stop all containers and rebuild from scratch"
    echo ""
    read -p "Do you want to continue? (y/N): " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        print_info "Rebuild cancelled"
        exit 0
    fi
    
    # Execute rebuild steps
    stop_containers
    cleanup
    rebuild_images
    start_containers
    show_status
    
    echo ""
    print_success "Docker rebuild complete!"
    echo ""
    print_info "Updated components:"
    echo "  • Node.js: 18 → 22 (Latest LTS)"
    echo "  • PostgreSQL: 15 → 16"
    echo "  • Redis: 7 → 7.4"
    echo "  • Nginx: unversioned → 1.27"
    echo "  • Security: Non-root users, signal handling"
    echo "  • Performance: Resource limits, multi-stage builds"
    echo ""
    
    show_logs
}

# Run main function
main


