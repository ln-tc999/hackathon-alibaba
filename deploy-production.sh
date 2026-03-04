#!/bin/bash

# VlowGen Production Deployment Script
# Run this on Alibaba Cloud server

set -e

echo "🚀 Starting VlowGen Production Deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create .env file in project root with required variables."
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Stop existing containers
echo -e "${YELLOW}📦 Stopping existing containers...${NC}"
sudo docker compose down || true

# Remove old images (optional - uncomment if you want clean build)
# echo -e "${YELLOW}🗑️  Removing old images...${NC}"
# sudo docker compose rm -f
# sudo docker rmi hackathon-alibaba-frontend hackathon-alibaba-backend || true

# Build containers
echo -e "${YELLOW}🔨 Building containers...${NC}"
sudo docker compose build --no-cache

# Start containers
echo -e "${YELLOW}🚀 Starting containers...${NC}"
sudo docker compose up -d

# Wait for health checks
echo -e "${YELLOW}⏳ Waiting for services to be healthy (30 seconds)...${NC}"
sleep 30

# Check container status
echo -e "${YELLOW}📊 Container Status:${NC}"
sudo docker ps

# Check logs
echo -e "${YELLOW}📝 Recent logs:${NC}"
echo -e "${GREEN}Backend logs:${NC}"
sudo docker compose logs backend --tail=20

echo -e "${GREEN}Frontend logs:${NC}"
sudo docker compose logs frontend --tail=20

# Test health endpoints
echo -e "${YELLOW}🏥 Testing health endpoints...${NC}"

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend accessible${NC}"
else
    echo -e "${RED}❌ Frontend not accessible${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Access your application at:"
echo "  Frontend: http://8.219.216.140"
echo "  Backend API: http://8.219.216.140:3001"
echo "  MinIO Console: http://8.219.216.140:9001"
echo ""
echo "To view logs:"
echo "  sudo docker compose logs -f backend"
echo "  sudo docker compose logs -f frontend"
echo ""
echo "To restart services:"
echo "  sudo docker compose restart"
echo ""
