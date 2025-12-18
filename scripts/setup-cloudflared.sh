#!/bin/bash
set -e

echo "========================================="
echo "Cloudflare Tunnel Setup for ShopRewards Hub"
echo "========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo "❌ Please run as root (sudo)"
   exit 1
fi

# 1. Install cloudflared
echo ""
echo "📥 Step 1: Installing cloudflared..."

if ! command -v cloudflared &> /dev/null; then
    # Detect OS
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        echo "Detected Debian/Ubuntu system"
        curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        dpkg -i cloudflared.deb
        rm cloudflared.deb
    elif [ -f /etc/redhat-release ]; then
        # RHEL/CentOS/Fedora
        echo "Detected RHEL/CentOS/Fedora system"
        curl -L --output cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
        rpm -i cloudflared.rpm
        rm cloudflared.rpm
    else
        # Generic Linux
        echo "Generic Linux detected, installing binary"
        curl -L --output /usr/local/bin/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
        chmod +x /usr/local/bin/cloudflared
    fi
    echo "✅ cloudflared installed successfully"
else
    echo "✅ cloudflared is already installed"
fi

cloudflared --version

# 2. Copy systemd service
echo ""
echo "📝 Step 2: Installing systemd service..."
cp /home/ehs/shop-rewards-hub/infra/cloudflared-tunnel.service /etc/systemd/system/cloudflared-tunnel.service
chmod 644 /etc/systemd/system/cloudflared-tunnel.service
echo "✅ Service file installed"

# 3. Reload systemd
echo ""
echo "🔄 Step 3: Reloading systemd..."
systemctl daemon-reload
echo "✅ Systemd reloaded"

# 4. Enable and start service
echo ""
echo "🚀 Step 4: Enabling and starting service..."
systemctl enable cloudflared-tunnel.service
systemctl start cloudflared-tunnel.service
echo "✅ Service enabled and started"

# 5. Check status
echo ""
echo "📊 Step 5: Checking service status..."
sleep 2
systemctl status cloudflared-tunnel.service --no-pager -l

echo ""
echo "========================================="
echo "✅ Cloudflare Tunnel Setup Complete!"
echo "========================================="
echo ""
echo "Service Commands:"
echo "  View status:  sudo systemctl status cloudflared-tunnel"
echo "  View logs:    sudo journalctl -u cloudflared-tunnel -f"
echo "  Restart:      sudo systemctl restart cloudflared-tunnel"
echo "  Stop:         sudo systemctl stop cloudflared-tunnel"
echo "  Disable:      sudo systemctl disable cloudflared-tunnel"
echo ""
echo "Your ShopRewards Hub should now be accessible via your Cloudflare Tunnel!"
echo "Check your Cloudflare Zero Trust dashboard for the public URL."
echo ""
