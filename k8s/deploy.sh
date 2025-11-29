#!/bin/bash

##############################################################################
# OfferZone Microservices - Kubernetes Deployment Script
# This script automates the deployment of all microservices to Kubernetes
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}\n"
}

# Function to check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    print_success "kubectl is installed"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
    
    # Check Kubernetes cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please ensure your cluster is running."
        exit 1
    fi
    print_success "Connected to Kubernetes cluster"
}

# Function to build Docker images
build_images() {
    print_section "Building Docker Images"
    
    local services=("ApiGateway:api-gateway" "Products:products" "User:user" "Offers:offers" "Notifications:notifications" "Favorites:favorites")
    
    for service_pair in "${services[@]}"; do
        local service="${service_pair%%:*}"
        local image_name="offerzone-${service_pair##*:}"
        print_info "Building ${service} service..."
        
        if docker build -f ${service}/Dockerfile -t ${image_name}:latest . > /dev/null 2>&1; then
            print_success "Built ${image_name}:latest"
        else
            print_error "Failed to build ${image_name}:latest"
            exit 1
        fi
    done
    
    print_success "All Docker images built successfully"
}

# Function to deploy infrastructure
deploy_infrastructure() {
    print_section "Deploying Infrastructure Services"
    
    # Deploy MongoDB
    print_info "Deploying MongoDB..."
    kubectl apply -f k8s/mongo.yml
    
    # Deploy Redis
    print_info "Deploying Redis..."
    kubectl apply -f k8s/redis.yml
    
    # Wait for infrastructure to be ready
    print_info "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=ready pod -l app=mongo --timeout=120s || true
    
    print_info "Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod -l app=redis --timeout=120s || true
    
    print_success "Infrastructure services deployed"
}

# Function to deploy configuration
deploy_configuration() {
    print_section "Deploying Configuration"
    
    # Deploy ConfigMap
    print_info "Applying ConfigMap..."
    kubectl apply -f k8s/configmap.yml
    
    # Deploy Secrets
    if [ -f k8s/secrets.yml ]; then
        print_info "Applying Secrets..."
        kubectl apply -f k8s/secrets.yml
    else
        print_warning "secrets.yml not found. Creating default secret..."
        kubectl create secret generic app-secrets \
            --from-literal=JWT_SECRET=your-super-secret-jwt-key-change-in-production \
            --dry-run=client -o yaml | kubectl apply -f -
    fi
    
    print_success "Configuration deployed"
}

# Function to deploy a single microservice
deploy_service() {
    local service_name=$1
    local yaml_file=$2
    
    print_info "Deploying ${service_name} service..."
    kubectl apply -f ${yaml_file}
    
    print_info "Waiting for ${service_name} to be ready..."
    kubectl wait --for=condition=ready pod -l app=${service_name} --timeout=120s || {
        print_warning "${service_name} pods not ready yet, continuing..."
    }
    
    print_success "${service_name} service deployed"
}

# Function to deploy all microservices
deploy_microservices() {
    print_section "Deploying Microservices"
    
    # Deploy in order considering dependencies
    deploy_service "products" "k8s/products.yml"
    deploy_service "user" "k8s/user.yml"
    deploy_service "offers" "k8s/offers.yml"
    deploy_service "notifications" "k8s/notifications.yml"
    deploy_service "favorites" "k8s/favorites.yml"
    deploy_service "api-gateway" "k8s/api-gateway.yml"
    
    print_success "All microservices deployed"
}

# Function to verify deployment
verify_deployment() {
    print_section "Verifying Deployment"
    
    print_info "Checking all pods..."
    kubectl get pods
    
    echo ""
    print_info "Checking all services..."
    kubectl get svc
    
    echo ""
    print_info "Checking all deployments..."
    kubectl get deployments
}

# Function to display access information
display_access_info() {
    print_section "Access Information"
    
    # Check if running on Minikube
    if kubectl config current-context | grep -q "minikube"; then
        print_info "Detected Minikube environment"
        print_info "To access the API Gateway, run one of these commands:"
        echo -e "  ${YELLOW}minikube service api-gateway${NC}"
        echo -e "  ${YELLOW}minikube tunnel${NC} (in separate terminal) then access http://localhost:8085"
        echo -e "  ${YELLOW}kubectl port-forward svc/api-gateway 8085:8085${NC}"
    else
        print_info "API Gateway should be accessible at: ${YELLOW}http://localhost:8085${NC}"
        print_info "Test the health endpoint: ${YELLOW}curl http://localhost:8085/health${NC}"
    fi
    
    echo ""
    print_info "To view logs of a service:"
    echo -e "  ${YELLOW}kubectl logs -l app=<service-name> -f${NC}"
    echo ""
    print_info "To port-forward individual services:"
    echo -e "  ${YELLOW}kubectl port-forward svc/products 8000:8000${NC}"
    echo -e "  ${YELLOW}kubectl port-forward svc/user 8001:8001${NC}"
    echo -e "  ${YELLOW}kubectl port-forward svc/offers 8002:8002${NC}"
    echo -e "  ${YELLOW}kubectl port-forward svc/notifications 8003:8003${NC}"
    echo -e "  ${YELLOW}kubectl port-forward svc/favorites 8004:8004${NC}"
}

# Function to show menu
show_menu() {
    echo ""
    echo "OfferZone Microservices Deployment"
    echo "===================================="
    echo "1. Full Deployment (Build + Deploy All)"
    echo "2. Build Docker Images Only"
    echo "3. Deploy Infrastructure Only"
    echo "4. Deploy Configuration Only"
    echo "5. Deploy Microservices Only"
    echo "6. Deploy Individual Service"
    echo "7. Verify Deployment"
    echo "8. View Logs"
    echo "9. Clean Up"
    echo "0. Exit"
    echo ""
}

# Function to deploy individual service
deploy_individual_service() {
    echo ""
    echo "Select service to deploy:"
    echo "1. Products"
    echo "2. User"
    echo "3. Offers"
    echo "4. Notifications"
    echo "5. Favorites"
    echo "6. API Gateway"
    echo ""
    read -p "Enter choice [1-6]: " service_choice
    
    case $service_choice in
        1) deploy_service "products" "k8s/products.yml" ;;
        2) deploy_service "user" "k8s/user.yml" ;;
        3) deploy_service "offers" "k8s/offers.yml" ;;
        4) deploy_service "notifications" "k8s/notifications.yml" ;;
        5) deploy_service "favorites" "k8s/favorites.yml" ;;
        6) deploy_service "api-gateway" "k8s/api-gateway.yml" ;;
        *) print_error "Invalid choice" ;;
    esac
}

# Function to view logs
view_logs() {
    echo ""
    echo "Select service to view logs:"
    echo "1. Products"
    echo "2. User"
    echo "3. Offers"
    echo "4. Notifications"
    echo "5. Favorites"
    echo "6. API Gateway"
    echo "7. MongoDB"
    echo "8. Redis"
    echo ""
    read -p "Enter choice [1-8]: " log_choice
    
    case $log_choice in
        1) kubectl logs -l app=products -f ;;
        2) kubectl logs -l app=user -f ;;
        3) kubectl logs -l app=offers -f ;;
        4) kubectl logs -l app=notifications -f ;;
        5) kubectl logs -l app=favorites -f ;;
        6) kubectl logs -l app=api-gateway -f ;;
        7) kubectl logs -l app=mongo -f ;;
        8) kubectl logs -l app=redis -f ;;
        *) print_error "Invalid choice" ;;
    esac
}

# Function to clean up
cleanup() {
    print_section "Cleaning Up"
    
    read -p "Are you sure you want to delete all resources? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        print_info "Deleting all resources..."
        kubectl delete -f k8s/ --ignore-not-found=true
        print_success "All resources deleted"
    else
        print_info "Cleanup cancelled"
    fi
}

# Function for full deployment
full_deployment() {
    check_prerequisites
    build_images
    deploy_infrastructure
    
    # Wait a bit for infrastructure to stabilize
    print_info "Waiting 10 seconds for infrastructure to stabilize..."
    sleep 10
    
    deploy_configuration
    deploy_microservices
    verify_deployment
    display_access_info
    
    print_section "Deployment Complete!"
    print_success "All services are deployed successfully!"
}

# Main script logic
main() {
    # Check if running with argument
    if [ $# -eq 1 ]; then
        case $1 in
            --full|-f)
                full_deployment
                exit 0
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -f, --full     Run full deployment (build + deploy all)"
                echo "  -h, --help     Show this help message"
                echo ""
                echo "Run without arguments for interactive menu"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Run with --help for usage information"
                exit 1
                ;;
        esac
    fi
    
    # Interactive mode
    while true; do
        show_menu
        read -p "Enter choice [0-9]: " choice
        
        case $choice in
            1) full_deployment ;;
            2) build_images ;;
            3) deploy_infrastructure ;;
            4) deploy_configuration ;;
            5) deploy_microservices ;;
            6) deploy_individual_service ;;
            7) verify_deployment ;;
            8) view_logs ;;
            9) cleanup ;;
            0) 
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main "$@"
