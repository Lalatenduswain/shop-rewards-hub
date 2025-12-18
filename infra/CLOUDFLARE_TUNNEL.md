# Cloudflare Tunnel Setup for ShopRewards Hub

This guide shows you how to expose your ShopRewards Hub application to the internet using Cloudflare Tunnel (formerly Argo Tunnel).

## What is Cloudflare Tunnel?

Cloudflare Tunnel creates a secure, encrypted connection from your server to Cloudflare's edge network without opening firewall ports. Benefits:

- **No open inbound ports** - No need to expose ports 80/443
- **DDoS protection** - Cloudflare's network protects your origin
- **Free SSL/TLS** - Automatic HTTPS certificates
- **Access control** - Integrate with Cloudflare Access for authentication
- **Zero Trust security** - Private services without VPN

## Prerequisites

- Cloudflare account (free tier works)
- Domain added to Cloudflare
- Server with Docker running ShopRewards Hub

## Installation

### Quick Setup (Automated)

Run the automated setup script as root:

```bash
sudo /home/ehs/shop-rewards-hub/scripts/setup-cloudflared.sh
```

This will:
1. Install cloudflared binary
2. Install systemd service
3. Enable and start the service
4. Show status and logs

### Manual Setup

If you prefer manual setup:

#### 1. Install cloudflared

**Debian/Ubuntu:**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

**RHEL/CentOS/Fedora:**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm -o cloudflared.rpm
sudo rpm -i cloudflared.rpm
```

**Generic Linux:**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared
```

#### 2. Install systemd service

```bash
sudo cp /home/ehs/shop-rewards-hub/infra/cloudflared-tunnel.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable cloudflared-tunnel.service
sudo systemctl start cloudflared-tunnel.service
```

#### 3. Verify service

```bash
sudo systemctl status cloudflared-tunnel
sudo journalctl -u cloudflared-tunnel -f
```

## Configure Tunnel Routes

Your tunnel is configured with the token, but you need to set up routes in the Cloudflare dashboard.

### 1. Access Cloudflare Zero Trust Dashboard

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/)
2. Navigate to **Access** → **Tunnels**
3. Find your tunnel (should show as "Connected" with green status)
4. Click **Configure**

### 2. Add Public Hostname Routes

Configure these routes to expose ShopRewards Hub services:

#### Route 1: Main Application (Next.js Web)
- **Public hostname**: `shop.yourdomain.com` (or your preferred subdomain)
- **Service**: `http://localhost:3000`
- **Type**: HTTP
- **Description**: ShopRewards Hub Web Application

#### Route 2: API Backend (if running separately)
- **Public hostname**: `api.yourdomain.com`
- **Service**: `http://localhost:4000`
- **Type**: HTTP
- **Description**: ShopRewards Hub API

#### Route 3: RabbitMQ Management (Optional)
- **Public hostname**: `rabbitmq.yourdomain.com`
- **Service**: `http://localhost:15672`
- **Type**: HTTP
- **Description**: RabbitMQ Management Console
- **Recommended**: Enable Cloudflare Access for authentication

#### Route 4: MinIO Console (Optional)
- **Public hostname**: `minio.yourdomain.com`
- **Service**: `http://localhost:9001`
- **Type**: HTTP
- **Description**: MinIO Storage Console
- **Recommended**: Enable Cloudflare Access for authentication

### Example Configuration

```yaml
# In Cloudflare Dashboard → Tunnels → Configure

Public Hostnames:
  - Hostname: shop.example.com
    Service: http://localhost:3000

  - Hostname: api.example.com
    Service: http://localhost:4000

  - Hostname: rabbitmq.example.com
    Service: http://localhost:15672
    Access: Cloudflare Access (recommended)

  - Hostname: minio.example.com
    Service: http://localhost:9001
    Access: Cloudflare Access (recommended)
```

## Security Best Practices

### 1. Protect Admin Interfaces

For RabbitMQ and MinIO consoles, enable **Cloudflare Access**:

1. Go to **Access** → **Applications**
2. Click **Add an application**
3. Choose **Self-hosted**
4. Configure:
   - **Application name**: RabbitMQ Management
   - **Subdomain**: rabbitmq
   - **Domain**: yourdomain.com
5. Add access policies:
   - **Allow** → **Emails** → Add your admin emails
   - Or use **IP ranges** for your office/VPN

Repeat for MinIO console.

### 2. Rate Limiting

Enable rate limiting in Cloudflare dashboard:

1. Go to **Security** → **WAF**
2. Create rate limiting rules:
   - **Login endpoints**: 5 requests/min
   - **API endpoints**: 100 requests/min
   - **Upload endpoints**: 10 requests/min

### 3. Web Application Firewall (WAF)

Enable managed rulesets:
- **Cloudflare Managed Ruleset**
- **OWASP Core Ruleset**

### 4. Bot Protection

Enable **Bot Fight Mode** or **Super Bot Fight Mode** (paid)

## Service Management

### Check Status
```bash
sudo systemctl status cloudflared-tunnel
```

### View Logs
```bash
# Real-time logs
sudo journalctl -u cloudflared-tunnel -f

# Last 100 lines
sudo journalctl -u cloudflared-tunnel -n 100

# Logs from last hour
sudo journalctl -u cloudflared-tunnel --since "1 hour ago"
```

### Restart Service
```bash
sudo systemctl restart cloudflared-tunnel
```

### Stop Service
```bash
sudo systemctl stop cloudflared-tunnel
```

### Disable Service
```bash
sudo systemctl disable cloudflared-tunnel
```

## Troubleshooting

### Tunnel shows "Disconnected"

1. Check service status:
   ```bash
   sudo systemctl status cloudflared-tunnel
   ```

2. Check logs for errors:
   ```bash
   sudo journalctl -u cloudflared-tunnel -n 50
   ```

3. Verify Docker services are running:
   ```bash
   cd /home/ehs/shop-rewards-hub/infra
   docker-compose ps
   ```

4. Test local connectivity:
   ```bash
   curl http://localhost:3000
   ```

### Connection Refused Errors

Make sure ShopRewards Hub services are running:
```bash
cd /home/ehs/shop-rewards-hub
pnpm dev  # Or start Docker services
```

### Token Authentication Failed

If you see token errors in logs:
1. Verify the token in `/etc/systemd/system/cloudflared-tunnel.service`
2. Regenerate token from Cloudflare dashboard
3. Update service file with new token
4. Reload and restart:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart cloudflared-tunnel
   ```

### High CPU/Memory Usage

Adjust resource limits in service file:
```bash
sudo nano /etc/systemd/system/cloudflared-tunnel.service

# Modify:
MemoryMax=512M  # Increase if needed
CPUQuota=50%    # Increase if needed

sudo systemctl daemon-reload
sudo systemctl restart cloudflared-tunnel
```

## DNS Configuration

Cloudflare automatically creates DNS records when you add public hostnames. To verify:

1. Go to Cloudflare dashboard → **DNS** → **Records**
2. You should see CNAME records like:
   - `shop.yourdomain.com` → `<tunnel-id>.cfargotunnel.com`
   - `api.yourdomain.com` → `<tunnel-id>.cfargotunnel.com`

These are created automatically - no manual DNS changes needed!

## Health Monitoring

### Cloudflare Dashboard

Monitor tunnel health in **Access** → **Tunnels**:
- Connection status (green = healthy)
- Data transferred
- Connection uptime
- Connector (this server)

### Local Monitoring

Check metrics endpoint:
```bash
curl http://localhost:60000/metrics
```

This shows Prometheus-compatible metrics:
- `cloudflared_tunnel_total_requests`
- `cloudflared_tunnel_requests_per_tunnel`
- `cloudflared_tunnel_response_time`

## Next Steps

1. ✅ Install and start tunnel service
2. ✅ Configure public hostname routes
3. ⚠️ Enable Cloudflare Access for admin consoles
4. ⚠️ Configure WAF and rate limiting
5. ⚠️ Test access from external network
6. ⚠️ Update DNS records if using custom domains
7. ⚠️ Configure HTTPS redirects in Cloudflare SSL/TLS settings

## Resources

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare Access Documentation](https://developers.cloudflare.com/cloudflare-one/applications/)
- [Zero Trust Dashboard](https://one.dash.cloudflare.com/)
