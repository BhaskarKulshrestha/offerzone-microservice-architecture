# 🚀 COMPLETE COMMAND GUIDE - Fresh Terminal to Running Application

## ✅ YOUR APPLICATION IS ALREADY RUNNING!

Good news! All services are already deployed and running. Skip to **Step 4** to access your application.

---

## 📋 COMPLETE SETUP (From Fresh Terminal)

### **STEP 1: Open Terminal and Navigate to Project**

```bash
cd /Users/I528989/Desktop/Bits/Sem\ 3/Scalable/offerzone-microservice-architecture
```

---

### **STEP 2: Verify Kubernetes is Running**

```bash
# Check if Minikube is running
minikube status

# If not running, start it:
minikube start --memory=4096 --cpus=2

# Verify kubectl can connect
kubectl cluster-info
```

---

### **STEP 3: Deploy Application (First Time or Fresh Deploy)**

#### **Option A: Quick Deploy (If images already built)** ⭐
```bash
./k8s/quick-deploy.sh
```

#### **Option B: Full Deploy (Build + Deploy Everything)**
```bash
# Build all images first
./k8s/build-images.sh

# Then deploy
./k8s/quick-deploy.sh
```

#### **Option C: Interactive Menu**
```bash
./k8s/deploy.sh
# Select: 1 for Full Deployment
```

---

### **STEP 4: Verify Deployment** ✅

```bash
# Check all pods (should see 8 pods running)
kubectl get pods

# Expected output:
# NAME                             READY   STATUS    RESTARTS   AGE
# api-gateway-xxx                  1/1     Running   0          2m
# products-xxx                     1/1     Running   0          2m
# user-xxx                         1/1     Running   0          2m
# offers-xxx                       1/1     Running   0          2m
# notifications-xxx                1/1     Running   0          2m
# favorites-xxx                    1/1     Running   0          2m
# mongo-xxx                        1/1     Running   0          2m
# redis-xxx                        1/1     Running   0          2m

# Check services
kubectl get svc
```

---

### **STEP 5: Access Your Application** 🌐

Since you're using **Minikube**, choose one method:

#### **Method 1: Minikube Service (Easiest)** ⭐
```bash
# Opens in browser automatically
minikube service api-gateway
```

#### **Method 2: Port Forward to localhost**
```bash
# Run this in your terminal
kubectl port-forward svc/api-gateway 8085:8085

# Access at: http://localhost:8085
# Keep terminal open!
```

#### **Method 3: Get Minikube URL**
```bash
# Get the URL
minikube service api-gateway --url

# Example output: http://192.168.49.2:31234
# Copy and paste in browser
```

---

## 🧪 **STEP 6: Test All Endpoints**

### **Setup: Get Base URL**

```bash
# METHOD 1: Using Minikube service URL
# In terminal 1 - Get URL and save it
export GATEWAY_URL=$(minikube service api-gateway --url)
echo $GATEWAY_URL

# METHOD 2: Using port-forward (localhost)
# In terminal 1 - Start port forward (keep it running)
kubectl port-forward svc/api-gateway 8085:8085 &

# In terminal 2 - Set localhost URL
export GATEWAY_URL="http://localhost:8085"
```

---

### **🔥 Test Every Endpoint**

```bash
# ======================================
# WELCOME / ROOT
# ======================================
curl $GATEWAY_URL/
# Expected: "Welcome to OfferZone API Gateway"

# ======================================
# SWAGGER DOCUMENTATION
# ======================================
# Open in browser: $GATEWAY_URL/api-docs

# ======================================
# PRODUCTS SERVICE
# ======================================

# Get all products
curl $GATEWAY_URL/offerzone/products

# Get product by ID (replace with actual ID)
curl $GATEWAY_URL/offerzone/products/692aee936b0ce9eb3c08cc61

# Search products
curl "$GATEWAY_URL/offerzone/products?search=Test"

# Filter by category
curl "$GATEWAY_URL/offerzone/products?category=Electronics"

# Paginate
curl "$GATEWAY_URL/offerzone/products?page=1&limit=5"

# ======================================
# USER SERVICE
# ======================================

# Get all users
curl $GATEWAY_URL/offerzone/users

# Get user by ID (replace with actual ID)
curl $GATEWAY_URL/offerzone/users/<user-id>

# Register new user (POST)
curl -X POST $GATEWAY_URL/offerzone/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }'

# Login user (POST)
curl -X POST $GATEWAY_URL/offerzone/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# ======================================
# OFFERS SERVICE
# ======================================

# Get all offers
curl $GATEWAY_URL/offerzone/offers

# Get offer by ID (replace with actual ID)
curl $GATEWAY_URL/offerzone/offers/<offer-id>

# Get active offers
curl $GATEWAY_URL/offerzone/offers/active

# Filter offers by product
curl $GATEWAY_URL/offerzone/offers/product/<product-id>

# ======================================
# NOTIFICATIONS SERVICE
# ======================================

# Get all notifications
curl $GATEWAY_URL/offerzone/notifications

# Get notifications for specific user (replace with actual user ID)
curl $GATEWAY_URL/offerzone/notifications/user/<user-id>

# Get unread notifications
curl $GATEWAY_URL/offerzone/notifications/user/<user-id>/unread

# ======================================
# FAVORITES SERVICE
# ======================================

# Get user favorites (replace with actual user ID)
curl $GATEWAY_URL/offerzone/favorites/user/<user-id>

# Get favorite offers for user
curl $GATEWAY_URL/offerzone/favorites/user/<user-id>/offers

# Add to favorites (POST)
curl -X POST $GATEWAY_URL/offerzone/favorites \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<user-id>",
    "productId": "<product-id>",
    "offerId": "<offer-id>"
  }'
```

---

## 📊 **QUICK TEST SCRIPT**

Save this as `test-endpoints.sh`:

```bash
#!/bin/bash

# Get Gateway URL
if kubectl get svc api-gateway &> /dev/null; then
    # Start port-forward in background
    kubectl port-forward svc/api-gateway 8085:8085 > /dev/null 2>&1 &
    PF_PID=$!
    sleep 2
    GATEWAY_URL="http://localhost:8085"
else
    echo "API Gateway not found!"
    exit 1
fi

echo "Testing OfferZone Endpoints..."
echo "=============================="
echo ""

echo "1. Welcome Page:"
curl -s $GATEWAY_URL/
echo -e "\n"

echo "2. Products Service:"
curl -s $GATEWAY_URL/offerzone/products | head -c 200
echo -e "\n...\n"

echo "3. Users Service:"
curl -s $GATEWAY_URL/offerzone/users | head -c 200
echo -e "\n...\n"

echo "4. Offers Service:"
curl -s $GATEWAY_URL/offerzone/offers | head -c 200
echo -e "\n...\n"

echo "5. Notifications Service:"
curl -s $GATEWAY_URL/offerzone/notifications | head -c 200
echo -e "\n...\n"

echo "6. Swagger Docs Available at:"
echo "$GATEWAY_URL/api-docs"
echo ""

echo "All tests completed!"

# Kill port-forward
kill $PF_PID 2>/dev/null
```

**Run it:**
```bash
chmod +x test-endpoints.sh
./test-endpoints.sh
```

---

## 📝 **View Logs**

```bash
# API Gateway logs
kubectl logs -l app=api-gateway -f

# Products service logs
kubectl logs -l app=products -f

# User service logs
kubectl logs -l app=user -f

# Offers service logs
kubectl logs -l app=offers -f

# Notifications service logs
kubectl logs -l app=notifications -f

# Favorites service logs
kubectl logs -l app=favorites -f

# MongoDB logs
kubectl logs -l app=mongo -f

# Redis logs
kubectl logs -l app=redis -f
```

---

## 🖥️ **Open Kubernetes Dashboard**

```bash
# Open dashboard in browser
minikube dashboard
```

---

## 🛠️ **Useful Management Commands**

```bash
# Restart a service
kubectl rollout restart deployment/products

# Scale a service
kubectl scale deployment products --replicas=3

# Get detailed pod info
kubectl describe pod <pod-name>

# Execute command in pod
kubectl exec -it <pod-name> -- /bin/sh

# Check resource usage (requires metrics-server)
kubectl top pods
kubectl top nodes

# Enable metrics server
minikube addons enable metrics-server
```

---

## 🧹 **Cleanup (When Done)**

```bash
# Delete all resources
./k8s/cleanup.sh

# OR manually
kubectl delete -f k8s/

# Stop Minikube (optional)
minikube stop

# Delete Minikube cluster (optional)
minikube delete
```

---

## 🔥 **ONE-LINE QUICK COMMANDS**

```bash
# Check if everything is running
kubectl get pods | grep -E "Running|NAME"

# Quick health check
curl $(minikube service api-gateway --url)/

# View all services
kubectl get svc

# Port forward in background
kubectl port-forward svc/api-gateway 8085:8085 > /dev/null 2>&1 & echo "Port forwarding started. Access at http://localhost:8085"

# Test all endpoints quickly
for endpoint in '' offerzone/products offerzone/users offerzone/offers; do echo "Testing /$endpoint:"; curl -s http://localhost:8085/$endpoint | head -c 100; echo -e "\n---"; done
```

---

## 📋 **COMPLETE ENDPOINT REFERENCE**

### **Base Path: `/offerzone`**

| Service | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| **Gateway** | GET | `/` | Welcome message |
| **Gateway** | GET | `/api-docs` | Swagger documentation |
| **Products** | GET | `/offerzone/products` | List all products |
| **Products** | GET | `/offerzone/products/:id` | Get product by ID |
| **Products** | GET | `/offerzone/products?search=term` | Search products |
| **Products** | GET | `/offerzone/products?category=name` | Filter by category |
| **User** | GET | `/offerzone/users` | List all users |
| **User** | GET | `/offerzone/users/:id` | Get user by ID |
| **User** | POST | `/offerzone/users/register` | Register new user |
| **User** | POST | `/offerzone/users/login` | Login user |
| **Offers** | GET | `/offerzone/offers` | List all offers |
| **Offers** | GET | `/offerzone/offers/:id` | Get offer by ID |
| **Offers** | GET | `/offerzone/offers/active` | Get active offers |
| **Offers** | GET | `/offerzone/offers/product/:productId` | Offers for product |
| **Notifications** | GET | `/offerzone/notifications` | List notifications |
| **Notifications** | GET | `/offerzone/notifications/user/:userId` | User notifications |
| **Notifications** | GET | `/offerzone/notifications/user/:userId/unread` | Unread notifications |
| **Favorites** | GET | `/offerzone/favorites/user/:userId` | User favorites |
| **Favorites** | GET | `/offerzone/favorites/user/:userId/offers` | User favorite offers |
| **Favorites** | POST | `/offerzone/favorites` | Add favorite |
| **Favorites** | DELETE | `/offerzone/favorites/:id` | Remove favorite |

---

## ✅ **QUICK START CHECKLIST**

- [ ] Navigate to project directory
- [ ] Verify Minikube is running (`minikube status`)
- [ ] Check deployment status (`kubectl get pods`)
- [ ] Access API Gateway (`minikube service api-gateway`)
- [ ] Test health endpoint (`curl <url>/health`)
- [ ] Test products endpoint (`curl <url>/api/products`)
- [ ] Open Kubernetes dashboard (`minikube dashboard`)
- [ ] View logs (`kubectl logs -l app=api-gateway -f`)

---

## 🎯 **YOUR APPLICATION IS READY!**

**Quick Access:**
```bash
# Method 1: Browser
minikube service api-gateway

# Method 2: Terminal
kubectl port-forward svc/api-gateway 8085:8085
# Then: curl http://localhost:8085/health
```

**All 8 services are running:**
✅ API Gateway (Port: 8085)
✅ Products (Port: 8000, gRPC: 50051)
✅ User (Port: 8001, gRPC: 50052)
✅ Offers (Port: 8002)
✅ Notifications (Port: 8003)
✅ Favorites (Port: 8004)
✅ MongoDB (Port: 27017)
✅ Redis (Port: 6379)

**Start testing now! 🚀**


# 🚀 OfferZone Kubernetes Deployment - Complete Setup Guide

## 📝 Overview

Your OfferZone microservices application is ready for Kubernetes deployment! All the necessary configuration files and automation scripts have been created to deploy each service individually.

## 📂 What's Been Set Up

### 1. **Kubernetes Manifests** (`k8s/` directory)
All services have individual YAML files for deployment:
- ✅ `mongo.yml` - MongoDB database
- ✅ `redis.yml` - Redis cache
- ✅ `configmap.yml` - Environment configuration
- ✅ `secrets.yml` - Sensitive data
- ✅ `products.yml` - Products microservice
- ✅ `user.yml` - User microservice
- ✅ `offers.yml` - Offers microservice
- ✅ `notifications.yml` - Notifications microservice
- ✅ `favorites.yml` - Favorites microservice
- ✅ `api-gateway.yml` - API Gateway (LoadBalancer)

### 2. **Automation Scripts**
- ✅ `deploy.sh` - Interactive deployment menu
- ✅ `build-images.sh` - Build all Docker images
- ✅ `quick-deploy.sh` - Fast deployment
- ✅ `cleanup.sh` - Remove all resources
- ✅ `check-prerequisites.sh` - Verify system readiness

### 3. **Documentation**
- ✅ `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- ✅ `QUICK_REFERENCE.md` - Quick command reference
- ✅ `README.md` - Updated with quick start
- ✅ `SETUP_COMPLETE.md` - This file

## 🎯 Quick Start - 3 Steps to Deploy

### **Option 1: Automated (Recommended)**
```bash
# From project root directory
./k8s/deploy.sh --full
```

### **Option 2: Step-by-Step**
```bash
# 1. Check prerequisites
./k8s/check-prerequisites.sh

# 2. Build all Docker images
./k8s/build-images.sh

# 3. Deploy to Kubernetes
./k8s/quick-deploy.sh
```

### **Option 3: Interactive Menu**
```bash
./k8s/deploy.sh
# Then select options from the menu
```

## 🔧 Prerequisites

Before deploying, ensure you have:

### Required Tools
- [ ] Docker Desktop (with Kubernetes enabled) OR Minikube
- [ ] kubectl CLI tool
- [ ] Docker daemon running

### Enable Kubernetes in Docker Desktop
1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Check "Enable Kubernetes"
4. Click "Apply & Restart"
5. Wait for Kubernetes to start (green indicator)

### OR Start Minikube
```bash
minikube start --memory=4096 --cpus=2
eval $(minikube docker-env)
```

## 📋 Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│              API Gateway (LoadBalancer)             │
│                   Port: 8085                        │
└──────────────┬──────────────────────────────────────┘
               │
    ┌──────────┴──────────┬────────────┬──────────┐
    │                     │            │          │
┌───▼────┐  ┌──────────┐ ┌────────┐  ┌──────────┐ ┌──────────┐
│Products│  │   User   │ │ Offers │  │Notificatio│ │Favorites │
│  :8000 │  │  :8001   │ │ :8002  │  │ns :8003  │ │  :8004   │
│gRPC    │  │gRPC      │ │        │  │          │ │          │
│:50051  │  │:50052    │ │        │  │          │ │          │
└────┬───┘  └────┬─────┘ └───┬────┘  └────┬─────┘ └────┬─────┘
     │           │            │            │            │
     └───────────┴────────────┴────────────┴────────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
           ┌────▼─────┐                 ┌────▼────┐
           │ MongoDB  │                 │  Redis  │
           │  :27017  │                 │  :6379  │
           └──────────┘                 └─────────┘
```

## 🚀 Complete Deployment Workflow

### Step 1: Verify Prerequisites
```bash
./k8s/check-prerequisites.sh
```

Expected output:
- ✓ kubectl installed
- ✓ Docker installed and running
- ✓ Kubernetes cluster connected
- ✓ All manifest files present

### Step 2: Build Docker Images
```bash
./k8s/build-images.sh
```

This builds:
- `offerzone-api-gateway:latest`
- `offerzone-products:latest`
- `offerzone-user:latest`
- `offerzone-offers:latest`
- `offerzone-notifications:latest`
- `offerzone-favorites:latest`

### Step 3: Deploy to Kubernetes
```bash
./k8s/quick-deploy.sh
```

This deploys in order:
1. Infrastructure (MongoDB, Redis)
2. Configuration (ConfigMap, Secrets)
3. Microservices (Products, User, Offers, Notifications, Favorites)
4. API Gateway

### Step 4: Verify Deployment
```bash
# Check all pods are running
kubectl get pods

# Expected output:
# NAME                              READY   STATUS    RESTARTS
# api-gateway-xxxxxxxxxx-xxxxx      1/1     Running   0
# products-xxxxxxxxxx-xxxxx         1/1     Running   0
# user-xxxxxxxxxx-xxxxx             1/1     Running   0
# offers-xxxxxxxxxx-xxxxx           1/1     Running   0
# notifications-xxxxxxxxxx-xxxxx    1/1     Running   0
# favorites-xxxxxxxxxx-xxxxx        1/1     Running   0
# mongo-xxxxxxxxxx-xxxxx            1/1     Running   0
# redis-xxxxxxxxxx-xxxxx            1/1     Running   0

# Check services
kubectl get svc
```

### Step 5: Access the Application

#### For Docker Desktop:
```bash
# API Gateway is available at:
http://localhost:8085

# Test health endpoint
curl http://localhost:8085/health
```

#### For Minikube:
```bash
# Option 1: Get URL
minikube service api-gateway --url

# Option 2: Tunnel (in separate terminal)
minikube tunnel
# Then access: http://localhost:8085

# Option 3: Port forward
kubectl port-forward svc/api-gateway 8085:8085
```

## 🔍 Monitoring Your Deployment

### View Logs
```bash
# API Gateway logs
kubectl logs -l app=api-gateway -f

# Products service logs
kubectl logs -l app=products -f

# View all services
kubectl get all
```

### Check Individual Service Health
```bash
# Port forward to test individual services
kubectl port-forward svc/products 8000:8000
curl http://localhost:8000/health

kubectl port-forward svc/user 8001:8001
curl http://localhost:8001/health
```

## 📊 Scaling Services

Each service can be scaled independently:

```bash
# Scale products service to 3 replicas
kubectl scale deployment products --replicas=3

# Scale user service to 2 replicas
kubectl scale deployment user --replicas=2

# Check scaling
kubectl get pods -w
```

## 🔄 Updating a Service

When you make code changes to a service:

```bash
# 1. Rebuild the image
docker build -f Products/Dockerfile -t offerzone-products:latest .

# 2. Restart the deployment
kubectl rollout restart deployment/products

# 3. Check rollout status
kubectl rollout status deployment/products

# 4. View logs
kubectl logs -l app=products -f
```

## 🧹 Cleanup

To remove all deployments:

```bash
./k8s/cleanup.sh
```

Or manually:
```bash
kubectl delete -f k8s/
```

## 📚 Available Documentation

1. **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment documentation
   - Detailed step-by-step instructions
   - Troubleshooting guide
   - Production considerations
   - Advanced configurations

2. **`QUICK_REFERENCE.md`** - Quick command reference
   - All common kubectl commands
   - Monitoring commands
   - Debugging tips
   - Useful aliases

3. **`README.md`** - Quick start guide
   - Overview and architecture
   - Quick deployment options
   - Basic monitoring commands

## 🎯 Testing Your Deployment

### Test API Gateway
```bash
curl http://localhost:8085/health
curl http://localhost:8085/api/products
curl http://localhost:8085/api/users
```

### Test Individual Services (with port-forward)
```bash
# Terminal 1: Port forward
kubectl port-forward svc/products 8000:8000

# Terminal 2: Test
curl http://localhost:8000/health
curl http://localhost:8000/api/products
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. **ImagePullBackOff Error**
```bash
# Check if images exist
docker images | grep offerzone

# For Minikube, ensure using Minikube's Docker
eval $(minikube docker-env)

# Rebuild images
./k8s/build-images.sh
```

#### 2. **Pods in CrashLoopBackOff**
```bash
# Check pod logs
kubectl logs <pod-name>

# Describe pod for more details
kubectl describe pod <pod-name>

# Common causes:
# - Database not ready (MongoDB/Redis)
# - Missing environment variables
# - Port conflicts
```

#### 3. **Service Not Accessible**
```bash
# Check service status
kubectl get svc

# Check pods are running
kubectl get pods

# For Minikube, ensure tunnel is running
minikube tunnel
```

#### 4. **Database Connection Errors**
```bash
# Check MongoDB is running
kubectl get pods -l app=mongo
kubectl logs -l app=mongo

# Verify ConfigMap
kubectl get configmap app-config -o yaml
```

## 🔐 Security Notes

### Before Production Deployment:

1. **Update Secrets**: Edit `k8s/secrets.yml` with secure values
   ```bash
   kubectl edit secret app-secrets
   ```

2. **Use Persistent Storage**: Replace `emptyDir` with PersistentVolumeClaims for MongoDB

3. **Add Resource Limits**: Define CPU and memory limits for each service

4. **Implement Health Checks**: Add liveness and readiness probes

5. **Use Ingress**: Replace LoadBalancer with Ingress controller

6. **Enable TLS**: Add SSL/TLS certificates

## 💡 Pro Tips

1. **Use the interactive deployment script** for guided deployment
   ```bash
   ./k8s/deploy.sh
   ```

2. **Monitor resources regularly**
   ```bash
   kubectl top pods
   kubectl top nodes
   ```

3. **Set up kubectl aliases** (see QUICK_REFERENCE.md)
   ```bash
   alias k='kubectl'
   alias kgp='kubectl get pods'
   ```

4. **Use namespaces** for better organization
   ```bash
   kubectl create namespace offerzone
   kubectl apply -f k8s/ -n offerzone
   ```

5. **Enable metrics-server** for resource monitoring
   ```bash
   # For Minikube
   minikube addons enable metrics-server
   ```

## 🎓 Next Steps

After successful deployment:

1. ✅ **Monitor application performance**
   - Set up Prometheus & Grafana
   - Configure alerting

2. ✅ **Implement CI/CD pipeline**
   - Automate image building
   - Automate deployments

3. ✅ **Set up centralized logging**
   - EFK stack (Elasticsearch, Fluentd, Kibana)
   - Or CloudWatch/Stackdriver

4. ✅ **Configure auto-scaling**
   - Horizontal Pod Autoscaler (HPA)
   - Cluster Autoscaler

5. ✅ **Implement service mesh** (optional)
   - Istio or Linkerd
   - Advanced traffic management

## 📞 Support

If you encounter issues:

1. Check the logs:
   ```bash
   kubectl logs <pod-name>
   ```

2. Describe the resource:
   ```bash
   kubectl describe pod <pod-name>
   ```

3. Check events:
   ```bash
   kubectl get events --sort-by=.metadata.creationTimestamp
   ```

4. Review documentation:
   - `DEPLOYMENT_GUIDE.md` for detailed help
   - `QUICK_REFERENCE.md` for commands

## ✅ Checklist for First Deployment

- [ ] Prerequisites verified (`./k8s/check-prerequisites.sh`)
- [ ] Kubernetes cluster running
- [ ] Docker images built (`./k8s/build-images.sh`)
- [ ] Services deployed (`./k8s/quick-deploy.sh`)
- [ ] All pods in Running state (`kubectl get pods`)
- [ ] API Gateway accessible (`curl http://localhost:8085/health`)
- [ ] Individual services tested
- [ ] Logs checked for errors

## 🎉 You're Ready!

Everything is set up for deploying your microservices to Kubernetes! 

**Start with:**
```bash
./k8s/deploy.sh --full
```

This will build images and deploy all services automatically.

**Good luck with your deployment! 🚀**
