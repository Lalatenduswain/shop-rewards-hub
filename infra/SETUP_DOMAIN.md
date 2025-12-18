# Domain Setup for shoprewards.lalatendu.info

This guide shows you how to configure ShopRewards Hub with your domain `shoprewards.lalatendu.info` using Cloudflare Tunnel.

## 🌐 Your URLs

Once configured, your application will be accessible at:

| Service | URL | Description |
|---------|-----|-------------|
| **Main App** | https://shoprewards.lalatendu.info | Public web application |
| **API** | https://api.shoprewards.lalatendu.info | Backend API endpoints |
| **RabbitMQ** | https://rabbitmq.shoprewards.lalatendu.info | Admin console (protected) |
| **MinIO** | https://minio.shoprewards.lalatendu.info | Storage console (protected) |

All URLs automatically get **free SSL/TLS certificates** from Cloudflare!

## 📋 Step-by-Step Setup

### Step 1: Verify Domain is on Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Verify `lalatendu.info` is listed under your domains
3. Ensure nameservers are pointing to Cloudflare

### Step 2: Install Cloudflare Tunnel Service

Run the automated setup script:

```bash
sudo /home/ehs/shop-rewards-hub/scripts/setup-cloudflared.sh
```

This installs and starts the tunnel service with your token.

### Step 3: Configure Routes in Cloudflare Dashboard

1. **Go to Zero Trust Dashboard**
   - Visit: https://one.dash.cloudflare.com/
   - Navigate to: **Access** → **Tunnels**

2. **Find Your Tunnel**
   - Look for your tunnel (should show **Connected** 🟢)
   - Click **Configure**

3. **Add Public Hostnames** (click **Add a public hostname** button)

#### Route 1: Main Application

```
Subdomain: shoprewards
Domain: lalatendu.info
Path: (leave empty)
Service Type: HTTP
URL: localhost:3000
```

**Settings:**
- ✅ No TLS Verify
- ❌ No Access Application (public)

#### Route 2: API Backend

```
Subdomain: api.shoprewards
Domain: lalatendu.info
Path: (leave empty)
Service Type: HTTP
URL: localhost:4000
```

**Settings:**
- ✅ No TLS Verify
- ❌ No Access Application (or enable for private API)

#### Route 3: RabbitMQ Admin Console (SECURE THIS!)

```
Subdomain: rabbitmq.shoprewards
Domain: lalatendu.info
Path: (leave empty)
Service Type: HTTP
URL: localhost:15672
```

**Settings:**
- ✅ No TLS Verify
- ✅ **Enable Access Application** ← IMPORTANT!
  - Click **Add an application**
  - Application name: `RabbitMQ Admin`
  - Subdomain: `rabbitmq.shoprewards`
  - Domain: `lalatendu.info`
  - Add Access Policy:
    - **Decision**: Allow
    - **Include**: Emails → Add your admin email

#### Route 4: MinIO Storage Console (SECURE THIS!)

```
Subdomain: minio.shoprewards
Domain: lalatendu.info
Path: (leave empty)
Service Type: HTTP
URL: localhost:9001
```

**Settings:**
- ✅ No TLS Verify
- ✅ **Enable Access Application** ← IMPORTANT!
  - Same process as RabbitMQ above

### Step 4: Update Application Environment Variables

Edit your `.env` file to use the new domain:

```bash
cd /home/ehs/shop-rewards-hub
nano .env
```

Update these variables:

```env
# Application URLs
NEXT_PUBLIC_API_URL=https://api.shoprewards.lalatendu.info
NEXTAUTH_URL=https://shoprewards.lalatendu.info

# MinIO Public URL (for file access)
MINIO_PUBLIC_URL=https://minio.shoprewards.lalatendu.info

# API Backend
API_URL=https://api.shoprewards.lalatendu.info
```

### Step 5: Start Your Application

Start the infrastructure services:

```bash
cd /home/ehs/shop-rewards-hub/infra
docker-compose up -d db cache queue storage
```

Start the development server:

```bash
cd /home/ehs/shop-rewards-hub
pnpm dev
```

**Or** if using Docker for the app:

```bash
cd /home/ehs/shop-rewards-hub/infra
docker-compose up -d web api
```

### Step 6: Test Your Domain

1. **Check tunnel status:**
   ```bash
   sudo systemctl status cloudflared-tunnel
   ```

2. **View tunnel logs:**
   ```bash
   sudo journalctl -u cloudflared-tunnel -f
   ```

3. **Test public access:**
   - Open browser to: https://shoprewards.lalatendu.info
   - You should see your ShopRewards Hub setup wizard!

4. **Verify DNS:**
   ```bash
   dig shoprewards.lalatendu.info
   nslookup shoprewards.lalatendu.info
   ```

## 🔒 Security Checklist

- [ ] RabbitMQ console protected with Cloudflare Access
- [ ] MinIO console protected with Cloudflare Access
- [ ] WAF enabled in Cloudflare dashboard
- [ ] Rate limiting configured
- [ ] Bot Fight Mode enabled
- [ ] SSL/TLS mode set to "Full" or "Full (Strict)"
- [ ] HSTS enabled (Cloudflare → SSL/TLS → Edge Certificates)
- [ ] Automatic HTTPS Rewrites enabled

## 🛡️ Cloudflare Security Settings

### 1. Enable WAF

1. Go to Cloudflare dashboard → **Security** → **WAF**
2. Enable these Managed Rulesets:
   - ✅ Cloudflare Managed Ruleset
   - ✅ Cloudflare OWASP Core Ruleset
   - ✅ Cloudflare Exposed Credentials Check

### 2. Configure Rate Limiting

Create rate limiting rules:

**Rule 1: Login Protection**
```
Path: /api/auth/*
Requests: 5 per minute
Action: Block
Duration: 10 minutes
```

**Rule 2: API Protection**
```
Path: /api/*
Requests: 100 per minute
Action: Challenge
```

**Rule 3: Upload Protection**
```
Path: /api/receipts/*
Requests: 10 per hour
Action: Block
Duration: 1 hour
```

### 3. Enable Bot Protection

1. Go to **Security** → **Bots**
2. Enable **Bot Fight Mode** (free) or **Super Bot Fight Mode** (paid)

### 4. SSL/TLS Settings

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full** (or **Full (Strict)** if you have valid origin certificates)
3. Enable these features:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ Opportunistic Encryption

4. Go to **SSL/TLS** → **Edge Certificates**
   - ✅ Always Use HTTPS
   - ✅ HTTP Strict Transport Security (HSTS)
   - ✅ Minimum TLS Version: 1.2 or higher
   - ✅ TLS 1.3: Enabled

## 📊 Monitoring and Logs

### View Cloudflare Access Logs

1. Go to **Logs** → **Audit Logs**
2. Filter by application to see who accessed your admin consoles

### View Cloudflare Analytics

1. Go to **Analytics & Logs** → **Traffic**
2. Monitor:
   - Requests per second
   - Bandwidth usage
   - Threat activity
   - Bot scores

### Local Application Logs

```bash
# Tunnel logs
sudo journalctl -u cloudflared-tunnel -f

# Docker logs
cd /home/ehs/shop-rewards-hub/infra
docker-compose logs -f web
docker-compose logs -f api
docker-compose logs -f db

# Development logs (if using pnpm dev)
# Check terminal where pnpm dev is running
```

## 🚀 Quick Start Commands

```bash
# 1. Install Cloudflare Tunnel
sudo /home/ehs/shop-rewards-hub/scripts/setup-cloudflared.sh

# 2. Start infrastructure
cd /home/ehs/shop-rewards-hub/infra
docker-compose up -d db cache queue storage

# 3. Generate environment secrets
openssl rand -hex 32  # For ENCRYPTION_KEY
openssl rand -hex 32  # For JWT_SECRET

# 4. Edit .env file
nano /home/ehs/shop-rewards-hub/.env
# Add the secrets above and update URLs to shoprewards.lalatendu.info

# 5. Setup database
cd /home/ehs/shop-rewards-hub
pnpm db:generate
pnpm --filter @shop-rewards/db exec prisma migrate deploy
pnpm --filter @shop-rewards/db exec prisma db seed

# 6. Start application
pnpm dev

# 7. Open browser
# Visit: https://shoprewards.lalatendu.info
```

## 🐛 Troubleshooting

### "ERR_CONNECTION_REFUSED" in browser

**Check if tunnel is running:**
```bash
sudo systemctl status cloudflared-tunnel
```

**Check if app is running:**
```bash
# For development
ps aux | grep "pnpm dev"

# For Docker
docker ps | grep shop-rewards
```

### "502 Bad Gateway" Error

This means tunnel is working but can't reach your app.

**Check app is listening on correct port:**
```bash
netstat -tlnp | grep :3000
netstat -tlnp | grep :4000
```

**Check Docker services:**
```bash
cd /home/ehs/shop-rewards-hub/infra
docker-compose ps
```

All services should show "Up" status.

### Tunnel shows "Disconnected" in Cloudflare

**Restart tunnel service:**
```bash
sudo systemctl restart cloudflared-tunnel
sudo systemctl status cloudflared-tunnel
```

**Check logs for errors:**
```bash
sudo journalctl -u cloudflared-tunnel -n 50
```

### DNS Not Resolving

**Wait for DNS propagation** (usually 1-5 minutes, max 24 hours)

**Force DNS refresh:**
```bash
# Linux
sudo systemd-resolve --flush-caches

# Or
sudo /etc/init.d/dns-clean restart
```

**Check DNS from external tool:**
- Visit: https://dnschecker.org/
- Enter: `shoprewards.lalatendu.info`
- Should show CNAME pointing to Cloudflare

## ✅ Success Checklist

After setup, verify everything works:

- [ ] Tunnel service running (`systemctl status cloudflared-tunnel`)
- [ ] All 4 routes configured in Cloudflare dashboard
- [ ] DNS resolves to Cloudflare (`dig shoprewards.lalatendu.info`)
- [ ] Main app accessible at https://shoprewards.lalatendu.info
- [ ] API accessible at https://api.shoprewards.lalatendu.info
- [ ] RabbitMQ protected (shows Cloudflare Access login)
- [ ] MinIO protected (shows Cloudflare Access login)
- [ ] HTTPS works (green padlock in browser)
- [ ] WAF enabled in Cloudflare
- [ ] Rate limiting configured
- [ ] Bot protection enabled

## 📞 Support

**Cloudflare Community:**
- https://community.cloudflare.com/

**Cloudflare Tunnel Docs:**
- https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

**ShopRewards Hub Repository:**
- Check README.md for additional help
- Open issues for bugs/questions

## 🎉 You're Done!

Your ShopRewards Hub is now accessible worldwide at:

**https://shoprewards.lalatendu.info**

With enterprise-grade security:
- ✅ DDoS protection
- ✅ Free SSL/TLS
- ✅ Web Application Firewall
- ✅ Bot protection
- ✅ Rate limiting
- ✅ Zero open ports
- ✅ Access control for admin consoles

Enjoy your secure, production-ready application! 🚀
