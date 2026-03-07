#!/bin/bash

# VlowGen Update Script (Pull + Restart, No Full Rebuild)
# Use this when you pull new code but don't need full rebuild

set -e

echo "🔄 Updating VlowGen..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    exit 1
fi

# Stop containers
echo -e "${YELLOW}⏸️  Stopping containers...${NC}"
sudo docker compose down

# Start containers (reuse existing images)
echo -e "${YELLOW}🚀 Starting containers...${NC}"
sudo docker compose up -d

# Wait for services
echo -e "${YELLOW}⏳ Waiting 15 seconds...${NC}"
sleep 15

# Check status
echo -e "${YELLOW}📊 Container Status:${NC}"
sudo docker ps

# Check logs
echo -e "${YELLOW}📝 Recent backend logs:${NC}"
sudo docker compose logs backend --tail=20

echo ""
echo -e "${GREEN}✅ Update complete!${NC}"
echo ""
echo "To view live logs:"
echo "  sudo docker compose logs -f backend"
echo ""
