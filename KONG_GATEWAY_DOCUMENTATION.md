# Kong API Gateway - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [What is Kong API Gateway?](#what-is-kong-api-gateway)
3. [Why Use Kong Gateway?](#why-use-kong-gateway)
4. [Architecture](#architecture)
5. [Port Configuration](#port-configuration)
6. [Installation & Setup](#installation--setup)
7. [How It Works](#how-it-works)
8. [API Endpoints](#api-endpoints)
9. [Kong Admin API](#kong-admin-api)
10. [Plugins & Features](#plugins--features)
11. [Troubleshooting](#troubleshooting)
12. [Testing the Gateway](#testing-the-gateway)

---

## 🎯 Overview

Kong API Gateway has been integrated into the OfferZone microservices architecture to act as a **single entry point** for all API requests. Instead of accessing each microservice directly, all client requests now go through Kong Gateway at **port 8000**.

---

## 🤔 What is Kong API Gateway?

Kong is an open-source API Gateway that sits between clients and your microservices. Think of it as a **"smart doorman"** for your application:

- **Client makes request** → **Kong Gateway receives it** → **Kong routes to correct microservice** → **Microservice processes** → **Kong returns response to client**

### Key Benefits:
✅ **Single Entry Point** - One URL for all services  
✅ **Security** - Centralized authentication and authorization  
✅ **Rate Limiting** - Prevent API abuse  
✅ **Load Balancing** - Distribute traffic efficiently  
✅ **Logging & Monitoring** - Track all API traffic  
✅ **CORS Handling** - Manage cross-origin requests  
✅ **Plugin Ecosystem** - Add features without changing code  

---

## 🏗️ Architecture

### Before Kong (Direct Access)
```
Client → http://localhost:8000/offerzone/users     (User Service)
Client → http://localhost:8001/offerzone/products  (Products Service)
Client → http://localhost:8002/offerzone/offers    (Offers Service)
Client → http://localhost:8003/offerzone/notifications (Notifications)
Client → http://localhost:8004/offerzone/favorites (Favorites Service)
```

### After Kong (Gateway Pattern)
```
                           ┌─────────────────────┐
                           │   Kong Gateway      │
         Client ──────────>│   Port: 8000        │
                           │   (Single Entry)    │
                           └──────────┬──────────┘
                                      │
                  ┌───────────────────┼───────────────────┐
                  │                   │                   │
         ┌────────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
         │  User Service   │ │ Products Service│ │  Offers Service │
         │  Port: 8010     │ │  Port: 8011     │ │  Port: 8012    │
         └─────────────────┘ └─────────────────┘ └─────────────────┘
                  │                   │
         ┌────────▼────────┐ ┌───────▼────────┐
         │ Notifications   │ │  Favorites     │
         │  Port: 8013     │ │  Port: 8014    │
         └─────────────────┘ └─────────────────┘
                  │
         ┌────────▼────────┐
         │    MongoDB      │
         │  Port: 27017    │
         └─────────────────┘
```

### Complete System Architecture
```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                          │
│                  (Web Browser, Mobile App, Postman)                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS Requests
                                 │
                    ┌────────────▼────────────┐
                    │   KONG API GATEWAY      │
                    │   Port: 8000 (Proxy)    │
                    │   Port: 8001 (Admin)    │
                    │                         │
                    │  Features:              │
                    │  • Rate Limiting        │
                    │  • CORS                 │
                    │  • Request Logging      │
                    │  • Load Balancing       │
                    │  • Authentication       │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   Docker Network        │
                    │   (offerzone-network)   │
                    └─────────┬───────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  USER SERVICE  │  │ PRODUCTS SERVICE│  │  OFFERS SERVICE │
│                │  │                 │  │                 │
│  Internal:8000 │  │  Internal:8001  │  │  Internal:8002  │
│  External:8010 │  │  External:8011  │  │  External:8012  │
│                │  │                 │  │                 │
│  • Register    │  │  • Get Products │  │  • Get Offers   │
│  • Login       │  │  • Create       │  │  • Create       │
│  • Profile     │  │  • Update       │  │  • Update       │
└───────┬────────┘  └────────┬────────┘  └────────┬────────┘
        │                    │                     │
        │                    │                     │
┌───────▼────────┐  ┌────────▼────────┐           │
│ NOTIFICATIONS  │  │   FAVORITES     │           │
│    SERVICE     │  │    SERVICE      │           │
│                │  │                 │           │
│ Internal:8003  │  │  Internal:8004  │           │
│ External:8013  │  │  External:8014  │           │
│                │  │                 │           │
│ • Get Notifs   │  │  • Add Favorite │           │
│ • Mark Read    │  │  • Get List     │           │
└───────┬────────┘  └────────┬────────┘           │
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             │
                    ┌────────▼────────┐
                    │    MONGODB      │
                    │   Port: 27017   │
                    │                 │
                    │  Databases:     │
                    │  • users        │
                    │  • products     │
                    │  • offers       │
                    │  • notifications│
                    │  • favorites    │
                    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         POSTGRES DATABASE                            │
│                        Port: 5432                                    │
│                   (Kong Configuration Storage)                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 Port Configuration

### 📌 Important: Ports Explained

#### **Client-Facing Ports (What You Use)**
- **8000** - Kong Proxy (Main API Gateway Entry Point) ⭐
- **8001** - Kong Admin API (For Configuration)

#### **Microservices Direct Access (For Debugging Only)**
| Service | Internal Port | External Port | Kong Route |
|---------|--------------|---------------|------------|
| User | 8000 | 8010 | `/offerzone/users` |
| Products | 8001 | 8011 | `/offerzone/products` |
| Offers | 8002 | 8012 | `/offerzone/offers` |
| Notifications | 8003 | 8013 | `/offerzone/notifications` |
| Favorites | 8004 | 8014 | `/offerzone/favorites` |

#### **Database Ports**
- **27017** - MongoDB
- **5432** - PostgreSQL (Kong's configuration database)

### 🎯 Why Different Ports?

**Internal Ports (8000-8004)**: Used within Docker network by services  
**External Ports (8010-8014)**: Used for direct debugging access  
**Kong Port (8000)**: The only port clients should use ⭐

---

## 🚀 Installation & Setup

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 8000, 8001, 8010-8014, 5432, 27017 available

### Step-by-Step Setup

#### 1️⃣ **Start All Services**
```bash
# Navigate to project directory
cd "/Users/I528989/Desktop/Bits/Sem 3/Scalable/OfferZone Scalable"

# Start all services (Kong + Microservices + Databases)
docker-compose up -d
```

This will start:
- Kong Gateway
- PostgreSQL (for Kong)
- MongoDB (for microservices)
- All 5 microservices

#### 2️⃣ **Verify Services are Running**
```bash
# Check all containers are running
docker-compose ps

# Check Kong health
curl http://localhost:8001/status
```

#### 3️⃣ **Configure Kong Gateway**
```bash
# Make the script executable
chmod +x kong-config.sh

# Run the configuration script
./kong-config.sh
```

This script:
- Creates services in Kong for each microservice
- Sets up routes to direct traffic
- Enables plugins (rate limiting, CORS, logging)

#### 4️⃣ **Verify Configuration**
```bash
# List all services
curl http://localhost:8001/services

# List all routes
curl http://localhost:8001/routes

# List all plugins
curl http://localhost:8001/plugins
```

---

## ⚙️ How It Works

### Request Flow (Step-by-Step)

Let's trace a request to register a new user:

```
1. Client sends request:
   POST http://localhost:8000/offerzone/users/register
   Body: { "name": "John", "email": "john@example.com", "password": "123456" }

2. Kong Gateway receives request at port 8000

3. Kong checks the route:
   - Path: /offerzone/users/register
   - Matches route: user-route
   - Target service: user-service

4. Kong applies plugins:
   - Rate Limiting: Check if client exceeded limit
   - CORS: Add CORS headers
   - Logging: Log the request

5. Kong forwards request to User Service:
   http://user-service:8000/offerzone/users/register
   (Internal Docker network)

6. User Service processes request:
   - Validates data
   - Hashes password
   - Saves to MongoDB
   - Returns response

7. Kong receives response from User Service

8. Kong sends response back to client with added headers

9. Client receives response:
   { "success": true, "message": "User registered successfully" }
```

### Route Matching Logic

Kong uses **path-based routing**:

| Request Path | Kong Route | Target Service | Service Port |
|-------------|------------|----------------|--------------|
| `/offerzone/users/*` | user-route | user-service | 8000 |
| `/offerzone/products/*` | products-route | products-service | 8001 |
| `/offerzone/offers/*` | offers-route | offers-service | 8002 |
| `/offerzone/notifications/*` | notifications-route | notifications-service | 8003 |
| `/offerzone/favorites/*` | favorites-route | favorites-service | 8004 |

---

## 🔗 API Endpoints

### ⚠️ Important: Update Your API Base URL

**Old Way (Direct Access):**
```javascript
// User Service
http://localhost:8000/offerzone/users/register

// Products Service  
http://localhost:8001/offerzone/products
```

**New Way (Through Kong Gateway):**
```javascript
// All services through Kong
http://localhost:8000/offerzone/users/register
http://localhost:8000/offerzone/products
http://localhost:8000/offerzone/offers
http://localhost:8000/offerzone/notifications
http://localhost:8000/offerzone/favorites
```

### 📍 Complete API Endpoints

#### **User Service** - `http://localhost:8000/offerzone/users`
```bash
# Register new user
POST /offerzone/users/register
Body: { "name": "John Doe", "email": "john@example.com", "password": "123456" }

# Login
POST /offerzone/users/login
Body: { "email": "john@example.com", "password": "123456" }

# Get user profile (requires JWT token)
GET /offerzone/users/profile
Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }
```

#### **Products Service** - `http://localhost:8000/offerzone/products`
```bash
# Get all products
GET /offerzone/products

# Get product by ID
GET /offerzone/products/:id

# Create product (protected)
POST /offerzone/products
Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }
Body: { "name": "Product Name", "price": 99.99, "description": "..." }

# Update product (protected)
PUT /offerzone/products/:id

# Delete product (protected)
DELETE /offerzone/products/:id
```

#### **Offers Service** - `http://localhost:8000/offerzone/offers`
```bash
# Get all offers
GET /offerzone/offers

# Get offer by ID
GET /offerzone/offers/:id

# Create offer (protected)
POST /offerzone/offers
Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }

# Update offer (protected)
PUT /offerzone/offers/:id

# Delete offer (protected)
DELETE /offerzone/offers/:id
```

#### **Favorites Service** - `http://localhost:8000/offerzone/favorites`
```bash
# Add to favorites (protected)
POST /offerzone/favorites
Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }

# Get user favorites (protected)
GET /offerzone/favorites/user/:userId
Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }

# Remove from favorites (protected)
DELETE /offerzone/favorites/:id
Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }
```

#### **Notifications Service** - `http://localhost:8000/offerzone/notifications`
```bash
# Get user notifications (protected)
GET /offerzone/notifications/user/:userId
Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }

# Create notification (protected)
POST /offerzone/notifications
Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }

# Mark notification as read (protected)
PUT /offerzone/notifications/:id/read
Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }
```

---

## 🛠️ Kong Admin API

Kong Admin API (port 8001) allows you to manage Kong configuration.

### Common Admin Commands

```bash
# List all services
curl http://localhost:8001/services

# List all routes
curl http://localhost:8001/routes

# List all plugins
curl http://localhost:8001/plugins

# Get Kong status
curl http://localhost:8001/status

# View specific service
curl http://localhost:8001/services/user-service

# View specific route
curl http://localhost:8001/routes/user-route

# Delete a service
curl -X DELETE http://localhost:8001/services/user-service

# Delete a route
curl -X DELETE http://localhost:8001/routes/user-route
```

### Add a New Service Manually

```bash
# Create service
curl -i -X POST http://localhost:8001/services \
  --data "name=new-service" \
  --data "url=http://new-service:8005"

# Create route for the service
curl -i -X POST http://localhost:8001/services/new-service/routes \
  --data "name=new-route" \
  --data "paths[]=/offerzone/new" \
  --data "strip_path=false"
```

---

## 🔌 Plugins & Features

### Enabled Plugins

#### 1️⃣ **Rate Limiting**
Prevents API abuse by limiting requests.

**Configuration:**
- 1000 requests per minute
- 10,000 requests per hour

**Test it:**
```bash
# Make many requests quickly
for i in {1..10}; do
  curl http://localhost:8000/offerzone/users
done

# Check rate limit headers in response
curl -i http://localhost:8000/offerzone/users
# Look for: X-RateLimit-Limit, X-RateLimit-Remaining
```

#### 2️⃣ **CORS (Cross-Origin Resource Sharing)**
Allows web browsers to access the API from different domains.

**Configuration:**
- Allowed origins: * (all)
- Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Credentials: enabled
- Max age: 3600 seconds

#### 3️⃣ **File Logging**
Logs all requests and responses.

**View logs:**
```bash
# Enter Kong container
docker exec -it kong-gateway bash

# View logs
tail -f /tmp/kong.log
```

### Adding More Plugins

Kong has 100+ plugins available. Here are some useful ones:

#### **JWT Authentication Plugin**
```bash
curl -X POST http://localhost:8001/services/user-service/plugins \
  --data "name=jwt"
```

#### **Request Size Limiting**
```bash
curl -X POST http://localhost:8001/plugins \
  --data "name=request-size-limiting" \
  --data "config.allowed_payload_size=10"
```

#### **Response Transformer**
```bash
curl -X POST http://localhost:8001/services/user-service/plugins \
  --data "name=response-transformer" \
  --data "config.add.headers=X-Custom-Header:value"
```

---

## 🧪 Testing the Gateway

### Using cURL

```bash
# Test User Registration
curl -X POST http://localhost:8000/offerzone/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Test User Login
curl -X POST http://localhost:8000/offerzone/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Test Get Products
curl http://localhost:8000/offerzone/products

# Test Get Offers
curl http://localhost:8000/offerzone/offers
```

### Using Postman

1. **Set Base URL:** `http://localhost:8000`

2. **Test User Registration:**
   - Method: POST
   - URL: `http://localhost:8000/offerzone/users/register`
   - Body (JSON):
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```

3. **Test Login & Get Token:**
   - Method: POST
   - URL: `http://localhost:8000/offerzone/users/login`
   - Body (JSON):
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```
   - Copy the JWT token from response

4. **Test Protected Endpoint:**
   - Method: GET
   - URL: `http://localhost:8000/offerzone/users/profile`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer YOUR_JWT_TOKEN`

### Testing Scripts

```bash
# Test all services
echo "Testing User Service..."
curl -s http://localhost:8000/offerzone/users | jq

echo "Testing Products Service..."
curl -s http://localhost:8000/offerzone/products | jq

echo "Testing Offers Service..."
curl -s http://localhost:8000/offerzone/offers | jq

echo "Testing Notifications Service..."
curl -s http://localhost:8000/offerzone/notifications/user/123 | jq

echo "Testing Favorites Service..."
curl -s http://localhost:8000/offerzone/favorites/user/123 | jq
```

---

## 🐛 Troubleshooting

### Issue 1: Kong not starting

**Symptoms:**
```
kong-gateway container keeps restarting
```

**Solution:**
```bash
# Check Kong logs
docker logs kong-gateway

# Ensure PostgreSQL is healthy
docker logs kong-database

# Restart services
docker-compose down -v
docker-compose up -d
```

### Issue 2: Services not accessible through Kong

**Symptoms:**
```
curl http://localhost:8000/offerzone/users
{"message":"no Route matched with those values"}
```

**Solution:**
```bash
# Check if routes are configured
curl http://localhost:8001/routes

# If empty, run configuration script
./kong-config.sh

# Verify services are running
docker-compose ps
```

### Issue 3: Port conflicts

**Symptoms:**
```
Error: Port 8000 is already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :8000

# Kill the process
kill -9 PID

# Or change Kong port in docker-compose.yml
```

### Issue 4: Database connection errors

**Symptoms:**
```
MongoNetworkError: failed to connect to server
```

**Solution:**
```bash
# Check MongoDB is running
docker logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Wait 30 seconds for services to reconnect
```

### Issue 5: Configuration not applied

**Symptoms:**
```
Changes in kong-config.sh not reflected
```

**Solution:**
```bash
# Delete existing configuration
curl -X DELETE http://localhost:8001/services/user-service

# Re-run configuration
./kong-config.sh

# Verify
curl http://localhost:8001/services
```

---

## 📊 Monitoring & Logs

### View Kong Logs
```bash
# Gateway logs
docker logs kong-gateway -f

# Admin API logs
docker logs kong-gateway --tail=100 | grep "admin"
```

### View Microservice Logs
```bash
# User service
docker logs user-service -f

# Products service
docker logs products-service -f

# All services
docker-compose logs -f
```

### View Database Logs
```bash
# MongoDB
docker logs mongodb -f

# PostgreSQL (Kong DB)
docker logs kong-database -f
```

---

## 🔒 Security Best Practices

### 1. **Use Environment Variables**
Never hardcode secrets in code. Use `.env` files:

```bash
# .env file
JWT_SECRET=your-super-secret-key
MONGODB_URI=mongodb://user:pass@mongodb:27017/db
```

### 2. **Enable JWT Plugin**
Add JWT authentication at Kong level:

```bash
curl -X POST http://localhost:8001/services/user-service/plugins \
  --data "name=jwt"
```

### 3. **Rate Limiting**
Already enabled globally. Adjust limits as needed:

```bash
curl -X PATCH http://localhost:8001/plugins/PLUGIN_ID \
  --data "config.minute=500" \
  --data "config.hour=5000"
```

### 4. **IP Restriction**
Restrict access to specific IPs:

```bash
curl -X POST http://localhost:8001/services/user-service/plugins \
  --data "name=ip-restriction" \
  --data "config.allow=192.168.1.0/24"
```

---

## 🎯 Quick Reference

### Start/Stop Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop all services and remove volumes
docker-compose down -v

# Restart a specific service
docker-compose restart kong

# View status
docker-compose ps
```

### Important URLs
- **API Gateway:** http://localhost:8000
- **Kong Admin:** http://localhost:8001
- **MongoDB:** mongodb://localhost:27017
- **PostgreSQL:** postgresql://localhost:5432

### Configuration Files
- `docker-compose.yml` - Service definitions
- `kong-config.sh` - Kong configuration script
- `.env` - Environment variables (create in each service folder)

---

## 🎓 Learning Resources

- [Kong Official Documentation](https://docs.konghq.com/)
- [Kong Plugin Hub](https://docs.konghq.com/hub/)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 📝 Summary

### What Changed?
1. ✅ Added Kong API Gateway as single entry point
2. ✅ All services now accessible through `localhost:8000`
3. ✅ Direct service access moved to ports 8010-8014
4. ✅ Added PostgreSQL for Kong configuration storage
5. ✅ Enabled rate limiting, CORS, and logging plugins
6. ✅ Maintained all existing service functionality

### What Stayed the Same?
1. ✅ All internal service ports unchanged (8000-8004)
2. ✅ MongoDB on port 27017
3. ✅ All API endpoints paths unchanged
4. ✅ JWT authentication still works the same way
5. ✅ Service logic and code unchanged

### Next Steps
1. Update your frontend/client code to use `http://localhost:8000`
2. Test all endpoints through Kong
3. Monitor logs for any issues
4. Explore additional Kong plugins for more features

---

**Need Help?** 
- Check troubleshooting section
- View logs: `docker-compose logs -f`
- Check Kong status: `curl http://localhost:8001/status`
- Verify routes: `curl http://localhost:8001/routes`

---

*Last Updated: November 26, 2025*
