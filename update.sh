#!/bin/bash

# update.sh - Update Script for Bean Counter

set -e

echo "🔄 Updating Bean Counter..."

# 1. Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull

# 2. Install dependencies (if any new ones)
echo "📦 Updating npm dependencies..."
npm install

# 3. Apply database migrations
echo "🗄️ Applying database migrations..."
npx prisma migrate deploy

# 4. Rebuild the application
echo "🏗️ Rebuilding application..."
npm run build

# 5. Restart the service (optional, if running via systemd)
if systemctl is-active --quiet bean-counter.service; then
  echo "♻️ Restarting bean-counter.service..."
  sudo systemctl restart bean-counter.service
else
  echo "ℹ️ Service not active, skipping restart."
fi

echo "✅ Update complete!"
