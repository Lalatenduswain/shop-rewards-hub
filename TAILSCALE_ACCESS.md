# Tailscale Network Access

Your ShopRewards Hub is now configured to be accessible via Tailscale network.

## 🌐 Access URLs

### Via Tailscale Network
```
Main App:    http://100.94.23.26:3000
Setup Wizard: http://100.94.23.26:3000/setup
```

### Via Cloudflare Tunnel (Public)
```
Main App:    https://shoprewards.lalatendu.info
Setup Wizard: https://shoprewards.lalatendu.info/setup
```

### Via Localhost (Server Only)
```
Main App:    http://localhost:3000
Setup Wizard: http://localhost:3000/setup
```

## 🚀 Starting the Application

Run the startup script:

```bash
cd /home/ehs/shop-rewards-hub
./start-shoprewards.sh
```

This will:
1. Start Docker services (PostgreSQL, Valkey, RabbitMQ, MinIO)
2. Run database migrations
3. Seed permissions and roles
4. Start Next.js on **0.0.0.0:3000** (accessible from all interfaces)

## ✅ What Was Fixed

**Problem**: Next.js was only binding to localhost (127.0.0.1), which blocked Tailscale connections.

**Solution**: Updated Next.js to bind to **0.0.0.0** (all interfaces):
- Changed: `next dev` → `next dev -H 0.0.0.0`
- Now accepts connections from:
  - localhost (127.0.0.1)
  - Tailscale (100.94.23.26)
  - Any network interface

## 🔍 Verification

After starting the app, verify it's listening on all interfaces:

```bash
# Check if port 3000 is listening on all interfaces
netstat -tlnp | grep :3000
# Should show: 0.0.0.0:3000 (not 127.0.0.1:3000)

# Or use ss command
ss -tlnp | grep :3000
```

You should see:
```
tcp   LISTEN  0  511  0.0.0.0:3000  0.0.0.0:*
```

**NOT** (this would block Tailscale):
```
tcp   LISTEN  0  511  127.0.0.1:3000  0.0.0.0:*
```

## 🛠️ Troubleshooting

### "Connection Refused" from Tailscale

**1. Verify app is running:**
```bash
ps aux | grep "next dev"
```

**2. Check listening address:**
```bash
netstat -tlnp | grep :3000
```

Should show `0.0.0.0:3000`, not `127.0.0.1:3000`

**3. Check Tailscale interface:**
```bash
ip addr show tailscale0
```

Should show: `inet 100.94.23.26/32`

**4. Test from server:**
```bash
curl http://100.94.23.26:3000
```

Should return HTML (not "Connection refused")

### Port 3000 Already in Use

**Kill existing process:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill it (replace PID with actual process ID)
kill -9 <PID>
```

### Firewall Blocking Access

**Check firewall status:**
```bash
sudo ufw status
```

If active, allow port 3000:
```bash
sudo ufw allow 3000/tcp
```

### App Starts but Shows Error

**Check logs:**
```bash
# See what's happening
# Logs will show in terminal where you ran ./start-shoprewards.sh
```

**Common errors:**
- Database connection failed → Check PostgreSQL is running
- Missing .env file → Run `cp .env.example .env`
- Port already in use → Kill existing process

## 📊 Network Configuration

Your server has these network interfaces:

| Interface | IP Address | Access From |
|-----------|------------|-------------|
| lo (localhost) | 127.0.0.1 | Server only |
| tailscale0 | 100.94.23.26 | Tailscale network |
| eth0/ens* | (public IP) | Internet (via Cloudflare) |

Next.js binds to **0.0.0.0** which means it listens on **all interfaces**.

## 🔐 Security Notes

### Tailscale Network (100.94.23.26)
- ✅ Private network, encrypted
- ✅ Only accessible by devices on your Tailscale network
- ✅ No need for firewall rules
- ✅ No SSL required (Tailscale encrypts traffic)

### Cloudflare Tunnel (shoprewards.lalatendu.info)
- ✅ Public internet access
- ✅ Free SSL/TLS certificate
- ✅ DDoS protection
- ✅ No open ports on server
- ✅ Traffic encrypted via tunnel

### Recommendations
- Use **Tailscale** for development/admin access (faster, more secure)
- Use **Cloudflare** for public production access (SSL, CDN, DDoS protection)
- Keep **localhost** for debugging on the server itself

## 🎯 Quick Start Commands

```bash
# Start everything
cd /home/ehs/shop-rewards-hub
./start-shoprewards.sh

# Stop services
cd /home/ehs/shop-rewards-hub/infra
docker-compose down

# View logs
docker-compose logs -f web

# Restart just the app (keep infrastructure running)
# Press Ctrl+C in terminal where app is running
# Then run: pnpm dev
```

## ✨ Success!

You can now access your ShopRewards Hub from:
- **Any device on your Tailscale network**: http://100.94.23.26:3000
- **Anywhere on the internet**: https://shoprewards.lalatendu.info

Enjoy! 🚀
