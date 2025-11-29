#!/bin/bash

##############################################################################
# Cleanup Script - Remove all Kubernetes resources
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}This will delete all OfferZone resources from Kubernetes${NC}"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${GREEN}Cleanup cancelled${NC}"
    exit 0
fi

echo -e "\n${RED}Deleting all resources...${NC}\n"

# Delete in reverse order
kubectl delete -f k8s/api-gateway.yml --ignore-not-found=true
kubectl delete -f k8s/favorites.yml --ignore-not-found=true
kubectl delete -f k8s/notifications.yml --ignore-not-found=true
kubectl delete -f k8s/offers.yml --ignore-not-found=true
kubectl delete -f k8s/user.yml --ignore-not-found=true
kubectl delete -f k8s/products.yml --ignore-not-found=true
kubectl delete -f k8s/redis.yml --ignore-not-found=true
kubectl delete -f k8s/mongo.yml --ignore-not-found=true
kubectl delete -f k8s/configmap.yml --ignore-not-found=true
kubectl delete secret app-secrets --ignore-not-found=true

echo -e "\n${GREEN}Cleanup complete!${NC}"
echo "Remaining resources:"
kubectl get all
