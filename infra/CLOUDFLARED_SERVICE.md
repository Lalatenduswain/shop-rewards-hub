# Cloudflared Tunnel4 Service

Dedicated Cloudflare Tunnel service for ShopRewards Hub.

## Service Details

- **Service Name**: `cloudflared-tunnel4.service`
- **Domain**: shoprewards.lalatendu.info
- **Target**: localhost:3000
- **Auto-start**: Yes (enabled on boot)

## Installation

Run the installation script:

```bash
sudo /home/ehs/shop-rewards-hub/scripts/install-cloudflared-tunnel4.sh
```

This will:
1. ✅ Stop any existing cloudflared services
2. ✅ Install cloudflared-tunnel4.service to systemd
3. ✅ Enable auto-start on boot
4. ✅ Start the service immediately

## Service Management

### Check Status
```bash
sudo systemctl status cloudflared-tunnel4
```

### View Real-Time Logs
```bash
sudo journalctl -u cloudflared-tunnel4 -f
```

### Restart Service
```bash
sudo systemctl restart cloudflared-tunnel4
```

### Stop Service
```bash
sudo systemctl stop cloudflared-tunnel4
```

### Start Service
```bash
sudo systemctl start cloudflared-tunnel4
```

### Disable Auto-Start
```bash
sudo systemctl disable cloudflared-tunnel4
```

### Enable Auto-Start
```bash
sudo systemctl enable cloudflared-tunnel4
```

## Verify Tunnel is Working

### 1. Check Service Status
```bash
sudo systemctl status cloudflared-tunnel4
```

Should show: **Active: active (running)**

### 2. Check Logs for Connection
```bash
sudo journalctl -u cloudflared-tunnel4 -n 50
```

Look for: `Registered tunnel connection`

### 3. Test from Browser
Visit: https://shoprewards.lalatendu.info

Should work once your app is running on port 3000.

## Configuration

The service file is located at:
```
/etc/systemd/system/cloudflared-tunnel4.service
```

Key settings:
- **Restart**: Always (auto-restart on failure)
- **Memory Limit**: 512MB
- **CPU Limit**: 50%
- **Log Location**: systemd journal

## Troubleshooting

### Service Won't Start

**Check logs:**
```bash
sudo journalctl -u cloudflared-tunnel4 -n 100
```

**Common issues:**
- cloudflared binary not found → Install cloudflared first
- Token invalid → Check token in service file
- Port conflict → Another cloudflared service running

### 502 Bad Gateway

This means tunnel is working but app isn't running.

**Check if app is running:**
```bash
netstat -tlnp | grep :3000
```

**Start your app:**
```bash
cd /home/ehs/shop-rewards-hub
./quick-start.sh
```

### Connection Timeout

**Verify cloudflared is connected:**
```bash
sudo journalctl -u cloudflared-tunnel4 | grep "Registered tunnel"
```

Should see recent connection messages.

**Check Cloudflare Dashboard:**
- Go to: https://one.dash.cloudflare.com/
- Navigate to: Access → Tunnels
- Your tunnel should show: **HEALTHY** (green)

### Multiple cloudflared Services

If you have multiple services, make sure only one is running:

```bash
# List all cloudflared services
systemctl list-units | grep cloudflared

# Stop old service
sudo systemctl stop cloudflared.service
sudo systemctl disable cloudflared.service

# Keep only tunnel4 running
sudo systemctl start cloudflared-tunnel4
```

## Resource Usage

Monitor resource usage:

```bash
# CPU and Memory
systemctl status cloudflared-tunnel4

# Detailed stats
sudo journalctl -u cloudflared-tunnel4 --since "1 hour ago" | grep -E "CPU|Memory"
```

Typical usage:
- **Memory**: 15-25 MB
- **CPU**: < 1%

## Integration with ShopRewards Hub

This tunnel routes traffic to your Next.js application:

```
Internet → Cloudflare Edge
          ↓
      Cloudflare Tunnel (encrypted)
          ↓
      Your Server (localhost:3000)
          ↓
      Next.js (ShopRewards Hub)
```

**Requirements:**
1. ✅ cloudflared-tunnel4 service running
2. ✅ Next.js app running on port 3000
3. ✅ Route configured in Cloudflare dashboard

## Benefits

- ✅ **No open ports** - Server firewall stays closed
- ✅ **Free SSL** - Automatic HTTPS certificate
- ✅ **DDoS protection** - Cloudflare shields your server
- ✅ **Auto-restart** - Service restarts on failure or reboot
- ✅ **Resource limits** - Won't consume excessive CPU/memory

## Uninstallation

To remove the service:

```bash
# Stop service
sudo systemctl stop cloudflared-tunnel4

# Disable auto-start
sudo systemctl disable cloudflared-tunnel4

# Remove service file
sudo rm /etc/systemd/system/cloudflared-tunnel4.service

# Reload systemd
sudo systemctl daemon-reload
```

## Support

**Cloudflare Tunnel Docs:**
- https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

**Systemd Docs:**
- `man systemctl`
- `man journalctl`

**ShopRewards Hub:**
- Check project README.md
