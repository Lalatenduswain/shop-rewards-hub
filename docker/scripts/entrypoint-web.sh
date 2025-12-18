#!/bin/bash
set -e

echo "[Web Entrypoint] Starting ShopRewards Hub Web Application..."

# Check if SETUP_COMPLETED environment variable is set
if [ -z "$SETUP_COMPLETED" ]; then
  echo "[Web Entrypoint] SETUP_COMPLETED not set, defaulting to false"
  export SETUP_COMPLETED="false"
fi

echo "[Web Entrypoint] Setup Status: $SETUP_COMPLETED"

# Wait for API service to be ready
echo "[Web Entrypoint] Waiting for API service..."
timeout=60
counter=0

while ! nc -z api 3000; do
  counter=$((counter + 1))
  if [ $counter -gt $timeout ]; then
    echo "[Web Entrypoint] ERROR: API service not available after ${timeout}s"
    exit 1
  fi
  echo "[Web Entrypoint] Waiting for API... ($counter/${timeout}s)"
  sleep 1
done

echo "[Web Entrypoint] API service is ready!"

# If setup is not complete, start in setup mode
if [ "$SETUP_COMPLETED" = "false" ]; then
  echo "[Web Entrypoint] ========================================="
  echo "[Web Entrypoint] FIRST BOOT DETECTED"
  echo "[Web Entrypoint] ========================================="
  echo "[Web Entrypoint] System is not configured."
  echo "[Web Entrypoint] Access http://localhost:3001/setup to begin setup wizard"
  echo "[Web Entrypoint] ========================================="
fi

# Start Next.js server
echo "[Web Entrypoint] Starting Next.js server on port 3001..."

# Check if we're in production or development
if [ "$NODE_ENV" = "production" ]; then
  echo "[Web Entrypoint] Running in PRODUCTION mode"
  exec node server.js
else
  echo "[Web Entrypoint] Running in DEVELOPMENT mode"
  exec pnpm dev --port 3001
fi
