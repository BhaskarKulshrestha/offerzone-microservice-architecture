require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const proxy = require("express-http-proxy");

const app = express();
const port = process.env.PORT || 8085;

app.use(cors());
app.use(morgan("combined"));

const slowDown = require("express-slow-down");

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per 15 minutes, then...
    delayMs: (hits) => hits * 100, // Add 100ms of delay to every request after the 50th
    maxDelayMs: 20000, // Cap delay at 20 seconds
});

app.use(speedLimiter);

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || "http://localhost:8000";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:8001";
const OFFERS_SERVICE_URL = process.env.OFFERS_SERVICE_URL || "http://localhost:8002";
const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL || "http://localhost:8003";
const FAVORITES_SERVICE_URL = process.env.FAVORITES_SERVICE_URL || "http://localhost:8004";

app.use("/offerzone/products", proxy(PRODUCTS_SERVICE_URL, {
    proxyReqPathResolver: (req) => "/offerzone/products" + req.url
}));
app.use("/offerzone/users", proxy(USER_SERVICE_URL, {
    proxyReqPathResolver: (req) => "/offerzone/users" + req.url
}));
app.use("/offerzone/offers", proxy(OFFERS_SERVICE_URL, {
    proxyReqPathResolver: (req) => "/offerzone/offers" + req.url
}));
app.use("/offerzone/notifications", proxy(NOTIFICATIONS_SERVICE_URL, {
    proxyReqPathResolver: (req) => "/offerzone/notifications" + req.url
}));
app.use("/offerzone/favorites", proxy(FAVORITES_SERVICE_URL, {
    proxyReqPathResolver: (req) => "/offerzone/favorites" + req.url
}));

app.get("/", (req, res) => {
    res.send("Welcome to OfferZone API Gateway");
});

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
