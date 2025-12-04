#!/bin/bash

# PostgreSQL 15 to 16 Migration Script
# This script backs up data from PostgreSQL 15 and migrates to PostgreSQL 16

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./database/backups"
BACKUP_FILE="postgres_15_backup_$(date +%Y%m%d_%H%M%S).sql"

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

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  PostgreSQL 15 → 16 Migration          ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_info "Step 1: Starting PostgreSQL 15 temporarily for backup..."

# Temporarily use PostgreSQL 15 for backup
docker run -d \
    --name temp_postgres_15 \
    -e POSTGRES_DB="${POSTGRES_DB:-driving_school}" \
    -e POSTGRES_USER="${POSTGRES_USER:-postgres}" \
    -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}" \
    -v driving_school_postgres_data:/var/lib/postgresql/data \
    postgres:15-alpine

# Wait for PostgreSQL to be ready
print_info "Waiting for PostgreSQL 15 to be ready..."
sleep 10

# Create backup directory
mkdir -p "$BACKUP_DIR"

print_info "Step 2: Creating backup..."

# Backup the database
docker exec temp_postgres_15 pg_dumpall -U "${POSTGRES_USER:-postgres}" > "$BACKUP_DIR/$BACKUP_FILE"

if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    print_success "Backup created: $BACKUP_DIR/$BACKUP_FILE"
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    print_info "Backup size: $BACKUP_SIZE"
else
    print_error "Backup failed!"
    docker stop temp_postgres_15
    docker rm temp_postgres_15
    exit 1
fi

# Stop and remove temporary container
print_info "Step 3: Stopping temporary PostgreSQL 15 container..."
docker stop temp_postgres_15
docker rm temp_postgres_15

print_success "Temporary container removed"

# Remove old volume
print_warning "Step 4: Removing old PostgreSQL 15 volume..."
read -p "This will delete the old PostgreSQL 15 data (backup is saved). Continue? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    print_info "Migration cancelled. Backup saved at: $BACKUP_DIR/$BACKUP_FILE"
    exit 0
fi

docker volume rm driving_school_postgres_data || true
print_success "Old volume removed"

# Start PostgreSQL 16
print_info "Step 5: Starting PostgreSQL 16..."
docker-compose up -d postgres

# Wait for PostgreSQL 16 to be ready
print_info "Waiting for PostgreSQL 16 to be ready..."
sleep 15

# Check if postgres is healthy
if ! docker exec driving_school_db pg_isready -U "${POSTGRES_USER:-postgres}" > /dev/null 2>&1; then
    print_error "PostgreSQL 16 failed to start properly"
    exit 1
fi

print_success "PostgreSQL 16 is running"

# Restore the backup
print_info "Step 6: Restoring data to PostgreSQL 16..."

docker exec -i driving_school_db psql -U "${POSTGRES_USER:-postgres}" < "$BACKUP_DIR/$BACKUP_FILE"

print_success "Data restored successfully!"

echo ""
print_success "Migration completed! ✨"
echo ""
print_info "Summary:"
echo "  • Backed up PostgreSQL 15 data"
echo "  • Removed old volume"
echo "  • Started PostgreSQL 16"
echo "  • Restored all data"
echo ""
print_info "Backup location: $BACKUP_DIR/$BACKUP_FILE"
print_info "Keep this backup safe!"
echo ""


