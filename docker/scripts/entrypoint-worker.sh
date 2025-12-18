#!/bin/bash
set -e

echo "[Worker Entrypoint] Starting ShopRewards Hub Background Workers..."

# Wait for all required services
echo "[Worker Entrypoint] Waiting for required services..."

# Wait for database
timeout=60
counter=0

echo "[Worker Entrypoint] Checking database..."
until nc -z db 5432; do
  counter=$((counter + 1))
  if [ $counter -gt $timeout ]; then
    echo "[Worker Entrypoint] ERROR: Database not available"
    exit 1
  fi
  sleep 1
done
echo "[Worker Entrypoint] ✓ Database ready"

# Wait for RabbitMQ
counter=0
echo "[Worker Entrypoint] Checking RabbitMQ..."
until nc -z queue 5672; do
  counter=$((counter + 1))
  if [ $counter -gt $timeout ]; then
    echo "[Worker Entrypoint] ERROR: RabbitMQ not available"
    exit 1
  fi
  sleep 1
done
echo "[Worker Entrypoint] ✓ RabbitMQ ready"

# Wait for Valkey
counter=0
echo "[Worker Entrypoint] Checking Valkey..."
until nc -z cache 6379; do
  counter=$((counter + 1))
  if [ $counter -gt $timeout ]; then
    echo "[Worker Entrypoint] WARNING: Valkey not available"
    break
  fi
  sleep 1
done
echo "[Worker Entrypoint] ✓ Valkey ready"

# Wait for MinIO
counter=0
echo "[Worker Entrypoint] Checking MinIO..."
until nc -z storage 9000; do
  counter=$((counter + 1))
  if [ $counter -gt $timeout ]; then
    echo "[Worker Entrypoint] WARNING: MinIO not available"
    break
  fi
  sleep 1
done
echo "[Worker Entrypoint] ✓ MinIO ready"

# Optional: Wait for Ollama (may be external)
if [ -n "$OLLAMA_URL" ]; then
  OLLAMA_HOST=$(echo "$OLLAMA_URL" | cut -d':' -f2 | tr -d '/')
  OLLAMA_PORT=$(echo "$OLLAMA_URL" | cut -d':' -f3 | grep -oE '[0-9]+' || echo "11434")

  counter=0
  echo "[Worker Entrypoint] Checking Ollama at $OLLAMA_HOST:$OLLAMA_PORT..."
  until nc -z "$OLLAMA_HOST" "$OLLAMA_PORT"; do
    counter=$((counter + 1))
    if [ $counter -gt $timeout ]; then
      echo "[Worker Entrypoint] WARNING: Ollama not available at $OLLAMA_URL"
      echo "[Worker Entrypoint] OCR workers will be disabled"
      break
    fi
    sleep 1
  done

  if [ $counter -le $timeout ]; then
    echo "[Worker Entrypoint] ✓ Ollama ready"
  fi
fi

echo "[Worker Entrypoint] All services ready!"
echo "[Worker Entrypoint] ========================================="

# Check if setup is complete
SETUP_CHECK_QUERY="SELECT system_configured FROM \"SetupWizardState\" LIMIT 1;"
SETUP_STATUS=$(psql "$DATABASE_URL" -t -c "$SETUP_CHECK_QUERY" 2>/dev/null || echo "false")
SETUP_STATUS=$(echo "$SETUP_STATUS" | xargs)

if [ "$SETUP_STATUS" != "t" ] && [ "$SETUP_STATUS" != "true" ]; then
  echo "[Worker Entrypoint] System not configured yet"
  echo "[Worker Entrypoint] Workers will start in standby mode"
  echo "[Worker Entrypoint] Waiting for setup wizard completion..."

  # Wait loop checking every 30 seconds
  while true; do
    sleep 30
    SETUP_STATUS=$(psql "$DATABASE_URL" -t -c "$SETUP_CHECK_QUERY" 2>/dev/null || echo "false")
    SETUP_STATUS=$(echo "$SETUP_STATUS" | xargs)

    if [ "$SETUP_STATUS" = "t" ] || [ "$SETUP_STATUS" = "true" ]; then
      echo "[Worker Entrypoint] Setup completed! Starting workers..."
      break
    fi
  done
fi

echo "[Worker Entrypoint] Starting background workers..."

# Start workers based on NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
  echo "[Worker Entrypoint] Running in PRODUCTION mode"
  echo "[Worker Entrypoint] Starting worker processes:"
  echo "[Worker Entrypoint]   - Receipt OCR Worker"
  echo "[Worker Entrypoint]   - Voucher Generation Worker"
  echo "[Worker Entrypoint]   - Analytics Worker"
  echo "[Worker Entrypoint]   - GDPR Auto-Delete Worker"

  exec node dist/workers/index.js
else
  echo "[Worker Entrypoint] Running in DEVELOPMENT mode"
  exec pnpm --filter @shop-rewards/api workers
fi
