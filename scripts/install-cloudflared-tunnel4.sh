#!/bin/bash
set -e

echo "========================================="
echo "Installing cloudflared-tunnel4 Service"
echo "For: shoprewards.lalatendu.info"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo "❌ Please run as root (use sudo)"
   exit 1
fi

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed!"
    echo "Please install it first with:"
    echo "  sudo cloudflared service install <your-token>"
    exit 1
fi

echo "✅ cloudflared is installed"
cloudflared --version
echo ""

# Stop existing cloudflared services to avoid conflicts
echo "🛑 Stopping any existing cloudflared services..."
systemctl stop cloudflared.service 2>/dev/null || true
systemctl stop cloudflared-tunnel.service 2>/dev/null || true
echo ""

# Copy service file
echo "📝 Installing cloudflared-tunnel4.service..."
cp /home/ehs/shop-rewards-hub/infra/cloudflared-tunnel4.service /etc/systemd/system/
chmod 644 /etc/systemd/system/cloudflared-tunnel4.service
echo "✅ Service file installed"
echo ""

# Reload systemd
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload
echo "✅ Systemd reloaded"
echo ""

# Disable old services (if they exist)
echo "🔧 Disabling old cloudflared services..."
systemctl disable cloudflared.service 2>/dev/null || true
systemctl disable cloudflared-tunnel.service 2>/dev/null || true
echo ""

# Enable and start new service
echo "🚀 Enabling and starting cloudflared-tunnel4.service..."
systemctl enable cloudflared-tunnel4.service
systemctl start cloudflared-tunnel4.service
echo "✅ Service enabled and started"
echo ""

# Wait a moment for service to initialize
sleep 3

# Check status
echo "📊 Service Status:"
echo "========================================="
systemctl status cloudflared-tunnel4.service --no-pager -l
echo ""

echo "========================================="
echo "✅ Installation Complete!"
echo "========================================="
echo ""
echo "Service: cloudflared-tunnel4.service"
echo "Tunnel for: shoprewards.lalatendu.info → localhost:3000"
echo ""
echo "Useful Commands:"
echo "  Status:   sudo systemctl status cloudflared-tunnel4"
echo "  Logs:     sudo journalctl -u cloudflared-tunnel4 -f"
echo "  Restart:  sudo systemctl restart cloudflared-tunnel4"
echo "  Stop:     sudo systemctl stop cloudflared-tunnel4"
echo "  Disable:  sudo systemctl disable cloudflared-tunnel4"
echo ""
echo "Next Steps:"
echo "1. Make sure your app is running on port 3000"
echo "2. Visit: https://shoprewards.lalatendu.info"
echo ""
