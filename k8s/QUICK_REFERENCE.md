# Kubernetes Quick Reference Guide

## 🚀 Quick Commands

### Deploy Everything
```bash
./k8s/deploy.sh --full
```

### Individual Steps
```bash
./k8s/build-images.sh          # Build all images
./k8s/quick-deploy.sh          # Deploy all services
./k8s/cleanup.sh               # Remove all resources
```

---

## 📦 Build Commands

```bash
# Build all images
./k8s/build-images.sh

# Build individual service
docker build -f Products/Dockerfile -t offerzone-products:latest .
docker build -f User/Dockerfile -t offerzone-user:latest .
docker build -f Offers/Dockerfile -t offerzone-offers:latest .
docker build -f Notifications/Dockerfile -t offerzone-notifications:latest .
docker build -f Favorites/Dockerfile -t offerzone-favorites:latest .
docker build -f ApiGateway/Dockerfile -t offerzone-api-gateway:latest .
```

---

## 🎯 Deploy Commands

### Deploy All
```bash
kubectl apply -f k8s/
```

### Deploy Individual Services
```bash
kubectl apply -f k8s/mongo.yml
kubectl apply -f k8s/redis.yml
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/secrets.yml
kubectl apply -f k8s/products.yml
kubectl apply -f k8s/user.yml
kubectl apply -f k8s/offers.yml
kubectl apply -f k8s/notifications.yml
kubectl apply -f k8s/favorites.yml
kubectl apply -f k8s/api-gateway.yml
```

---

## 🔍 Monitoring Commands

### View Resources
```bash
kubectl get all                              # All resources
kubectl get pods                             # All pods
kubectl get pods -w                          # Watch pods
kubectl get svc                              # All services
kubectl get deployments                      # All deployments
kubectl get configmap                        # All configmaps
kubectl get secrets                          # All secrets
```

### View Logs
```bash
kubectl logs -l app=api-gateway -f           # API Gateway logs
kubectl logs -l app=products -f              # Products logs
kubectl logs -l app=user -f                  # User logs
kubectl logs -l app=offers -f                # Offers logs
kubectl logs -l app=notifications -f         # Notifications logs
kubectl logs -l app=favorites -f             # Favorites logs
kubectl logs -l app=mongo -f                 # MongoDB logs
kubectl logs -l app=redis -f                 # Redis logs
kubectl logs <pod-name> -f                   # Specific pod logs
```

### Describe Resources
```bash
kubectl describe pod <pod-name>              # Pod details
kubectl describe svc <service-name>          # Service details
kubectl describe deployment <deployment>     # Deployment details
kubectl get events --sort-by=.metadata.creationTimestamp  # Events
```

---

## 🔧 Debugging Commands

### Execute Commands in Pods
```bash
kubectl exec -it <pod-name> -- /bin/sh       # Shell into pod
kubectl exec <pod-name> -- env               # View environment
kubectl exec <pod-name> -- ls -la            # List files
```

### Port Forwarding
```bash
kubectl port-forward svc/api-gateway 8085:8085
kubectl port-forward svc/products 8000:8000
kubectl port-forward svc/user 8001:8001
kubectl port-forward svc/offers 8002:8002
kubectl port-forward svc/notifications 8003:8003
kubectl port-forward svc/favorites 8004:8004
kubectl port-forward svc/mongo 27017:27017
kubectl port-forward svc/redis 6379:6379
```

### Get Pod Details
```bash
kubectl get pod <pod-name> -o yaml           # Pod YAML
kubectl get pod <pod-name> -o json           # Pod JSON
kubectl top pods                             # Resource usage
kubectl top nodes                            # Node usage
```

---

## ⚖️ Scaling Commands

### Manual Scaling
```bash
kubectl scale deployment api-gateway --replicas=2
kubectl scale deployment products --replicas=3
kubectl scale deployment user --replicas=2
kubectl scale deployment offers --replicas=2
kubectl scale deployment notifications --replicas=2
kubectl scale deployment favorites --replicas=2
```

### Auto Scaling
```bash
kubectl autoscale deployment products --cpu-percent=70 --min=1 --max=5
kubectl autoscale deployment user --cpu-percent=70 --min=1 --max=5
kubectl get hpa                              # View HPA status
```

---

## 🔄 Update & Rollback

### Update Deployment
```bash
kubectl set image deployment/products products=offerzone-products:v2
kubectl rollout status deployment/products
kubectl rollout history deployment/products
```

### Rollback
```bash
kubectl rollout undo deployment/products
kubectl rollout undo deployment/products --to-revision=2
```

### Restart Deployment
```bash
kubectl rollout restart deployment/products
kubectl rollout restart deployment/user
kubectl rollout restart deployment/api-gateway
```

---

## 🧹 Cleanup Commands

### Delete All Resources
```bash
./k8s/cleanup.sh
# OR
kubectl delete -f k8s/
```

### Delete Individual Resources
```bash
kubectl delete deployment api-gateway
kubectl delete deployment products
kubectl delete deployment user
kubectl delete service api-gateway
kubectl delete pod <pod-name>
kubectl delete pods --all                    # Delete all pods
```

### Delete and Recreate
```bash
kubectl delete -f k8s/products.yml
kubectl apply -f k8s/products.yml
```

---

## 🌐 Access Commands

### For Docker Desktop
```bash
# Direct access
curl http://localhost:8085/health

# Test endpoints
curl http://localhost:8085/api/products
curl http://localhost:8085/api/users
```

### For Minikube
```bash
# Get service URL
minikube service api-gateway --url

# Open in browser
minikube service api-gateway

# Tunnel (in separate terminal)
minikube tunnel

# Then access
curl http://localhost:8085/health
```

---

## 🔐 Secrets Management

### Create Secret
```bash
kubectl create secret generic app-secrets \
  --from-literal=JWT_SECRET=your-secret-key \
  --from-literal=API_KEY=your-api-key
```

### View Secret
```bash
kubectl get secret app-secrets -o yaml
kubectl describe secret app-secrets
```

### Update Secret
```bash
kubectl delete secret app-secrets
kubectl apply -f k8s/secrets.yml
```

---

## 🎭 Context & Namespace

### Context Commands
```bash
kubectl config current-context               # Current context
kubectl config get-contexts                  # All contexts
kubectl config use-context <context-name>    # Switch context
kubectl cluster-info                         # Cluster info
```

### Namespace Commands
```bash
kubectl create namespace offerzone           # Create namespace
kubectl get namespaces                       # List namespaces
kubectl config set-context --current --namespace=offerzone
kubectl get all -n offerzone                # Resources in namespace
```

---

## 🐛 Common Issues

### ImagePullBackOff
```bash
# Check images
docker images | grep offerzone

# For Minikube
eval $(minikube docker-env)
./k8s/build-images.sh
```

### CrashLoopBackOff
```bash
kubectl logs <pod-name>
kubectl describe pod <pod-name>
kubectl get events
```

### Pending Pods
```bash
kubectl describe pod <pod-name>
kubectl get nodes
kubectl top nodes
```

### Service Not Accessible
```bash
kubectl get svc
kubectl get endpoints
kubectl describe svc <service-name>
minikube tunnel  # For Minikube
```

---

## 📊 Resource Monitoring

### Resource Usage
```bash
kubectl top nodes                            # Node usage
kubectl top pods                             # Pod usage
kubectl top pods --sort-by=memory            # Sort by memory
kubectl top pods --sort-by=cpu               # Sort by CPU
```

### Describe Resources
```bash
kubectl describe nodes
kubectl describe pod <pod-name>
kubectl describe deployment <deployment-name>
```

---

## 💾 ConfigMap Management

### View ConfigMap
```bash
kubectl get configmap app-config -o yaml
kubectl describe configmap app-config
```

### Update ConfigMap
```bash
kubectl edit configmap app-config
# OR
kubectl apply -f k8s/configmap.yml
```

### Restart pods after ConfigMap change
```bash
kubectl rollout restart deployment/products
kubectl rollout restart deployment/user
# Restart all
kubectl rollout restart deployment
```

---

## 🔄 Complete Workflow

### Initial Deployment
```bash
# 1. Build images
./k8s/build-images.sh

# 2. Deploy
./k8s/quick-deploy.sh

# 3. Verify
kubectl get pods
kubectl get svc

# 4. Access
curl http://localhost:8085/health
```

### Update Service
```bash
# 1. Make code changes

# 2. Rebuild image
docker build -f Products/Dockerfile -t offerzone-products:latest .

# 3. Restart deployment
kubectl rollout restart deployment/products

# 4. Check status
kubectl rollout status deployment/products
kubectl logs -l app=products -f
```

### Debug Issues
```bash
# 1. Check pods
kubectl get pods

# 2. Check logs
kubectl logs <pod-name>

# 3. Describe pod
kubectl describe pod <pod-name>

# 4. Check events
kubectl get events

# 5. Shell into pod
kubectl exec -it <pod-name> -- /bin/sh
```

---

## 📱 Testing Endpoints

### Health Checks
```bash
curl http://localhost:8085/health
curl http://localhost:8000/health  # Products (if port-forwarded)
curl http://localhost:8001/health  # User (if port-forwarded)
```

### API Gateway Routes
```bash
# Via API Gateway
curl http://localhost:8085/api/products
curl http://localhost:8085/api/users
curl http://localhost:8085/api/offers
curl http://localhost:8085/api/notifications
curl http://localhost:8085/api/favorites
```

---

## 🛠️ Useful Aliases

Add these to your `~/.zshrc`:

```bash
alias k='kubectl'
alias kgp='kubectl get pods'
alias kgs='kubectl get svc'
alias kgd='kubectl get deployments'
alias kga='kubectl get all'
alias kl='kubectl logs -f'
alias kd='kubectl describe'
alias ke='kubectl exec -it'
alias kpf='kubectl port-forward'
```

Then reload: `source ~/.zshrc`

---

## 📚 Learn More

- Full Documentation: `k8s/DEPLOYMENT_GUIDE.md`
- Kubernetes Docs: https://kubernetes.io/docs/
- kubectl Cheat Sheet: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
