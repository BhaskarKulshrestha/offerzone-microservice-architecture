# OfferZone Microservices - Kubernetes Deployment Guide

## Overview
This guide will help you deploy all microservices individually to Kubernetes cluster.

## Architecture
The application consists of the following services:
1. **Infrastructure Services**: MongoDB, Redis
2. **Microservices**:
   - API Gateway (Port: 8085)
   - User Service (Port: 8001, gRPC: 50052)
   - Products Service (Port: 8000, gRPC: 50051)
   - Offers Service (Port: 8002)
   - Notifications Service (Port: 8003)
   - Favorites Service (Port: 8004)

---

## Prerequisites

### 1. Required Tools
- **Docker Desktop** (with Kubernetes enabled) OR **Minikube**
- **kubectl** CLI tool
- **Docker** for building images

### 2. Verify Installation
```bash
# Check kubectl
kubectl version --client

# Check Docker
docker --version

# Check Kubernetes cluster
kubectl cluster-info
```

### 3. For Minikube Users
```bash
# Start Minikube
minikube start --memory=4096 --cpus=2

# Enable metrics server (optional)
minikube addons enable metrics-server

# Use Minikube's Docker daemon (to avoid pushing to registry)
eval $(minikube docker-env)
```

---

## Step 1: Build Docker Images

Build all microservice images individually:

```bash
# Navigate to project root
cd /Users/I528989/Desktop/Bits/Sem\ 3/Scalable/offerzone-microservice-architecture

# Build API Gateway
docker build -f ApiGateway/Dockerfile -t offerzone-api-gateway:latest .

# Build Products Service
docker build -f Products/Dockerfile -t offerzone-products:latest .

# Build User Service
docker build -f User/Dockerfile -t offerzone-user:latest .

# Build Offers Service
docker build -f Offers/Dockerfile -t offerzone-offers:latest .

# Build Notifications Service
docker build -f Notifications/Dockerfile -t offerzone-notifications:latest .

# Build Favorites Service
docker build -f Favorites/Dockerfile -t offerzone-favorites:latest .
```

### Verify Images
```bash
docker images | grep offerzone
```

---

## Step 2: Create Kubernetes Secrets

Create a secrets file for sensitive data (if not exists):

```bash
# Create secrets.yml manually or use the existing one
kubectl create secret generic app-secrets \
  --from-literal=JWT_SECRET=your-super-secret-jwt-key \
  --from-literal=MONGO_USERNAME=admin \
  --from-literal=MONGO_PASSWORD=password \
  --dry-run=client -o yaml > k8s/secrets-generated.yml
```

Or create `k8s/secrets.yml` manually:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  JWT_SECRET: "your-super-secret-jwt-key-change-in-production"
  # Add other secrets as needed
```

---

## Step 3: Deploy Infrastructure Services

Deploy MongoDB and Redis first:

```bash
# Deploy MongoDB
kubectl apply -f k8s/mongo.yml

# Deploy Redis
kubectl apply -f k8s/redis.yml

# Wait for infrastructure to be ready
kubectl wait --for=condition=ready pod -l app=mongo --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis --timeout=120s
```

### Verify Infrastructure
```bash
kubectl get pods -l app=mongo
kubectl get pods -l app=redis
kubectl get svc mongo redis
```

---

## Step 4: Deploy Configuration

Apply ConfigMap and Secrets:

```bash
# Apply ConfigMap
kubectl apply -f k8s/configmap.yml

# Apply Secrets
kubectl apply -f k8s/secrets.yml

# Verify
kubectl get configmap app-config
kubectl get secret app-secrets
```

---

## Step 5: Deploy Microservices Individually

### 5.1 Deploy Products Service
```bash
kubectl apply -f k8s/products.yml

# Wait for deployment
kubectl wait --for=condition=ready pod -l app=products --timeout=120s

# Check status
kubectl get pods -l app=products
kubectl get svc products
```

### 5.2 Deploy User Service
```bash
kubectl apply -f k8s/user.yml

# Wait for deployment
kubectl wait --for=condition=ready pod -l app=user --timeout=120s

# Check status
kubectl get pods -l app=user
kubectl get svc user
```

### 5.3 Deploy Offers Service
```bash
kubectl apply -f k8s/offers.yml

# Wait for deployment
kubectl wait --for=condition=ready pod -l app=offers --timeout=120s

# Check status
kubectl get pods -l app=offers
kubectl get svc offers
```

### 5.4 Deploy Notifications Service
```bash
kubectl apply -f k8s/notifications.yml

# Wait for deployment
kubectl wait --for=condition=ready pod -l app=notifications --timeout=120s

# Check status
kubectl get pods -l app=notifications
kubectl get svc notifications
```

### 5.5 Deploy Favorites Service
```bash
kubectl apply -f k8s/favorites.yml

# Wait for deployment
kubectl wait --for=condition=ready pod -l app=favorites --timeout=120s

# Check status
kubectl get pods -l app=favorites
kubectl get svc favorites
```

### 5.6 Deploy API Gateway
```bash
kubectl apply -f k8s/api-gateway.yml

# Wait for deployment
kubectl wait --for=condition=ready pod -l app=api-gateway --timeout=120s

# Check status
kubectl get pods -l app=api-gateway
kubectl get svc api-gateway
```

---

## Step 6: Verify Complete Deployment

```bash
# Check all pods
kubectl get pods

# Check all services
kubectl get svc

# Check deployments
kubectl get deployments

# Check logs of any service (example: api-gateway)
kubectl logs -l app=api-gateway --tail=50
```

---

## Step 7: Access the Application

### For Docker Desktop Kubernetes:
```bash
# API Gateway should be accessible at:
http://localhost:8085

# Test health endpoint
curl http://localhost:8085/health
```

### For Minikube:
```bash
# Option 1: Use minikube tunnel (requires separate terminal)
minikube tunnel

# Then access at:
http://localhost:8085

# Option 2: Use minikube service
minikube service api-gateway --url

# Option 3: Use port-forward
kubectl port-forward svc/api-gateway 8085:8085
```

---

## Step 8: Test Individual Services

### Direct Service Access (for testing):
```bash
# Port-forward individual services
kubectl port-forward svc/products 8000:8000
kubectl port-forward svc/user 8001:8001
kubectl port-forward svc/offers 8002:8002
kubectl port-forward svc/notifications 8003:8003
kubectl port-forward svc/favorites 8004:8004

# Test endpoints
curl http://localhost:8000/health  # Products
curl http://localhost:8001/health  # User
curl http://localhost:8002/health  # Offers
curl http://localhost:8003/health  # Notifications
curl http://localhost:8004/health  # Favorites
```

---

## Monitoring and Debugging

### View Logs
```bash
# View logs for specific service
kubectl logs -l app=products -f
kubectl logs -l app=user -f
kubectl logs -l app=offers -f
kubectl logs -l app=notifications -f
kubectl logs -l app=favorites -f
kubectl logs -l app=api-gateway -f

# View logs for specific pod
kubectl logs <pod-name> -f
```

### Describe Resources
```bash
# Get detailed info about a pod
kubectl describe pod <pod-name>

# Get detailed info about a service
kubectl describe svc <service-name>

# Get events
kubectl get events --sort-by=.metadata.creationTimestamp
```

### Execute Commands in Pods
```bash
# Shell into a pod
kubectl exec -it <pod-name> -- /bin/sh

# Run a command
kubectl exec <pod-name> -- env
```

---

## Scaling Services

### Scale Individual Services
```bash
# Scale products service to 3 replicas
kubectl scale deployment products --replicas=3

# Scale user service to 2 replicas
kubectl scale deployment user --replicas=2

# Check scaling
kubectl get pods -w
```

### Auto-scaling (Optional)
```bash
# Enable HPA for products service
kubectl autoscale deployment products --cpu-percent=70 --min=1 --max=5

# Check HPA status
kubectl get hpa
```

---

## Updating Services

### Rolling Update
```bash
# After rebuilding Docker image
docker build -f Products/Dockerfile -t offerzone-products:v2 .

# Update deployment
kubectl set image deployment/products products=offerzone-products:v2

# Or edit deployment
kubectl edit deployment products

# Check rollout status
kubectl rollout status deployment/products

# View rollout history
kubectl rollout history deployment/products
```

### Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/products

# Rollback to specific revision
kubectl rollout undo deployment/products --to-revision=2
```

---

## Cleanup

### Delete Individual Services
```bash
kubectl delete -f k8s/api-gateway.yml
kubectl delete -f k8s/favorites.yml
kubectl delete -f k8s/notifications.yml
kubectl delete -f k8s/offers.yml
kubectl delete -f k8s/user.yml
kubectl delete -f k8s/products.yml
```

### Delete Infrastructure
```bash
kubectl delete -f k8s/redis.yml
kubectl delete -f k8s/mongo.yml
kubectl delete -f k8s/configmap.yml
kubectl delete -f k8s/secrets.yml
```

### Delete Everything at Once
```bash
kubectl delete -f k8s/
```

---

## Troubleshooting

### Common Issues

#### 1. ImagePullBackOff Error
```bash
# Check if image exists locally
docker images | grep offerzone

# For Minikube, ensure you're using Minikube's Docker daemon
eval $(minikube docker-env)

# Rebuild image
docker build -f <service>/Dockerfile -t offerzone-<service>:latest .
```

#### 2. CrashLoopBackOff
```bash
# Check logs
kubectl logs <pod-name>

# Check events
kubectl describe pod <pod-name>

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Port conflicts
```

#### 3. Service Not Accessible
```bash
# Check if service is running
kubectl get svc

# Check if pods are ready
kubectl get pods

# Check endpoints
kubectl get endpoints

# For LoadBalancer type on Minikube, use:
minikube tunnel
```

#### 4. Database Connection Issues
```bash
# Check if MongoDB is running
kubectl get pods -l app=mongo

# Check MongoDB logs
kubectl logs -l app=mongo

# Verify ConfigMap has correct MongoDB URI
kubectl get configmap app-config -o yaml
```

---

## Production Considerations

### 1. Persistent Storage
Replace `emptyDir` with `PersistentVolumeClaim` for MongoDB:
```yaml
volumes:
- name: mongo-storage
  persistentVolumeClaim:
    claimName: mongo-pvc
```

### 2. Resource Limits
Add resource requests and limits to deployments:
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### 3. Health Checks
Add liveness and readiness probes:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 4. Ingress Controller
For production, use Ingress instead of LoadBalancer:
```bash
# Enable Ingress on Minikube
minikube addons enable ingress

# Create Ingress resource
kubectl apply -f k8s/ingress.yml
```

### 5. Namespace Organization
```bash
# Create namespace
kubectl create namespace offerzone

# Deploy to namespace
kubectl apply -f k8s/ -n offerzone

# Set default namespace
kubectl config set-context --current --namespace=offerzone
```

---

## Quick Reference Commands

```bash
# Get all resources
kubectl get all

# Get all in watch mode
kubectl get pods -w

# Delete all pods (will be recreated by deployments)
kubectl delete pods --all

# Restart a deployment
kubectl rollout restart deployment/<deployment-name>

# Get resource usage
kubectl top nodes
kubectl top pods

# View cluster information
kubectl cluster-info
kubectl get nodes
```

---

## Next Steps

1. **Set up CI/CD Pipeline** - Automate building and deployment
2. **Configure Monitoring** - Use Prometheus and Grafana
3. **Set up Logging** - Use EFK stack (Elasticsearch, Fluentd, Kibana)
4. **Implement Service Mesh** - Consider Istio or Linkerd
5. **Secure Communications** - Add TLS certificates
6. **Backup Strategy** - Implement MongoDB backup solution

---

## Support

For issues or questions:
- Check pod logs: `kubectl logs <pod-name>`
- Check events: `kubectl get events`
- Describe resources: `kubectl describe <resource-type> <resource-name>`
