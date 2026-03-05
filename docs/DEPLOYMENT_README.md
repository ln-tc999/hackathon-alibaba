# VlowGen Production Deployment & Security Guide

Complete guide untuk deploy VlowGen ke production dengan security best practices.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Security Overview](#security-overview)
3. [SSL/TLS Setup](#ssltls-setup)
4. [Deployment](#deployment)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Security Checklist](#security-checklist)

## 🚀 Quick Start

### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Domain name pointing to your server
- 2GB+ RAM, 20GB+ storage
- Root or sudo access

### 1. Server Setup (5 minutes)

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. SSL Certificate (5 minutes)

```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate (replace yourdomain.com)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Verify certificate
ls -la /etc/letsencrypt/live/yourdomain.com/
```

### 3. Clone & Configure (10 minutes)

```bash
# Clone repository
git clone https://github.com/yourusername/vlowgen.git
cd vlowgen

# Copy environment template
cp .env.production.template .env.production

# Edit environment (use your favorite editor)
nano .env.production

# Update nginx.conf with your domain
sed -i 's/yourdomain.com/your-actual-domain.com/g' nginx.conf

# Make deploy script executable
chmod +x deploy.sh
```

### 4. Deploy (5 minutes)

```bash
# Deploy to production
./deploy.sh production

# Verify deployment
docker-compose ps
curl https://yourdomain.com/health
```

**Total time: ~25 minutes** ✅

## 🔒 Security Overview

### What's Implemented

#### Logging Security
- ✅ Automatic sensitive data masking
- ✅ API keys masked in logs
- ✅ No stack traces in production
- ✅ Structured logging format

#### API Security
- ✅ Rate limiting (100 req/min)
- ✅ CORS validation
- ✅ API key validation
- ✅ Request sanitization
- ✅ Input validation

#### Transport Security
- ✅ HTTPS enforced
- ✅ TLS 1.2+ only
- ✅ Strong cipher suites
- ✅ HSTS enabled
- ✅ OCSP stapling

#### Infrastructure Security
- ✅ Firewall configured
- ✅ Services isolated
- ✅ Resource limits
- ✅ Health checks
- ✅ Automatic backups

### Security Files

| File | Purpose |
|------|---------|
| `packages/backend/src/utils/logger.ts` | Secure logging with data masking |
| `packages/backend/src/middleware/security.ts` | Security middleware (rate limit, headers, etc.) |
| `nginx.conf` | Nginx configuration with SSL and security headers |
| `docker-compose.prod.yml` | Production Docker setup with security options |
| `SECURITY_CHECKLIST.md` | Comprehensive security checklist |

## 🔐 SSL/TLS Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Auto-renewal setup
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify renewal
sudo systemctl status certbot.timer
```

### Option 2: Self-Signed (Development Only)

```bash
# Generate certificate
openssl genrsa -out key.pem 2048
openssl req -new -x509 -key key.pem -out cert.pem -days 365

# Update .env.production
USE_SSL=true
SSL_CERT_PATH=./certs/cert.pem
SSL_KEY_PATH=./certs/key.pem
```

### Option 3: AWS Certificate Manager

1. Go to AWS Certificate Manager
2. Request public certificate
3. Add domain names
4. Validate via DNS
5. Attach to load balancer

See `SSL_SETUP.md` for detailed instructions.

## 🚀 Deployment

### Using Deploy Script

```bash
# Deploy to production
./deploy.sh production

# Rollback to previous version
./deploy.sh rollback
```

### Manual Deployment

```bash
# Load environment
export $(cat .env.production | xargs)

# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify services
docker-compose ps
```

### Verify Deployment

```bash
# Check health endpoints
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health

# Check SSL certificate
openssl s_client -connect yourdomain.com:443

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl https://yourdomain.com/api/health

# Frontend health
curl https://yourdomain.com/health

# MinIO health
docker-compose exec minio mc admin info minio
```

### View Logs

```bash
# Real-time logs
docker-compose logs -f backend

# Export logs
docker-compose logs backend > backend.log

# Filter logs
docker-compose logs backend | grep ERROR
```

### Monitor Resources

```bash
# Check resource usage
docker stats

# Check disk usage
df -h

# Check memory
free -h
```

### Automated Monitoring

```bash
# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
DOMAIN="yourdomain.com"

# Check backend
curl -sf https://$DOMAIN/api/health || echo "Backend down"

# Check frontend
curl -sf https://$DOMAIN/health || echo "Frontend down"

# Check SSL expiration
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | \
  openssl x509 -noout -dates
EOF

chmod +x monitor.sh

# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /path/to/monitor.sh") | crontab -
```

## 🔄 Maintenance

### Daily Tasks
- [ ] Review error logs
- [ ] Check health endpoints
- [ ] Monitor resource usage

### Weekly Tasks
- [ ] Apply security updates
- [ ] Check dependency updates
- [ ] Verify backups
- [ ] Review security logs

### Monthly Tasks
- [ ] Run security scans
- [ ] Update documentation
- [ ] Review access logs
- [ ] Test disaster recovery

### Quarterly Tasks
- [ ] Penetration testing
- [ ] Security audit
- [ ] Compliance review
- [ ] Update security policies

## 🆘 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild images
docker-compose build --no-cache backend

# Restart services
docker-compose restart backend
```

### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -noout -dates

# Renew certificate
sudo certbot renew --force-renewal

# Restart nginx
docker-compose restart nginx
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Limit resources in docker-compose.yml
# Restart services
docker-compose restart
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :443

# Kill process
sudo kill -9 <PID>
```

## ✅ Security Checklist

### Pre-Deployment
- [ ] All API keys rotated
- [ ] SSL certificate obtained
- [ ] Environment variables configured
- [ ] Database credentials secured
- [ ] CORS origins configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Logging configured

### Post-Deployment
- [ ] Health checks passing
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] Logs being generated
- [ ] Backups working
- [ ] Monitoring configured
- [ ] Incident response plan ready

### Ongoing
- [ ] Security updates applied
- [ ] Logs reviewed
- [ ] Backups verified
- [ ] Certificate renewal working
- [ ] Monitoring alerts working
- [ ] Team trained on procedures

## 📚 Additional Resources

### Documentation
- [SSL_SETUP.md](SSL_SETUP.md) - Detailed SSL setup guide
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Complete deployment guide
- [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) - Security checklist
- [SECURITY_AND_DEPLOYMENT_SUMMARY.md](SECURITY_AND_DEPLOYMENT_SUMMARY.md) - Summary of all changes

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Nginx Security](https://nginx.org/en/docs/http/ngx_http_ssl_module.html)

## 🆘 Support

### Getting Help
1. Check [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) troubleshooting section
2. Review logs: `docker-compose logs backend`
3. Check health endpoints
4. Review [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)

### Reporting Issues
- GitHub Issues: Report bugs
- Security Issues: Email security@yourdomain.com
- Documentation: Update relevant .md files

## 📝 Deployment Checklist

Before going live:
- [ ] Server provisioned and updated
- [ ] Docker and Docker Compose installed
- [ ] SSL certificate obtained
- [ ] Environment variables configured
- [ ] Backups tested
- [ ] Health checks passing
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Logging verified
- [ ] Monitoring configured
- [ ] Incident response plan ready
- [ ] Team trained on procedures
- [ ] Documentation updated

---

**Status**: Production Ready ✅
**Last Updated**: 2024
**Version**: 1.0.0

For detailed information, see the documentation files listed above.
