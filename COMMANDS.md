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
