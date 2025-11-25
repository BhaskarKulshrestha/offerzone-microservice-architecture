#!/bin/bash

echo "=========================================="
echo "Stopping OfferZone Services"
echo "=========================================="
echo ""

# Ask for confirmation
read -p "Do you want to remove data volumes? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Stopping services and removing volumes..."
    docker-compose down -v
    echo ""
    echo "✅ All services stopped and data removed"
else
    echo "🛑 Stopping services (keeping data)..."
    docker-compose down
    echo ""
    echo "✅ All services stopped"
    echo "💾 Data volumes preserved"
fi

echo ""
echo "📊 Remaining containers:"
docker-compose ps

echo ""
echo "=========================================="
echo "Services stopped successfully!"
echo "=========================================="
echo ""
echo "To start again, run: ./start-services.sh"
echo ""
