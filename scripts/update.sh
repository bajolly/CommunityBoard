#!/bin/bash

# Quick update script for Community Board
# Use this for updating the application after code changes

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running from project root
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "Updating Community Board application..."

# Update dependencies if package.json changed
if git diff --name-only HEAD^ HEAD | grep -q "package.json"; then
    print_status "Package.json changed, updating dependencies..."
    npm install
fi

# Rebuild and restart the app container
print_status "Rebuilding application container..."
docker-compose build app

print_status "Restarting application..."
docker-compose up -d app

# Wait for service to be ready
sleep 5

# Check if service is running
if docker-compose ps | grep -q "communityboard-app.*Up"; then
    print_status "Application updated successfully!"
    echo ""
    print_status "Application is running at: http://localhost:3000"
else
    print_error "Application failed to start. Check logs with: docker-compose logs app"
    exit 1
fi