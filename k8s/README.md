# OfferZone Kubernetes Deployment

This directory contains the Kubernetes manifests to deploy the OfferZone microservices architecture.

## 📋 Quick Start

### Option 1: Automated Deployment (Recommended)
```bash
# Full automated deployment with interactive menu
./k8s/deploy.sh

# Or run full deployment directly
./k8s/deploy.sh --full
```

### Option 2: Quick Scripts
```bash
# 1. Build all Docker images
./k8s/build-images.sh

# 2. Deploy all services
./k8s/quick-deploy.sh

# 3. Clean up (when needed)
./k8s/cleanup.sh
```

### Option 3: Manual Deployment
```bash
# 1. Build images
docker build -f ApiGateway/Dockerfile -t offerzone-api-gateway:latest .
docker build -f Products/Dockerfile -t offerzone-products:latest .
docker build -f User/Dockerfile -t offerzone-user:latest .
docker build -f Offers/Dockerfile -t offerzone-offers:latest .
docker build -f Notifications/Dockerfile -t offerzone-notifications:latest .
docker build -f Favorites/Dockerfile -t offerzone-favorites:latest .

# 2. Deploy infrastructure
kubectl apply -f k8s/mongo.yml
kubectl apply -f k8s/redis.yml

# 3. Deploy configuration
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/secrets.yml

# 4. Deploy microservices individually
kubectl apply -f k8s/products.yml
kubectl apply -f k8s/user.yml
kubectl apply -f k8s/offers.yml
kubectl apply -f k8s/notifications.yml
kubectl apply -f k8s/favorites.yml
kubectl apply -f k8s/api-gateway.yml

# 5. Verify deployment
kubectl get pods
kubectl get svc
```

## 📦 Prerequisites

- **Kubernetes cluster** (Docker Desktop with K8s enabled OR Minikube)
- **kubectl** CLI tool installed and configured
- **Docker** for building images

### Setup Docker Desktop Kubernetes
1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Check "Enable Kubernetes"
4. Click "Apply & Restart"

### Setup Minikube
```bash
# Start Minikube
minikube start --memory=4096 --cpus=2

# Use Minikube's Docker daemon
eval $(minikube docker-env)
```

## 🏗️ Architecture

### Infrastructure Services
- **MongoDB** (Port: 27017) - Database
- **Redis** (Port: 6379) - Caching & Message Queue

### Microservices
- **API Gateway** (Port: 8085) - Entry point, LoadBalancer
- **Products Service** (Port: 8000, gRPC: 50051)
- **User Service** (Port: 8001, gRPC: 50052)
- **Offers Service** (Port: 8002)
- **Notifications Service** (Port: 8003)
- **Favorites Service** (Port: 8004)

## 📁 Files Description

| File | Description |
|------|-------------|
| `deploy.sh` | Interactive deployment script with menu |
| `build-images.sh` | Build all Docker images |
| `quick-deploy.sh` | Quick deployment of all services |
| `cleanup.sh` | Remove all Kubernetes resources |
| `DEPLOYMENT_GUIDE.md` | Comprehensive deployment documentation |
| `configmap.yml` | Environment variables configuration |
| `secrets.yml` | Sensitive data (JWT secrets, etc.) |
| `mongo.yml` | MongoDB deployment & service |
| `redis.yml` | Redis deployment & service |
| `api-gateway.yml` | API Gateway deployment & LoadBalancer |
| `products.yml` | Products microservice |
| `user.yml` | User microservice |
| `offers.yml` | Offers microservice |
| `notifications.yml` | Notifications microservice |
| `favorites.yml` | Favorites microservice |

## 🚀 Deployment Steps

### 1. Build Docker Images
```bash
./k8s/build-images.sh
```

### 2. Deploy to Kubernetes
```bash
./k8s/quick-deploy.sh
```

### 3. Verify Deployment
```bash
kubectl get pods
kubectl get svc
kubectl get deployments
```

### 4. Access the Application

**For Docker Desktop:**
```bash
# Access API Gateway
http://localhost:8085

# Test health endpoint
curl http://localhost:8085/health
```

**For Minikube:**
```bash
# Option 1: Service command
minikube service api-gateway

# Option 2: Tunnel (separate terminal)
minikube tunnel
# Then access: http://localhost:8085

# Option 3: Port forwarding
kubectl port-forward svc/api-gateway 8085:8085
```

## 🔍 Monitoring & Debugging

### View All Resources
```bash
kubectl get all
```

### Check Pod Logs
```bash
# View logs for a specific service
kubectl logs -l app=products -f
kubectl logs -l app=api-gateway -f

# View logs for a specific pod
kubectl logs <pod-name> -f
```

### Describe Resources
```bash
# Get detailed pod information
kubectl describe pod <pod-name>

# Get service details
kubectl describe svc api-gateway

# View events
kubectl get events --sort-by=.metadata.creationTimestamp
```

### Port Forward Individual Services
```bash
kubectl port-forward svc/products 8000:8000
kubectl port-forward svc/user 8001:8001
kubectl port-forward svc/offers 8002:8002
kubectl port-forward svc/notifications 8003:8003
kubectl port-forward svc/favorites 8004:8004
```

## 📊 Scaling Services

### Manual Scaling
```bash
# Scale products service to 3 replicas
kubectl scale deployment products --replicas=3

# Check scaling status
kubectl get pods -w
```

### Auto-scaling
```bash
# Enable horizontal pod autoscaler
kubectl autoscale deployment products --cpu-percent=70 --min=1 --max=5

# Check HPA status
kubectl get hpa
```

## 🔄 Updating Services

### Update Deployment
```bash
# Rebuild image with new tag
docker build -f Products/Dockerfile -t offerzone-products:v2 .

# Update deployment
kubectl set image deployment/products products=offerzone-products:v2

# Check rollout status
kubectl rollout status deployment/products
```

### Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/products

# View rollout history
kubectl rollout history deployment/products
```

## 🧹 Cleanup

### Remove All Resources
```bash
./k8s/cleanup.sh
```

### Or manually:
```bash
kubectl delete -f k8s/
```

## 🐛 Troubleshooting

### ImagePullBackOff Error
```bash
# Check if images exist
docker images | grep offerzone

# For Minikube, ensure using Minikube's Docker
eval $(minikube docker-env)

# Rebuild images
./k8s/build-images.sh
```

### CrashLoopBackOff
```bash
# Check pod logs
kubectl logs <pod-name>

# Check pod details
kubectl describe pod <pod-name>
```

### Service Not Accessible
```bash
# Check service status
kubectl get svc

# Check endpoints
kubectl get endpoints

# For Minikube
minikube tunnel
```

### Database Connection Issues
```bash
# Check MongoDB status
kubectl get pods -l app=mongo
kubectl logs -l app=mongo

# Verify ConfigMap
kubectl get configmap app-config -o yaml
```

## 📚 Additional Resources

- **Comprehensive Guide**: See `DEPLOYMENT_GUIDE.md` for detailed documentation
- **Docker Commands**: See `../DOCKER_COMMANDS.md` for Docker-related commands
- **Project README**: See `../README.md` for project overview

## 💡 Tips

1. **Use the interactive script** (`./k8s/deploy.sh`) for guided deployment
2. **Check logs regularly** to identify issues early
3. **Use port-forwarding** for testing individual services
4. **Scale services** based on load requirements
5. **Monitor resources** with `kubectl top pods` (requires metrics-server)

## 📝 Notes

- All services are deployed with `replicas: 1` by default
- MongoDB uses `emptyDir` volume (data is lost on pod restart)
- For production, consider using PersistentVolumeClaims
- Update secrets in `secrets.yml` before production deployment
- API Gateway is exposed via LoadBalancer on port 8085
