#!/bin/bash

# Test script to verify setup.sh prerequisites checking
# This script simulates what setup.sh does without making changes

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  OfferZone Setup Verification Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get version
get_version() {
    if [ "$1" = "docker" ]; then
        docker --version 2>/dev/null | awk '{print $3}' | sed 's/,$//'
    elif [ "$1" = "kubectl" ]; then
        kubectl version --client --short 2>/dev/null | awk '{print $3}'
    elif [ "$1" = "minikube" ]; then
        minikube version --short 2>/dev/null | sed 's/v//'
    elif [ "$1" = "node" ]; then
        node --version 2>/dev/null | sed 's/v//'
    elif [ "$1" = "helm" ]; then
        helm version --short 2>/dev/null | sed 's/v//'
    fi
}

echo -e "${YELLOW}Checking prerequisites...${NC}"
echo ""

# Check Docker
if command_exists docker; then
    VERSION=$(get_version docker)
    echo -e "${GREEN}✓${NC} Docker: ${GREEN}Installed${NC} (${VERSION})"
    
    # Check if Docker daemon is running
    if docker info >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Docker daemon: Running"
    else
        echo -e "  ${RED}✗${NC} Docker daemon: Not running"
        echo -e "    Please start Docker Desktop"
    fi
else
    echo -e "${RED}✗${NC} Docker: Not installed"
    echo -e "  ${YELLOW}setup.sh will install it${NC}"
fi
echo ""

# Check kubectl
if command_exists kubectl; then
    VERSION=$(get_version kubectl)
    echo -e "${GREEN}✓${NC} kubectl: ${GREEN}Installed${NC} (${VERSION})"
else
    echo -e "${RED}✗${NC} kubectl: Not installed"
    echo -e "  ${YELLOW}setup.sh will install it${NC}"
fi
echo ""

# Check Minikube
if command_exists minikube; then
    VERSION=$(get_version minikube)
    echo -e "${GREEN}✓${NC} Minikube: ${GREEN}Installed${NC} (${VERSION})"
    
    # Check if Minikube is running
    if minikube status >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Minikube cluster: Running"
        
        # Get current resources
        MEMORY=$(minikube config get memory 2>/dev/null || echo "unknown")
        CPUS=$(minikube config get cpus 2>/dev/null || echo "unknown")
        echo -e "  ${BLUE}ℹ${NC} Current resources: ${MEMORY} RAM, ${CPUS} CPUs"
    else
        echo -e "  ${YELLOW}⚠${NC} Minikube cluster: Not running"
        echo -e "  ${YELLOW}setup.sh will start it${NC}"
    fi
else
    echo -e "${RED}✗${NC} Minikube: Not installed"
    echo -e "  ${YELLOW}setup.sh will install it${NC}"
fi
echo ""

# Check Node.js
if command_exists node; then
    VERSION=$(get_version node)
    echo -e "${GREEN}✓${NC} Node.js: ${GREEN}Installed${NC} (${VERSION})"
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version 2>/dev/null)
        echo -e "  ${GREEN}✓${NC} npm: ${NPM_VERSION}"
    fi
else
    echo -e "${RED}✗${NC} Node.js: Not installed"
    echo -e "  ${YELLOW}setup.sh will install it${NC}"
fi
echo ""

# Check Helm (optional)
if command_exists helm; then
    VERSION=$(get_version helm)
    echo -e "${GREEN}✓${NC} Helm: ${GREEN}Installed${NC} (${VERSION})"
else
    echo -e "${YELLOW}⚠${NC} Helm: Not installed (optional)"
    echo -e "  ${YELLOW}setup.sh can install it${NC}"
fi
echo ""

# Check environment files
echo -e "${YELLOW}Checking configuration files...${NC}"
echo ""

if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${YELLOW}⚠${NC} .env file missing"
    echo -e "  ${YELLOW}setup.sh will create it from .env.example${NC}"
fi

if [ -f "k8s/secrets.yml" ]; then
    echo -e "${GREEN}✓${NC} k8s/secrets.yml exists"
else
    echo -e "${YELLOW}⚠${NC} k8s/secrets.yml missing"
    echo -e "  ${YELLOW}setup.sh will create it from secrets.yml.example${NC}"
fi
echo ""

# Check if services are already deployed
if command_exists kubectl && minikube status >/dev/null 2>&1; then
    echo -e "${YELLOW}Checking Kubernetes deployments...${NC}"
    echo ""
    
    PODS=$(kubectl get pods 2>/dev/null | grep -c "Running" || echo "0")
    if [ "$PODS" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Found $PODS running pods"
        echo ""
        echo -e "${BLUE}Current pods:${NC}"
        kubectl get pods 2>/dev/null | grep "Running" || true
    else
        echo -e "${YELLOW}⚠${NC} No running pods found"
        echo -e "  ${YELLOW}setup.sh will deploy all services${NC}"
    fi
    echo ""
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

MISSING=0

if ! command_exists docker; then
    MISSING=$((MISSING + 1))
fi

if ! command_exists kubectl; then
    MISSING=$((MISSING + 1))
fi

if ! command_exists minikube; then
    MISSING=$((MISSING + 1))
fi

if ! command_exists node; then
    MISSING=$((MISSING + 1))
fi

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✓ All required tools are installed!${NC}"
    echo ""
    echo -e "${BLUE}You can run:${NC}"
    echo -e "  ./setup.sh${NC} - To deploy/redeploy the application"
    echo -e "  ${BLUE}or${NC}"
    echo -e "  cd k8s && ./quick-deploy.sh${NC} - For quick deployment"
else
    echo -e "${YELLOW}⚠ Missing $MISSING required tool(s)${NC}"
    echo ""
    echo -e "${BLUE}Run:${NC}"
    echo -e "  ./setup.sh${NC} - To install missing tools and deploy"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo ""
