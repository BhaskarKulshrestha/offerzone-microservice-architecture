#!/bin/bash

echo "=========================================="
echo "Starting OfferZone with Kong API Gateway"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose down > /dev/null 2>&1
echo "✓ Existing containers stopped"
echo ""

# Start all services
echo "🚀 Starting all services..."
echo "   - PostgreSQL (Kong Database)"
echo "   - Kong Gateway"
echo "   - MongoDB"
echo "   - User Service"
echo "   - Products Service"
echo "   - Offers Service"
echo "   - Notifications Service"
echo "   - Favorites Service"
echo ""

docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to start services"
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Check if Kong is healthy
echo ""
echo "🔍 Checking Kong Gateway status..."
KONG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9001/status)

if [ "$KONG_STATUS" != "200" ]; then
    echo "⚠️  Kong is not ready yet, waiting a bit more..."
    sleep 10
fi

# Check container status
echo ""
echo "📊 Container Status:"
docker-compose ps

# Configure Kong
echo ""
echo "=========================================="
echo "Configuring Kong API Gateway..."
echo "=========================================="
echo ""

# Check if kong-config.sh exists and is executable
if [ ! -f "./kong-config.sh" ]; then
    echo "❌ Error: kong-config.sh not found"
    exit 1
fi

if [ ! -x "./kong-config.sh" ]; then
    echo "🔧 Making kong-config.sh executable..."
    chmod +x ./kong-config.sh
fi

# Run Kong configuration
./kong-config.sh

echo ""
echo "=========================================="
echo "✅ All Services Started Successfully!"
echo "=========================================="
echo ""
echo "🌐 Access URLs:"
echo "   API Gateway:  http://localhost:9000"
echo "   Kong Admin:   http://localhost:9001"
echo ""
echo "📍 API Endpoints (through Kong):"
echo "   Users:        http://localhost:9000/offerzone/users"
echo "   Products:     http://localhost:9000/offerzone/products"
echo "   Offers:       http://localhost:9000/offerzone/offers"
echo "   Notifications: http://localhost:9000/offerzone/notifications"
echo "   Favorites:    http://localhost:9000/offerzone/favorites"
echo ""
echo "🔍 Direct Service Access (for debugging):"
echo "   User:         http://localhost:8010"
echo "   Products:     http://localhost:8011"
echo "   Offers:       http://localhost:8012"
echo "   Notifications: http://localhost:8013"
echo "   Favorites:    http://localhost:8014"
echo ""
echo "📊 Useful Commands:"
echo "   View logs:       docker-compose logs -f"
echo "   Stop services:   ./stop-services.sh"
echo "   Restart Kong:    docker-compose restart kong"
echo ""
echo "=========================================="
