#!/bin/bash

# VlowGen Quick Restart Script (No Rebuild)
# Use this when you only need to restart containers without rebuilding

set -e

echo "🔄 Quick Restart VlowGen..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    exit 1
fi

# Restart containers (no rebuild)
echo -e "${YELLOW}🔄 Restarting containers...${NC}"
sudo docker compose restart

# Wait a bit
echo -e "${YELLOW}⏳ Waiting 10 seconds...${NC}"
sleep 10

# Check status
echo -e "${YELLOW}📊 Container Status:${NC}"
sudo docker ps

# Check logs
echo -e "${YELLOW}📝 Recent backend logs:${NC}"
sudo docker compose logs backend --tail=20

echo ""
echo -e "${GREEN}✅ Restart complete!${NC}"
echo ""
echo "To view live logs:"
echo "  sudo docker compose logs -f backend"
echo ""
