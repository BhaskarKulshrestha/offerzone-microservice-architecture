# OfferZone - Microservices Architecture

A scalable microservices-based application for managing products, offers, favorites, and notifications with Kubernetes deployment support.

## 🚀 Quick Start (Automated Setup)

**For new users**, we provide an automated setup script that checks for prerequisites and sets up everything:

```bash
git clone https://github.com/BhaskarKulshrestha/offerzone-microservice-architecture.git
cd offerzone-microservice-architecture
./setup.sh
```

The script will:
- ✅ Check for required tools (Docker, kubectl, Minikube, Node.js)
- 🔧 Install missing prerequisites automatically (on macOS/Linux)
- 🐳 Build all Docker images
- ☸️ Deploy to Kubernetes
- 🚀 Start all services

**That's it!** Your application will be running on Kubernetes.

---

## Architecture

This project implements a microservices architecture with the following services:

- **API Gateway** (Port 8085) - Single entry point with rate limiting and routing
- **User Service** (Port 8001, gRPC 50052) - User authentication and management
- **Products Service** (Port 8002, gRPC 50051) - Product catalog management
- **Offers Service** (Port 8003) - Deals and offers management
- **Favorites Service** (Port 8004) - User favorites management
- **Notifications Service** (Port 8005) - User notifications
- **MongoDB** (Port 27017) - Database
- **Redis** (Port 6379) - Caching layer

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **API Gateway**: Custom with rate limiting, circuit breaker
- **Database**: MongoDB
- **Cache**: Redis
- **Communication**: REST APIs, gRPC
- **Orchestration**: Kubernetes, Docker
- **Authentication**: JWT
- **Logging**: Winston
- **API Documentation**: Swagger/OpenAPI

## Deployment Options

### Option 1: Kubernetes (Recommended)

See [SETUP_FOR_NEW_USERS.md](SETUP_FOR_NEW_USERS.md) for detailed setup instructions.

**Quick Deploy:**
```bash
# Automated setup (checks prerequisites, installs if needed)
./setup.sh

# Or manual deployment
cd k8s
./build-images.sh      # Build all Docker images
./quick-deploy.sh      # Deploy to Kubernetes
```

**Access the application:**
```bash
# Get API Gateway URL
minikube service api-gateway --url

# Or use port forwarding
kubectl port-forward svc/api-gateway 8085:8085
# Then access: http://localhost:8085
```

**Available Endpoints:**
- `GET /offerzone/products` - List all products
- `GET /offerzone/users` - List all users
- `GET /offerzone/offers` - List all offers
- `GET /offerzone/notifications` - List notifications
- `GET /offerzone/favorites` - List favorites

### Option 2: Docker Compose

```bash
docker-compose up -d
```

### Option 3: Local Development

## Prerequisites (Manual Setup)

- Node.js (v14 or higher)
- Docker & Docker Desktop
- kubectl (v1.30+)
- Minikube
- MongoDB (local or Atlas)
- npm or yarn

## Installation (Manual)

### 1. Clone the repository
```bash
git clone https://github.com/BhaskarKulshrestha/offerzone-microservice-architecture.git
cd offerzone-microservice-architecture
```

### 2. Set up environment files
```bash
# Copy example files
cp .env.example .env
cp k8s/secrets.yml.example k8s/secrets.yml

# Edit with your values
nano .env
nano k8s/secrets.yml
```

### 3. Install dependencies for each service
```bash
# User Service
cd User && npm install

# Products Service
cd ../Products && npm install

# Offers Service
cd ../Offers && npm install

# Favorites Service
cd ../Favorites && npm install

# Notifications Service
cd ../Notifications && npm install
```

### 3. Configure environment variables

Create a `.env` file in each service directory:



## Running the Services

You can run each service individually:

```bash
# Terminal 1 - User Service
cd User && node index.js

# Terminal 2 - Products Service
cd Products && node index.js

# Terminal 3 - Offers Service
cd Offers && node index.js

# Terminal 4 - Favorites Service
cd Favorites && node index.js

# Terminal 5 - Notifications Service
cd Notifications && node index.js
```

Or use nodemon for development:
```bash
cd User && nodemon index.js
```

## API Endpoints

### User Service (http://localhost:8001)
- `POST /offerzone/users/register` - Register a new user
- `POST /offerzone/users/login` - User login
- `GET /offerzone/users/profile` - Get user profile (protected)

### Products Service (http://localhost:8002)
- `GET /offerzone/products` - Get all products
- `POST /offerzone/products` - Create a product (protected)
- `GET /offerzone/products/:id` - Get product by ID
- `PUT /offerzone/products/:id` - Update product (protected)
- `DELETE /offerzone/products/:id` - Delete product (protected)

### Offers Service (http://localhost:8003)
- `GET /offerzone/offers` - Get all offers
- `POST /offerzone/offers` - Create an offer (protected)
- `GET /offerzone/offers/:id` - Get offer by ID
- `PUT /offerzone/offers/:id` - Update offer (protected)
- `DELETE /offerzone/offers/:id` - Delete offer (protected)

### Favorites Service (http://localhost:8004)
- `POST /offerzone/favorites` - Add to favorites (protected)
- `GET /offerzone/favorites/user/:userId` - Get user favorites (protected)
- `DELETE /offerzone/favorites/:id` - Remove from favorites (protected)

### Notifications Service (http://localhost:8005)
- `GET /offerzone/notifications/user/:userId` - Get user notifications (protected)
- `POST /offerzone/notifications` - Create notification (protected)
- `PUT /offerzone/notifications/:id/read` - Mark as read (protected)

## Project Structure

```
.
├── User/
│   ├── controller/
│   ├── Models/
│   ├── Routes/
│   ├── Middleware/
│   ├── utils/
│   └── index.js
├── Products/
│   ├── controller/
│   ├── Models/
│   ├── Routes/
│   ├── Middleware/
│   ├── utils/
│   └── index.js
├── Offers/
│   ├── controller/
│   ├── Models/
│   ├── Routes/
│   ├── Middleware/
│   ├── utils/
│   └── index.js
├── Favorites/
│   ├── controller/
│   ├── Models/
│   ├── Routes/
│   ├── Middleware/
│   ├── utils/
│   └── index.js
└── Notifications/
    ├── controller/
    ├── Models/
    ├── Routes/
    ├── Middleware/
    ├── utils/
    └── index.js
```

## Features

- ✅ Microservices architecture
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ MongoDB database per service
- ✅ Request logging with Winston
- ✅ Error handling middleware
- ✅ CORS enabled
- ✅ RESTful API design

## Future Enhancements

- [ ] API Gateway implementation
- [ ] Service discovery
- [ ] Container orchestration (Docker/Kubernetes)
- [ ] Message queue for inter-service communication
- [ ] Redis caching
- [ ] API rate limiting
- [ ] GraphQL support
- [ ] Swagger/OpenAPI documentation

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
