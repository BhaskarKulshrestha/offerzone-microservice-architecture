# Docker Commands Reference

This guide provides the essential commands to run the OfferZone microservices using Docker Compose.

## Prerequisites
- **Docker Desktop** must be installed and running.

## Quick Start
To build and start all services in one go:
```bash
docker-compose up --build
```
The API Gateway will be available at: `http://localhost:8085`

## Detailed Commands

### 1. Build Images
Build the Docker images for all services without starting them.
```bash
docker-compose build
```

### 2. Start Services
**Run in Foreground** (View logs in terminal):
```bash
docker-compose up
```

**Run in Background** (Detached mode):
```bash
docker-compose up -d
```

### 3. Manage Services
**Stop Containers**:
```bash
docker-compose stop
```

**Stop and Remove Containers** (Clean up):
```bash
docker-compose down
```
*Add `-v` to remove volumes (database data): `docker-compose down -v`*

**View Logs**:
Follow logs for all services:
```bash
docker-compose logs -f
```
Follow logs for a specific service (e.g., `products`):
```bash
docker-compose logs -f products
```

**Restart a Service**:
```bash
docker-compose restart [service_name]
```
Example: `docker-compose restart api-gateway`

## Service Ports
| Service | Internal Port | Exposed Port |
| :--- | :--- | :--- |
| **API Gateway** | 8085 | **8085** |
| Products | 8000 | 8000 |
| User | 8001 | 8001 |
| Offers | 8002 | 8002 |
| Notifications | 8003 | 8003 |
| Favorites | 8004 | 8004 |
| MongoDB | 27017 | 27017 |
| Redis | 6379 | 6380 |
