#!/bin/bash

# Community Board Docker Deployment Script
# This script builds and updates the Docker container for the application

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

# Parse command line arguments
BUILD_ONLY=false
RESTART=false
LOGS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --restart)
            RESTART=true
            shift
            ;;
        --logs)
            LOGS=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --build-only  Only build the Docker image without starting containers"
            echo "  --restart     Stop and restart all containers"
            echo "  --logs        Show container logs after deployment"
            echo "  --help        Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_status "Starting Community Board deployment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please update .env with your configuration before deploying to production!"
fi

# Update npm dependencies
print_status "Installing npm dependencies..."
npm install

# Stop existing containers if restart flag is set
if [ "$RESTART" = true ]; then
    print_status "Stopping existing containers..."
    docker-compose down
fi

# Build the Docker image
print_status "Building Docker image..."
docker-compose build app

if [ "$BUILD_ONLY" = true ]; then
    print_status "Build complete. Use 'docker-compose up -d' to start the application."
    exit 0
fi

# Start the containers
print_status "Starting containers..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "communityboard-app.*Up"; then
    print_status "Application is running!"
else
    print_error "Application failed to start. Check logs with: docker-compose logs app"
    exit 1
fi

if docker-compose ps | grep -q "communityboard-mongodb.*Up"; then
    print_status "MongoDB is running!"
else
    print_error "MongoDB failed to start. Check logs with: docker-compose logs mongodb"
    exit 1
fi

# Display service URLs
echo ""
print_status "Services are available at:"
echo "  - Application: http://localhost:3000"
echo "  - Mongo Express: http://localhost:8081"
echo ""
print_status "Default admin credentials:"
echo "  - Email: admin@communityboard.com"
echo "  - Password: admin123"
echo ""
print_warning "Remember to change default credentials in production!"

# Show logs if requested
if [ "$LOGS" = true ]; then
    echo ""
    print_status "Showing application logs (Ctrl+C to exit)..."
    docker-compose logs -f app
fi

print_status "Deployment complete!"