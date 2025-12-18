#!/bin/bash
set -e

echo "[API Entrypoint] Starting ShopRewards Hub API Server..."

# Wait for database to be ready
echo "[API Entrypoint] Waiting for database..."
timeout=60
counter=0

until nc -z db 5432; do
  counter=$((counter + 1))
  if [ $counter -gt $timeout ]; then
    echo "[API Entrypoint] ERROR: Database not available after ${timeout}s"
    exit 1
  fi
  echo "[API Entrypoint] Waiting for database... ($counter/${timeout}s)"
  sleep 1
done

echo "[API Entrypoint] Database is ready!"

# Wait for Valkey (cache) to be ready
echo "[API Entrypoint] Waiting for Valkey cache..."
counter=0

until nc -z cache 6379; do
  counter=$((counter + 1))
  if [ $counter -gt $timeout ]; then
    echo "[API Entrypoint] WARNING: Valkey not available after ${timeout}s"
    echo "[API Entrypoint] Continuing without cache..."
    break
  fi
  echo "[API Entrypoint] Waiting for Valkey... ($counter/${timeout}s)"
  sleep 1
done

echo "[API Entrypoint] Valkey is ready!"

# Wait for RabbitMQ to be ready
echo "[API Entrypoint] Waiting for RabbitMQ..."
counter=0

until nc -z queue 5672; do
  counter=$((counter + 1))
  if [ $counter -gt $timeout ]; then
    echo "[API Entrypoint] WARNING: RabbitMQ not available after ${timeout}s"
    echo "[API Entrypoint] Continuing without message queue..."
    break
  fi
  echo "[API Entrypoint] Waiting for RabbitMQ... ($counter/${timeout}s)"
  sleep 1
done

echo "[API Entrypoint] RabbitMQ is ready!"

# Check if this is first boot
echo "[API Entrypoint] Checking first-boot status..."

# Query database for SetupWizardState
SETUP_CHECK_QUERY="SELECT system_configured FROM \"SetupWizardState\" LIMIT 1;"

# Run query (this will fail if table doesn't exist or no records - which is fine for first boot)
SETUP_STATUS=$(psql "$DATABASE_URL" -t -c "$SETUP_CHECK_QUERY" 2>/dev/null || echo "false")

# Trim whitespace
SETUP_STATUS=$(echo "$SETUP_STATUS" | xargs)

if [ "$SETUP_STATUS" = "t" ] || [ "$SETUP_STATUS" = "true" ]; then
  echo "[API Entrypoint] System is already configured"
  export SETUP_COMPLETED="true"
else
  echo "[API Entrypoint] ========================================="
  echo "[API Entrypoint] FIRST BOOT DETECTED"
  echo "[API Entrypoint] ========================================="
  echo "[API Entrypoint] Running Prisma migrations..."

  # Generate Prisma client
  pnpm --filter @shop-rewards/db exec prisma generate

  # Run migrations
  pnpm --filter @shop-rewards/db exec prisma migrate deploy

  echo "[API Entrypoint] Migrations completed!"
  echo "[API Entrypoint] ========================================="

  export SETUP_COMPLETED="false"
fi

# Start the API server
echo "[API Entrypoint] Starting tRPC API server on port 3000..."

if [ "$NODE_ENV" = "production" ]; then
  echo "[API Entrypoint] Running in PRODUCTION mode"
  exec node dist/server.js
else
  echo "[API Entrypoint] Running in DEVELOPMENT mode"
  exec pnpm --filter @shop-rewards/api dev
fi
