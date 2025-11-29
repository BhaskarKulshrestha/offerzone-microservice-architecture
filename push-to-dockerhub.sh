#!/bin/bash

################################################################################
# Docker Hub Push Script for OfferZone Microservices
################################################################################
#
# This script builds and pushes all microservice images to a single Docker Hub repo
# Each service gets its own tag: user-service, products-service, etc.
#
# Prerequisites:
# 1. Docker Hub account (create at https://hub.docker.com)
# 2. Docker installed and running
# 3. Login to Docker Hub: docker login
#
# Usage:
#   ./push-to-dockerhub.sh <your-dockerhub-username>/<repo-name>
#
# Example:
#   ./push-to-dockerhub.sh bhaskarkul/offerzone
#
################################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if repo is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Docker Hub repository not provided${NC}"
    echo ""
    echo "Usage: $0 <dockerhub-username>/<repo-name>"
    echo ""
    echo "Example: $0 bhaskarkul/offerzone"
    echo ""
    exit 1
fi

DOCKER_REPO=$1

echo -e "${BLUE}=========================================="
echo "Docker Hub Push for OfferZone"
echo -e "==========================================${NC}"
echo ""
echo "Docker Repository: $DOCKER_REPO"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if logged in to Docker Hub
if ! docker info 2>/dev/null | grep -q "Username"; then
    echo -e "${YELLOW}You are not logged in to Docker Hub.${NC}"
    echo "Please login first:"
    echo ""
    echo "  docker login"
    echo ""
    read -p "Press Enter after logging in, or Ctrl+C to cancel..."
fi

echo -e "${BLUE}Starting build and push process...${NC}"
echo ""

# Array of services with their tags and directories
declare -a services=("user-service" "products-service" "offers-service" "notifications-service" "favorites-service")
declare -a directories=("User" "Products" "Offers" "Notifications" "Favorites")

# Function to build and push a service
build_and_push() {
    local service=$1
    local directory=$2
    local image_name="$DOCKER_REPO:$service"
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Processing: $service${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Check if Dockerfile exists
    if [ ! -f "$directory/Dockerfile" ]; then
        echo -e "${RED}  ✗ Dockerfile not found in $directory/${NC}"
        return 1
    fi
    
    # Build the image
    echo -e "${BLUE}  → Building image: $image_name${NC}"
    if docker build -t "$image_name" "$directory/" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Build successful${NC}"
    else
        echo -e "${RED}  ✗ Build failed${NC}"
        return 1
    fi
    
    # Tag with latest for this service
    echo -e "${BLUE}  → Tagging image as $service (tag)${NC}"
    docker tag "$image_name" "$DOCKER_REPO:$service"
    
    # Push to Docker Hub
    echo -e "${BLUE}  → Pushing to Docker Hub...${NC}"
    if docker push "$image_name"; then
        echo -e "${GREEN}  ✓ Push successful${NC}"
        echo -e "${GREEN}  ✓ Image: $image_name${NC}"
    else
        echo -e "${RED}  ✗ Push failed${NC}"
        return 1
    fi
    
    echo ""
}

# Build and push all services
success_count=0
fail_count=0

for i in "${!services[@]}"; do
    if build_and_push "${services[$i]}" "${directories[$i]}"; then
        ((success_count++))
    else
        ((fail_count++))
    fi
done

# Summary
echo -e "${BLUE}=========================================="
echo "Build and Push Summary"
echo -e "==========================================${NC}"
echo ""
echo -e "${GREEN}✓ Successfully pushed: $success_count services${NC}"
if [ $fail_count -gt 0 ]; then
    echo -e "${RED}✗ Failed: $fail_count services${NC}"
fi
echo ""

# List all pushed images
if [ $success_count -gt 0 ]; then
    echo -e "${BLUE}Pushed Images (All in one repo with different tags):${NC}"
    echo ""
    for service in "${services[@]}"; do
        echo "  • docker pull $DOCKER_REPO:$service"
    done
    echo ""
    
    echo -e "${BLUE}Docker Hub Repository:${NC}"
    echo "  • https://hub.docker.com/r/$DOCKER_REPO"
    echo ""
fi

# Instructions for using the images
echo -e "${BLUE}=========================================="
echo "Next Steps"
echo -e "==========================================${NC}"
echo ""
echo "1. View your images on Docker Hub:"
echo "   https://hub.docker.com/r/$DOCKER_REPO"
echo ""
echo "2. Pull images on other machines:"
echo "   docker pull $DOCKER_REPO:user-service"
echo "   docker pull $DOCKER_REPO:products-service"
echo "   docker pull $DOCKER_REPO:offers-service"
echo "   docker pull $DOCKER_REPO:notifications-service"
echo "   docker pull $DOCKER_REPO:favorites-service"
echo ""
echo "3. Update docker-compose.yml to use your images:"
echo "   user-service:"
echo "     image: $DOCKER_REPO:user-service"
echo ""
echo "   products-service:"
echo "     image: $DOCKER_REPO:products-service"
echo ""
echo "   (and so on for all services...)"
echo ""
echo -e "${GREEN}✓ All done!${NC}"
echo ""


# Build and push all services
success_count=0
fail_count=0

for i in "${!services[@]}"; do
    if build_and_push "${services[$i]}" "${directories[$i]}"; then
        ((success_count++))
    else
        ((fail_count++))
    fi
done

# Summary
echo -e "${BLUE}=========================================="
echo "Build and Push Summary"
echo -e "==========================================${NC}"
echo ""
echo -e "${GREEN}✓ Successfully pushed: $success_count services${NC}"
if [ $fail_count -gt 0 ]; then
    echo -e "${RED}✗ Failed: $fail_count services${NC}"
fi
echo ""

# List all pushed images
if [ $success_count -gt 0 ]; then
    echo -e "${BLUE}Pushed Images:${NC}"
    echo ""
    for service in "${services[@]}"; do
        echo "  • docker pull $DOCKERHUB_USERNAME/offerzone-$service:latest"
    done
    echo ""
    
    echo -e "${BLUE}Docker Hub URLs:${NC}"
    echo ""
    for service in "${services[@]}"; do
        echo "  • https://hub.docker.com/r/$DOCKERHUB_USERNAME/offerzone-$service"
    done
    echo ""
fi

# Instructions for using the images
echo -e "${BLUE}=========================================="
echo "Next Steps"
echo -e "==========================================${NC}"
echo ""
echo "1. View your images on Docker Hub:"
echo "   https://hub.docker.com/u/$DOCKERHUB_USERNAME"
echo ""
echo "2. Pull images on other machines:"
echo "   docker pull $DOCKERHUB_USERNAME/offerzone-user-service:latest"
echo ""
echo "3. Update docker-compose.yml to use your images:"
echo "   image: $DOCKERHUB_USERNAME/offerzone-user-service:latest"
echo ""
echo -e "${GREEN}✓ All done!${NC}"
echo ""
