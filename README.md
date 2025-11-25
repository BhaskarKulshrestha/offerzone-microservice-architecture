# OfferZone - Microservices Architecture with Kong API Gateway

A scalable microservices-based application for managing products, offers, favorites, and notifications, powered by Kong API Gateway.

---

## � Table of Contents
1. [Quick Start](#-quick-start)
2. [Architecture](#-architecture)
3. [Technology Stack](#-technology-stack)
4. [Port Configuration](#-port-configuration)
5. [Installation](#-installation)
6. [API Endpoints](#-api-endpoints)
7. [Testing](#-testing)
8. [Kong Gateway](#-kong-gateway)
9. [Troubleshooting](#-troubleshooting)
10. [Project Structure](#-project-structure)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/BhaskarKulshrestha/offerzone-microservice-architecture.git
cd offerzone-microservice-architecture

# Start all services (Kong + Microservices + Databases)
./start-services.sh

# Stop all services
./stop-services.sh
```

**That's it!** Your API Gateway is ready at `http://localhost:9000`

---

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
│              (Web Browser, Mobile App, Postman)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS (Port 9000)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  KONG API GATEWAY                            │
│  • Port 9000: API Gateway (Entry Point) ⭐                  │
│  • Port 9001: Admin API (Configuration)                     │
│  • Features: Rate Limiting, CORS, Logging, Load Balancing   │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┐
         │               │               │              │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
    │  User   │    │Products │    │ Offers  │   │  Noti-  │
    │ Service │    │ Service │    │ Service │   │fications│
    │ :8010   │    │ :8011   │    │ :8012   │   │  :8013  │
    └────┬────┘    └────┬────┘    └────┬────┘   └────┬────┘
         │               │               │              │
         └───────────────┴───────────────┴──────────────┘
                         │
                    ┌────▼────┐
                    │ MongoDB │
                    │  :27017 │
                    └─────────┘
```

### Microservices

| Service | Internal Port | External Port | Description |
|---------|--------------|---------------|-------------|
| **Kong Gateway** | 8000 | **9000** | API Gateway Entry Point ⭐ |
| **Kong Admin** | 8001 | **9001** | Configuration & Management |
| User Service | 8000 | 8010 | Authentication & User Management |
| Products Service | 8001 | 8011 | Product Catalog |
| Offers Service | 8002 | 8012 | Deals & Offers |
| Notifications Service | 8003 | 8013 | User Notifications |
| Favorites Service | 8004 | 8014 | User Favorites |
| MongoDB | 27017 | 27017 | Database |
| PostgreSQL (Kong) | 5432 | 5432 | Kong Configuration DB |

---

## 💻 Technology Stack

- **API Gateway**: Kong Gateway 3.4
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Databases**: 
  - MongoDB 6.0 (for microservices data)
  - PostgreSQL 13 (for Kong configuration)
- **Authentication**: JWT
- **Logging**: Winston + Morgan
- **Containerization**: Docker & Docker Compose

---

## 🔌 Port Configuration

### Client-Facing Ports (What You Use)
- **http://localhost:9000** - Kong Gateway (Main API Entry Point) ⭐
- **http://localhost:9001** - Kong Admin API (Configuration)

### Direct Service Access (For Debugging)
- **http://localhost:8010** - User Service
- **http://localhost:8011** - Products Service
- **http://localhost:8012** - Offers Service
- **http://localhost:8013** - Notifications Service
- **http://localhost:8014** - Favorites Service

### Database Ports
- **localhost:27017** - MongoDB
- **localhost:5432** - PostgreSQL (Kong DB)

---

---

## 📥 Installation

### Prerequisites
- Docker and Docker Compose
- Node.js (v14 or higher) - for local development only
- Git

### Option 1: Using Docker Compose (Recommended) ⭐

```bash
# 1. Clone the repository
git clone https://github.com/BhaskarKulshrestha/offerzone-microservice-architecture.git
cd offerzone-microservice-architecture

# 2. Start all services
./start-services.sh

# 3. Verify services are running
docker-compose ps

# 4. Check Kong status
curl http://localhost:9001/status
```

### Option 2: Manual Development Setup

#### Step 1: Start Infrastructure (Kong + Databases)
```bash
docker-compose up -d kong mongodb kong-database
chmod +x kong-config.sh
./kong-config.sh
```

#### Step 2: Install Dependencies
```bash
# User Service
cd User && npm install

# Products Service
cd ../Products && npm install

# Offers Service
cd ../Offers && npm install

# Notifications Service
cd ../Notifications && npm install

# Favorites Service
cd ../Favorites && npm install
```

#### Step 3: Configure Environment Variables
Create a `.env` file in each service directory:
```env
PORT=8000  # or appropriate port
MONGODB_URI=mongodb://localhost:27017/offerzone_[service_name]
JWT_SECRET=your-secret-key-here
```

#### Step 4: Run Services
```bash
# Terminal 1 - User Service
cd User && nodemon index.js

# Terminal 2 - Products Service
cd Products && nodemon index.js

# Terminal 3 - Offers Service
cd Offers && nodemon index.js

# Terminal 4 - Notifications Service
cd Notifications && nodemon index.js

# Terminal 5 - Favorites Service
cd Favorites && nodemon index.js
```

---

## 📍 API Endpoints Reference

### ⚠️ Important: All requests go through Kong Gateway

**Base URL:** `http://localhost:9000`

All endpoints below use this base URL. For protected routes, include the JWT token in the Authorization header.

---

### 🧑 User Service (`/offerzone/users`)

#### 1. Register New User
- **URL**: `http://localhost:9000/offerzone/users/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}
```
- **Response (Success - 201)**:
```json
{
  "message": "User registered successfully",
  "userId": "64abc123def456789"
}
```
- **cURL Example**:
```bash
curl -X POST http://localhost:9000/offerzone/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

#### 2. User Login
- **URL**: `http://localhost:9000/offerzone/users/session`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response (Success - 200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123def456789",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```
- **cURL Example**:
```bash
curl -X POST http://localhost:9000/offerzone/users/session \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 3. Get User Profile
- **URL**: `http://localhost:9000/offerzone/users/me`
- **Method**: `GET`
- **Auth Required**: Yes (JWT Token)
- **Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Response (Success - 200)**:
```json
{
  "_id": "64abc123def456789",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer"
}
```
- **cURL Example**:
```bash
curl -X GET http://localhost:9000/offerzone/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 🛒 Products Service (`/offerzone/products`)

#### 1. Get All Products
- **URL**: `http://localhost:9000/offerzone/products`
- **Method**: `GET`
- **Auth Required**: No
- **Response (Success - 200)**:
```json
[
  {
    "_id": "64prod123abc",
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 50
  }
]
```
- **cURL Example**:
```bash
curl http://localhost:9000/offerzone/products
```

#### 2. Get Product by ID
- **URL**: `http://localhost:9000/offerzone/products/:id`
- **Method**: `GET`
- **Auth Required**: No
- **cURL Example**:
```bash
curl http://localhost:9000/offerzone/products/64prod123abc
```

#### 3. Create Product
- **URL**: `http://localhost:9000/offerzone/products`
- **Method**: `POST`
- **Auth Required**: Yes (JWT Token)
- **Request Body**:
```json
{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "category": "Electronics",
  "stock": 50
}
```
- **Response (Success - 201)**:
```json
{
  "message": "Product created successfully",
  "productId": "64prod123abc"
}
```
- **cURL Example**:
```bash
curl -X POST http://localhost:9000/offerzone/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 50
  }'
```

#### 4. Update Product
- **URL**: `http://localhost:9000/offerzone/products/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (JWT Token)
- **Request Body**:
```json
{
  "price": 899.99,
  "stock": 45
}
```
- **cURL Example**:
```bash
curl -X PUT http://localhost:9000/offerzone/products/64prod123abc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "price": 899.99,
    "stock": 45
  }'
```

#### 5. Delete Product
- **URL**: `http://localhost:9000/offerzone/products/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (JWT Token)
- **cURL Example**:
```bash
curl -X DELETE http://localhost:9000/offerzone/products/64prod123abc \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 🎁 Offers Service (`/offerzone/offers`)

#### 1. Get All Offers
- **URL**: `http://localhost:9000/offerzone/offers`
- **Method**: `GET`
- **Auth Required**: No
- **Response (Success - 200)**:
```json
[
  {
    "_id": "64offer123",
    "title": "50% Off on Electronics",
    "description": "Limited time offer",
    "discount": 50,
    "startDate": "2025-11-26",
    "endDate": "2025-12-26",
    "productId": "64prod123abc"
  }
]
```
- **cURL Example**:
```bash
curl http://localhost:9000/offerzone/offers
```

#### 2. Get Offer by ID
- **URL**: `http://localhost:9000/offerzone/offers/:id`
- **Method**: `GET`
- **Auth Required**: No
- **cURL Example**:
```bash
curl http://localhost:9000/offerzone/offers/64offer123
```

#### 3. Create Offer
- **URL**: `http://localhost:9000/offerzone/offers`
- **Method**: `POST`
- **Auth Required**: Yes (JWT Token)
- **Request Body**:
```json
{
  "title": "50% Off on Electronics",
  "description": "Limited time offer",
  "discount": 50,
  "startDate": "2025-11-26",
  "endDate": "2025-12-26",
  "productId": "64prod123abc"
}
```
- **Response (Success - 201)**:
```json
{
  "message": "Offer created successfully",
  "offerId": "64offer123"
}
```
- **cURL Example**:
```bash
curl -X POST http://localhost:9000/offerzone/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "50% Off on Electronics",
    "description": "Limited time offer",
    "discount": 50,
    "startDate": "2025-11-26",
    "endDate": "2025-12-26",
    "productId": "64prod123abc"
  }'
```

#### 4. Update Offer
- **URL**: `http://localhost:9000/offerzone/offers/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (JWT Token)
- **Request Body**:
```json
{
  "discount": 60,
  "endDate": "2025-12-31"
}
```
- **cURL Example**:
```bash
curl -X PUT http://localhost:9000/offerzone/offers/64offer123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "discount": 60,
    "endDate": "2025-12-31"
  }'
```

#### 5. Delete Offer
- **URL**: `http://localhost:9000/offerzone/offers/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (JWT Token)
- **cURL Example**:
```bash
curl -X DELETE http://localhost:9000/offerzone/offers/64offer123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 🔔 Notifications Service (`/offerzone/notifications`)

#### 1. Get User Notifications
- **URL**: `http://localhost:9000/offerzone/notifications/user/:userId`
- **Method**: `GET`
- **Auth Required**: Yes (JWT Token)
- **Response (Success - 200)**:
```json
[
  {
    "_id": "64notif123",
    "userId": "64abc123def456789",
    "title": "New Offer Available",
    "message": "Check out 50% off on Electronics",
    "read": false,
    "createdAt": "2025-11-26T10:30:00Z"
  }
]
```
- **cURL Example**:
```bash
curl http://localhost:9000/offerzone/notifications/user/64abc123def456789 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 2. Create Notification
- **URL**: `http://localhost:9000/offerzone/notifications`
- **Method**: `POST`
- **Auth Required**: Yes (JWT Token)
- **Request Body**:
```json
{
  "userId": "64abc123def456789",
  "title": "New Offer Available",
  "message": "Check out 50% off on Electronics"
}
```
- **Response (Success - 201)**:
```json
{
  "message": "Notification created successfully",
  "notificationId": "64notif123"
}
```
- **cURL Example**:
```bash
curl -X POST http://localhost:9000/offerzone/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "userId": "64abc123def456789",
    "title": "New Offer Available",
    "message": "Check out 50% off on Electronics"
  }'
```

#### 3. Mark Notification as Read
- **URL**: `http://localhost:9000/offerzone/notifications/:id/read`
- **Method**: `PUT`
- **Auth Required**: Yes (JWT Token)
- **Response (Success - 200)**:
```json
{
  "message": "Notification marked as read"
}
```
- **cURL Example**:
```bash
curl -X PUT http://localhost:9000/offerzone/notifications/64notif123/read \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### ⭐ Favorites Service (`/offerzone/favorites`)

#### 1. Add to Favorites
- **URL**: `http://localhost:9000/offerzone/favorites`
- **Method**: `POST`
- **Auth Required**: Yes (JWT Token)
- **Request Body**:
```json
{
  "userId": "64abc123def456789",
  "productId": "64prod123abc"
}
```
- **Response (Success - 201)**:
```json
{
  "message": "Added to favorites successfully",
  "favoriteId": "64fav123"
}
```
- **cURL Example**:
```bash
curl -X POST http://localhost:9000/offerzone/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "userId": "64abc123def456789",
    "productId": "64prod123abc"
  }'
```

#### 2. Get User Favorites
- **URL**: `http://localhost:9000/offerzone/favorites/user/:userId`
- **Method**: `GET`
- **Auth Required**: Yes (JWT Token)
- **Response (Success - 200)**:
```json
[
  {
    "_id": "64fav123",
    "userId": "64abc123def456789",
    "productId": "64prod123abc",
    "product": {
      "name": "Laptop",
      "price": 999.99
    }
  }
]
```
- **cURL Example**:
```bash
curl http://localhost:9000/offerzone/favorites/user/64abc123def456789 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 3. Remove from Favorites
- **URL**: `http://localhost:9000/offerzone/favorites/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (JWT Token)
- **Response (Success - 200)**:
```json
{
  "message": "Removed from favorites successfully"
}
```
- **cURL Example**:
```bash
curl -X DELETE http://localhost:9000/offerzone/favorites/64fav123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 📝 Quick Reference Summary

| Service | Endpoint | Method | Request Body Example |
|---------|----------|--------|---------------------|
| **User - Register** | `/offerzone/users/` | POST | `{"name":"John","email":"john@example.com","password":"pass123","role":"customer"}` |
| **User - Login** | `/offerzone/users/session` | POST | `{"email":"john@example.com","password":"pass123"}` |
| **User - Profile** | `/offerzone/users/me` | GET | N/A (Token required) |
| **Products - List** | `/offerzone/products` | GET | N/A |
| **Products - Create** | `/offerzone/products` | POST | `{"name":"Laptop","price":999.99,"stock":50}` |
| **Offers - List** | `/offerzone/offers` | GET | N/A |
| **Offers - Create** | `/offerzone/offers` | POST | `{"title":"50% Off","discount":50,"productId":"..."}` |
| **Notifications - Get** | `/offerzone/notifications/user/:userId` | GET | N/A (Token required) |
| **Notifications - Create** | `/offerzone/notifications` | POST | `{"userId":"...","title":"New Offer","message":"..."}` |
| **Favorites - Add** | `/offerzone/favorites` | POST | `{"userId":"...","productId":"..."}` |
| **Favorites - Get** | `/offerzone/favorites/user/:userId` | GET | N/A (Token required)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/offerzone/favorites` | Add to favorites | Yes |
| GET | `/offerzone/favorites/user/:userId` | Get user favorites | Yes |
| DELETE | `/offerzone/favorites/:id` | Remove from favorites | Yes |

---

## 🧪 Testing

### 1. Verify All Services are Running

```bash
docker-compose ps
```

All containers should show "healthy" status.

### 2. Test User Registration

```bash
curl -X POST http://localhost:9000/offerzone/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "customer"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "userId": "..."
}
```

### 3. Test User Login

```bash
curl -X POST http://localhost:9000/offerzone/users/session \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "customer"
  }
}
```

### 4. Test Protected Endpoint

```bash
# Save the token from login response
TOKEN="your_token_here"

curl -X GET http://localhost:9000/offerzone/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Test Products Service

```bash
# Get all products
curl http://localhost:9000/offerzone/products

# Create a product (requires authentication)
curl -X POST http://localhost:9000/offerzone/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Product",
    "price": 99.99,
    "description": "A test product"
  }'
```

### 6. Test Offers Service

```bash
# Get all offers
curl http://localhost:9000/offerzone/offers

# Create an offer (requires authentication)
curl -X POST http://localhost:9000/offerzone/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "50% Off",
    "description": "Half price on selected items",
    "discount": 50
  }'
```

### 7. Check Kong Admin API

```bash
# List all services
curl http://localhost:9001/services

# List all routes
curl http://localhost:9001/routes

# Check Kong status
curl http://localhost:9001/status
```

### 8. Test Rate Limiting

Run the same request more than 1000 times in a minute to trigger rate limiting:

```bash
for i in {1..1005}; do
  curl http://localhost:9000/offerzone/products
done
```

You should receive a `429 Too Many Requests` response after 1000 requests.

### 9. Using Postman
1. Set base URL to `http://localhost:9000`
2. Import the endpoints from the API Endpoints section
3. For protected routes, add `Authorization: Bearer <token>` header

---

## 🔧 Kong Gateway Configuration

---

## 🔧 Kong Gateway Configuration

### What is Kong Gateway?

Kong Gateway acts as a **single entry point** for all microservices, providing:
- 🔒 **Security**: Centralized authentication, rate limiting, IP restriction
- 📊 **Monitoring**: Request/response logging, analytics
- 🌐 **CORS**: Cross-origin resource sharing
- ⚡ **Performance**: Load balancing, caching, response transformation
- 🔌 **Extensibility**: 100+ plugins for additional features

### Kong Services Configured

| Service Name | Upstream URL | Path Prefix |
|--------------|--------------|-------------|
| user-service | http://user:8000 | /offerzone/users |
| products-service | http://products:8001 | /offerzone/products |
| offers-service | http://offers:8002 | /offerzone/offers |
| notifications-service | http://notifications:8003 | /offerzone/notifications |
| favorites-service | http://favorites:8004 | /offerzone/favorites |

### Active Kong Plugins

#### 1. **Rate Limiting** (Applied to all services)
- **Per Minute**: 1000 requests
- **Per Hour**: 10,000 requests
- **Policy**: Local (in-memory)

#### 2. **CORS** (Applied to all services)
- **Origins**: `*` (all origins allowed)
- **Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers**: Accept, Content-Type, Authorization
- **Credentials**: true

#### 3. **File Logging** (Applied to all services)
- **Path**: `/tmp/kong.log`
- **Reopen**: true

### Kong Admin API

Access Kong's management interface at **http://localhost:9001**

Common commands:
```bash
# List all services
curl http://localhost:9001/services | jq

# List all routes
curl http://localhost:9001/routes | jq

# List all plugins
curl http://localhost:9001/plugins | jq

# Get Kong status
curl http://localhost:9001/status | jq

# View specific service
curl http://localhost:9001/services/user-service | jq
```

### Reconfiguring Kong

If you need to update Kong configuration:

```bash
# Option 1: Use the configuration script
./kong-config.sh

# Option 2: Manually via Admin API
curl -i -X POST http://localhost:9001/services/ \
  --data name=new-service \
  --data url='http://backend:8000'
```

### Kong Database

Kong uses **PostgreSQL 13** to store its configuration:
- **Host**: kong-database
- **Port**: 5432
- **Database**: kong
- **User**: kong
- **Password**: kongpass

---

## 📁 Project Structure

```
OfferZone-Scalable/
│
├── 📋 Configuration Files
│   ├── docker-compose.yml          # Main orchestration file
│   ├── kong.yml                    # Declarative Kong config
│   ├── kong-config.sh             # Kong setup script (uses port 9001)
│   ├── start-services.sh          # Startup script (uses ports 9000/9001)
│   └── stop-services.sh           # Shutdown script
│
├── 📖 Documentation
│   ├── README.md                  # This file (comprehensive guide)
│   ├── ARCHITECTURE.md            # System architecture diagrams
│   └── LICENSE                    # MIT License
│
├── 🧑 User Service (Port 8010)
│   ├── Dockerfile
│   ├── index.js                   # Express server
│   ├── package.json
│   ├── controller/
│   │   └── User.js               # User business logic
│   ├── Models/
│   │   └── User.js               # MongoDB User schema
│   ├── Routes/
│   │   └── User.js               # POST /, POST /session, GET /me
│   ├── Middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── utils/
│   │   └── logger.js             # Winston logger
│   └── logs/                      # Log files
│
├── 🛒 Products Service (Port 8011)
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   ├── controller/
│   │   └── Products.js
│   ├── Models/
│   │   ├── Product.js
│   │   └── User.js               # For auth
│   ├── Routes/
│   │   └── Products.js           # CRUD operations
│   ├── Middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   └── logger.js
│   └── logs/
│
├── 🎁 Offers Service (Port 8012)
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   ├── controller/
│   │   └── Offers.js
│   ├── Models/
│   │   ├── Offers.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── Routes/
│   │   └── Offers.js             # CRUD operations
│   ├── Middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   └── logger.js
│   └── logs/
│
├── 🔔 Notifications Service (Port 8013)
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   ├── controller/
│   │   └── Notifications.js
│   ├── Models/
│   │   ├── Notifications.js
│   │   ├── Offers.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── Routes/
│   │   └── Notifications.js      # Get, Create, Mark Read
│   ├── Middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   └── logger.js
│   └── logs/
│
└── ⭐ Favorites Service (Port 8014)
    ├── Dockerfile
    ├── index.js
    ├── package.json
    ├── controller/
    │   └── Favorites.js
    ├── Models/
    │   ├── Favorites.js
    │   ├── Offers.js
    │   ├── Product.js
    │   └── User.js
    ├── Routes/
    │   └── Favorites.js          # Add, Get, Remove
    ├── Middleware/
    │   └── authMiddleware.js
    ├── utils/
    │   └── logger.js
    └── logs/
```

---

## ✨ Features

- ✅ **Kong API Gateway** - Single entry point at `http://localhost:9000`
- ✅ **Rate Limiting** - 1000 requests/min, 10,000/hour per client
- ✅ **CORS Enabled** - Cross-origin resource sharing
- ✅ **Microservices Architecture** - 5 independent services
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-Based Authorization** - Customer/Retailer roles
- ✅ **MongoDB Databases** - Separate DB per service
- ✅ **Request Logging** - Winston + Morgan integration
- ✅ **Error Handling** - Centralized error middleware
- ✅ **RESTful API Design** - Standard HTTP methods
- ✅ **Docker Containerization** - Easy deployment
- ✅ **Health Checks** - Automated service monitoring
- ✅ **Declarative Config** - Version-controlled Kong setup

---

## 📊 Monitoring & Management

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker logs kong-gateway -f
docker logs user-service -f
docker logs products-service -f

# Kong access logs (from plugin)
docker exec kong-gateway tail -f /tmp/kong.log
```

### Monitor Service Health

```bash
# Check all containers
docker-compose ps

# Check Kong health
curl http://localhost:9001/status

# Check service uptime
curl http://localhost:9001/services/user-service
```

### Database Access

```bash
# MongoDB (microservices data)
docker exec -it mongodb mongosh
use offerzone_users

# PostgreSQL (Kong config)
docker exec -it kong-database psql -U kong -d kong
\dt
```

---

## 🐛 Troubleshooting

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Services Not Starting

**Symptoms**: Containers fail to start or show "Unhealthy" status

**Solution**:
```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]

# Full restart
docker-compose down -v
docker-compose up -d
```

#### 2. Kong Routes Not Working

**Symptoms**: Getting 404 errors through Kong Gateway

**Solution**:
```bash
# Re-run Kong configuration
./kong-config.sh

# Verify routes exist
curl http://localhost:9001/routes | jq

# Check service is registered
curl http://localhost:9001/services | jq
```

#### 3. Port Conflicts

**Symptoms**: Error: "Port is already in use"

**Solution**:
```bash
# Find process using port (macOS/Linux)
lsof -i :9000
lsof -i :9001

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

#### 4. Database Connection Issues

**Symptoms**: Services can't connect to MongoDB

**Solution**:
```bash
# Check MongoDB is running
docker logs mongodb

# Verify connection
docker exec -it mongodb mongosh --eval "db.adminCommand('ping')"

# Restart MongoDB
docker-compose restart mongodb
```

#### 5. Authentication Failures

**Symptoms**: 401 Unauthorized errors

**Solution**:
```bash
# Ensure token is valid
# Tokens expire after 24 hours by default

# Get a fresh token
curl -X POST http://localhost:9000/offerzone/users/session \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Use token in requests
curl http://localhost:9000/offerzone/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 6. Rate Limiting Triggered

**Symptoms**: 429 Too Many Requests

**Solution**:
- Wait 1 minute for counter to reset
- Or increase rate limits in `kong-config.sh`:
  ```bash
  --data "config.minute=5000" \
  --data "config.hour=50000"
  ```
  Then run `./kong-config.sh` again

#### 7. CORS Errors

**Symptoms**: Browser blocks requests due to CORS policy

**Solution**:
CORS is already enabled on all routes. If still having issues:
```bash
# Verify CORS plugin
curl http://localhost:9001/plugins | jq '.data[] | select(.name=="cors")'

# Or add specific origins in kong-config.sh
--data "config.origins=http://localhost:3000,http://localhost:4200"
```

### Getting Help

If problems persist:

1. **Check Logs**: `docker-compose logs -f`
2. **Verify Docker**: `docker version` and `docker-compose version`
3. **Check Resources**: Ensure Docker has enough RAM (4GB+ recommended)
4. **Clean Restart**: `docker-compose down -v && docker-compose up -d`

---

## 🚀 Future Enhancements

- [x] ✅ API Gateway implementation (Kong Gateway)
- [x] ✅ Rate limiting and CORS
- [x] ✅ Centralized logging
- [ ] 🔄 Service discovery (Consul/Eureka)
- [ ] 🔄 Message queue for inter-service communication (RabbitMQ/Kafka)
- [ ] 🔄 Redis caching layer
- [ ] 🔄 Advanced API rate limiting per user
- [ ] 🔄 GraphQL API support
- [ ] 🔄 Swagger/OpenAPI documentation
- [ ] 🔄 Kubernetes deployment manifests
- [ ] 🔄 CI/CD pipeline (GitHub Actions)
- [ ] 🔄 Prometheus + Grafana monitoring
- [ ] 🔄 ELK Stack for log aggregation
- [ ] 🔄 JWT refresh tokens
- [ ] 🔄 Email notifications
- [ ] 🔄 File upload service

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 📞 Support

For questions or issues:
- 📧 Open an issue on GitHub
- 📖 Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- 🔍 Review Kong logs: `docker logs kong-gateway -f`

---

**Built with ❤️ using Kong Gateway, Node.js, and Docker**

