#!/bin/bash

##############################################################################
# Pre-deployment Check Script
# Verifies all prerequisites before deploying to Kubernetes
##############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     OfferZone Pre-Deployment Check                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}\n"

# Check kubectl
echo -n "Checking kubectl... "
if command -v kubectl &> /dev/null; then
    VERSION=$(kubectl version --client --short 2>/dev/null || kubectl version --client 2>/dev/null | head -1)
    echo -e "${GREEN}✓${NC} Found: $VERSION"
else
    echo -e "${RED}✗${NC} kubectl not found"
    echo -e "${YELLOW}  Install: https://kubernetes.io/docs/tasks/tools/${NC}"
    ((ERRORS++))
fi

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    VERSION=$(docker --version)
    echo -e "${GREEN}✓${NC} Found: $VERSION"
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} Docker daemon is running"
    else
        echo -e "  ${RED}✗${NC} Docker daemon is not running"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} Docker not found"
    echo -e "${YELLOW}  Install: https://www.docker.com/products/docker-desktop${NC}"
    ((ERRORS++))
fi

# Check Kubernetes cluster
echo -n "Checking Kubernetes cluster... "
if kubectl cluster-info &> /dev/null; then
    echo -e "${GREEN}✓${NC} Connected to cluster"
    
    # Check cluster type
    CONTEXT=$(kubectl config current-context 2>/dev/null)
    echo -e "  Context: ${BLUE}$CONTEXT${NC}"
    
    # Check if Minikube
    if echo "$CONTEXT" | grep -q "minikube"; then
        echo -e "  ${BLUE}ℹ${NC} Detected Minikube"
        
        # Check Minikube status
        if command -v minikube &> /dev/null; then
            STATUS=$(minikube status -f "{{.Host}}" 2>/dev/null)
            if [ "$STATUS" = "Running" ]; then
                echo -e "  ${GREEN}✓${NC} Minikube is running"
            else
                echo -e "  ${YELLOW}⚠${NC} Minikube status: $STATUS"
                ((WARNINGS++))
            fi
        fi
    fi
    
    # Check nodes
    NODES=$(kubectl get nodes --no-headers 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  Nodes: ${GREEN}$NODES${NC}"
    
else
    echo -e "${RED}✗${NC} Cannot connect to cluster"
    echo -e "${YELLOW}  Docker Desktop: Enable Kubernetes in settings${NC}"
    echo -e "${YELLOW}  Minikube: Run 'minikube start'${NC}"
    ((ERRORS++))
fi

# Check Docker images
echo -e "\n${BLUE}Checking Docker images...${NC}"
IMAGES=("offerzone-api-gateway" "offerzone-products" "offerzone-user" "offerzone-offers" "offerzone-notifications" "offerzone-favorites")
MISSING_IMAGES=0

for IMAGE in "${IMAGES[@]}"; do
    if docker images --format "{{.Repository}}" | grep -q "^${IMAGE}$"; then
        echo -e "  ${GREEN}✓${NC} $IMAGE:latest"
    else
        echo -e "  ${RED}✗${NC} $IMAGE:latest (not found)"
        ((MISSING_IMAGES++))
    fi
done

if [ $MISSING_IMAGES -gt 0 ]; then
    echo -e "\n  ${YELLOW}⚠${NC} $MISSING_IMAGES image(s) missing"
    echo -e "  ${YELLOW}  Run: ./k8s/build-images.sh${NC}"
    ((WARNINGS++))
fi

# Check Kubernetes manifests
echo -e "\n${BLUE}Checking Kubernetes manifests...${NC}"
MANIFESTS=("mongo.yml" "redis.yml" "configmap.yml" "products.yml" "user.yml" "offers.yml" "notifications.yml" "favorites.yml" "api-gateway.yml")
MISSING_MANIFESTS=0

for MANIFEST in "${MANIFESTS[@]}"; do
    if [ -f "k8s/$MANIFEST" ]; then
        echo -e "  ${GREEN}✓${NC} k8s/$MANIFEST"
    else
        echo -e "  ${RED}✗${NC} k8s/$MANIFEST (not found)"
        ((MISSING_MANIFESTS++))
        ((ERRORS++))
    fi
done

# Check secrets
if [ -f "k8s/secrets.yml" ]; then
    echo -e "  ${GREEN}✓${NC} k8s/secrets.yml"
else
    echo -e "  ${YELLOW}⚠${NC} k8s/secrets.yml (not found)"
    echo -e "  ${YELLOW}  Will create default secret during deployment${NC}"
    ((WARNINGS++))
fi

# Check deployment scripts
echo -e "\n${BLUE}Checking deployment scripts...${NC}"
SCRIPTS=("deploy.sh" "build-images.sh" "quick-deploy.sh" "cleanup.sh")
for SCRIPT in "${SCRIPTS[@]}"; do
    if [ -f "k8s/$SCRIPT" ]; then
        if [ -x "k8s/$SCRIPT" ]; then
            echo -e "  ${GREEN}✓${NC} k8s/$SCRIPT (executable)"
        else
            echo -e "  ${YELLOW}⚠${NC} k8s/$SCRIPT (not executable)"
            echo -e "  ${YELLOW}  Run: chmod +x k8s/$SCRIPT${NC}"
            ((WARNINGS++))
        fi
    else
        echo -e "  ${RED}✗${NC} k8s/$SCRIPT (not found)"
        ((WARNINGS++))
    fi
done

# Check for existing deployments
echo -e "\n${BLUE}Checking existing deployments...${NC}"
if kubectl get deployments &> /dev/null; then
    DEPLOYMENTS=$(kubectl get deployments --no-headers 2>/dev/null | wc -l | tr -d ' ')
    if [ "$DEPLOYMENTS" -gt 0 ]; then
        echo -e "  ${YELLOW}⚠${NC} Found $DEPLOYMENTS existing deployment(s)"
        echo -e "  ${YELLOW}  Current deployments:${NC}"
        kubectl get deployments 2>/dev/null | tail -n +2 | awk '{print "    - " $1}'
        echo -e "  ${YELLOW}  Run './k8s/cleanup.sh' to remove before redeploying${NC}"
        ((WARNINGS++))
    else
        echo -e "  ${GREEN}✓${NC} No existing deployments"
    fi
fi

# Check available resources
echo -e "\n${BLUE}Checking cluster resources...${NC}"
if kubectl top nodes &> /dev/null; then
    kubectl top nodes
else
    echo -e "  ${YELLOW}⚠${NC} Metrics not available (metrics-server may not be installed)"
    echo -e "  ${YELLOW}  Minikube: Run 'minikube addons enable metrics-server'${NC}"
fi

# Port availability check (optional, only if cluster is accessible)
echo -e "\n${BLUE}Checking port availability on localhost...${NC}"
PORTS=(8085 8000 8001 8002 8003 8004 27017 6379)
for PORT in "${PORTS[@]}"; do
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "  ${YELLOW}⚠${NC} Port $PORT is in use"
        ((WARNINGS++))
    else
        echo -e "  ${GREEN}✓${NC} Port $PORT is available"
    fi
done

# Summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Summary                                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}\n"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready to deploy.${NC}"
    echo -e "\n${GREEN}Next steps:${NC}"
    echo -e "  1. Build images: ${BLUE}./k8s/build-images.sh${NC}"
    echo -e "  2. Deploy: ${BLUE}./k8s/quick-deploy.sh${NC}"
    echo -e "  Or run: ${BLUE}./k8s/deploy.sh --full${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo -e "  You can proceed with deployment, but review the warnings above."
    echo -e "\n${BLUE}To proceed:${NC}"
    echo -e "  Run: ${BLUE}./k8s/deploy.sh --full${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) and $WARNINGS warning(s) found${NC}"
    echo -e "  Please fix the errors above before deploying."
    exit 1
fi
