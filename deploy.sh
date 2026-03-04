#!/bin/bash

# VlowGen Production Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
DOMAIN=${DOMAIN:-yourdomain.com}
BACKUP_DIR="./backups"
LOG_FILE="./deploy-$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    log "✓ Docker is installed"

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    log "✓ Docker Compose is installed"

    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        error ".env.production file not found. Copy from .env.production.template"
    fi
    log "✓ .env.production exists"

    # Check if nginx.conf exists
    if [ ! -f "nginx.conf" ]; then
        error "nginx.conf not found"
    fi
    log "✓ nginx.conf exists"

    # Check if SSL certificates exist
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
            warning "SSL certificate not found at /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
            warning "Please run: sudo certbot certonly --standalone -d $DOMAIN"
        else
            log "✓ SSL certificate found"
        fi
    fi
}

# Backup current deployment
backup_deployment() {
    log "Creating backup..."

    mkdir -p "$BACKUP_DIR"
    BACKUP_NAME="backup-$(date +%Y%m%d_%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

    mkdir -p "$BACKUP_PATH"

    # Backup docker-compose files
    cp docker-compose.yml "$BACKUP_PATH/" 2>/dev/null || true
    cp docker-compose.prod.yml "$BACKUP_PATH/" 2>/dev/null || true

    # Backup environment files
    cp .env.production "$BACKUP_PATH/" 2>/dev/null || true

    # Backup nginx config
    cp nginx.conf "$BACKUP_PATH/" 2>/dev/null || true

    # Backup MinIO data
    if docker-compose ps minio &> /dev/null; then
        log "Backing up MinIO data..."
        docker-compose exec -T minio mc mirror /data "$BACKUP_PATH/minio-data" || true
    fi

    log "✓ Backup created at $BACKUP_PATH"
    echo "$BACKUP_PATH" > "$BACKUP_DIR/latest-backup"
}

# Build Docker images
build_images() {
    log "Building Docker images..."

    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml build --no-cache
    else
        docker-compose build --no-cache
    fi

    log "✓ Docker images built successfully"
}

# Stop current services
stop_services() {
    log "Stopping current services..."

    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml down || true
    else
        docker-compose down || true
    fi

    log "✓ Services stopped"
}

# Start services
start_services() {
    log "Starting services..."

    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi

    log "✓ Services started"
}

# Wait for services to be healthy
wait_for_services() {
    log "Waiting for services to be healthy..."

    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps | grep -q "healthy"; then
            log "✓ Services are healthy"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    error "Services failed to become healthy"
}

# Run health checks
health_checks() {
    log "Running health checks..."

    # Check backend
    if curl -sf http://localhost:3001/health > /dev/null; then
        log "✓ Backend is healthy"
    else
        error "Backend health check failed"
    fi

    # Check frontend
    if curl -sf http://localhost:4321 > /dev/null; then
        log "✓ Frontend is healthy"
    else
        error "Frontend health check failed"
    fi

    # Check MinIO
    if docker-compose exec -T minio mc admin info minio > /dev/null 2>&1; then
        log "✓ MinIO is healthy"
    else
        error "MinIO health check failed"
    fi
}

# Verify SSL certificate
verify_ssl() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Verifying SSL certificate..."

        CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
        if [ -f "$CERT_PATH" ]; then
            EXPIRY=$(openssl x509 -in "$CERT_PATH" -noout -dates | grep notAfter | cut -d= -f2)
            log "✓ SSL certificate valid until: $EXPIRY"
        fi
    fi
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."

    find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

    log "✓ Old backups cleaned up"
}

# Rollback to previous deployment
rollback() {
    log "Rolling back to previous deployment..."

    LATEST_BACKUP=$(cat "$BACKUP_DIR/latest-backup" 2>/dev/null)

    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi

    log "Restoring from $LATEST_BACKUP..."

    # Stop current services
    docker-compose down || true

    # Restore files
    cp "$LATEST_BACKUP/docker-compose.yml" . 2>/dev/null || true
    cp "$LATEST_BACKUP/.env.production" . 2>/dev/null || true
    cp "$LATEST_BACKUP/nginx.conf" . 2>/dev/null || true

    # Restart services
    docker-compose up -d

    log "✓ Rollback completed"
}

# Main deployment flow
main() {
    log "Starting deployment for $ENVIRONMENT environment..."
    log "Domain: $DOMAIN"
    log "Log file: $LOG_FILE"

    pre_deployment_checks
    backup_deployment
    build_images
    stop_services
    start_services
    wait_for_services
    health_checks
    verify_ssl
    cleanup_backups

    log "✓ Deployment completed successfully!"
    log "Services are running:"
    docker-compose ps
}

# Handle errors
trap 'error "Deployment failed. Check $LOG_FILE for details"' ERR

# Parse arguments
case "${1:-}" in
    rollback)
        rollback
        ;;
    *)
        main
        ;;
esac
