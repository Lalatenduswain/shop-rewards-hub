#!/bin/bash

# ShopRewards Hub - Development Environment Startup Script

set -e

echo "🚀 Starting ShopRewards Hub Development Environment"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
  cp .env.example .env

  # Generate encryption key
  ENCRYPTION_KEY=$(openssl rand -hex 32)
  JWT_SECRET=$(openssl rand -hex 32)

  # Update .env with generated keys
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
  else
    # Linux
    sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
  fi

  echo -e "${GREEN}✅ Generated encryption keys and saved to .env${NC}"
  echo -e "${YELLOW}⚠️  Please review .env and update any other required values${NC}"
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
  echo -e "${RED}❌ pnpm is not installed. Installing...${NC}"
  npm install -g pnpm@8.15.0
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 Installing dependencies...${NC}"
  pnpm install
  echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Start Docker services
echo -e "${YELLOW}🐳 Starting Docker services...${NC}"
cd infra
docker-compose up -d db cache queue storage

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service health
echo -e "${YELLOW}🔍 Checking service health...${NC}"
docker-compose ps

# Go back to root
cd ..

# Generate Prisma client
echo -e "${YELLOW}🔄 Generating Prisma client...${NC}"
pnpm db:generate

# Run migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
pnpm db:migrate

# Seed database
echo -e "${YELLOW}🌱 Seeding database...${NC}"
pnpm db:seed

echo ""
echo -e "${GREEN}✅ Development environment ready!${NC}"
echo ""
echo "Available services:"
echo "  📊 PostgreSQL:    http://localhost:5432"
echo "  ⚡ Valkey:        http://localhost:6379"
echo "  🐰 RabbitMQ:      http://localhost:15672 (guest/guest)"
echo "  📦 MinIO:         http://localhost:9001 (shoprewards/shoprewards123!)"
echo ""
echo "To start the application:"
echo "  ${GREEN}pnpm dev${NC}"
echo ""
echo "To stop services:"
echo "  ${GREEN}cd infra && docker-compose down${NC}"
echo ""
echo "First-time setup:"
echo "  1. Start the app: pnpm dev"
echo "  2. Navigate to: http://localhost:3000/setup"
echo "  3. Complete the 12-step wizard"
echo ""
echo -e "${YELLOW}Default super admin:${NC}"
echo "  Email:    admin@shoprewards.local"
echo "  Password: ChangeMe123!"
echo -e "${RED}  ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!${NC}"
echo ""
