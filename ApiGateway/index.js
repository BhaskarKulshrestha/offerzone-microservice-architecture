require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const proxy = require("express-http-proxy");

const app = express();
const port = process.env.PORT || 8085;

app.use(cors());
app.use(morgan("combined"));

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/offerzone/products", proxy("http://localhost:8000", {
    proxyReqPathResolver: (req) => "/offerzone/products" + req.url
}));
app.use("/offerzone/users", proxy("http://localhost:8001", {
    proxyReqPathResolver: (req) => "/offerzone/users" + req.url
}));
app.use("/offerzone/offers", proxy("http://localhost:8002", {
    proxyReqPathResolver: (req) => "/offerzone/offers" + req.url
}));
app.use("/offerzone/notifications", proxy("http://localhost:8003", {
    proxyReqPathResolver: (req) => "/offerzone/notifications" + req.url
}));
app.use("/offerzone/favorites", proxy("http://localhost:8004", {
    proxyReqPathResolver: (req) => "/offerzone/favorites" + req.url
}));

app.get("/", (req, res) => {
    res.send("Welcome to OfferZone API Gateway");
});

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
