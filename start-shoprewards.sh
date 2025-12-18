#!/bin/bash
set -e

cd /home/ehs/shop-rewards-hub

echo "========================================="
echo "🚀 Starting ShopRewards Hub"
echo "========================================="
echo ""

# Step 1: Start infrastructure services
echo "📦 Step 1: Starting infrastructure services (PostgreSQL, Valkey, RabbitMQ, MinIO)..."
cd infra
docker-compose up -d db cache queue storage
echo "✅ Infrastructure services started"
echo ""

# Step 2: Wait for services to be healthy
echo "⏳ Step 2: Waiting for services to be healthy (30 seconds)..."
sleep 30
echo "✅ Services should be healthy"
echo ""

# Step 3: Generate Prisma client
echo "🔧 Step 3: Generating Prisma client..."
cd /home/ehs/shop-rewards-hub
pnpm --filter @shop-rewards/db exec prisma generate
echo "✅ Prisma client generated"
echo ""

# Step 4: Run database migrations
echo "🗄️  Step 4: Running database migrations..."
pnpm --filter @shop-rewards/db exec prisma migrate deploy
echo "✅ Migrations complete"
echo ""

# Step 5: Seed database
echo "🌱 Step 5: Seeding database with permissions and roles..."
pnpm --filter @shop-rewards/db exec prisma db seed
echo "✅ Database seeded"
echo ""

# Step 6: Start development server
echo "========================================="
echo "🎉 Starting development server..."
echo "========================================="
echo ""
echo "Your app will be accessible at:"
echo "  - Local: http://localhost:3000"
echo "  - Tailscale: http://100.94.23.26:3000"
echo "  - Public (Cloudflare): https://shoprewards.lalatendu.info"
echo ""
echo "Setup Wizard:"
echo "  - Local: http://localhost:3000/setup"
echo "  - Tailscale: http://100.94.23.26:3000/setup"
echo "  - Public: https://shoprewards.lalatendu.info/setup"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

pnpm dev
