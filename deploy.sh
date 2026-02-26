#!/bin/bash

# VlowGen Platform Deployment Script for Alibaba Cloud VPS
# Usage: ./deploy.sh [production|staging]

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="vlowgen"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose first."
fi

# Check if environment file exists
if [[ ! -f "$ENV_FILE" ]]; then
    error "Environment file $ENV_FILE not found. Please create it from the template."
fi

log "Starting $ENVIRONMENT deployment of $PROJECT_NAME"

# Stop existing containers
log "Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down --remove-orphans || warn "No existing containers to stop"

# Pull latest images (if using remote registry)
# log "Pulling latest images..."
# docker-compose -f $COMPOSE_FILE pull

# Build and start containers
log "Building and starting containers..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --build

# Wait for services to be healthy
log "Waiting for services to become healthy..."
sleep 10

# Check service status
log "Checking service status..."
docker-compose -f $COMPOSE_FILE ps

# Check health endpoints
log "Checking health endpoints..."
sleep 5

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "Frontend is accessible"
else
    warn "Frontend may not be ready yet"
fi

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "Backend is healthy"
else
    warn "Backend may not be ready yet"
fi

# Show logs
log "Showing recent logs..."
docker-compose -f $COMPOSE_FILE logs --tail=20

log "Deployment completed successfully!"
log "Frontend: http://localhost:3000"
log "Backend API: http://localhost:3001"
log "Backend Health: http://localhost:3001/health"

# Cleanup old images
log "Cleaning up old Docker images..."
docker image prune -f

log "Deployment finished!"