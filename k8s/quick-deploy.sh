#!/bin/bash

##############################################################################
# Quick Deploy Script - Deploy all services to Kubernetes
##############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Deploying OfferZone to Kubernetes...${NC}\n"

# Deploy in order
echo "1. Deploying MongoDB..."
kubectl apply -f k8s/mongo.yml

echo "2. Deploying Redis..."
kubectl apply -f k8s/redis.yml

echo "3. Waiting for infrastructure..."
sleep 5

echo "4. Applying ConfigMap..."
kubectl apply -f k8s/configmap.yml

echo "5. Applying Secrets..."
if [ -f k8s/secrets.yml ]; then
    kubectl apply -f k8s/secrets.yml
else
    echo -e "${YELLOW}Creating default secrets...${NC}"
    kubectl create secret generic app-secrets \
        --from-literal=JWT_SECRET=your-super-secret-jwt-key-change-in-production \
        --dry-run=client -o yaml | kubectl apply -f -
fi

echo "6. Deploying Products Service..."
kubectl apply -f k8s/products.yml

echo "7. Deploying User Service..."
kubectl apply -f k8s/user.yml

echo "8. Deploying Offers Service..."
kubectl apply -f k8s/offers.yml

echo "9. Deploying Notifications Service..."
kubectl apply -f k8s/notifications.yml

echo "10. Deploying Favorites Service..."
kubectl apply -f k8s/favorites.yml

echo "11. Deploying API Gateway..."
kubectl apply -f k8s/api-gateway.yml

echo -e "\n${GREEN}Deployment complete!${NC}\n"
echo "Checking status..."
kubectl get pods

echo -e "\n${BLUE}Access Information:${NC}"
if kubectl config current-context | grep -q "minikube"; then
    echo -e "${YELLOW}Run: minikube service api-gateway${NC}"
else
    echo -e "${YELLOW}API Gateway: http://localhost:8085${NC}"
fi
