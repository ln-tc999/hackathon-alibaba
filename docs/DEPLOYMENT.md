# VlowGen Platform Deployment Guide

This guide explains how to deploy the VlowGen platform to your Alibaba Cloud VPS using Docker.

## Prerequisites

1. **Alibaba Cloud VPS** with:
   - Ubuntu 20.04 or later recommended
   - At least 2GB RAM
   - Docker and Docker Compose installed

2. **Domain Name** (optional but recommended for production)

## Server Setup

### 1. Install Docker and Docker Compose

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y

# Install Docker Compose
sudo apt install docker-compose -y

# Add current user to docker group
sudo usermod -aG docker $USER

# Restart to apply group changes
newgrp docker
```

### 2. Clone the Repository

```bash
# Clone your repository to the VPS
git clone <your-repository-url> vlowgen-platform
cd vlowgen-platform
```

### 3. Configure Environment Variables

```bash
# Copy the production environment template
cp .env.production.template .env.production

# Edit the environment file with your actual values
nano .env.production
```

Update the following variables:
- `NEXT_PUBLIC_API_URL` - Your domain or VPS IP with port 3001
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - Your WalletConnect project ID
- `DASHSCOPE_API_KEY` - Your Alibaba Cloud DashScope API key (for Qwen models)
- `WAN2_API_KEY` - Your Alibaba Cloud Wan2.1 API key (for image generation)
- `COMPOSIO_API_KEY` - Your Composio API key (for social media integrations)

### 4. Deploy the Application

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh production
```

## Deployment Options

### Production Deployment
```bash
./deploy.sh production
```

### Staging Deployment (if you create a staging environment)
```bash
./deploy.sh staging
```

## Post-Deployment Configuration

### 1. Setup Reverse Proxy (Nginx - Recommended)

Install Nginx:
```bash
sudo apt install nginx -y
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/vlowgen
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/vlowgen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Setup SSL Certificate (Recommended)

Using Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### 3. Setup Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Monitoring and Maintenance

### Check Service Status
```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Update Deployment
```bash
# Pull latest changes
git pull origin main

# Redeploy
./deploy.sh production
```

### Backup Considerations
Since this is a stateless application, regular code backups are sufficient. The main data is stored in external services (Alibaba Cloud, Composio).

## Troubleshooting

### Common Issues

1. **Containers won't start**
   ```bash
   # Check Docker daemon
   sudo systemctl status docker
   
   # Check container logs
   docker-compose logs
   ```

2. **Ports already in use**
   ```bash
   # Check what's using the ports
   sudo lsof -i :3000
   sudo lsof -i :3001
   
   # Kill processes if needed
   sudo kill -9 <PID>
   ```

3. **Health checks failing**
   ```bash
   # Check if services are responding
   curl http://localhost:3000
   curl http://localhost:3001/health
   ```

4. **Permission issues**
   ```bash
   # Ensure proper file permissions
   sudo chown -R $USER:$USER .
   chmod +x deploy.sh
   ```

### Useful Commands

```bash
# Stop all services
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Rebuild containers
docker-compose up -d --build

# Check resource usage
docker stats

# View container details
docker-compose ps -a
```

## Performance Optimization

### For Production:
1. **Use a CDN** for static assets
2. **Enable gzip compression** in Nginx
3. **Setup proper caching headers**
4. **Monitor resource usage** and scale accordingly
5. **Consider using Docker Swarm or Kubernetes** for high availability

### Security Considerations:
1. **Keep Docker and system updated**
2. **Use non-root users in containers**
3. **Regular security audits**
4. **Backup your environment files securely**
5. **Monitor logs for suspicious activity**

## Support

For issues with the deployment, check:
1. Container logs: `docker-compose logs`
2. System logs: `journalctl -u docker`
3. Nginx logs: `/var/log/nginx/error.log`

The application should be accessible at `http://your-domain.com` after successful deployment.