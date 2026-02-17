#!/bin/bash

# setup.sh - Fresh Install Script for Bean Counter

set -e

echo "🚀 Starting Bean Counter setup..."

# 1. Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# 2. Setup environment variables
if [ ! -f .env ]; then
  echo "📄 Creating .env file..."
  echo 'DATABASE_URL="file:./dev.db"' > .env
else
  echo "✅ .env file already exists."
fi

# 3. Initialize database
echo "🗄️ Initializing database..."
npx prisma migrate dev --name init

# 4. Build application
echo "🏗️ Building application..."
npm run build

echo "✅ Setup complete! You can start the app with 'npm run dev' or configure systemd."
