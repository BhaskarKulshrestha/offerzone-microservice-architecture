# 🚀 Setup Guide for New Users

## Welcome to OfferZone Microservices!

This guide will help you set up and run the entire application on your system in **under 10 minutes**.

---

## 📋 **Prerequisites**

Before you start, ensure you have these installed:

### **Required:**
- **Docker Desktop** (v20.10+)
  - Download: https://www.docker.com/products/docker-desktop
  - After install, start Docker Desktop

- **kubectl** (Kubernetes CLI)
  ```bash
  # macOS
  brew install kubectl
  
  # Windows (using Chocolatey)
  choco install kubernetes-cli
  
  # Linux
  sudo snap install kubectl --classic
  ```

- **Minikube** (Local Kubernetes cluster)
  ```bash
  # macOS
  brew install minikube
  
  # Windows (using Chocolatey)
  choco install minikube
  
  # Linux
  curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
  sudo install minikube-linux-amd64 /usr/local/bin/minikube
  ```

- **Node.js** (v16+) - For local development
  - Download: https://nodejs.org/

### **Optional but Recommended:**
- **k9s** - Terminal UI for Kubernetes
  ```bash
  brew install k9s  # macOS
  ```

- **Lens** - Desktop UI for Kubernetes
  ```bash
  brew install --cask lens  # macOS
  ```

---

## 🎯 **Quick Start (3 Commands)**

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd offerzone-microservice-architecture

# 2. Run setup script (handles everything!)
./setup.sh

# 3. Access the application
minikube service api-gateway
```

**That's it! Your application is running!** 🎉

---

## 📚 **Detailed Setup Steps**

### **Step 1: Clone Repository**

```bash
git clone <your-repo-url>
cd offerzone-microservice-architecture
```

### **Step 2: Configure Environment**

The setup script will do this automatically, but if you want to do it manually:

```bash
# Copy environment template
cp .env.example .env

# Copy secrets template
cp k8s/secrets.yml.example k8s/secrets.yml

# Edit if needed (default values work fine for local development)
nano .env
```

### **Step 3: Start Minikube**

```bash
# Start Minikube with recommended resources
minikube start --memory=4096 --cpus=2

# Verify it's running
minikube status
```

### **Step 4: Build Docker Images**

```bash
# Make scripts executable
chmod +x k8s/*.sh

# Build all microservice images
./k8s/build-images.sh
```

This will build images for:
- API Gateway
- Products Service
- User Service
- Offers Service
- Notifications Service
- Favorites Service

### **Step 5: Deploy to Kubernetes**

```bash
# Deploy everything
./k8s/quick-deploy.sh

# Or use full deployment
./k8s/deploy.sh --full
```

This deploys:
- MongoDB (database)
- Redis (cache)
- All 6 microservices
- ConfigMaps and Secrets

### **Step 6: Verify Deployment**

```bash
# Check all pods are running (should see 8 pods)
kubectl get pods

# Check services
kubectl get svc

# View logs
kubectl logs -l app=api-gateway -f
```

### **Step 7: Access Application**

```bash
# Method 1: Minikube service (opens in browser)
minikube service api-gateway

# Method 2: Port forward
kubectl port-forward svc/api-gateway 8085:8085
# Then visit: http://localhost:8085

# Method 3: Get URL
minikube service api-gateway --url
```

---

## 🧪 **Testing the Application**

### **Test Endpoints**

```bash
# Set base URL
export GATEWAY_URL=$(minikube service api-gateway --url)

# Test welcome page
curl $GATEWAY_URL/

# Test products
curl $GATEWAY_URL/offerzone/products

# Test users
curl $GATEWAY_URL/offerzone/users

# Test offers
curl $GATEWAY_URL/offerzone/offers

# View Swagger docs
open $GATEWAY_URL/api-docs
```

### **View Kubernetes Dashboard**

```bash
# Open dashboard
minikube dashboard
```

---

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────┐
│                 API Gateway (:8085)                  │
│              (Load Balancer Service)                 │
└───────────────────────┬─────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
│   Products   │ │    User    │ │   Offers   │
│   Service    │ │  Service   │ │  Service   │
│   :8000      │ │   :8001    │ │   :8002    │
│   gRPC:50051 │ │  gRPC:50052│ │            │
└──────┬───────┘ └─────┬──────┘ └─────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼──────┐ ┌────▼──────┐
│Notifications │ │ Favorites │ │  MongoDB  │
│   Service    │ │  Service  │ │  :27017   │
│   :8003      │ │   :8004   │ └───────────┘
└──────────────┘ └─────┬─────┘
                       │
                ┌──────▼──────┐
                │    Redis    │
                │    :6379    │
                └─────────────┘
```

### **Services:**

| Service | Port | gRPC Port | Description |
|---------|------|-----------|-------------|
| API Gateway | 8085 | - | Main entry point |
| Products | 8000 | 50051 | Product management |
| User | 8001 | 50052 | User management |
| Offers | 8002 | - | Offers management |
| Notifications | 8003 | - | Notifications |
| Favorites | 8004 | - | User favorites |
| MongoDB | 27017 | - | Database |
| Redis | 6379 | - | Cache |

---

## 🛠️ **Common Commands**

### **Deployment Management**

```bash
# View all pods
kubectl get pods

# View services
kubectl get svc

# View logs
kubectl logs -l app=api-gateway -f

# Scale a service
kubectl scale deployment products --replicas=3

# Restart a service
kubectl rollout restart deployment/products

# Delete a service
kubectl delete -f k8s/products.yml

# Redeploy a service
kubectl apply -f k8s/products.yml
```

### **Cleanup**

```bash
# Delete all deployments
./k8s/cleanup.sh

# Or manually
kubectl delete all --all

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```

---

## 🐛 **Troubleshooting**

### **Problem: Pods not starting**

```bash
# Check pod status
kubectl get pods

# Describe pod for details
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>
```

### **Problem: Images not found**

```bash
# Rebuild images
./k8s/build-images.sh

# Verify images exist
docker images | grep offerzone
```

### **Problem: Service not accessible**

```bash
# Check service status
kubectl get svc

# Check if Minikube is running
minikube status

# Restart port forward
kubectl port-forward svc/api-gateway 8085:8085
```

### **Problem: Out of memory**

```bash
# Stop Minikube
minikube stop

# Restart with more memory
minikube start --memory=8192 --cpus=4
```

### **Problem: MongoDB connection issues**

```bash
# Check MongoDB logs
kubectl logs -l app=mongo

# Verify MongoDB service
kubectl get svc mongo

# Test connection from a pod
kubectl run -it --rm debug --image=mongo:latest --restart=Never -- mongosh mongodb://mongo:27017
```

---

## 📝 **Development Workflow**

### **Making Changes to a Service**

```bash
# 1. Make code changes to service (e.g., Products)

# 2. Rebuild the image
cd Products
docker build -t offerzone/products:latest .

# 3. Redeploy
kubectl rollout restart deployment/products

# 4. View logs
kubectl logs -l app=products -f
```

### **Adding a New Service**

```bash
# 1. Create service code in new directory

# 2. Create Dockerfile

# 3. Build image
docker build -t offerzone/new-service:latest .

# 4. Create Kubernetes manifest (k8s/new-service.yml)

# 5. Deploy
kubectl apply -f k8s/new-service.yml
```

---

## 🔒 **Security Notes**

- **Never commit** `k8s/secrets.yml` or `.env` files
- Change default passwords in production
- Use proper authentication/authorization
- Enable TLS for production deployments
- Regularly update dependencies

---

## 📚 **Additional Resources**

- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **Minikube Documentation**: https://minikube.sigs.k8s.io/docs/
- **Docker Documentation**: https://docs.docker.com/
- **kubectl Cheat Sheet**: https://kubernetes.io/docs/reference/kubectl/cheatsheet/

---

## 🎯 **Quick Reference Card**

```bash
# Start everything
minikube start && ./k8s/deploy.sh --full

# Access app
minikube service api-gateway

# View logs
kubectl logs -l app=api-gateway -f

# Rebuild & redeploy a service
cd <service-dir> && docker build -t offerzone/<service>:latest . && kubectl rollout restart deployment/<service>

# Clean up
./k8s/cleanup.sh && minikube stop
```

---

## 💬 **Need Help?**

- Check the troubleshooting section above
- View logs: `kubectl logs <pod-name>`
- Open an issue in the repository
- Check Kubernetes events: `kubectl get events`

---

**Happy Coding! 🚀**


# 🛍️ OfferZone - Microservices Architecture

A scalable, cloud-native e-commerce platform built with microservices architecture, featuring real-time notifications, intelligent offer management, and seamless user experiences.

## 🚀 Quick Start (For New Users)

### **Prerequisites**
- Docker Desktop
- kubectl
- Minikube
- Node.js (optional)

### **One-Command Setup**

```bash
./setup.sh
```

This will:
1. ✅ Check prerequisites
2. ✅ Setup environment files
3. ✅ Start Minikube
4. ✅ Build all Docker images
5. ✅ Deploy to Kubernetes
6. ✅ Show access instructions

### **Access Application**

```bash
# Open in browser
minikube service api-gateway

# Or get URL
minikube service api-gateway --url
```

---

## 📚 Documentation

- **[Complete Setup Guide](SETUP_FOR_NEW_USERS.md)** - Detailed step-by-step instructions
- **[Commands Reference](COMMANDS.md)** - All commands you need
- **[Deployment Guide](k8s/DEPLOYMENT_GUIDE.md)** - Kubernetes deployment details

---

## 🏗️ Architecture

```
API Gateway (:8085)
    ├── Products Service (:8000, gRPC :50051)
    ├── User Service (:8001, gRPC :50052)
    ├── Offers Service (:8002)
    ├── Notifications Service (:8003)
    └── Favorites Service (:8004)
            ├── MongoDB (:27017)
            └── Redis (:6379)
```

### **Microservices**

| Service | Description | Port | Tech Stack |
|---------|-------------|------|------------|
| **API Gateway** | Main entry point, routing | 8085 | Node.js, Express |
| **Products** | Product management | 8000, 50051 | Node.js, gRPC |
| **User** | User management | 8001, 50052 | Node.js, gRPC |
| **Offers** | Offer management | 8002 | Node.js |
| **Notifications** | Real-time notifications | 8003 | Node.js |
| **Favorites** | User favorites | 8004 | Node.js |
| **MongoDB** | Primary database | 27017 | MongoDB |
| **Redis** | Caching layer | 6379 | Redis |

---

## 🎯 Features

- ✅ **Microservices Architecture** - Independent, scalable services
- ✅ **Kubernetes Deployment** - Container orchestration
- ✅ **gRPC Communication** - Fast inter-service communication
- ✅ **RESTful APIs** - Standard HTTP endpoints
- ✅ **Real-time Notifications** - Event-driven architecture
- ✅ **Caching** - Redis for performance
- ✅ **Database** - MongoDB for persistence
- ✅ **API Gateway** - Single entry point with routing
- ✅ **Health Checks** - Service monitoring
- ✅ **Swagger Documentation** - Interactive API docs

---

## 📋 Prerequisites Verification

Run this to check if you have everything:

```bash
./k8s/check-prerequisites.sh
```

---

## 🛠️ Development

### **Local Development (Without Kubernetes)**

```bash
# Install dependencies
npm install

# Start MongoDB and Redis
docker-compose up -d mongo redis

# Start individual services
cd Products && npm start
cd User && npm start
cd Offers && npm start
# ... and so on
```

### **Kubernetes Development**

```bash
# Make changes to a service
cd Products
# ... make changes ...

# Rebuild and redeploy
docker build -t offerzone/products:latest .
kubectl rollout restart deployment/products

# View logs
kubectl logs -l app=products -f
```

---

## 🧪 Testing

### **Test All Endpoints**

```bash
# Get API Gateway URL
export GATEWAY_URL=$(minikube service api-gateway --url)

# Test products
curl $GATEWAY_URL/offerzone/products

# Test users
curl $GATEWAY_URL/offerzone/users

# Test offers
curl $GATEWAY_URL/offerzone/offers

# View Swagger docs
open $GATEWAY_URL/api-docs
```

### **Run Tests**

```bash
# Run all tests
npm test

# Run service-specific tests
cd Products && npm test
cd User && npm test
```

---

## 📊 Monitoring

### **View Logs**

```bash
# View all pods
kubectl get pods

# View specific service logs
kubectl logs -l app=api-gateway -f
kubectl logs -l app=products -f

# View all logs
kubectl logs --all-containers=true -f
```

### **Kubernetes Dashboard**

```bash
# Open dashboard
minikube dashboard
```

### **Resource Usage**

```bash
# Enable metrics (first time only)
minikube addons enable metrics-server

# View resource usage
kubectl top pods
kubectl top nodes
```

---

## 🔧 Management Commands

```bash
# View all resources
kubectl get all

# Scale a service
kubectl scale deployment products --replicas=3

# Restart a service
kubectl rollout restart deployment/products

# Delete all deployments
./k8s/cleanup.sh

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```

---

## 📁 Project Structure

```
offerzone-microservice-architecture/
├── ApiGateway/          # API Gateway service
├── Products/            # Products microservice
├── User/                # User microservice
├── Offers/              # Offers microservice
├── Notifications/       # Notifications microservice
├── Favorites/           # Favorites microservice
├── k8s/                 # Kubernetes manifests
│   ├── api-gateway.yml
│   ├── products.yml
│   ├── user.yml
│   ├── offers.yml
│   ├── notifications.yml
│   ├── favorites.yml
│   ├── mongo.yml
│   ├── redis.yml
│   ├── configmap.yml
│   ├── secrets.yml
│   ├── deploy.sh
│   ├── build-images.sh
│   ├── quick-deploy.sh
│   └── cleanup.sh
├── setup.sh             # Automated setup script
├── docker-compose.yml   # Docker Compose configuration
├── .env.example         # Environment template
└── README.md
```

---

## 🐛 Troubleshooting

### **Pods not starting?**
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### **Service not accessible?**
```bash
minikube service api-gateway --url
kubectl port-forward svc/api-gateway 8085:8085
```

### **Out of memory?**
```bash
minikube stop
minikube start --memory=8192 --cpus=4
```

For more troubleshooting, see [SETUP_FOR_NEW_USERS.md](SETUP_FOR_NEW_USERS.md#-troubleshooting)

---

## 🔒 Security

- Never commit `k8s/secrets.yml` or `.env` files
- Change default passwords in production
- Use proper authentication/authorization
- Enable TLS for production deployments
- Regularly update dependencies

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Microservices Architecture**