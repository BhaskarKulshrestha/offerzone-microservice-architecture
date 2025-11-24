# OfferZone - Microservices Architecture

A scalable microservices-based application for managing products, offers, favorites, and notifications.

## Architecture

This project implements a microservices architecture with the following services:

- **User Service** (Port 8001) - User authentication and management
- **Products Service** (Port 8002) - Product catalog management
- **Offers Service** (Port 8003) - Deals and offers management
- **Favorites Service** (Port 8004) - User favorites management
- **Notifications Service** (Port 8005) - User notifications

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Logging**: Winston
- **HTTP Logging**: Morgan

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/BhaskarKulshrestha/offerzone-microservice-architecture.git
cd offerzone-microservice-architecture
```

### 2. Install dependencies for each service
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
