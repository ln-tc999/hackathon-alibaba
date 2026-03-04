# VlowGen Production Deployment Guide

## Prerequisites

1. **Alibaba Cloud ECS Instance** with:
   - Docker installed
   - Docker Compose V2 installed
   - Ports opened: 80, 3001, 9000, 9001

2. **Security Group Rules** (Alibaba Cloud Console):
   - Port 80 (HTTP) - Frontend
   - Port 3001 (HTTP) - Backend API
   - Port 9000 (HTTP) - MinIO API
   - Port 9001 (HTTP) - MinIO Console

## Step-by-Step Deployment

### 1. Upload Project to Server

```bash
# On your local machine
# Zip the project (exclude node_modules and .git)
tar -czf vlowgen.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='packages/*/node_modules' \
  --exclude='packages/*/dist' \
  --exclude='.qoder' \
  .

# Upload to server
scp vlowgen.tar.gz admin@8.219.216.140:~/

# SSH to server
ssh admin@8.219.216.140

# Extract
cd ~
tar -xzf vlowgen.tar.gz
cd hackathon-alibaba  # or your project folder name
```

### 2. Verify Environment File

```bash
# Check if .env exists
cat .env

# If not, create it with the content from .env file in project root
# Make sure to update PUBLIC_API_URL with your server IP
```

### 3. Run Deployment Script

```bash
# Make script executable
chmod +x deploy-production.sh

# Run deployment
./deploy-production.sh
```

### 4. Verify Deployment

```bash
# Check container status
sudo docker ps

# All containers should show "healthy" status:
# - vlowgen-frontend (port 80)
# - vlowgen-backend (port 3001)
# - vlowgen-minio (ports 9000, 9001)

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:80

# From your local machine
curl http://8.219.216.140:3001/health
```

### 5. Access Application

- **Frontend**: http://8.219.216.140
- **Backend API**: http://8.219.216.140:3001
- **MinIO Console**: http://8.219.216.140:9001
  - Username: minioadmin
  - Password: minioadmin

## Troubleshooting

### Frontend shows "unhealthy"

```bash
# Check frontend logs
sudo docker compose logs frontend --tail=50

# Common issues:
# 1. PUBLIC_API_URL not set correctly
# 2. Health check endpoint not responding

# Rebuild frontend
sudo docker compose build --no-cache frontend
sudo docker compose up -d frontend
```

### Backend CORS errors

```bash
# Check ALLOWED_ORIGINS in .env
# Should include: http://8.219.216.140,http://8.219.216.140:80

# Restart backend
sudo docker compose restart backend
```

### MinIO not accessible

```bash
# Check MinIO logs
sudo docker compose logs minio --tail=50

# Restart MinIO
sudo docker compose restart minio
```

### Rebuild Everything

```bash
# Stop all containers
sudo docker compose down

# Remove volumes (WARNING: This deletes all data)
sudo docker compose down -v

# Rebuild and start
sudo docker compose build --no-cache
sudo docker compose up -d
```

## Monitoring

### View Logs

```bash
# All services
sudo docker compose logs -f

# Specific service
sudo docker compose logs -f backend
sudo docker compose logs -f frontend
sudo docker compose logs -f minio

# Last 100 lines
sudo docker compose logs backend --tail=100
```

### Check Resource Usage

```bash
# Container stats
sudo docker stats

# Disk usage
sudo docker system df
```

## Updating Application

```bash
# Pull latest code (if using git)
git pull

# Or upload new files via scp

# Rebuild and restart
sudo docker compose build --no-cache
sudo docker compose up -d
```

## Backup

### Backup MinIO Data

```bash
# Backup MinIO volume
sudo docker run --rm \
  -v hackathon-alibaba_minio-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/minio-backup-$(date +%Y%m%d).tar.gz /data
```

### Restore MinIO Data

```bash
# Restore from backup
sudo docker run --rm \
  -v hackathon-alibaba_minio-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/minio-backup-YYYYMMDD.tar.gz -C /
```

## Security Recommendations

1. **Change MinIO Credentials**:
   - Update MINIO_ACCESS_KEY and MINIO_SECRET_KEY in .env
   - Restart containers

2. **Enable API Key Authentication**:
   - Set REQUIRE_API_KEY=true in .env
   - Set API_KEY=your-secret-key
   - Restart backend

3. **Setup SSL/TLS**:
   - Get SSL certificate (Let's Encrypt)
   - Update USE_SSL=true in .env
   - Set SSL_CERT_PATH and SSL_KEY_PATH
   - Restart backend

4. **Firewall Rules**:
   - Only open necessary ports
   - Restrict MinIO console (9001) to admin IPs only

## Performance Tuning

### Increase Container Resources

Edit `docker-compose.yml`:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '4'
        memory: 2G
      reservations:
        cpus: '2'
        memory: 1G
```

### Enable Caching

Add Redis for caching (optional):

```yaml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
```

## Support

For issues, check:
1. Container logs: `sudo docker compose logs`
2. System resources: `sudo docker stats`
3. Network connectivity: `curl http://localhost:3001/health`

## Environment Variables Reference

See `.env` file for all available configuration options.

Key variables:
- `PUBLIC_API_URL`: Frontend API endpoint
- `DASHSCOPE_API_KEY`: Alibaba Cloud AI API key
- `COMPOSIO_API_KEY`: Social media integration key
- `ALLOWED_ORIGINS`: CORS allowed origins
- `NODE_ENV`: production/development
