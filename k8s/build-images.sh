#!/bin/bash

##############################################################################
# Quick Build Script - Build all Docker images for Kubernetes deployment
##############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Building all OfferZone Docker images...${NC}\n"

# Check if running in Minikube
if kubectl config current-context 2>/dev/null | grep -q "minikube"; then
    echo -e "${GREEN}Detected Minikube - using Minikube Docker daemon${NC}"
    eval $(minikube docker-env)
fi

# Build images
echo "Building API Gateway..."
docker build -f ApiGateway/Dockerfile -t offerzone-api-gateway:latest .

echo "Building Products Service..."
docker build -f Products/Dockerfile -t offerzone-products:latest .

echo "Building User Service..."
docker build -f User/Dockerfile -t offerzone-user:latest .

echo "Building Offers Service..."
docker build -f Offers/Dockerfile -t offerzone-offers:latest .

echo "Building Notifications Service..."
docker build -f Notifications/Dockerfile -t offerzone-notifications:latest .

echo "Building Favorites Service..."
docker build -f Favorites/Dockerfile -t offerzone-favorites:latest .

echo -e "\n${GREEN}All images built successfully!${NC}\n"
echo "Images created:"
docker images | grep offerzone
