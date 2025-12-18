#!/bin/bash
set -e

echo "🚀 Quick Start - ShopRewards Hub"
echo "=================================="
echo ""

# 1. Start infrastructure services
echo "📦 Starting Docker services..."
cd /home/ehs/shop-rewards-hub/infra
docker-compose up -d db cache queue storage

echo "⏳ Waiting 30 seconds for services to initialize..."
sleep 30

# 2. Check services are up
echo "✅ Docker services started:"
docker-compose ps

echo ""
echo "🔧 Setting up database..."
cd /home/ehs/shop-rewards-hub

# 3. Generate Prisma client (only if needed)
if [ ! -d "node_modules/.prisma" ]; then
    echo "Generating Prisma client..."
    pnpm --filter @shop-rewards/db exec prisma generate
fi

# 4. Run migrations
echo "Running database migrations..."
pnpm --filter @shop-rewards/db exec prisma migrate deploy || echo "⚠️  Migrations may have already run"

# 5. Seed database
echo "Seeding database..."
pnpm --filter @shop-rewards/db exec prisma db seed || echo "⚠️  Database may already be seeded"

echo ""
echo "========================================="
echo "✅ Infrastructure is ready!"
echo "========================================="
echo ""
echo "Now starting Next.js on port 3000..."
echo ""
echo "Access your app at:"
echo "  🌍 Public:    https://shoprewards.lalatendu.info"
echo "  🔒 Tailscale: http://100.94.23.26:3000"
echo "  💻 Local:     http://localhost:3000"
echo ""
echo "Setup wizard:"
echo "  https://shoprewards.lalatendu.info/setup"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# 6. Start dev server
pnpm dev
