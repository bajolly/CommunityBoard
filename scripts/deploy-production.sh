#!/bin/bash

# Community Board Production Deployment Script
# This script prepares and deploys the application for production use

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running from project root
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "Starting Community Board production deployment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Production deployment requires configuration!"
    echo "Please create .env from .env.example and configure all values"
    exit 1
fi

# Verify critical environment variables
print_status "Checking environment configuration..."

# Load .env file
export $(cat .env | grep -v '^#' | xargs)

# Check critical variables
MISSING_VARS=()

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your_jwt_secret_here" ]; then
    MISSING_VARS+=("JWT_SECRET")
fi

if [ -z "$MONGO_ROOT_PASSWORD" ] || [ "$MONGO_ROOT_PASSWORD" = "admin123" ]; then
    MISSING_VARS+=("MONGO_ROOT_PASSWORD")
fi

if [ -z "$MONGO_EXPRESS_PASSWORD" ] || [ "$MONGO_EXPRESS_PASSWORD" = "admin123" ]; then
    MISSING_VARS+=("MONGO_EXPRESS_PASSWORD")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_error "The following environment variables need to be updated for production:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

# Set NODE_ENV to production if not already set
if ! grep -q "NODE_ENV=production" .env; then
    print_status "Setting NODE_ENV to production..."
    echo "NODE_ENV=production" >> .env
fi

# Clean up any existing containers and volumes
print_status "Cleaning up existing deployment..."
docker-compose down -v

# Build production image
print_status "Building production Docker image..."
docker-compose build --no-cache app

# Run database migrations if needed
print_status "Starting database..."
docker-compose up -d mongodb
sleep 10

# Check if migration script exists and run it
if [ -f "scripts/migrate-stories-lanes.js" ]; then
    print_status "Running database migrations..."
    docker-compose run --rm app node scripts/migrate-stories-lanes.js
fi

# Start all services
print_status "Starting all services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be healthy..."
sleep 10

# Health check
HEALTHY=true

if ! docker-compose ps | grep -q "communityboard-app.*Up"; then
    print_error "Application failed to start"
    HEALTHY=false
fi

if ! docker-compose ps | grep -q "communityboard-mongodb.*Up"; then
    print_error "MongoDB failed to start"
    HEALTHY=false
fi

if [ "$HEALTHY" = false ]; then
    print_error "Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi

# Create admin user if it doesn't exist
print_status "Ensuring admin user exists..."
docker-compose exec -T mongodb mongosh communityboard --eval "
    db = db.getSiblingDB('communityboard');
    if (db.users.findOne({ email: 'admin@communityboard.com' }) === null) {
        print('Creating default admin user...');
        db.users.insertOne({
            fullname: 'System Administrator',
            email: 'admin@communityboard.com',
            password: '\$2a\$10\$8K1p/gHBh7yPdQyYhPzZR.26DgZGVx5TLMcOjJu.GA/dxdHwPwLnq',
            address: 'System',
            role: 'admin',
            isApproved: true,
            createdAt: new Date()
        });
    }
" 2>/dev/null || true

# Display deployment information
echo ""
print_status "Production deployment complete!"
echo ""
print_status "Services:"
echo "  - Application: http://localhost:3000"
echo "  - Mongo Express: http://localhost:8081"
echo ""
print_warning "Next steps:"
echo "  1. Configure a reverse proxy (nginx/Apache) for the application"
echo "  2. Set up SSL certificates for HTTPS"
echo "  3. Configure firewall rules"
echo "  4. Set up monitoring and backups"
echo "  5. Change the default admin password immediately!"
echo ""
print_status "To view logs: docker-compose logs -f app"
print_status "To stop services: docker-compose down"