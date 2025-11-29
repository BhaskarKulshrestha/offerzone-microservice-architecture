#!/bin/bash

##############################################################################
# OfferZone Microservices - Automated Setup Script
# This script automatically sets up everything needed to run the application
# - Checks and installs prerequisites
# - Sets up environment files
# - Starts Minikube
# - Builds and deploys to Kubernetes
##############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# OS Detection
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
fi

print_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                    ║"
    echo "║          🚀 OfferZone Microservices - Automated Setup 🚀          ║"
    echo "║                                                                    ║"
    echo "║     Complete automated setup for Kubernetes deployment             ║"
    echo "║                                                                    ║"
    echo "╚════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    echo -e "${BLUE}Detected OS: ${GREEN}$OS${NC}\n"
}

print_section() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_step() {
    echo -e "${MAGENTA}[STEP]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Homebrew is installed (macOS)
check_homebrew() {
    if [[ "$OS" == "macos" ]]; then
        if ! command_exists brew; then
            print_warning "Homebrew not found. Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            
            # Add Homebrew to PATH
            if [[ -f "/opt/homebrew/bin/brew" ]]; then
                eval "$(/opt/homebrew/bin/brew shellenv)"
            fi
            
            print_success "Homebrew installed successfully"
        else
            print_success "Homebrew is already installed"
        fi
    fi
}

# Install Docker
install_docker() {
    if command_exists docker; then
        print_success "Docker is already installed"
        
        # Check if Docker daemon is running
        if ! docker info >/dev/null 2>&1; then
            print_warning "Docker is installed but not running"
            print_info "Please start Docker Desktop manually and run this script again"
            
            if [[ "$OS" == "macos" ]]; then
                print_info "Opening Docker Desktop..."
                open -a Docker
                echo -e "${YELLOW}Waiting for Docker to start (this may take 30 seconds)...${NC}"
                sleep 30
                
                # Check again
                if ! docker info >/dev/null 2>&1; then
                    print_error "Docker is still not running. Please start Docker Desktop manually."
                    exit 1
                fi
            else
                exit 1
            fi
        fi
        
        print_success "Docker daemon is running"
        return 0
    fi
    
    print_warning "Docker not found. Installing Docker..."
    
    if [[ "$OS" == "macos" ]]; then
        print_info "Installing Docker Desktop via Homebrew..."
        brew install --cask docker
        print_info "Opening Docker Desktop..."
        open -a Docker
        echo -e "${YELLOW}Waiting for Docker to start (this may take 30 seconds)...${NC}"
        sleep 30
    elif [[ "$OS" == "linux" ]]; then
        print_info "Installing Docker..."
        curl -fsSL https://get.docker.com | sh
        sudo usermod -aG docker $USER
        print_warning "Please log out and log back in for Docker group changes to take effect"
        print_info "Then run this script again"
        exit 0
    else
        print_error "Please install Docker Desktop manually from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    print_success "Docker installed successfully"
}

# Install kubectl
install_kubectl() {
    if command_exists kubectl; then
        print_success "kubectl is already installed ($(kubectl version --client --short 2>/dev/null || kubectl version --client))"
        return 0
    fi
    
    print_warning "kubectl not found. Installing kubectl..."
    
    if [[ "$OS" == "macos" ]]; then
        brew install kubectl
    elif [[ "$OS" == "linux" ]]; then
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        chmod +x kubectl
        sudo mv kubectl /usr/local/bin/
    else
        print_error "Please install kubectl manually from: https://kubernetes.io/docs/tasks/tools/"
        exit 1
    fi
    
    print_success "kubectl installed successfully"
}

# Install Minikube
install_minikube() {
    if command_exists minikube; then
        print_success "Minikube is already installed ($(minikube version --short 2>/dev/null || echo 'unknown version'))"
        return 0
    fi
    
    print_warning "Minikube not found. Installing Minikube..."
    
    if [[ "$OS" == "macos" ]]; then
        brew install minikube
    elif [[ "$OS" == "linux" ]]; then
        curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
        sudo install minikube-linux-amd64 /usr/local/bin/minikube
        rm minikube-linux-amd64
    else
        print_error "Please install Minikube manually from: https://minikube.sigs.k8s.io/docs/start/"
        exit 1
    fi
    
    print_success "Minikube installed successfully"
}

# Check and install prerequisites
check_prerequisites() {
    print_section "Step 1: Checking and Installing Prerequisites"
    
    # Check/Install Homebrew (macOS only)
    check_homebrew
    
    # Check/Install Docker
    print_step "Checking Docker..."
    install_docker
    
    # Check/Install kubectl
    print_step "Checking kubectl..."
    install_kubectl
    
    # Check/Install Minikube
    print_step "Checking Minikube..."
    install_minikube
    
    # Check Node.js (optional)
    if command_exists node; then
        print_success "Node.js is installed ($(node --version))"
    else
        print_warning "Node.js not found (optional for development)"
        if [[ "$OS" == "macos" ]]; then
            read -p "Would you like to install Node.js? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                brew install node
                print_success "Node.js installed successfully"
            fi
        fi
    fi
    
    print_success "All required prerequisites are ready!"
}

# Setup environment files
setup_environment() {
    print_section "Step 2: Setting Up Environment Files"
    
    # Create .env if it doesn't exist
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            print_info "Creating .env from template..."
            cp .env.example .env
            print_success ".env file created"
        else
            print_info "Creating default .env file..."
            cat > .env << 'EOF'
# OfferZone Environment Configuration
NODE_ENV=development
MONGO_URI=mongodb://mongo:27017/offerzone
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
API_GATEWAY_PORT=8085
PRODUCTS_PORT=8000
USER_PORT=8001
OFFERS_PORT=8002
NOTIFICATIONS_PORT=8003
FAVORITES_PORT=8004
EOF
            print_success "Default .env file created"
        fi
    else
        print_success ".env file already exists"
    fi
    
    # Create secrets.yml if it doesn't exist
    if [ ! -f k8s/secrets.yml ]; then
        if [ -f k8s/secrets.yml.example ]; then
            print_info "Creating secrets.yml from template..."
            cp k8s/secrets.yml.example k8s/secrets.yml
            print_success "secrets.yml created"
        else
            print_info "Creating default secrets.yml..."
            cat > k8s/secrets.yml << 'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  JWT_SECRET: "your-super-secret-jwt-key-change-in-production"
  MONGO_USERNAME: ""
  MONGO_PASSWORD: ""
  REDIS_PASSWORD: ""
EOF
            print_success "Default secrets.yml created"
        fi
    else
        print_success "secrets.yml already exists"
    fi
    
    # Make scripts executable
    print_info "Making scripts executable..."
    chmod +x k8s/*.sh 2>/dev/null || true
    chmod +x setup.sh 2>/dev/null || true
    chmod +x test-endpoints.sh 2>/dev/null || true
    print_success "Scripts are executable"
}

# Start Minikube
start_minikube() {
    print_section "Step 3: Starting Minikube Cluster"
    
    # Check if Minikube is already running
    if minikube status >/dev/null 2>&1; then
        print_success "Minikube is already running"
        
        # Check current resource allocation
        current_memory=$(minikube config get memory 2>/dev/null || echo "unknown")
        current_cpus=$(minikube config get cpus 2>/dev/null || echo "unknown")
        print_info "Current resources: Memory=${current_memory}, CPUs=${current_cpus}"
        
        # Ask if user wants to restart with more resources
        read -p "Do you want to restart Minikube with 4GB RAM and 2 CPUs? (recommended) (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Stopping Minikube..."
            minikube stop
            print_info "Starting Minikube with updated resources..."
            minikube start --memory=4096 --cpus=2 --driver=docker
            print_success "Minikube restarted with updated resources"
        fi
    else
        print_info "Starting Minikube (this may take 2-3 minutes)..."
        print_info "Allocating 4GB RAM and 2 CPUs..."
        
        # Try to start Minikube
        if minikube start --memory=4096 --cpus=2 --driver=docker; then
            print_success "Minikube started successfully"
        else
            print_warning "Failed to start with Docker driver, trying default driver..."
            minikube start --memory=4096 --cpus=2
            print_success "Minikube started successfully"
        fi
    fi
    
    # Enable addons
    print_info "Enabling useful addons..."
    minikube addons enable metrics-server 2>/dev/null || print_warning "Could not enable metrics-server"
    minikube addons enable dashboard 2>/dev/null || print_warning "Could not enable dashboard"
    
    # Verify connection
    if kubectl cluster-info >/dev/null 2>&1; then
        print_success "Connected to Kubernetes cluster"
        kubectl config current-context
    else
        print_error "Failed to connect to Kubernetes cluster"
        exit 1
    fi
    
    # Show cluster info
    echo ""
    print_info "Cluster Information:"
    echo "  Context: $(kubectl config current-context)"
    echo "  Nodes: $(kubectl get nodes --no-headers 2>/dev/null | wc -l)"
    echo "  Kubernetes Version: $(kubectl version --short 2>/dev/null | grep Server || echo 'unknown')"
}

# Build Docker images
build_images() {
    print_section "Step 4: Building Docker Images"
    
    # Check if images already exist
    existing_images=$(docker images | grep -c "offerzone" || echo "0")
    
    if [ "$existing_images" -gt 0 ]; then
        print_info "Found $existing_images existing OfferZone images"
        read -p "Do you want to rebuild all images? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping image build"
            return 0
        fi
    fi
    
    if [ -f k8s/build-images.sh ]; then
        print_info "Building all microservice images (this may take 5-10 minutes)..."
        ./k8s/build-images.sh
        print_success "All images built successfully"
    else
        print_error "build-images.sh not found"
        exit 1
    fi
}

# Deploy to Kubernetes
deploy_application() {
    print_section "Step 5: Deploying to Kubernetes"
    
    # Check if already deployed
    existing_deployments=$(kubectl get deployments --no-headers 2>/dev/null | wc -l)
    
    if [ "$existing_deployments" -gt 0 ]; then
        print_warning "Found $existing_deployments existing deployments"
        read -p "Do you want to delete and redeploy? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Cleaning up existing deployments..."
            kubectl delete all --all 2>/dev/null || true
            kubectl delete configmap --all 2>/dev/null || true
            kubectl delete secret app-secrets 2>/dev/null || true
            sleep 5
        else
            print_info "Skipping deployment"
            return 0
        fi
    fi
    
    if [ -f k8s/quick-deploy.sh ]; then
        print_info "Deploying all services to Kubernetes..."
        ./k8s/quick-deploy.sh
        print_success "Application deployed successfully"
    else
        print_error "quick-deploy.sh not found"
        exit 1
    fi
}

# Wait for pods to be ready
wait_for_pods() {
    print_section "Step 6: Waiting for Pods to be Ready"
    
    print_info "Waiting for all pods to be ready (this may take 2-3 minutes)..."
    echo ""
    
    local max_attempts=120
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        # Get pod status
        total_pods=$(kubectl get pods --no-headers 2>/dev/null | wc -l || echo "0")
        running_pods=$(kubectl get pods --no-headers 2>/dev/null | grep "Running" | grep "1/1" | wc -l || echo "0")
        
        if [ "$total_pods" -eq 0 ]; then
            echo -ne "\r${YELLOW}Waiting for pods to be created... ($((max_attempts - attempt))s)${NC}"
        elif [ "$running_pods" -eq "$total_pods" ]; then
            echo -ne "\r${GREEN}All $total_pods pods are ready!${NC}                                        "
            echo ""
            break
        else
            echo -ne "\r${YELLOW}Pods ready: $running_pods/$total_pods ($((max_attempts - attempt))s remaining)${NC}"
        fi
        
        sleep 1
        ((attempt++))
    done
    
    echo ""
    
    if [ $attempt -ge $max_attempts ]; then
        print_warning "Timeout waiting for pods. Some pods may still be starting..."
    fi
    
    # Show final pod status
    echo ""
    print_info "Current Pod Status:"
    kubectl get pods
    echo ""
}

# Verify deployment
verify_deployment() {
    print_section "Step 7: Verifying Deployment"
    
    echo -e "${CYAN}Pods:${NC}"
    kubectl get pods
    echo ""
    
    echo -e "${CYAN}Services:${NC}"
    kubectl get svc
    echo ""
    
    echo -e "${CYAN}Deployments:${NC}"
    kubectl get deployments
    echo ""
    
    # Check if all pods are running
    not_running=$(kubectl get pods --no-headers 2>/dev/null | grep -v "Running" | wc -l || echo "0")
    
    if [ "$not_running" -eq 0 ]; then
        print_success "All pods are running successfully!"
    else
        print_warning "$not_running pod(s) are not in Running state"
        print_info "You can check pod details with: kubectl describe pod <pod-name>"
    fi
}

# Show access information
show_access_info() {
    print_section "🎉 Setup Complete!"
    
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║        Your OfferZone application is now running! 🚀          ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    print_info "Services deployed:"
    echo "  ✓ API Gateway (Port: 8085)"
    echo "  ✓ Products Service (Port: 8000, gRPC: 50051)"
    echo "  ✓ User Service (Port: 8001, gRPC: 50052)"
    echo "  ✓ Offers Service (Port: 8002)"
    echo "  ✓ Notifications Service (Port: 8003)"
    echo "  ✓ Favorites Service (Port: 8004)"
    echo "  ✓ MongoDB (Port: 27017)"
    echo "  ✓ Redis (Port: 6379)"
    
    echo ""
    print_section "📍 Access Your Application"
    
    echo -e "${YELLOW}Method 1: Minikube Service (Recommended)${NC}"
    echo -e "  Run: ${CYAN}minikube service api-gateway${NC}"
    echo "  This will open the application in your browser"
    echo ""
    
    echo -e "${YELLOW}Method 2: Port Forward (localhost)${NC}"
    echo -e "  Run: ${CYAN}kubectl port-forward svc/api-gateway 8085:8085${NC}"
    echo -e "  Then visit: ${CYAN}http://localhost:8085${NC}"
    echo ""
    
    echo -e "${YELLOW}Method 3: Get Minikube URL${NC}"
    echo -e "  Run: ${CYAN}minikube service api-gateway --url${NC}"
    echo "  Copy the URL and open in browser"
    echo ""
    
    print_section "🧪 Test Your Application"
    
    echo "Quick test commands:"
    echo ""
    echo -e "  ${CYAN}# Get the API Gateway URL${NC}"
    echo "  export GATEWAY_URL=\$(minikube service api-gateway --url)"
    echo ""
    echo -e "  ${CYAN}# Test welcome page${NC}"
    echo "  curl \$GATEWAY_URL/"
    echo ""
    echo -e "  ${CYAN}# Test products endpoint${NC}"
    echo "  curl \$GATEWAY_URL/offerzone/products"
    echo ""
    echo -e "  ${CYAN}# Open Swagger documentation${NC}"
    echo "  open \$GATEWAY_URL/api-docs"
    echo ""
    
    print_section "📊 Useful Commands"
    
    echo -e "  ${CYAN}kubectl get pods${NC}                    - View all pods"
    echo -e "  ${CYAN}kubectl get svc${NC}                     - View all services"
    echo -e "  ${CYAN}kubectl logs -l app=api-gateway -f${NC}  - View API Gateway logs"
    echo -e "  ${CYAN}minikube dashboard${NC}                  - Open Kubernetes UI"
    echo -e "  ${CYAN}./k8s/cleanup.sh${NC}                    - Clean up everything"
    echo -e "  ${CYAN}minikube stop${NC}                       - Stop Minikube"
    echo -e "  ${CYAN}minikube start${NC}                      - Start Minikube"
    echo ""
    
    print_section "📚 Documentation"
    
    echo "  • Complete Setup Guide: SETUP_FOR_NEW_USERS.md"
    echo "  • Commands Reference: COMMANDS.md"
    echo "  • Deployment Guide: k8s/DEPLOYMENT_GUIDE.md"
    echo "  • Quick Reference: k8s/QUICK_REFERENCE.md"
    echo ""
    
    print_section "🎯 Next Steps"
    
    echo "1. Access the application:"
    echo -e "   ${CYAN}minikube service api-gateway${NC}"
    echo ""
    echo "2. View the logs:"
    echo -e "   ${CYAN}kubectl logs -l app=api-gateway -f${NC}"
    echo ""
    echo "3. Open Kubernetes dashboard:"
    echo -e "   ${CYAN}minikube dashboard${NC}"
    echo ""
    
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║                  Happy Coding! 🎉                              ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Ask to open application
ask_to_open() {
    echo ""
    read -p "Would you like to open the application now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Opening application..."
        minikube service api-gateway
    else
        print_info "You can open it later with: minikube service api-gateway"
    fi
}

# Main function
main() {
    print_banner
    
    # Confirm before proceeding
    echo -e "${YELLOW}This script will:${NC}"
    echo "  1. Check and install required tools (Docker, kubectl, Minikube)"
    echo "  2. Setup environment files (.env, secrets.yml)"
    echo "  3. Start Minikube cluster"
    echo "  4. Build all Docker images"
    echo "  5. Deploy all services to Kubernetes"
    echo ""
    
    read -p "Do you want to proceed? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled"
        exit 0
    fi
    
    # Run setup steps
    check_prerequisites
    setup_environment
    start_minikube
    build_images
    deploy_application
    wait_for_pods
    verify_deployment
    show_access_info
    ask_to_open
}

# Handle script interruption
trap 'echo -e "\n${RED}Setup interrupted${NC}"; exit 1' INT TERM

# Run main function
main "$@"
