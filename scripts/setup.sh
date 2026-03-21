#!/bin/bash
# TradeClaw Setup Script

set -e

echo "=== TradeClaw Setup ==="

# Check prerequisites
command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required but not installed. Install: npm install -g pnpm"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "docker is required but not installed."; exit 1; }

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Start infrastructure
echo "Starting PostgreSQL and Redis..."
docker compose up -d

# Wait for services
echo "Waiting for services to be ready..."
sleep 5

# Copy env file if not exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please edit .env and add your database credentials"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Edit packages/server/.env with your settings"
echo "2. Run: pnpm dev"
echo ""
echo "Or deploy to Railway + Vercel:"
echo "1. Push to GitHub"
echo "2. Connect to railway.app (backend)"
echo "3. Connect to vercel.com (frontend)"
