#!/bin/bash

################################################################################
# Kong API Gateway Configuration Script for OfferZone Microservices
################################################################################
#
# This script configures Kong Gateway to route requests to all microservices
#
# GATEWAY ENDPOINTS (Client-facing URLs):
# - Kong Proxy: http://localhost:9000
# - Kong Admin: http://localhost:9001
#
# CLIENT REQUEST EXAMPLES:
# 
# 1. User Registration:
#    POST http://localhost:9000/offerzone/users/
#    Body: {"name":"John","email":"john@example.com","password":"pass123","role":"customer"}
#
# 2. User Login:
#    POST http://localhost:9000/offerzone/users/session
#    Body: {"email":"john@example.com","password":"pass123"}
#
# 3. Get Products:
#    GET http://localhost:9000/offerzone/products
#
# 4. Create Product (requires token):
#    POST http://localhost:9000/offerzone/products
#    Headers: Authorization: Bearer <token>
#    Body: {"name":"Laptop","price":999.99,"stock":50}
#
# 5. Get Offers:
#    GET http://localhost:9000/offerzone/offers
#
# 6. Create Offer (requires token):
#    POST http://localhost:9000/offerzone/offers
#    Headers: Authorization: Bearer <token>
#    Body: {"title":"50% Off","discount":50,"productId":"..."}
#
# 7. Get Notifications (requires token):
#    GET http://localhost:9000/offerzone/notifications/user/:userId
#    Headers: Authorization: Bearer <token>
#
# 8. Add to Favorites (requires token):
#    POST http://localhost:9000/offerzone/favorites
#    Headers: Authorization: Bearer <token>
#    Body: {"userId":"...","productId":"..."}
#
################################################################################

# Wait for Kong to be ready
echo "Waiting for Kong to be ready..."
sleep 10

# Kong Admin API URL
KONG_ADMIN_URL="http://localhost:9001"

echo "=========================================="
echo "Configuring Kong API Gateway for OfferZone"
echo "=========================================="

# Function to check if service exists
check_service_exists() {
    local service_name=$1
    curl -s "${KONG_ADMIN_URL}/services/${service_name}" > /dev/null 2>&1
    return $?
}

# Function to check if route exists
check_route_exists() {
    local route_name=$1
    curl -s "${KONG_ADMIN_URL}/routes/${route_name}" > /dev/null 2>&1
    return $?
}

# ==========================================
# 1. Configure User Service
# ==========================================
# Routes:
#   POST   /offerzone/users/          - Register new user
#   POST   /offerzone/users/session   - User login
#   GET    /offerzone/users/me        - Get user profile (requires JWT)
#
# Example Request Body (Register):
#   {"name":"John Doe","email":"john@example.com","password":"pass123","role":"customer"}
#
# Example Request Body (Login):
#   {"email":"john@example.com","password":"pass123"}
#
# ==========================================
echo ""
echo "1. Configuring User Service..."

if check_service_exists "user-service"; then
    echo "   ⚠ User service already exists, updating..."
    curl -i -X PATCH ${KONG_ADMIN_URL}/services/user-service \
      --data "url=http://user-service:8000"
else
    echo "   ✓ Creating user service..."
    curl -i -X POST ${KONG_ADMIN_URL}/services \
      --data "name=user-service" \
      --data "url=http://user-service:8000"
fi

if check_route_exists "user-route"; then
    echo "   ⚠ User route already exists, skipping..."
else
    echo "   ✓ Creating user route..."
    curl -i -X POST ${KONG_ADMIN_URL}/services/user-service/routes \
      --data "name=user-route" \
      --data "paths[]=/offerzone/users" \
      --data "strip_path=false"
fi

# ==========================================
# 2. Configure Products Service
# ==========================================
# Routes:
#   GET    /offerzone/products        - Get all products
#   GET    /offerzone/products/:id    - Get product by ID
#   POST   /offerzone/products        - Create product (requires JWT)
#   PUT    /offerzone/products/:id    - Update product (requires JWT)
#   DELETE /offerzone/products/:id    - Delete product (requires JWT)
#
# Example Request Body (Create/Update):
#   {"name":"Laptop","description":"High-performance laptop","price":999.99,"category":"Electronics","stock":50}
#
# ==========================================
echo ""
echo "2. Configuring Products Service..."

if check_service_exists "products-service"; then
    echo "   ⚠ Products service already exists, updating..."
    curl -i -X PATCH ${KONG_ADMIN_URL}/services/products-service \
      --data "url=http://products-service:8001"
else
    echo "   ✓ Creating products service..."
    curl -i -X POST ${KONG_ADMIN_URL}/services \
      --data "name=products-service" \
      --data "url=http://products-service:8001"
fi

if check_route_exists "products-route"; then
    echo "   ⚠ Products route already exists, skipping..."
else
    echo "   ✓ Creating products route..."
    curl -i -X POST ${KONG_ADMIN_URL}/services/products-service/routes \
      --data "name=products-route" \
      --data "paths[]=/offerzone/products" \
      --data "strip_path=false"
fi

# ==========================================
# 3. Configure Offers Service
# ==========================================
# Routes:
#   GET    /offerzone/offers          - Get all offers
#   GET    /offerzone/offers/:id      - Get offer by ID
#   POST   /offerzone/offers          - Create offer (requires JWT)
#   PUT    /offerzone/offers/:id      - Update offer (requires JWT)
#   DELETE /offerzone/offers/:id      - Delete offer (requires JWT)
#
# Example Request Body (Create/Update):
#   {"title":"50% Off Electronics","description":"Limited time","discount":50,"startDate":"2025-11-26","endDate":"2025-12-26","productId":"..."}
#
# ==========================================
echo ""
echo "3. Configuring Offers Service..."

if check_service_exists "offers-service"; then
    echo "   ⚠ Offers service already exists, updating..."
    curl -i -X PATCH ${KONG_ADMIN_URL}/services/offers-service \
      --data "url=http://offers-service:8002"
else
    echo "   ✓ Creating offers service..."
    curl -i -X POST ${KONG_ADMIN_URL}/services \
      --data "name=offers-service" \
      --data "url=http://offers-service:8002"
fi

if check_route_exists "offers-route"; then
    echo "   ⚠ Offers route already exists, skipping..."
else
    echo "   ✓ Creating offers route..."
    curl -i -X POST ${KONG_ADMIN_URL}/services/offers-service/routes \
      --data "name=offers-route" \
      --data "paths[]=/offerzone/offers" \
      --data "strip_path=false"
fi

# ==========================================
# 4. Configure Notifications Service
# ==========================================
# Routes:
#   GET    /offerzone/notifications/user/:userId  - Get user notifications (requires JWT)
#   POST   /offerzone/notifications               - Create notification (requires JWT)
#   PUT    /offerzone/notifications/:id/read      - Mark notification as read (requires JWT)
#
# Example Request Body (Create):
#   {"userId":"64abc123...","title":"New Offer Available","message":"Check out 50% off on Electronics"}
#
# ==========================================
echo ""
echo "4. Configuring Notifications Service..."

if check_service_exists "notifications-service"; then
    echo "   ⚠ Notifications service already exists, updating..."
    curl -i -X PATCH ${KONG_ADMIN_URL}/services/notifications-service \
      --data "url=http://notifications-service:8003"
else
    echo "   ✓ Creating notifications service..."
    curl -i -X POST ${KONG_ADMIN_URL}/services \
      --data "name=notifications-service" \
      --data "url=http://notifications-service:8003"
fi

if check_route_exists "notifications-route"; then
    echo "   ⚠ Notifications route already exists, skipping..."
else
    echo "   ✓ Creating notifications route..."
    curl -i -X POST ${KONG_ADMIN_URL}/services/notifications-service/routes \
      --data "name=notifications-route" \
      --data "paths[]=/offerzone/notifications" \
      --data "strip_path=false"
fi

# ==========================================
# 5. Configure Favorites Service
# ==========================================
# Routes:
#   POST   /offerzone/favorites               - Add to favorites (requires JWT)
#   GET    /offerzone/favorites/user/:userId  - Get user favorites (requires JWT)
#   DELETE /offerzone/favorites/:id           - Remove from favorites (requires JWT)
#
# Example Request Body (Add):
#   {"userId":"64abc123...","productId":"64prod123..."}
#
# ==========================================
echo ""
echo "5. Configuring Favorites Service..."

if check_service_exists "favorites-service"; then
    echo "   ⚠ Favorites service already exists, updating..."
    curl -i -X PATCH ${KONG_ADMIN_URL}/services/favorites-service \
      --data "url=http://favorites-service:8004"
else
    echo "   ✓ Creating favorites service..."
    curl -i -X POST ${KONG_ADMIN_URL}/services \
      --data "name=favorites-service" \
      --data "url=http://favorites-service:8004"
fi

if check_route_exists "favorites-route"; then
    echo "   ⚠ Favorites route already exists, skipping..."
else
    echo "   ✓ Creating favorites route..."
    curl -i -X POST ${KONG_ADMIN_URL}/services/favorites-service/routes \
      --data "name=favorites-route" \
      --data "paths[]=/offerzone/favorites" \
      --data "strip_path=false"
fi

# ==========================================
# 6. Configure Kong Plugins (Optional)
# ==========================================
echo ""
echo "6. Configuring Kong Plugins..."

# Rate Limiting Plugin (Global)
echo "   ✓ Enabling rate limiting plugin..."
curl -i -X POST ${KONG_ADMIN_URL}/plugins \
  --data "name=rate-limiting" \
  --data "config.minute=1000" \
  --data "config.hour=10000" \
  --data "config.policy=local" 2>/dev/null || echo "   ⚠ Rate limiting already configured"

# CORS Plugin (Global)
echo "   ✓ Enabling CORS plugin..."
curl -i -X POST ${KONG_ADMIN_URL}/plugins \
  --data "name=cors" \
  --data "config.origins=*" \
  --data "config.methods=GET" \
  --data "config.methods=POST" \
  --data "config.methods=PUT" \
  --data "config.methods=DELETE" \
  --data "config.methods=PATCH" \
  --data "config.methods=OPTIONS" \
  --data "config.headers=Accept" \
  --data "config.headers=Accept-Version" \
  --data "config.headers=Content-Length" \
  --data "config.headers=Content-MD5" \
  --data "config.headers=Content-Type" \
  --data "config.headers=Date" \
  --data "config.headers=Authorization" \
  --data "config.exposed_headers=X-Auth-Token" \
  --data "config.credentials=true" \
  --data "config.max_age=3600" 2>/dev/null || echo "   ⚠ CORS already configured"

# Request/Response Logging
echo "   ✓ Enabling logging plugin..."
curl -i -X POST ${KONG_ADMIN_URL}/plugins \
  --data "name=file-log" \
  --data "config.path=/tmp/kong.log" 2>/dev/null || echo "   ⚠ Logging already configured"

echo ""
echo "=========================================="
echo "✓ Kong Configuration Complete!"
echo "=========================================="
echo ""
echo "Gateway Information:"
echo "  - Kong Proxy (API Gateway): http://localhost:9000"
echo "  - Kong Admin API: http://localhost:9001"
echo ""
echo "Service Routes:"
echo "  - User Service: http://localhost:9000/offerzone/users"
echo "  - Products Service: http://localhost:9000/offerzone/products"
echo "  - Offers Service: http://localhost:9000/offerzone/offers"
echo "  - Notifications Service: http://localhost:9000/offerzone/notifications"
echo "  - Favorites Service: http://localhost:9000/offerzone/favorites"
echo ""
echo "Direct Service Access (for debugging):"
echo "  - User Service: http://localhost:8010"
echo "  - Products Service: http://localhost:8011"
echo "  - Offers Service: http://localhost:8012"
echo "  - Notifications Service: http://localhost:8013"
echo "  - Favorites Service: http://localhost:8014"
echo ""
echo "To view configured services:"
echo "  curl http://localhost:9001/services"
echo ""
echo "To view configured routes:"
echo "  curl http://localhost:9001/routes"
echo ""
echo "To view all plugins:"
echo "  curl http://localhost:9001/plugins"
echo "=========================================="
